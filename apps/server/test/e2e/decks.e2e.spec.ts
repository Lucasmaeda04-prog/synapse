import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { FirebaseAuthGuard } from '../../src/auth/firebase-auth.guard';
import { RolesGuard } from '../../src/auth/roles.guard';

// primeira execução pode demorar (download do MongoDB binary)
jest.setTimeout(60000);

describe('Decks (e2e)', () => {
  let app: INestApplication | undefined;
  let mongod: MongoMemoryServer | undefined;
  let server: any;

  const teacherHex = new Types.ObjectId().toHexString();

  const fakeAuthGuard = {
    canActivate: (context: any) => {
      const req = context.switchToHttp().getRequest();
      // simula usuário professor autenticado
      req.user = { userId: teacherHex, role: 'TEACHER' };
      return true;
    },
  };

  const allowRolesGuard = { canActivate: () => true };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri; // garante uso do banco em memória

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(FirebaseAuthGuard).useValue(fakeAuthGuard)
      .overrideGuard(RolesGuard).useValue(allowRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  let createdId: string;

  it('POST /decks (create)', async () => {
    const payload = {
      title: 'Matemática Básica',
      description: 'Operações fundamentais',
      tags: ['matemática', 'básico'],
      is_public: false,
    };
    const res = await request(server).post('/decks').send(payload).expect(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toMatchObject({
      title: 'Matemática Básica',
      description: 'Operações fundamentais',
      tags: ['matemática', 'básico'],
      is_public: false,
      cards_count: 0,
      owner_id: teacherHex,
    });
    createdId = res.body._id;
  });

  it('GET /decks (list)', async () => {
    const res = await request(server).get('/decks').expect(200);
    const list = res.body.data || res.body;
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((d: any) => String(d._id) === String(createdId))).toBe(true);
  });

  it('GET /decks/:id (get by id)', async () => {
    const res = await request(server).get(`/decks/${createdId}`).expect(200);
    expect(res.body).toHaveProperty('_id', createdId);
  });

  it('PATCH /decks/:id (update)', async () => {
    const res = await request(server)
      .patch(`/decks/${createdId}`)
      .send({ title: 'Matemática Avançada', is_public: true })
      .expect(200);
    expect(res.body).toHaveProperty('title', 'Matemática Avançada');
    expect(res.body).toHaveProperty('is_public', true);
  });

  it('DELETE /decks/:id (delete)', async () => {
    const res = await request(server).delete(`/decks/${createdId}`).expect(200);
    expect(res.body).toEqual({ message: 'Deck deleted successfully' });
  });
});
