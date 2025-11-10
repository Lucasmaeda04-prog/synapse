import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { Deck, DeckSchema } from '../database/schemas/deck.schema';
import {
  Assignment,
  AssignmentSchema,
} from '../database/schemas/assignment.schema';
import { Class, ClassSchema } from '../database/schemas/class.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deck.name, schema: DeckSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Class.name, schema: ClassSchema },
    ]),
    AuthModule,
  ],
  controllers: [DecksController],
  providers: [DecksService],
  exports: [DecksService],
})
export class DecksModule {}
