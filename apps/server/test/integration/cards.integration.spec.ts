// test/integration/cards.integration-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CardsModule } from '../../src/cards/cards.module';
import { DecksModule } from '../../src/decks/decks.module';
import { FirebaseAuthGuard } from '../../src/auth/firebase-auth.guard';
import { RolesGuard } from '../../src/auth/roles.guard';

jest.setTimeout(60000);

describe('Cards - Integration (module)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let server: any;

  const teacherHex = new Types.ObjectId().toHexString();

  const fakeAuthGuard = {
    canActivate: (ctx: any) => {
      const req = ctx.switchToHttp().getRequest();
      req.user = { userId: teacherHex, role: 'TEACHER' };
      return true;
    },
  };
  const allowRoles = { canActivate: () => true };

  let deckId: string;
  let cardId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        DecksModule,
        CardsModule,
      ],
    })
      .overrideGuard(FirebaseAuthGuard).useValue(fakeAuthGuard)
      .overrideGuard(RolesGuard).useValue(allowRoles)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('POST /decks -> cria deck', async () => {
    const res = await request(server)
      .post('/decks')
      .send({ title: 'Deck Integration Cards' })
      .expect(201);

    deckId = res.body._id;
    expect(deckId).toBeDefined();
  });

  it('POST /decks/:deckId/cards -> cria card', async () => {
    const res = await request(server)
      .post(`/decks/${deckId}/cards`)
      .send({
        front: 'Pergunta Integration',
        back: 'Resposta Integration',
        hints: ['hintIntegration'],
      })
      .expect(201);

    cardId = res.body._id;
    expect(cardId).toBeDefined();
  });

  it('GET /decks/:deckId/cards -> lista cards', async () => {
    const res = await request(server)
      .get(`/decks/${deckId}/cards`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((c: any) => c._id === cardId)).toBe(true);
  });

  it('GET /cards/:id -> retorna card', async () => {
    const res = await request(server)
      .get(`/cards/${cardId}`)
      .expect(200);

    expect(res.body).toHaveProperty('_id', cardId);
  });

  it('PATCH /cards/:id -> atualiza card', async () => {
    const res = await request(server)
      .patch(`/cards/${cardId}`)
      .send({ back: 'Resposta Atualizada' })
      .expect(200);

    expect(res.body).toHaveProperty('back', 'Resposta Atualizada');
  });

  it('DELETE /cards/:id -> remove card', async () => {
    await request(server).delete(`/cards/${cardId}`).expect(204);
  });
});
