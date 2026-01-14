import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DecksModule } from '../../src/decks/decks.module';
import { FirebaseAuthGuard } from '../../src/auth/firebase-auth.guard';
import { RolesGuard } from '../../src/auth/roles.guard';

jest.setTimeout(60000);

describe('Decks - Integration (module)', () => {
  let app: INestApplication | undefined;
  let mongod: MongoMemoryServer | undefined;
  let server: any;

  const teacherHex = new Types.ObjectId().toHexString();

  const fakeAuthGuard = {
    canActivate: (context: any) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: teacherHex, role: 'TEACHER' };
      return true;
    },
  };
  const allowRolesGuard = { canActivate: () => true };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        DecksModule, // apenas o módulo sob teste
      ],
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

  it('POST /decks -> cria deck', async () => {
    const payload = { title: 'Deck Integração', tags: ['tag1'] };
    const res = await request(server).post('/decks').send(payload).expect(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toMatchObject({ title: 'Deck Integração', tags: ['tag1'] });
    createdId = res.body._id;
  });

  it('GET /decks -> lista (pagina)', async () => {
    const res = await request(server).get('/decks').expect(200);
    const list = res.body.data || res.body;
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((d: any) => String(d._id) === String(createdId))).toBe(true);
  });

  it('GET /decks/:id -> retorna deck', async () => {
    const res = await request(server).get(`/decks/${createdId}`).expect(200);
    expect(res.body).toHaveProperty('_id', createdId);
  });

  it('PATCH /decks/:id -> atualiza', async () => {
    const res = await request(server)
      .patch(`/decks/${createdId}`)
      .send({ title: 'Atualizado' })
      .expect(200);
    expect(res.body).toHaveProperty('title', 'Atualizado');
  });

  it('DELETE /decks/:id -> remove', async () => {
    const res = await request(server).delete(`/decks/${createdId}`).expect(200);
    expect(res.body).toEqual({ message: 'Deck deleted successfully' });
  });
});
