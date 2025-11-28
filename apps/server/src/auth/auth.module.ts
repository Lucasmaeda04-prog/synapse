import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseService } from './firebase.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RolesGuard } from './roles.guard';
import { User, UserSchema } from '../database/schemas/user.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [FirebaseService, FirebaseAuthGuard, RolesGuard],
  exports: [
    FirebaseService,
    FirebaseAuthGuard,
    RolesGuard,
    MongooseModule, // Export MongooseModule to provide access to User model
  ],
})
export class AuthModule {}
