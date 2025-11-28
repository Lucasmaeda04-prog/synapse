import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyController, StudyDevController } from './study.controller';
import { StudyService } from './study.service';
import { Card, CardSchema } from '../database/schemas/card.schema';
import { Deck, DeckSchema } from '../database/schemas/deck.schema';
import { Class, ClassSchema } from '../database/schemas/class.schema';
import { Review, ReviewSchema } from '../database/schemas/review.schema';
import { Progress, ProgressSchema } from '../database/schemas/progress.schema';
import { Assignment, AssignmentSchema } from '../database/schemas/assignment.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: Deck.name, schema: DeckSchema },
      { name: Class.name, schema: ClassSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: Assignment.name, schema: AssignmentSchema },
    ]),
    AuthModule,
  ],
  controllers: [StudyController, StudyDevController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
