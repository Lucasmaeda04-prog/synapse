import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ClassesModule } from '../../src/classes/classes.module';
import { FirebaseAuthGuard } from '../../src/auth/firebase-auth.guard';

// aumentar timeout porque mongodb-memory-server pode demorar para baixar/initializar
jest.setTimeout(60000);

describe('Classes - Integration (module)', () => {
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

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        ClassesModule, // apenas o módulo sob teste
      ],
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

  it('POST /classes -> cria classe', async () => {
    const payload = { name: 'Integration Turma' };
    const res = await request(server).post('/classes').send(payload).expect(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toMatchObject({ name: 'Integration Turma' });
    createdId = res.body._id;
  });

  it('GET /classes -> lista classes (paginação básica)', async () => {
    const res = await request(server).get('/classes').expect(200);
    const list = res.body.data || res.body;
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((c: any) => String(c._id) === String(createdId))).toBe(true);
  });

  it('GET /classes/:id -> retorna classe', async () => {
    const res = await request(server).get(`/classes/${createdId}`).expect(200);
    expect(res.body).toHaveProperty('_id', createdId);
  });

  it('PATCH /classes/:id -> atualiza classe', async () => {
    const res = await request(server).patch(`/classes/${createdId}`).send({ name: 'Updated' }).expect(200);
    expect(res.body).toHaveProperty('name', 'Updated');
  });

  it('DELETE /classes/:id -> remove classe', async () => {
    const res = await request(server).delete(`/classes/${createdId}`).expect(200);
    expect(res.body).toEqual({ message: 'Class deleted successfully' });
  });
});