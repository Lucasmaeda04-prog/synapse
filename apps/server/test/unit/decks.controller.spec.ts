import { Test, TestingModule } from '@nestjs/testing';
import { DecksController } from '../../src/decks/decks.controller';
import { DecksService } from '../../src/decks/decks.service';
import { FirebaseAuthGuard } from '../../src/auth/firebase-auth.guard';
import { RolesGuard } from '../../src/auth/roles.guard';

describe('DecksController (unit)', () => {
  let controller: DecksController;

  const mockService = {
    create: jest.fn().mockResolvedValue({ _id: '1', title: 'Deck A', owner_id: 'u1', cards_count: 0, is_public: false, tags: [] }),
    findAll: jest.fn().mockResolvedValue({ data: [{ _id: '1', title: 'Deck A' }], total: 1, page: 1, limit: 20, totalPages: 1 }),
    findOne: jest.fn().mockResolvedValue({ _id: '1', title: 'Deck A' }),
    update: jest.fn().mockResolvedValue({ _id: '1', title: 'Deck Upd' }),
    remove: jest.fn().mockResolvedValue({ message: 'Deck deleted successfully' }),
  };

  const mockReq = { user: { role: 'TEACHER', userId: 'u1' } } as any;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [DecksController],
      providers: [{ provide: DecksService, useValue: mockService }],
    });

    moduleBuilder
      .overrideGuard(FirebaseAuthGuard).useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn().mockResolvedValue(true) });

    const module: TestingModule = await moduleBuilder.compile();
    controller = module.get<DecksController>(DecksController);
  });

  it('cria deck', async () => {
    const dto = { title: 'Deck A' } as any;
    const res = await controller.create?.(dto, mockReq);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'u1');
    expect(res).toMatchObject({ _id: '1', title: 'Deck A' });
  });

  it('lista decks', async () => {
    const res = await controller.findAll?.({} as any, mockReq);
    expect(mockService.findAll).toHaveBeenCalledWith({}, 'u1', 'TEACHER');
    expect(res).toHaveProperty('data');
  });

  it('busca por id', async () => {
    const res = await controller.findOne?.('1', mockReq);
    expect(mockService.findOne).toHaveBeenCalledWith('1', 'u1');
    expect(res).toMatchObject({ _id: '1' });
  });

  it('atualiza', async () => {
    const res = await controller.update?.('1', { title: 'Deck Upd' } as any, mockReq);
    expect(mockService.update).toHaveBeenCalledWith('1', { title: 'Deck Upd' }, 'u1');
    expect(res).toMatchObject({ title: 'Deck Upd' });
  });

  it('remove', async () => {
    const res = await controller.remove?.('1', mockReq);
    expect(mockService.remove).toHaveBeenCalledWith('1', 'u1');
    expect(res).toEqual({ message: 'Deck deleted successfully' });
  });
});
