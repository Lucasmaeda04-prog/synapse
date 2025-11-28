import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../database/schemas/review.schema';
import { Progress, ProgressDocument } from '../database/schemas/progress.schema';
import { Card, CardDocument } from '../database/schemas/card.schema';
import { Deck, DeckDocument } from '../database/schemas/deck.schema';
import { Class, ClassDocument } from '../database/schemas/class.schema';
import { Assignment, AssignmentDocument } from '../database/schemas/assignment.schema';
import { User, UserDocument } from '../database/schemas/user.schema';
import {
  StudentOverviewDto,
  DeckAnalyticsDto,
  StudentActivityDto,
  StudySessionDto,
} from './dto/student-report.dto';
import {
  TeacherOverviewDto,
  ClassReportDto,
  StudentProgressDto,
  DeckPerformanceDto,
  DeckDetailedReportDto,
  CardAnalyticsDto,
} from './dto/teacher-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    @InjectModel(Deck.name) private deckModel: Model<DeckDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Assignment.name) private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Retorna visão geral do aluno com estatísticas de todos os decks
   */
  async getStudentOverview(studentId: string): Promise<StudentOverviewDto> {
    const studentObjectId = new Types.ObjectId(studentId);

    // Buscar todos os decks que o aluno tem acesso (via assignment direto ou turma)
    const studentClasses = await this.classModel
      .find({ student_ids: studentObjectId })
      .select('_id')
      .lean();
    const classIds = studentClasses.map((c) => c._id);

    // Buscar assignments do aluno
    const assignments = await this.assignmentModel
      .find({
        $or: [
          { student_id: studentObjectId },
          { class_id: { $in: classIds } },
        ],
      })
      .select('deck_id')
      .lean();

    const deckIds = [...new Set(assignments.map((a) => a.deck_id.toString()))];

    // Buscar decks próprios também
    const ownDecks = await this.deckModel
      .find({ owner_id: studentObjectId })
      .select('_id')
      .lean();
    ownDecks.forEach((d) => {
      if (!deckIds.includes(d._id.toString())) {
        deckIds.push(d._id.toString());
      }
    });

    // Calcular estatísticas por deck
    const decks: DeckAnalyticsDto[] = [];
    let totalCards = 0;
    let totalLearned = 0;
    let totalDueToday = 0;
    let totalAnswers = 0;
    let totalCorrect = 0;
    let totalTimeMs = 0;

    for (const deckId of deckIds) {
      const deckStats = await this.getDeckAnalyticsForStudent(deckId, studentId);
      decks.push(deckStats);

      totalCards += deckStats.total_cards;
      totalLearned += deckStats.learned;
      totalDueToday += deckStats.due_today;
      totalAnswers += deckStats.total_answers;
      totalCorrect += deckStats.correct_answers;
      totalTimeMs += deckStats.time_spent_minutes * 60 * 1000;
    }

    return {
      student_id: studentId,
      total_decks: decks.length,
      total_cards: totalCards,
      total_learned: totalLearned,
      total_due_today: totalDueToday,
      overall_accuracy: totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
      total_time_spent_minutes: Math.round(totalTimeMs / 60000),
      decks,
    };
  }

  /**
   * Retorna estatísticas de um deck específico para um aluno
   */
  async getDeckAnalyticsForStudent(deckId: string, studentId: string): Promise<DeckAnalyticsDto> {
    const deckObjectId = new Types.ObjectId(deckId);
    const studentObjectId = new Types.ObjectId(studentId);

    // Buscar deck
    const deck = await this.deckModel.findById(deckObjectId).lean();
    if (!deck) {
      return this.getEmptyDeckAnalytics(deckId, 'Deck não encontrado');
    }

    // Total de cards no deck
    const totalCards = await this.cardModel.countDocuments({ deck_id: deckObjectId });

    // Buscar reviews do aluno para este deck
    const reviews = await this.reviewModel
      .find({
        student_id: studentObjectId,
        deck_id: deckObjectId,
      })
      .lean();

    // Calcular estatísticas
    const learned = reviews.length;
    const totalAnswers = reviews.length;
    // Rating 2 (Good) e 3 (Easy) são considerados corretos
    const correctAnswers = reviews.filter((r) => r.rating >= 2).length;
    const totalTimeMs = reviews.reduce((sum, r) => sum + (r.elapsed_ms || 0), 0);

    // Cards devido hoje
    const now = new Date();
    const dueToday = reviews.filter((r) => r.next_due_at && r.next_due_at <= now).length;

    // Última atividade
    const lastReview = reviews.sort((a, b) =>
      (b.reviewed_at?.getTime() || 0) - (a.reviewed_at?.getTime() || 0)
    )[0];

    return {
      deck_id: deckId,
      deck_title: deck.title,
      total_cards: totalCards,
      learned,
      due_today: dueToday,
      total_answers: totalAnswers,
      correct_answers: correctAnswers,
      accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
      time_spent_minutes: Math.round(totalTimeMs / 60000),
      last_activity_at: lastReview?.reviewed_at,
    };
  }

  /**
   * Retorna histórico de atividade do aluno
   */
  async getStudentActivity(studentId: string, days: number = 30): Promise<StudentActivityDto> {
    const studentObjectId = new Types.ObjectId(studentId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Buscar todas as reviews do período
    const reviews = await this.reviewModel
      .find({
        student_id: studentObjectId,
        reviewed_at: { $gte: startDate },
      })
      .sort({ reviewed_at: 1 })
      .lean();

    // Agrupar por dia
    const sessionsByDate = new Map<string, { cards: number; correct: number; timeMs: number }>();

    for (const review of reviews) {
      if (!review.reviewed_at) continue;
      const dateKey = review.reviewed_at.toISOString().split('T')[0];
      const existing = sessionsByDate.get(dateKey) || { cards: 0, correct: 0, timeMs: 0 };
      existing.cards += 1;
      existing.correct += review.rating >= 2 ? 1 : 0;
      existing.timeMs += review.elapsed_ms || 0;
      sessionsByDate.set(dateKey, existing);
    }

    const sessions: StudySessionDto[] = Array.from(sessionsByDate.entries()).map(([date, data]) => ({
      date,
      cards_studied: data.cards,
      accuracy: data.cards > 0 ? Math.round((data.correct / data.cards) * 100) : 0,
      time_minutes: Math.round(data.timeMs / 60000),
    }));

    // Calcular streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(
      Array.from(sessionsByDate.keys()).sort()
    );

    return {
      sessions,
      current_streak: currentStreak,
      longest_streak: longestStreak,
    };
  }

  /**
   * Retorna visão geral do professor
   */
  async getTeacherOverview(teacherId: string): Promise<TeacherOverviewDto> {
    const teacherObjectId = new Types.ObjectId(teacherId);

    // Contagens básicas
    const totalClasses = await this.classModel.countDocuments({ teacher_id: teacherObjectId });
    const totalDecks = await this.deckModel.countDocuments({ owner_id: teacherObjectId });

    // Buscar turmas do professor
    const classes = await this.classModel.find({ teacher_id: teacherObjectId }).lean();
    const studentIds = new Set<string>();
    classes.forEach((c) => {
      c.student_ids?.forEach((sid: Types.ObjectId) => studentIds.add(sid.toString()));
    });
    const totalStudents = studentIds.size;

    // Total de cards
    const totalCards = await this.cardModel.countDocuments({
      deck_id: { $in: await this.deckModel.find({ owner_id: teacherObjectId }).distinct('_id') },
    });

    // Total de assignments
    const deckIds = await this.deckModel.find({ owner_id: teacherObjectId }).distinct('_id');
    const totalAssignments = await this.assignmentModel.countDocuments({
      deck_id: { $in: deckIds },
    });

    // Calcular médias de progresso e acerto dos alunos
    let totalProgress = 0;
    let totalAccuracy = 0;
    let studentCount = 0;

    for (const studentId of studentIds) {
      const overview = await this.getStudentOverview(studentId);
      if (overview.total_cards > 0) {
        totalProgress += (overview.total_learned / overview.total_cards) * 100;
        totalAccuracy += overview.overall_accuracy;
        studentCount++;
      }
    }

    return {
      teacher_id: teacherId,
      total_classes: totalClasses,
      total_students: totalStudents,
      total_decks: totalDecks,
      total_cards: totalCards,
      total_assignments: totalAssignments,
      avg_student_progress: studentCount > 0 ? Math.round(totalProgress / studentCount) : 0,
      avg_student_accuracy: studentCount > 0 ? Math.round(totalAccuracy / studentCount) : 0,
    };
  }

  /**
   * Retorna relatório de uma turma específica
   */
  async getClassReport(classId: string): Promise<ClassReportDto> {
    const classObjectId = new Types.ObjectId(classId);

    const classDoc = await this.classModel.findById(classObjectId).lean();
    if (!classDoc) {
      throw new Error('Turma não encontrada');
    }

    // Buscar decks atribuídos à turma
    const assignments = await this.assignmentModel
      .find({ class_id: classObjectId })
      .distinct('deck_id');

    // Buscar progresso de cada aluno
    const students: StudentProgressDto[] = [];
    let totalProgress = 0;
    let totalAccuracy = 0;

    for (const studentId of classDoc.student_ids || []) {
      const user = await this.userModel.findById(studentId).lean();
      if (!user) continue;

      const overview = await this.getStudentOverview(studentId.toString());

      const progressPercent = overview.total_cards > 0
        ? Math.round((overview.total_learned / overview.total_cards) * 100)
        : 0;

      students.push({
        student_id: studentId.toString(),
        student_name: user.name,
        student_email: user.email,
        total_cards: overview.total_cards,
        learned: overview.total_learned,
        progress_percent: progressPercent,
        accuracy: overview.overall_accuracy,
        time_spent_minutes: overview.total_time_spent_minutes,
        last_activity_at: overview.decks[0]?.last_activity_at,
      });

      totalProgress += progressPercent;
      totalAccuracy += overview.overall_accuracy;
    }

    const studentCount = students.length;

    return {
      class_id: classId,
      class_name: classDoc.name,
      total_students: studentCount,
      total_decks: assignments.length,
      avg_progress: studentCount > 0 ? Math.round(totalProgress / studentCount) : 0,
      avg_accuracy: studentCount > 0 ? Math.round(totalAccuracy / studentCount) : 0,
      students,
    };
  }

  /**
   * Retorna performance de um deck específico (visão do professor)
   */
  async getDeckPerformance(deckId: string): Promise<DeckPerformanceDto> {
    const deckObjectId = new Types.ObjectId(deckId);

    const deck = await this.deckModel.findById(deckObjectId).lean();
    if (!deck) {
      throw new Error('Deck não encontrado');
    }

    const totalCards = await this.cardModel.countDocuments({ deck_id: deckObjectId });

    // Buscar todos os reviews deste deck
    const reviews = await this.reviewModel.find({ deck_id: deckObjectId }).lean();

    // Agrupar por aluno
    const studentStats = new Map<string, { learned: number; correct: number; total: number }>();

    for (const review of reviews) {
      const studentId = review.student_id.toString();
      const stats = studentStats.get(studentId) || { learned: 0, correct: 0, total: 0 };
      stats.learned += 1;
      stats.correct += review.rating >= 2 ? 1 : 0;
      stats.total += 1;
      studentStats.set(studentId, stats);
    }

    const studentsCount = studentStats.size;
    let totalProgress = 0;
    let totalAccuracy = 0;

    for (const stats of studentStats.values()) {
      totalProgress += totalCards > 0 ? (stats.learned / totalCards) * 100 : 0;
      totalAccuracy += stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    }

    // Buscar card mais difícil e mais fácil
    const cardStats = await this.getCardAnalytics(deckId);
    const sortedByAccuracy = [...cardStats].sort((a, b) => a.accuracy - b.accuracy);

    const hardestCard = sortedByAccuracy[0];
    const easiestCard = sortedByAccuracy[sortedByAccuracy.length - 1];

    return {
      deck_id: deckId,
      deck_title: deck.title,
      total_cards: totalCards,
      students_count: studentsCount,
      avg_progress: studentsCount > 0 ? Math.round(totalProgress / studentsCount) : 0,
      avg_accuracy: studentsCount > 0 ? Math.round(totalAccuracy / studentsCount) : 0,
      hardest_card: hardestCard ? {
        card_id: hardestCard.card_id,
        front: hardestCard.front,
        accuracy: hardestCard.accuracy,
      } : undefined,
      easiest_card: easiestCard ? {
        card_id: easiestCard.card_id,
        front: easiestCard.front,
        accuracy: easiestCard.accuracy,
      } : undefined,
    };
  }

  /**
   * Retorna análise detalhada de cada card do deck
   */
  async getDeckDetailedReport(deckId: string): Promise<DeckDetailedReportDto> {
    const deckObjectId = new Types.ObjectId(deckId);

    const deck = await this.deckModel.findById(deckObjectId).lean();
    if (!deck) {
      throw new Error('Deck não encontrado');
    }

    const cards = await this.getCardAnalytics(deckId);

    return {
      deck_id: deckId,
      deck_title: deck.title,
      cards,
    };
  }

  /**
   * Helper: Retorna análise de cada card
   */
  private async getCardAnalytics(deckId: string): Promise<CardAnalyticsDto[]> {
    const deckObjectId = new Types.ObjectId(deckId);

    const cards = await this.cardModel.find({ deck_id: deckObjectId }).lean();
    const result: CardAnalyticsDto[] = [];

    for (const card of cards) {
      const reviews = await this.reviewModel
        .find({ card_id: card._id })
        .lean();

      const totalAnswers = reviews.length;
      const correctAnswers = reviews.filter((r) => r.rating >= 2).length;
      const totalTimeMs = reviews.reduce((sum, r) => sum + (r.elapsed_ms || 0), 0);

      result.push({
        card_id: card._id.toString(),
        front: card.front,
        total_answers: totalAnswers,
        correct_answers: correctAnswers,
        accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
        avg_response_time_seconds: totalAnswers > 0 ? Math.round(totalTimeMs / totalAnswers / 1000) : 0,
      });
    }

    return result;
  }

  /**
   * Helper: Calcula streaks de estudo
   */
  private calculateStreaks(sortedDates: string[]): { currentStreak: number; longestStreak: number } {
    if (sortedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Verificar se estudou hoje ou ontem para streak atual
    const lastStudyDate = sortedDates[sortedDates.length - 1];
    if (lastStudyDate === today || lastStudyDate === yesterday) {
      currentStreak = 1;
    }

    // Calcular streaks
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / 86400000);

      if (diffDays === 1) {
        tempStreak++;
        if (sortedDates[i] === today || sortedDates[i] === yesterday) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  /**
   * Helper: Retorna analytics vazio para deck não encontrado
   */
  private getEmptyDeckAnalytics(deckId: string, title: string): DeckAnalyticsDto {
    return {
      deck_id: deckId,
      deck_title: title,
      total_cards: 0,
      learned: 0,
      due_today: 0,
      total_answers: 0,
      correct_answers: 0,
      accuracy: 0,
      time_spent_minutes: 0,
    };
  }
}
