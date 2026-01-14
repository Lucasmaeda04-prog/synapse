// test/unit/cards.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CardsService } from '../../src/cards/cards.service';
import { NotFoundException } from '@nestjs/common';

type AnyModel = Partial<Record<string, jest.Mock>> & Partial<Model<any>>;

describe('CardsService (unit)', () => {
  let service: CardsService;
  let cardModel: AnyModel;
  let deckModel: AnyModel;

  const deckHex = new Types.ObjectId().toHexString();
  const cardHex = new Types.ObjectId().toHexString();

  const dbCard = {
    _id: { toString: () => cardHex },
    deck_id: { toString: () => deckHex },
    front: 'F',
    back: 'B',
    hints: ['h1'],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const plainCard = () => ({
    ...dbCard,
    _id: cardHex,
    deck_id: deckHex,
  });

  beforeEach(async () => {
    // ---------- Card model mock ----------
    function CardModel(this: any, doc?: any) {
      if (!(this instanceof CardModel)) return new (CardModel as any)(doc);
      Object.assign(this, doc);
    }
    CardModel.prototype.save = jest.fn().mockResolvedValue(dbCard);

    const findChain = {
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([plainCard()]),
    };

    (CardModel as any).find = jest.fn().mockReturnValue(findChain);
    (CardModel as any).findById = jest.fn().mockImplementation((id: string) => {
      if (id !== cardHex) {
        return {
          lean: () => ({ exec: () => Promise.resolve(null) }),
          exec: () => Promise.resolve(null),
          then: (resolve: any) => resolve(null),
        };
      }
      return {
        lean: () => ({ exec: () => Promise.resolve(plainCard()) }),
        exec: () => Promise.resolve({ ...plainCard() }),
        then: (resolve: any) => resolve({ ...plainCard() }),
      };
    });
    (CardModel as any).findByIdAndUpdate = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(plainCard()),
    });
    (CardModel as any).findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(plainCard()),
    });

    cardModel = CardModel as any;

    // ---------- Deck model mock ----------
    deckModel = {
      findById: jest.fn().mockImplementation((id: string) => {
        if (id !== deckHex) {
          return { exec: jest.fn().mockResolvedValue(null) };
        }
        return { exec: jest.fn().mockResolvedValue({ _id: deckHex }) };
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: deckHex }),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getModelToken('Card'), useValue: cardModel },
        { provide: getModelToken('Deck'), useValue: deckModel },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('create: cria card quando deck existe', async () => {
    const res = await service.create?.(deckHex, { front: 'F', back: 'B' } as any);
    expect((cardModel as any).prototype.save).toHaveBeenCalled();
    expect(deckModel.findById).toHaveBeenCalledWith(deckHex);
    expect(deckModel.findByIdAndUpdate).toHaveBeenCalledWith(deckHex, { $inc: { cards_count: 1 } });
    expect(res).toMatchObject({
      _id: cardHex,
      deck_id: deckHex,
      front: 'F',
      back: 'B',
    });
  });

  it('create: lança NotFound se deckId inválido', async () => {
    await expect(service.create?.('invalid', { front: 'F', back: 'B' } as any))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('create: lança NotFound se deck não existe', async () => {
    (deckModel.findById as jest.Mock).mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(null),
    });
    await expect(service.create?.(deckHex, { front: 'F', back: 'B' } as any))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('findByDeck: lista cards de um deck', async () => {
    const res = await service.findByDeck?.(deckHex);
    expect(cardModel.find).toHaveBeenCalledWith({ deck_id: new Types.ObjectId(deckHex) });
    expect(Array.isArray(res)).toBe(true);
    expect(res?.[0]?._id).toBe(cardHex);
  });

  it('findByDeck: lança NotFound se deckId inválido', async () => {
    await expect(service.findByDeck?.('invalid')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne: retorna card por id', async () => {
    const res = await service.findOne?.(cardHex);
    expect((cardModel as any).findById).toHaveBeenCalledWith(cardHex);
    expect(res).toMatchObject({ _id: cardHex, deck_id: deckHex });
  });

  it('findOne: lança NotFound se id inválido', async () => {
    await expect(service.findOne?.('invalid')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: atualiza card', async () => {
    const res = await service.update?.(cardHex, { front: 'F2' } as any);
    expect(cardModel.findByIdAndUpdate).toHaveBeenCalledWith(cardHex, { front: 'F2' }, { new: true });
    expect(res).toMatchObject({ _id: cardHex });
  });

  it('update: lança NotFound se id inválido', async () => {
    await expect(service.update?.('invalid', { front: 'F2' } as any))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove: deleta card e decrementa contador do deck', async () => {
    const res = await service.remove?.(cardHex);
    expect((cardModel as any).findById).toHaveBeenCalledWith(cardHex);
    expect(cardModel.findByIdAndDelete).toHaveBeenCalledWith(cardHex);
    expect(deckModel.findByIdAndUpdate).toHaveBeenCalledWith(expect.anything(), { $inc: { cards_count: -1 } });
    expect(res).toBeUndefined();
  });

  it('remove: lança NotFound se id inválido ou card não existe', async () => {
    await expect(service.remove?.('invalid')).rejects.toBeInstanceOf(NotFoundException);

    (cardModel as any).findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(service.remove?.(cardHex)).rejects.toBeInstanceOf(NotFoundException);
  });
});
