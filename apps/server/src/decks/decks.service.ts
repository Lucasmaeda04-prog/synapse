import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Deck, DeckDocument } from '../database/schemas/deck.schema';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { QueryDeckDto } from './dto/query-deck.dto';
import { PaginatedDecksResponseDto, DeckResponseDto } from './dto/deck-response.dto';

@Injectable()
export class DecksService {
  constructor(
    @InjectModel(Deck.name) private deckModel: Model<DeckDocument>,
  ) {}

  async create(createDeckDto: CreateDeckDto, ownerId: string): Promise<DeckResponseDto> {
    const deck = new this.deckModel({
      ...createDeckDto,
      owner_id: new Types.ObjectId(ownerId),
      cards_count: 0,
    });

    const savedDeck = await deck.save();
    return this.toResponseDto(savedDeck);
  }

  async findAll(queryDto: QueryDeckDto, userId?: string): Promise<PaginatedDecksResponseDto> {
    const { page = 1, limit = 20, query, tags, mine, sort = 'created_at', order = 'desc' } = queryDto;

    const filter: any = {};

    // Filtro: apenas meus decks
    if (mine && userId) {
      filter.owner_id = new Types.ObjectId(userId);
    }

    // Filtro: busca textual
    if (query) {
      filter.$text = { $search: query };
    }

    // Filtro: tags
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
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
      data: data.map(deck => this.toResponseDto(deck)),
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

  async update(id: string, updateDeckDto: UpdateDeckDto, userId: string): Promise<DeckResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }

    const deck = await this.deckModel.findById(id).exec();

    if (!deck) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }

    // Apenas o proprietário pode editar
    if (deck.owner_id.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to update this deck');
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
      throw new ForbiddenException('You do not have permission to delete this deck');
    }

    await this.deckModel.findByIdAndDelete(id).exec();

    return { message: 'Deck deleted successfully' };
  }

  async incrementCardsCount(deckId: string): Promise<void> {
    await this.deckModel.findByIdAndUpdate(
      deckId,
      { $inc: { cards_count: 1 } },
    ).exec();
  }

  async decrementCardsCount(deckId: string): Promise<void> {
    await this.deckModel.findByIdAndUpdate(
      deckId,
      { $inc: { cards_count: -1 } },
    ).exec();
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
