import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Segurança básica
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS controlado por env (CORS_ORIGINS separado por vírgulas; '*' libera tudo)
  const origins = (config.get<string>('CORS_ORIGINS') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins.length === 0 || origins.includes('*') ? true : origins,
    credentials: true,
  });

  // Swagger condicional
  if ((config.get<string>('SWAGGER_ENABLED') || '').toLowerCase() === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Synapse API')
      .setDescription('Documentação da API do Synapse')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const doc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('/docs', app, doc);
  }

  const port = Number(config.get<string>('PORT') ?? 3000);
  const host = process.env.HOST; // Se não definido, escuta em todas as interfaces compatíveis
  if (host) {
    await app.listen(port, host);
  } else {
    await app.listen(port);
  }
}
bootstrap();
