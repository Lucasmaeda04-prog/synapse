import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProgressDocument = HydratedDocument<Progress>;

@Schema({
  collection: 'progress',
  timestamps: false,
})
export class Progress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Deck', required: true })
  deck_id!: Types.ObjectId;

  @Prop({ type: Number, required: true })
  total_cards!: number;

  @Prop({ type: Number, required: true })
  learned!: number;

  @Prop({ type: Number, required: true })
  due_today!: number;

  @Prop({ type: Date, required: true })
  last_activity_at!: Date;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

ProgressSchema.index({ student_id: 1, deck_id: 1 }, { unique: true });
