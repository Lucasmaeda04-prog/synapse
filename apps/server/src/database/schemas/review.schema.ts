import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  collection: 'reviews',
  timestamps: false,
})
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  card_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Deck', required: true })
  deck_id!: Types.ObjectId;

  @Prop({ type: Number, enum: [0, 1, 2, 3], required: true })
  rating!: 0 | 1 | 2 | 3; // Again/Hard/Good/Easy

  @Prop({ type: Number, required: true })
  elapsed_ms!: number;

  @Prop({ type: Date, required: true })
  scheduled_at!: Date;

  @Prop({ type: Date, required: true })
  reviewed_at!: Date;

  @Prop({ type: Date, required: true })
  next_due_at!: Date;

  @Prop({ type: Number, required: true })
  stability!: number;

  @Prop({ type: Number, required: true })
  difficulty!: number;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Índices para fila e garantia de 1 estado por aluno+card
ReviewSchema.index({ student_id: 1, card_id: 1 }, { unique: true });
ReviewSchema.index({ student_id: 1, next_due_at: 1 });
ReviewSchema.index({ deck_id: 1, student_id: 1 });

