// test/e2e/cards.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { FirebaseAuthGuard } from '../../src/auth/firebase-auth.guard';
import { RolesGuard } from '../../src/auth/roles.guard';

jest.setTimeout(60000);

describe('Cards (e2e)', () => {
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
    process.env.MONGODB_URI = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

  it('POST /decks -> cria deck para usar nos cards', async () => {
    const res = await request(server)
      .post('/decks')
      .send({ title: 'Deck Cards E2E' })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    deckId = res.body._id;
  });

  it('POST /decks/:deckId/cards -> cria card', async () => {
    const payload = {
      front: 'Pergunta E2E',
      back: 'Resposta E2E',
      hints: ['hint1'],
    };

    const res = await request(server)
      .post(`/decks/${deckId}/cards`)
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toMatchObject({
      deck_id: deckId,
      front: 'Pergunta E2E',
      back: 'Resposta E2E',
      hints: ['hint1'],
    });

    cardId = res.body._id;
  });

  it('GET /decks/:deckId/cards -> lista cards do deck', async () => {
    const res = await request(server)
      .get(`/decks/${deckId}/cards`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((c: any) => c._id === cardId)).toBe(true);
  });

  it('GET /cards/:id -> retorna card por id', async () => {
    const res = await request(server)
      .get(`/cards/${cardId}`)
      .expect(200);

    expect(res.body).toHaveProperty('_id', cardId);
    expect(res.body).toHaveProperty('deck_id', deckId);
  });

  it('PATCH /cards/:id -> atualiza card', async () => {
    const res = await request(server)
      .patch(`/cards/${cardId}`)
      .send({ front: 'Pergunta Atualizada' })
      .expect(200);

    expect(res.body).toHaveProperty('front', 'Pergunta Atualizada');
  });

  it('DELETE /cards/:id -> deleta card', async () => {
    await request(server).delete(`/cards/${cardId}`).expect(204);
  });
});
    