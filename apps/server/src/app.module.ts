import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGODB_URI'),
        // Ajustes comuns de conexão; adapte conforme ambiente
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 20,
        autoIndex: true, // dev: true | prod: false + scripts de índice
      }),
    }),
    DatabaseModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, HealthService],
})
export class AppModule {}
