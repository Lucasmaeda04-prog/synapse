// test/unit/cards.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from '../../src/cards/cards.controller';
import { CardsService } from '../../src/cards/cards.service';

describe('CardsController (unit)', () => {
  let controller: CardsController;

  const mockService = {
    create: jest.fn().mockResolvedValue({ _id: 'cid', deck_id: 'did', front: 'F', back: 'B', hints: [] }),
    findByDeck: jest.fn().mockResolvedValue([{ _id: 'cid', deck_id: 'did', front: 'F', back: 'B', hints: [] }]),
    findOne: jest.fn().mockResolvedValue({ _id: 'cid', deck_id: 'did', front: 'F', back: 'B', hints: [] }),
    update: jest.fn().mockResolvedValue({ _id: 'cid', deck_id: 'did', front: 'F2', back: 'B2', hints: [] }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [CardsController],
      providers: [{ provide: CardsService, useValue: mockService }],
    });

    const module: TestingModule = await moduleBuilder.compile();
    controller = module.get<CardsController>(CardsController);
  });

  it('create deve chamar service.create', async () => {
    const dto = { front: 'F', back: 'B' } as any;
    const res = await controller.create('did', dto);
    expect(mockService.create).toHaveBeenCalledWith('did', dto);
    expect(res).toMatchObject({ _id: 'cid', deck_id: 'did' });
  });

  it('findByDeck deve listar cards do deck', async () => {
    const res = await controller.findByDeck('did');
    expect(mockService.findByDeck).toHaveBeenCalledWith('did');
    expect(Array.isArray(res)).toBe(true);
  });

  it('findOne deve retornar card', async () => {
    const res = await controller.findOne('cid');
    expect(mockService.findOne).toHaveBeenCalledWith('cid');
    expect(res).toHaveProperty('_id', 'cid');
  });

  it('update deve chamar service.update', async () => {
    const dto = { front: 'F2' } as any;
    const res = await controller.update('cid', dto);
    expect(mockService.update).toHaveBeenCalledWith('cid', dto);
    expect(res).toHaveProperty('front', 'F2');
  });

  it('remove deve chamar service.remove', async () => {
    const res = await controller.remove('cid');
    expect(mockService.remove).toHaveBeenCalledWith('cid');
    expect(res).toBeUndefined();
  });
});
