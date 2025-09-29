import { Global, Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserSchema } from './schemas/user.schema';
import { Deck, DeckSchema } from './schemas/deck.schema';
import { Card, CardSchema } from './schemas/card.schema';
import { Class as ClassEntity, ClassSchema } from './schemas/class.schema';
import { Assignment, AssignmentSchema } from './schemas/assignment.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Progress, ProgressSchema } from './schemas/progress.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Deck.name, schema: DeckSchema },
      { name: Card.name, schema: CardSchema },
      { name: ClassEntity.name, schema: ClassSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Progress.name, schema: ProgressSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule implements OnModuleInit {
  async onModuleInit() {
    // Índices declarados nas Schemas; Mongoose pode criá-los conforme config (autoIndex).
    // Para ambientes prod, recomendo gerenciar via scripts de migração de índices.
  }
}
