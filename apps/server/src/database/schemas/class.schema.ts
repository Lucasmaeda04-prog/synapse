import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClassDocument = HydratedDocument<Class>;

@Schema({ collection: 'classes', timestamps: { createdAt: 'created_at' } })
export class Class {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacher_id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  student_ids!: Types.ObjectId[];

  @Prop({ type: String, required: false })
  org_id?: string;

  @Prop({ type: String, required: false })
  school_id?: string;
}

export const ClassSchema = SchemaFactory.createForClass(Class);

ClassSchema.index({ teacher_id: 1, created_at: -1 });

