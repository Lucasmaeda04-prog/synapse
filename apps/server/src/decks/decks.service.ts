import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Deck, DeckDocument } from '../database/schemas/deck.schema';
import {
  Assignment,
  AssignmentDocument,
} from '../database/schemas/assignment.schema';
import { Class, ClassDocument } from '../database/schemas/class.schema';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { QueryDeckDto } from './dto/query-deck.dto';
import {
  PaginatedDecksResponseDto,
  DeckResponseDto,
} from './dto/deck-response.dto';
import { Card, CardDocument } from '../database/schemas/card.schema';
import { CreateCardDto } from '../cards/dto/create-card.dto';

@Injectable()
export class DecksService {
  constructor(
    @InjectModel(Deck.name) private deckModel: Model<DeckDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
  ) {}

  async create(
    createDeckDto: CreateDeckDto,
    ownerId: string,
  ): Promise<DeckResponseDto> {
    // Extract cards if provided so they are not directly set on deck document
    const { cards, ...deckPayload } = createDeckDto as any;

    // Start a mongoose session for transaction
    const session = await this.deckModel.db.startSession();
    session.startTransaction();

    try {
      const deck = new this.deckModel({
        ...deckPayload,
        owner_id: new Types.ObjectId(ownerId),
        cards_count: 0,
      });

      const savedDeck = await deck.save({ session });

      // If cards were provided, insert them and update cards_count within transaction
      if (Array.isArray(cards) && cards.length > 0) {
        const cardsToInsert: Partial<Card>[] = cards.map(
          (c: CreateCardDto) => ({
            deck_id: new Types.ObjectId(savedDeck._id),
            front: c.front,
            back: c.back,
            hints: c.hints || [],
          }),
        );

        await this.cardModel.insertMany(cardsToInsert as any, { session });

        await this.deckModel.findByIdAndUpdate(
          savedDeck._id,
          { $inc: { cards_count: cardsToInsert.length } },
          { session },
        );
      }

      await session.commitTransaction();
      session.endSession();

      // Return the deck (fresh read)
      const result = await this.deckModel.findById(savedDeck._id).lean().exec();
      return this.toResponseDto(result);
    } catch (err) {
      // Abort transaction on error
      try {
        await session.abortTransaction();
      } catch (e) {
        // ignore
      }
      session.endSession();
      throw err;
    }
  }

  async findAll(
    queryDto: QueryDeckDto,
    userId?: string,
    userRole?: string,
  ): Promise<PaginatedDecksResponseDto> {
    const {
      page = 1,
      limit = 20,
      query,
      tags,
      sort = 'created_at',
      order = 'desc',
    } = queryDto;

    const filter: any = {};
    let allowedDeckIds: Types.ObjectId[] | undefined;

    // Para professores/admins: sempre retornar apenas seus decks
    if (userRole === 'TEACHER' || userRole === 'ADMIN') {
      if (!userId) {
        // Se não tiver userId, retornar vazio (não deveria acontecer, mas por segurança)
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
      filter.owner_id = new Types.ObjectId(userId);
    }
    // Para alunos: buscar apenas decks atribuídos a ele ou suas turmas
    else if (userRole === 'STUDENT' && userId) {
      // Buscar turmas onde o aluno está
      const studentClasses = await this.classModel
        .find({ student_ids: new Types.ObjectId(userId) })
        .select('_id')
        .lean()
        .exec();

      const classIds = studentClasses.map((c) => c._id);

      // Buscar assignments:
      // 1. Atribuídos diretamente ao aluno (student_id)
      // 2. Atribuídos às turmas onde o aluno está (class_id)
      const assignmentFilter: any = {
        $or: [{ student_id: new Types.ObjectId(userId) }],
      };

      if (classIds.length > 0) {
        assignmentFilter.$or.push({ class_id: { $in: classIds } });
      }

      const assignments = await this.assignmentModel
        .find(assignmentFilter)
        .select('deck_id')
        .lean()
        .exec();

      allowedDeckIds = assignments.map((a) => a.deck_id);

      // Se não houver assignments, retornar array vazio
      if (allowedDeckIds.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      filter._id = { $in: allowedDeckIds };
    }

    // Filtro: busca textual
    if (query) {
      filter.$text = { $search: query };
    }

    // Filtro: tags
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      filter.tags = { $in: tagArray };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField: any = {};
    sortField[sort] = sortOrder;

    const [data, total] = await Promise.all([
      this.deckModel
        .find(filter)
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.deckModel.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map((deck) => this.toResponseDto(deck)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string): Promise<DeckResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }

    const deck = await this.deckModel.findById(id).lean().exec();

    if (!deck) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }

    // Verificar acesso: proprietário ou deck público
    if (userId && deck.owner_id.toString() !== userId && !deck.is_public) {
      throw new ForbiddenException('You do not have access to this deck');
    }

    return this.toResponseDto(deck);
  }

  async update(
    id: string,
    updateDeckDto: UpdateDeckDto,
    userId: string,
  ): Promise<DeckResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }

    const deck = await this.deckModel.findById(id).exec();

    if (!deck) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }

    // Apenas o proprietário pode editar
    if (deck.owner_id.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this deck',
      );
    }

    Object.assign(deck, updateDeckDto);
    const updatedDeck = await deck.save();

    return this.toResponseDto(updatedDeck);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }

    const deck = await this.deckModel.findById(id).exec();

    if (!deck) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }

    // Apenas o proprietário pode deletar
    if (deck.owner_id.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this deck',
      );
    }

    await this.deckModel.findByIdAndDelete(id).exec();

    return { message: 'Deck deleted successfully' };
  }

  async incrementCardsCount(deckId: string): Promise<void> {
    await this.deckModel
      .findByIdAndUpdate(deckId, { $inc: { cards_count: 1 } })
      .exec();
  }

  async decrementCardsCount(deckId: string): Promise<void> {
    await this.deckModel
      .findByIdAndUpdate(deckId, { $inc: { cards_count: -1 } })
      .exec();
  }

  private toResponseDto(deck: any): DeckResponseDto {
    return {
      _id: deck._id.toString(),
      owner_id: deck.owner_id.toString(),
      title: deck.title,
      description: deck.description,
      tags: deck.tags || [],
      is_public: deck.is_public,
      cards_count: deck.cards_count,
      org_id: deck.org_id,
      school_id: deck.school_id,
      created_at: deck.created_at,
      updated_at: deck.updated_at,
    };
  }
}
