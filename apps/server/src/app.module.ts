import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { UsersModule } from './users/users.module';
import { DecksModule } from './decks/decks.module';
import { ClassesModule } from './classes/classes.module';
import { CardsModule } from './cards/cards.module';
import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGODB_URI'),
        // Ajustes comuns de conexão; adapte conforme ambiente
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 20,
        autoIndex: true, // dev: true | prod: false + scripts de índice
      }),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    DecksModule,
    ClassesModule,
    CardsModule,
    AssignmentsModule,
  ],
  controllers: [AppController, HealthController, AuthController],
  providers: [AppService, HealthService],
})
export class AppModule {}
