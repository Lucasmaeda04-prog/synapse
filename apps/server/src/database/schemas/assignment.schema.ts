import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AssignmentDocument = HydratedDocument<Assignment>;

@Schema({ collection: 'assignments', timestamps: { createdAt: 'created_at' } })
export class Assignment {
  @Prop({ type: Types.ObjectId, ref: 'Deck', required: true })
  deck_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: false })
  class_id?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  student_id?: Types.ObjectId | null;

  @Prop({ type: Date, required: false })
  due_date?: Date | null;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

// Evitar duplicatas por deck/turma
AssignmentSchema.index(
  { deck_id: 1, class_id: 1 },
  { unique: true, partialFilterExpression: { class_id: { $exists: true } } },
);
// Evitar duplicatas por deck/aluno
AssignmentSchema.index(
  { deck_id: 1, student_id: 1 },
  { unique: true, partialFilterExpression: { student_id: { $exists: true } } },
);

