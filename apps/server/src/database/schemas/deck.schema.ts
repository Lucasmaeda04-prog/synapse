import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DeckDocument = HydratedDocument<Deck>;

@Schema({
  collection: 'decks',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Deck {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner_id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: false, default: '' })
  description?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Boolean, default: false })
  is_public!: boolean;

  @Prop({ type: Number, default: 0 })
  cards_count!: number;

  @Prop({ type: String, required: false })
  org_id?: string;

  @Prop({ type: String, required: false })
  school_id?: string;
}

export const DeckSchema = SchemaFactory.createForClass(Deck);

DeckSchema.index({ owner_id: 1, created_at: -1 });
// Text index combinando campos relevantes para busca
DeckSchema.index({ title: 'text', description: 'text', tags: 'text' });
