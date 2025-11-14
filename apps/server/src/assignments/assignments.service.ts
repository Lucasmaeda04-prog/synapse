import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  Assignment,
  AssignmentDocument,
} from '../database/schemas/assignment.schema';
import { Deck, DeckDocument } from '../database/schemas/deck.schema';
import { Class, ClassDocument } from '../database/schemas/class.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { QueryAssignmentDto } from './dto/query-assignment.dto';

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

interface DeckLean {
  _id: Types.ObjectId;
  owner_id: Types.ObjectId;
  title: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  cards_count?: number;
  org_id?: string;
  school_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface AssignmentLean {
  _id: Types.ObjectId;
  deck_id: Types.ObjectId | DeckLean;
  class_id?: Types.ObjectId | null;
  student_id?: Types.ObjectId | null;
  due_date?: Date | null;
  created_at?: Date;
}

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Deck.name)
    private readonly deckModel: Model<DeckDocument>,
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
  ) {}

  async create(
    createDto: CreateAssignmentDto,
    userId: string,
    userRole: UserRole,
  ): Promise<AssignmentResponseDto> {
    if (!createDto.class_id && !createDto.student_id) {
      throw new BadRequestException(
        'É necessário informar class_id ou student_id',
      );
    }

    if (createDto.class_id && createDto.student_id) {
      throw new BadRequestException(
        'Informe apenas class_id ou student_id, não ambos',
      );
    }

    const deck = await this.deckModel
      .findById(this.toObjectId(createDto.deck_id, 'deck_id'))
      .exec();

    if (!deck) {
      throw new NotFoundException(
        `Deck com ID ${createDto.deck_id} não encontrado`,
      );
    }

    if (
      userRole === 'TEACHER' &&
      deck.owner_id.toString() !== userId.toString()
    ) {
      throw new ForbiddenException('Você não pode atribuir decks de terceiros');
    }

    let classEntity: ClassDocument | null = null;
    if (createDto.class_id) {
      classEntity = await this.validateClassAccess(
        createDto.class_id,
        userId,
        userRole,
      );

      const duplicate = await this.assignmentModel
        .findOne({
          deck_id: deck._id,
          class_id: classEntity._id,
        })
        .lean()
        .exec();

      if (duplicate) {
        throw new BadRequestException(
          'Este deck já está atribuído para a turma informada',
        );
      }
    }

    let studentObjectId: Types.ObjectId | undefined;
    if (createDto.student_id) {
      studentObjectId = this.toObjectId(createDto.student_id, 'student_id');

      const duplicate = await this.assignmentModel
        .findOne({
          deck_id: deck._id,
          student_id: studentObjectId,
        })
        .lean()
        .exec();

      if (duplicate) {
        throw new BadRequestException(
          'Este deck já está atribuído para o aluno informado',
        );
      }
    }

    let dueDate: Date | undefined;
    if (createDto.due_date) {
      dueDate = new Date(createDto.due_date);
      if (Number.isNaN(dueDate.getTime())) {
        throw new BadRequestException('due_date inválido');
      }
    }

    const assignment = new this.assignmentModel({
      deck_id: deck._id,
      class_id: classEntity?._id,
      student_id: studentObjectId,
      due_date: dueDate,
    });

    await assignment.save();
    await assignment.populate('deck_id');

    const leanAssignment = assignment.toObject() as AssignmentLean;
    return this.toResponseDto(leanAssignment);
  }

  async findAll(
    query: QueryAssignmentDto,
    userId: string,
    userRole: UserRole,
  ): Promise<AssignmentResponseDto[]> {
    const filter: FilterQuery<AssignmentDocument> = {};
    const userObjectId = this.toObjectId(userId, 'userId');

    if (query.deck_id) {
      filter.deck_id = this.toObjectId(query.deck_id, 'deck_id');
    }

    if (query.class_id) {
      const classEntity = await this.validateClassAccess(
        query.class_id,
        userId,
        userRole,
      );
      filter.class_id = classEntity._id;
    }

    if (query.student_id) {
      const studentObjectId = this.toObjectId(query.student_id, 'student_id');

      if (
        userRole === 'STUDENT' &&
        studentObjectId.toString() !== userId.toString()
      ) {
        throw new ForbiddenException(
          'Você não pode acessar assignments de outro aluno',
        );
      }

      filter.student_id = studentObjectId;
    }

    if (!filter.class_id && !filter.student_id) {
      if (userRole === 'TEACHER' || userRole === 'ADMIN') {
        const classes = await this.classModel
          .find({ teacher_id: userObjectId })
          .select('_id')
          .lean()
          .exec();

        if (classes.length === 0) {
          return [];
        }

        filter.class_id = { $in: classes.map((klass) => klass._id) };
      } else if (userRole === 'STUDENT') {
        const classes = await this.classModel
          .find({ student_ids: userObjectId })
          .select('_id')
          .lean()
          .exec();

        filter.$or = [{ student_id: userObjectId }];

        if (classes.length > 0) {
          filter.$or.push({ class_id: { $in: classes.map((cls) => cls._id) } });
        }
      }
    }

    const assignments = (await this.assignmentModel
      .find(filter)
      .sort({ created_at: -1 })
      .populate('deck_id')
      .lean()
      .exec()) as AssignmentLean[];

    return assignments.map((assignment) => this.toResponseDto(assignment));
  }

  async remove(
    assignmentId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ message: string }> {
    const assignmentObjectId = this.toObjectId(assignmentId, 'assignmentId');
    const assignment = (await this.assignmentModel
      .findById(assignmentObjectId)
      .lean()
      .exec()) as (Assignment & { _id: Types.ObjectId }) | null;

    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} não encontrado`);
    }

    const deck = await this.deckModel.findById(assignment.deck_id).exec();
    if (!deck) {
      throw new NotFoundException('Deck associado não encontrado');
    }

    let classEntity: ClassDocument | null = null;
    if (assignment.class_id) {
      classEntity = await this.classModel.findById(assignment.class_id).exec();
    }

    const isTeacherOwner =
      userRole === 'TEACHER' &&
      (deck.owner_id.toString() === userId ||
        classEntity?.teacher_id.toString() === userId);

    const isAdmin = userRole === 'ADMIN';

    if (!isTeacherOwner && !isAdmin) {
      throw new ForbiddenException(
        'Você não possui permissão para remover este assignment',
      );
    }

    await this.assignmentModel.findByIdAndDelete(assignmentObjectId).exec();
    return { message: 'Assignment removido com sucesso' };
  }

  private async validateClassAccess(
    classId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<ClassDocument> {
    const objectId = this.toObjectId(classId, 'class_id');
    const classEntity = await this.classModel.findById(objectId).exec();

    if (!classEntity) {
      throw new NotFoundException(`Turma ${classId} não encontrada`);
    }

    if (
      userRole === 'TEACHER' &&
      classEntity.teacher_id.toString() !== userId
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta turma',
      );
    }

    if (userRole === 'STUDENT') {
      const isStudent = classEntity.student_ids.some(
        (studentId) => studentId.toString() === userId,
      );
      if (!isStudent) {
        throw new ForbiddenException(
          'Você não está autorizado a acessar esta turma',
        );
      }
    }

    return classEntity;
  }

  private toObjectId(value: string, field: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${field} inválido`);
    }
    return new Types.ObjectId(value);
  }

  private toResponseDto(assignment: AssignmentLean): AssignmentResponseDto {
    let deckId: string;
    let deck: AssignmentResponseDto['deck'];

    if (this.isDeckPopulated(assignment.deck_id)) {
      const populatedDeck = assignment.deck_id;
      deckId = populatedDeck._id.toString();
      deck = {
        _id: populatedDeck._id.toString(),
        owner_id: populatedDeck.owner_id.toString(),
        title: populatedDeck.title,
        description: populatedDeck.description,
        tags: populatedDeck.tags || [],
        is_public: populatedDeck.is_public ?? false,
        cards_count: populatedDeck.cards_count ?? 0,
        org_id: populatedDeck.org_id,
        school_id: populatedDeck.school_id,
        created_at: populatedDeck.created_at ?? new Date(),
        updated_at: populatedDeck.updated_at ?? new Date(),
      };
    } else {
      deckId = assignment.deck_id.toString();
      deck = undefined;
    }

    return {
      _id: assignment._id.toString(),
      deck_id: deckId,
      class_id: assignment.class_id?.toString(),
      student_id: assignment.student_id?.toString(),
      due_date: assignment.due_date ?? null,
      created_at: assignment.created_at ?? new Date(),
      deck,
    };
  }

  private isDeckPopulated(deck: Types.ObjectId | DeckLean): deck is DeckLean {
    return typeof deck === 'object' && deck !== null && 'title' in deck;
  }
}
