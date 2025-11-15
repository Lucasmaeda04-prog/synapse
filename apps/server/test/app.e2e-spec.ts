import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { FirebaseAuthGuard } from '../src/auth/firebase-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';

jest.setTimeout(60000);

describe('App (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  const fakeAuthGuard = {
    canActivate: (ctx: any) => {
      const req = ctx.switchToHttp().getRequest();
      req.user = { userId: '507f1f77bcf86cd799439011', role: 'TEACHER' };
      return true;
    },
  };
  const allowRoles = { canActivate: () => true };

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
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('/health (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(typeof res.body).toBe('object');
  });
});
