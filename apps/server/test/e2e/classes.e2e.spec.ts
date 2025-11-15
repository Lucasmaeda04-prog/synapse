import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { FirebaseAuthGuard } from '../../src/auth/firebase-auth.guard';

// primeira execução pode demorar (download do MongoDB binary)
jest.setTimeout(60000);

describe('Classes (e2e)', () => {
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

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    // garantir que AppModule use o MongoMemoryServer
    process.env.MONGODB_URI = uri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue(fakeAuthGuard)
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

  it('POST /classes (create)', async () => {
    const payload = { name: 'E2E Turma' };
    const res = await request(server).post('/classes').send(payload).expect(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toMatchObject({ name: 'E2E Turma' });
    createdId = res.body._id;
  });

  it('GET /classes (list)', async () => {
    const res = await request(server).get('/classes').expect(200);
    const list = res.body.data || res.body;
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((c: any) => String(c._id) === String(createdId))).toBe(true);
  });

  it('GET /classes/:id (get by id)', async () => {
    const res = await request(server).get(`/classes/${createdId}`).expect(200);
    expect(res.body).toHaveProperty('_id', createdId);
  });

  it('PATCH /classes/:id (update)', async () => {
    const res = await request(server).patch(`/classes/${createdId}`).send({ name: 'E2E Updated' }).expect(200);
    expect(res.body).toHaveProperty('name', 'E2E Updated');
  });

  it('DELETE /classes/:id (delete)', async () => {
    const res = await request(server).delete(`/classes/${createdId}`).expect(200);
    expect(res.body).toEqual({ message: 'Class deleted successfully' });
  });
});