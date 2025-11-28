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
  const port = Number(config.get<string>('PORT') ?? 3000);
  if ((config.get<string>('SWAGGER_ENABLED') || '').toLowerCase() === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Synapse API')
      .setDescription(
        'API do Synapse - Plataforma de aprendizado com repetição espaçada\n\n' +
          '## Recursos disponíveis\n' +
          '- **Decks**: Criar e gerenciar decks de flashcards ✅\n' +
          '- **Classes**: Gerenciar turmas e alunos ✅\n' +
          '- **Study**: Sistema de estudo com repetição espaçada (SRS) ✅\n' +
          '- **Cards**: Gerenciar cards dentro dos decks ✅\n' +
          '- **Reports**: Relatórios de progresso (em breve)\n\n' +
          '## Autenticação\n' +
          'A autenticação será implementada via JWT Bearer Token.\n' +
          'Por enquanto, as rotas usam IDs temporários para testes.',
      )
      .setVersion('0.1.0')
      .addTag('decks', 'Operações relacionadas a decks de flashcards')
      .addTag('classes', 'Operações relacionadas a turmas')
      .addTag('study', 'Sistema de estudo com repetição espaçada (SRS)')
      .addTag('health', 'Status e saúde da aplicação')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token de autenticação (em breve)',
        },
        'JWT-auth',
      )
      .build();
    const doc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('/docs', app, doc, {
      customSiteTitle: 'Synapse API Docs',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
      customCss: '.swagger-ui .topbar { display: none }',
    });
    console.log(
      `\n📚 Swagger documentation available at: http://localhost:${port}/docs\n`,
    );
  }

  const host = process.env.HOST; // Se não definido, escuta em todas as interfaces compatíveis
  if (host) {
    await app.listen(port, host);
  } else {
    await app.listen(port);
  }
}
bootstrap();
