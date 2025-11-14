import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import {
  Assignment,
  AssignmentSchema,
} from '../database/schemas/assignment.schema';
import { Deck, DeckSchema } from '../database/schemas/deck.schema';
import { Class, ClassSchema } from '../database/schemas/class.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Deck.name, schema: DeckSchema },
      { name: Class.name, schema: ClassSchema },
    ]),
    AuthModule,
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
