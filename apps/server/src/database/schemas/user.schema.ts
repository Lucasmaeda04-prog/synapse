import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class User {
  @Prop({ required: true })
  uid!: string; // Firebase UID

  @Prop({ required: true, enum: ['ADMIN', 'TEACHER', 'STUDENT'] })
  role!: UserRole;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: false, default: '' })
  password_hash?: string; // Opcional quando usando Firebase

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: false })
  org_id?: string;

  @Prop({ type: String, required: false })
  school_id?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ uid: 1 }, { unique: true });
