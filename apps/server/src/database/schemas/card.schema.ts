import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CardDocument = HydratedDocument<Card>;

class MediaItem {
  @Prop({ required: true, enum: ['image', 'audio', 'video'] })
  type!: 'image' | 'audio' | 'video';

  @Prop({ required: true })
  url!: string;
}

@Schema({
  collection: 'cards',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Card {
  @Prop({ type: Types.ObjectId, ref: 'Deck', required: true })
  deck_id!: Types.ObjectId;

  @Prop({ required: true })
  front!: string;

  @Prop({ required: true })
  back!: string;

  @Prop({ type: [String], default: [] })
  hints!: string[];

  @Prop({ type: [MediaItem], default: [] })
  media!: MediaItem[];
}

export const CardSchema = SchemaFactory.createForClass(Card);

CardSchema.index({ deck_id: 1 });
