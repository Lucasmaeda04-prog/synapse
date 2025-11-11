import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from '../../src/classes/classes.controller';
import { ClassesService } from '../../src/classes/classes.service';
import { FirebaseAuthGuard } from '../../src/auth/firebase-auth.guard';

describe('ClassesController (unit)', () => {
  let controller: ClassesController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([{ _id: '1', name: 'Turma A' }]),
    create: jest.fn().mockResolvedValue({ _id: '1', name: 'Turma A' }),
    findOne: jest.fn().mockResolvedValue({ _id: '1', name: 'Turma A' }),
    update: jest.fn().mockResolvedValue({ _id: '1', name: 'Atualizada' }),
    remove: jest.fn().mockResolvedValue({ _id: '1', name: 'Turma A' }),
  };

  // mock de request reutilizável com user
  const mockReq = { user: { role: 'teacher', userId: '1' } } as any;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [ClassesController],
      providers: [{ provide: ClassesService, useValue: mockService }],
    });

    moduleBuilder.overrideGuard(FirebaseAuthGuard).useValue({ canActivate: jest.fn().mockResolvedValue(true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<ClassesController>(ClassesController);
  });

  it('deve listar classes', async () => {
    const res = await controller.findAll?.(undefined as any, mockReq);
    expect(mockService.findAll).toHaveBeenCalledWith(undefined, mockReq.user.userId, mockReq.user.role);
    expect(res).toEqual([{ _id: '1', name: 'Turma A' }]);
  });

  it('deve criar classe', async () => {
    const dto = { name: 'Turma A' };
    const res = await controller.create?.(dto as any, mockReq);
    expect(mockService.create).toHaveBeenCalledWith(dto, mockReq.user.userId);
    expect(res).toEqual({ _id: '1', name: 'Turma A' });
  });

  it('deve buscar por id', async () => {
    const res = await controller.findOne?.('1', mockReq);
    expect(mockService.findOne).toHaveBeenCalledWith('1', mockReq.user.userId, mockReq.user.role);
    expect(res).toEqual({ _id: '1', name: 'Turma A' });
  });

  it('deve atualizar', async () => {
    const dto = { name: 'Atualizada' };
    const res = await controller.update?.('1', dto as any, mockReq);
    expect(mockService.update).toHaveBeenCalledWith('1', dto, mockReq.user.userId);
    expect(res).toEqual({ _id: '1', name: 'Atualizada' });
  });

  it('deve remover', async () => {
    const res = await controller.remove?.('1', mockReq);
    expect(mockService.remove).toHaveBeenCalledWith('1', mockReq.user.userId);
    expect(res).toEqual({ _id: '1', name: 'Turma A' });
  });
});