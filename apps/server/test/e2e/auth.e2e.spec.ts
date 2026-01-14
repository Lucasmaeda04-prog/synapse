import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { FirebaseService } from '../../src/auth/firebase.service';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.setTimeout(30000); // aumenta timeout para a inicialização do app

describe('/auth (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();

    const mockFirebaseService = {
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'uid-123', email: 'user@example.com', name: 'User' }),
    };
    const mockUserModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          uid: 'uid-123',
          email: 'user@example.com',
          name: 'User',
          role: 'TEACHER',
        }),
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseService)
      .useValue(mockFirebaseService)
      .overrideProvider(getModelToken('User'))
      .useValue(mockUserModel)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  it('GET /auth/me retorna 200 quando token valido', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer faketoken')
      .expect(200)
      .then((res) => {
        expect(res.body.email).toBe('user@example.com');
        expect(res.body.role).toBeDefined();
      });
  });
});