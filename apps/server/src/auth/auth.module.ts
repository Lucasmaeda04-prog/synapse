import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseService, FirebaseAuthGuard, RolesGuard],
  exports: [FirebaseService, FirebaseAuthGuard, RolesGuard],
})
export class AuthModule {}
