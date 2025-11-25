import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthGuard } from '../../src/auth/firebase-auth.guard';
import { FirebaseService } from '../../src/auth/firebase.service';

describe('FirebaseAuthGuard (unit)', () => {
  let guard: FirebaseAuthGuard;
  const mockFirebaseService = {
    verifyIdToken: jest.fn(),
  };
  const mockUserModel = {
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      uid: 'uid-123',
      email: 'user@example.com',
      name: 'User',
      role: 'STUDENT',
    })}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: 'UserModel', useValue: mockUserModel }, // será substituído por getModelToken no projeto real
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
    // injetar userModel manualmente se seu guard o recebe via construtor com getModelToken
    // (aqui assume-se que a injeção por token foi feita; adapte se necessário)
    (guard as any).userModel = mockUserModel;
  });

  it('deve permitir requisição válida e setar request.user', async () => {
    const decoded = { uid: 'uid-123', email: 'user@example.com', name: 'User' };
    mockFirebaseService.verifyIdToken.mockResolvedValue(decoded);

    const req: any = { headers: { authorization: 'Bearer faketoken' } };
    const context: any = {
      switchToHttp: () => ({ getRequest: () => req }),
    };

    const can = await guard.canActivate(context as any);
    expect(can).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.uid).toBe('uid-123');
    expect(req.user.role).toBe('STUDENT');
  });
});