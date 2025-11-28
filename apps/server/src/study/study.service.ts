import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardDocument } from '../database/schemas/card.schema';
import { Deck, DeckDocument } from '../database/schemas/deck.schema';
import { Class, ClassDocument } from '../database/schemas/class.schema';
import { Review, ReviewDocument } from '../database/schemas/review.schema';
import { Progress, ProgressDocument } from '../database/schemas/progress.schema';
import { Assignment, AssignmentDocument } from '../database/schemas/assignment.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueueQueryDto } from './dto/queue-query.dto';
import { ProgressQueryDto } from './dto/progress-query.dto';
import { QueueResponseDto, CardInQueueDto } from './dto/queue-response.dto';
import { ProgressResponseDto, DeckProgressDto } from './dto/progress-response.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { scheduleNext, parseRating } from './srs.algorithm';

@Injectable()
export class StudyService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    @InjectModel(Deck.name) private deckModel: Model<DeckDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Assignment.name) private assignmentModel: Model<AssignmentDocument>,
  ) {}

  /**
   * Retorna a fila de cards para estudar (novos + devidos)
   */
  async getQueue(queryDto: QueueQueryDto, studentId: string): Promise<QueueResponseDto> {
    const { deckId, limit = 20 } = queryDto;
    const deckObjectId = new Types.ObjectId(deckId);
    const studentObjectId = new Types.ObjectId(studentId);

    // Verificar se o deck existe
    const deck = await this.deckModel.findById(deckObjectId);
    if (!deck) {
      throw new NotFoundException('Deck não encontrado');
    }

    // Verificar se o usuário é dono do deck
    const isOwner = deck.owner_id.toString() === studentId;

    // Se não é dono, verificar se tem acesso via Assignment
    if (!isOwner) {
      const hasAccess = await this.assignmentModel.exists({
        deck_id: deckObjectId,
        $or: [
          { student_id: studentObjectId },
          {
            class_id: {
              $in: await this.getStudentClassIds(studentId),
            },
          },
        ],
      });

      if (!hasAccess) {
        throw new NotFoundException('Você não tem acesso a este deck');
      }
    }

    // Buscar todos os cards do deck
    const allCards = await this.cardModel
      .find({ deck_id: deckObjectId })
      .select('_id deck_id front back')
      .lean();

    // Buscar reviews do aluno para este deck
    const reviews = await this.reviewModel
      .find({
        student_id: studentObjectId,
        deck_id: deckObjectId,
      })
      .select('card_id next_due_at')
      .lean();

    const reviewMap = new Map(reviews.map((r) => [r.card_id.toString(), r]));

    const now = new Date();
    const queue: CardInQueueDto[] = [];

    for (const card of allCards) {
      const review = reviewMap.get(card._id.toString());

      if (!review) {
        // Card novo (nunca estudado)
        queue.push({
          card_id: card._id.toString(),
          deck_id: card.deck_id.toString(),
          front: card.front,
          back: card.back,
          is_new: true,
        });
      } else if (review.next_due_at <= now) {
        // Card devido (precisa revisar)
        queue.push({
          card_id: card._id.toString(),
          deck_id: card.deck_id.toString(),
          front: card.front,
          back: card.back,
          next_due_at: review.next_due_at,
          is_new: false,
        });
      }
    }

    // Ordenar: novos primeiro, depois por next_due_at mais antigo
    queue.sort((a, b) => {
      if (a.is_new && !b.is_new) return -1;
      if (!a.is_new && b.is_new) return 1;
      if (a.next_due_at && b.next_due_at) {
        return a.next_due_at.getTime() - b.next_due_at.getTime();
      }
      return 0;
    });

    return {
      total: queue.length,
      cards: queue.slice(0, limit),
    };
  }

  /**
   * Submete uma review e atualiza o estado do card
   */
  async submitReview(reviewDto: CreateReviewDto, studentId: string): Promise<ReviewResponseDto> {
    const { card_id, deck_id, rating, elapsed_ms } = reviewDto;
    const studentObjectId = new Types.ObjectId(studentId);
    const cardObjectId = new Types.ObjectId(card_id);
    const deckObjectId = new Types.ObjectId(deck_id);

    // Validar rating
    const validRating = parseRating(rating);

    // Verificar se o card existe
    const card = await this.cardModel.findById(cardObjectId);
    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    // Verificar se o card pertence ao deck
    if (card.deck_id.toString() !== deck_id) {
      throw new BadRequestException('Card não pertence ao deck informado');
    }

    // Buscar review anterior (se existir)
    const previousReview = await this.reviewModel.findOne({
      student_id: studentObjectId,
      card_id: cardObjectId,
    });

    // Calcular próximo agendamento usando o algoritmo SRS
    const prevState = previousReview
      ? {
          stability: previousReview.stability,
          difficulty: previousReview.difficulty,
          intervalDays: this.calculateIntervalDays(
            previousReview.scheduled_at,
            previousReview.reviewed_at,
          ),
        }
      : null;

    const now = new Date();
    const scheduleResult = scheduleNext(prevState, validRating, elapsed_ms, now);

    // DEBUG: Log para verificar os intervalos
    console.log('=== DEBUG SRS ===');
    console.log('Rating:', validRating);
    console.log('Now:', now.toISOString());
    console.log('Next Due:', scheduleResult.next_due_at.toISOString());
    console.log('Interval (minutos):', (scheduleResult.next_due_at.getTime() - now.getTime()) / 60000);
    console.log('=================');

    // Atualizar ou criar review (upsert)
    await this.reviewModel.findOneAndUpdate(
      {
        student_id: studentObjectId,
        card_id: cardObjectId,
      },
      {
        deck_id: deckObjectId,
        rating: validRating,
        elapsed_ms,
        scheduled_at: previousReview?.next_due_at || now,
        reviewed_at: now,
        next_due_at: scheduleResult.next_due_at,
        stability: scheduleResult.stability,
        difficulty: scheduleResult.difficulty,
      },
      { upsert: true, new: true },
    );

    // Atualizar progress
    await this.updateProgress(studentId, deck_id);

    return {
      success: true,
      next_due_at: scheduleResult.next_due_at,
      stability: scheduleResult.stability,
      difficulty: scheduleResult.difficulty,
      interval_days: scheduleResult.intervalDays,
    };
  }

  /**
   * Retorna o progresso do aluno (todos os decks ou um específico)
   */
  async getProgress(queryDto: ProgressQueryDto, studentId: string): Promise<ProgressResponseDto> {
    const { deckId } = queryDto;
    const studentObjectId = new Types.ObjectId(studentId);

    const filter: any = { student_id: studentObjectId };
    if (deckId) {
      filter.deck_id = new Types.ObjectId(deckId);
    }

    const progressDocs = await this.progressModel.find(filter).lean();

    const decks: DeckProgressDto[] = progressDocs.map((p) => ({
      deck_id: p.deck_id.toString(),
      total_cards: p.total_cards,
      learned: p.learned,
      due_today: p.due_today,
      last_activity_at: p.last_activity_at,
    }));

    return { decks };
  }

  /**
   * Atualiza o progresso do aluno em um deck
   */
  private async updateProgress(studentId: string, deckId: string): Promise<void> {
    const studentObjectId = new Types.ObjectId(studentId);
    const deckObjectId = new Types.ObjectId(deckId);

    // Total de cards no deck
    const totalCards = await this.cardModel.countDocuments({ deck_id: deckObjectId });

    // Cards aprendidos (revisados ao menos uma vez)
    const learned = await this.reviewModel.countDocuments({
      student_id: studentObjectId,
      deck_id: deckObjectId,
    });

    // Cards devidos hoje
    const now = new Date();
    const dueToday = await this.reviewModel.countDocuments({
      student_id: studentObjectId,
      deck_id: deckObjectId,
      next_due_at: { $lte: now },
    });

    await this.progressModel.findOneAndUpdate(
      {
        student_id: studentObjectId,
        deck_id: deckObjectId,
      },
      {
        total_cards: totalCards,
        learned,
        due_today: dueToday,
        last_activity_at: now,
      },
      { upsert: true },
    );
  }

  /**
   * Retorna os IDs das turmas do aluno
   */
  private async getStudentClassIds(studentId: string): Promise<Types.ObjectId[]> {
    const studentObjectId = new Types.ObjectId(studentId);

    // Buscar todas as turmas onde o aluno está matriculado
    const classes = await this.classModel
      .find({ student_ids: studentObjectId })
      .select('_id')
      .lean();

    return classes.map((c) => c._id);
  }

  /**
   * Calcula o intervalo em dias entre duas datas
   */
  private calculateIntervalDays(from: Date, to: Date): number {
    const diffMs = to.getTime() - from.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    return Math.max(1, diffDays);
  }

  /**
   * [DEV] Reseta todos os reviews de um deck para um aluno
   * Útil para testes - permite estudar o deck do zero
   */
  async resetDeckReviews(deckId: string, studentId: string): Promise<{ deleted: number }> {
    const studentObjectId = new Types.ObjectId(studentId);
    const deckObjectId = new Types.ObjectId(deckId);

    // Deletar todos os reviews do aluno para este deck
    const result = await this.reviewModel.deleteMany({
      student_id: studentObjectId,
      deck_id: deckObjectId,
    });

    // Deletar o progresso também
    await this.progressModel.deleteMany({
      student_id: studentObjectId,
      deck_id: deckObjectId,
    });

    console.log(`[DEV] Reset reviews - Deck: ${deckId}, Student: ${studentId}, Deleted: ${result.deletedCount}`);

    return { deleted: result.deletedCount };
  }

  /**
   * [DEV] Reseta TODOS os reviews de um deck (todos os alunos)
   * Útil para testes - limpa completamente o deck
   */
  async resetAllDeckReviews(deckId: string): Promise<{ deleted: number }> {
    const deckObjectId = new Types.ObjectId(deckId);

    // Deletar todos os reviews de todos os alunos para este deck
    const result = await this.reviewModel.deleteMany({
      deck_id: deckObjectId,
    });

    // Deletar o progresso também
    await this.progressModel.deleteMany({
      deck_id: deckObjectId,
    });

    console.log(`[DEV] Reset ALL reviews - Deck: ${deckId}, Deleted: ${result.deletedCount}`);

    return { deleted: result.deletedCount };
  }
}
