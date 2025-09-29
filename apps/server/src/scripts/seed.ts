import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AppModule } from '../app.module';
import { User } from '../database/schemas/user.schema';
import { Deck } from '../database/schemas/deck.schema';
import { Card } from '../database/schemas/card.schema';
import { Class as ClassEntity } from '../database/schemas/class.schema';
import { Assignment } from '../database/schemas/assignment.schema';
import { Review } from '../database/schemas/review.schema';
import { Progress } from '../database/schemas/progress.schema';

async function run() {
  const logger = new Logger('Seed');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    // Resolve models from Nest context (uses same Mongoose connection/config)
    const UserModel = app.get<Model<User>>(getModelToken('User'));
    const DeckModel = app.get<Model<Deck>>(getModelToken('Deck'));
    const CardModel = app.get<Model<Card>>(getModelToken('Card'));
    const ClassModel = app.get<Model<ClassEntity>>(getModelToken('Class'));
    const AssignmentModel = app.get<Model<Assignment>>(getModelToken('Assignment'));
    const ReviewModel = app.get<Model<Review>>(getModelToken('Review'));
    const ProgressModel = app.get<Model<Progress>>(getModelToken('Progress'));

    // 1) Users (teacher + student)
    const teacher = await UserModel.findOneAndUpdate(
      { email: 'professor@synapse.com' },
      { $set: { name: 'Prof. Maria Silva', role: 'TEACHER', password_hash: 'seed' } },
      { upsert: true, new: true },
    ).lean();

    const student = await UserModel.findOneAndUpdate(
      { email: 'aluno@synapse.com' },
      { $set: { name: 'João Santos', role: 'STUDENT', password_hash: 'seed' } },
      { upsert: true, new: true },
    ).lean();

    if (!teacher || !student) throw new Error('Users upsert failed');

    const teacherId = new Types.ObjectId((teacher as any)._id);
    const studentId = new Types.ObjectId((student as any)._id);

    // 2) Deck
    const deck = await DeckModel.findOneAndUpdate(
      { owner_id: teacherId, title: 'Biologia - Sistema Nervoso' },
      {
        $setOnInsert: {
          description: 'Conceitos básicos do sistema nervoso',
          tags: ['biologia', 'neuro'],
          is_public: false,
          cards_count: 0,
        },
      },
      { upsert: true, new: true },
    ).lean();
    const deckId = new Types.ObjectId((deck as any)._id);

    // 3) Card
    const card = await CardModel.findOneAndUpdate(
      { deck_id: deckId, front: 'O que é um neurônio?' },
      {
        $setOnInsert: {
          back: 'Célula especializada na transmissão de impulsos nervosos.',
          hints: ['célula', 'impulsos elétricos'],
          media: [],
        },
      },
      { upsert: true, new: true },
    ).lean();
    const cardId = new Types.ObjectId((card as any)._id);

    // Atualiza cards_count do deck (não crítico se concorrente)
    await DeckModel.updateOne({ _id: deckId }, [
      { $set: { cards_count: { $ifNull: ['$cards_count', 0] } } },
    ]);
    const deckCardsCount = await CardModel.countDocuments({ deck_id: deckId });
    await DeckModel.updateOne({ _id: deckId }, { $set: { cards_count: deckCardsCount } });

    // 4) Class (turma) com o aluno matriculado
    const klass = await ClassModel.findOneAndUpdate(
      { teacher_id: teacherId, name: 'Turma A - 1º Ano' },
      { $setOnInsert: { student_ids: [studentId] } },
      { upsert: true, new: true },
    ).lean();
    const classId = new Types.ObjectId((klass as any)._id);

    // 5) Assignment (deck → turma)
    await AssignmentModel.findOneAndUpdate(
      { deck_id: deckId, class_id: classId },
      { $setOnInsert: { due_date: null } },
      { upsert: true, new: true },
    ).lean();

    // 6) Review (estado atual do aluno para o card)
    const now = new Date();
    await ReviewModel.findOneAndUpdate(
      { student_id: studentId, card_id: cardId },
      {
        $setOnInsert: {
          deck_id: deckId,
          rating: 2, // Good
          elapsed_ms: 3500,
          scheduled_at: now,
          reviewed_at: now,
          next_due_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          stability: 0.3,
          difficulty: 0.3,
        },
      },
      { upsert: true, new: true },
    );

    // 7) Progress (materializado simples)
    await ProgressModel.findOneAndUpdate(
      { student_id: studentId, deck_id: deckId },
      {
        $set: {
          total_cards: deckCardsCount,
          learned: 1,
          due_today: 0,
          last_activity_at: now,
        },
      },
      { upsert: true, new: true },
    );

    logger.log('Seed concluído com sucesso. Verifique as coleções no Atlas.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

run();

