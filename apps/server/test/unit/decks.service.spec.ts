import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DecksService } from '../../src/decks/decks.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

type AnyModel = Partial<Record<string, jest.Mock>> & Partial<Model<any>>;

describe('DecksService (unit)', () => {
    let service: DecksService;
    let deckModel: AnyModel;
    let classModel: AnyModel = {} as any;
    let assignmentModel: AnyModel = {} as any;

    const ownerHex = new Types.ObjectId().toHexString();
    const otherUserHex = new Types.ObjectId().toHexString();
    const studentHex = new Types.ObjectId().toHexString();
    const classHex = new Types.ObjectId().toHexString();
    const deckHex = new Types.ObjectId().toHexString();

    // Documento "persistido" simulado
    const dbDeck = {
        _id: { toString: () => deckHex },
        owner_id: { toString: () => ownerHex },
        title: 'Deck A',
        description: 'desc',
        tags: ['t1'],
        is_public: false,
        cards_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const toPlainDeck = () => ({
        ...dbDeck,
        _id: deckHex,
        owner_id: ownerHex,
    });

    beforeEach(async () => {
        /** ---------- deck model ---------- **/
        function DeckModel(this: any, doc?: any) {
            if (!(this instanceof DeckModel)) return new (DeckModel as any)(doc);
            Object.assign(this, doc);
        }
        DeckModel.prototype.save = jest.fn().mockResolvedValue(dbDeck);

        // listagem: .find().sort().skip().limit().lean().exec()
        const findChain = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([toPlainDeck()]),
        };

        (DeckModel as any).find = jest.fn().mockReturnValue(findChain);
        (DeckModel as any).countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
        (DeckModel as any).create = jest.fn().mockResolvedValue(dbDeck);

        // findById com dois fluxos (lean/exec) + instância editável (update)
        let foundDoc: any = {
            ...toPlainDeck(),
            save: jest.fn().mockResolvedValue(dbDeck),
        };
        (DeckModel as any).findById = jest.fn().mockImplementation((id: string) => {
            if (id !== deckHex) {
                return {
                    lean: () => ({ exec: () => Promise.resolve(null) }),
                    exec: () => Promise.resolve(null),
                    then: (resolve: any) => resolve(null),
                };
            }
            return {
                lean: () => ({ exec: () => Promise.resolve(toPlainDeck()) }),
                exec: () => Promise.resolve(foundDoc),
                then: (resolve: any) => resolve(foundDoc),
            };
        });

        (DeckModel as any).findByIdAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(dbDeck) });
        (DeckModel as any).findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(dbDeck) });

        deckModel = DeckModel as any;

        /** ---------- class model (para STUDENT) ---------- **/
        classModel = {
            find: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(classHex) }]),
            }),
        };

        /** ---------- assignment model (para STUDENT) ---------- **/
        assignmentModel = {
            find: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([{ deck_id: new Types.ObjectId(deckHex) }]),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DecksService,
                { provide: getModelToken('Deck'), useValue: deckModel },
                { provide: getModelToken('Assignment'), useValue: assignmentModel },
                { provide: getModelToken('Class'), useValue: classModel },
            ],
        }).compile();

        service = module.get<DecksService>(DecksService);
    });

    it('create: cria deck com owner e cards_count=0', async () => {
        const res = await service.create?.({ title: 'Deck A' } as any, ownerHex);
        expect((deckModel as any).prototype.save).toHaveBeenCalled();
        expect(res).toMatchObject({
            _id: deckHex,
            owner_id: ownerHex,
            title: 'Deck A',
            cards_count: 0,
        });
    });

    it('findAll (TEACHER): filtra por owner_id', async () => {
        const res = await service.findAll?.({} as any, ownerHex, 'TEACHER');
        expect(deckModel.find).toHaveBeenCalled();
        expect(res).toHaveProperty('data');
        expect(res?.data?.[0]?._id).toBe(deckHex);
    });

    it('findAll (STUDENT): retorna apenas decks atribuídos', async () => {
        const res = await service.findAll?.({} as any, studentHex, 'STUDENT');
        expect(classModel.find).toHaveBeenCalled();
        expect(assignmentModel.find).toHaveBeenCalled();
        expect(res?.data?.length).toBeGreaterThan(0);
    });

    it('findOne: retorna deck quando público ou owner', async () => {
        // caso owner
        const asOwner = await service.findOne?.(deckHex, ownerHex);
        expect(asOwner?._id).toBe(deckHex);

        // caso público
        (deckModel as any).findById = jest.fn().mockReturnValue({
            lean: () => ({
                exec: () =>
                    Promise.resolve({
                        ...toPlainDeck(),
                        is_public: true,
                    }),
            }),
            exec: () =>
                Promise.resolve({
                    ...toPlainDeck(),
                    is_public: true,
                }),
            then: (resolve: any) =>
                resolve({
                    ...toPlainDeck(),
                    is_public: true,
                }),
        });
        const asOther = await service.findOne?.(deckHex, otherUserHex);
        expect(asOther?._id).toBe(deckHex);
    });

    it('findOne: lança Forbidden se não for owner e deck não for público', async () => {
        // volta mock padrão (não público)
        (deckModel as any).findById = jest.fn().mockReturnValue({
            lean: () => ({ exec: () => Promise.resolve(toPlainDeck()) }),
            exec: () => Promise.resolve({ ...toPlainDeck(), save: jest.fn() }),
            then: (resolve: any) => resolve({ ...toPlainDeck(), save: jest.fn() }),
        });
        await expect(service.findOne?.(deckHex, otherUserHex)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('update: só owner pode atualizar', async () => {
        // owner ok
        const ok = await service.update?.(deckHex, { title: 'UP' } as any, ownerHex);
        expect(ok).toHaveProperty('title');

        // não-owner bloqueado
        await expect(service.update?.(deckHex, { title: 'X' } as any, otherUserHex))
            .rejects.toBeInstanceOf(ForbiddenException);
    });

    it('remove: só owner pode deletar', async () => {
        // owner ok
        const ok = await service.remove?.(deckHex, ownerHex);
        expect(ok).toEqual({ message: 'Deck deleted successfully' });

        // não-owner bloqueado
        await expect(service.remove?.(deckHex, otherUserHex))
            .rejects.toBeInstanceOf(ForbiddenException);
    });

    it('increment/decrement cards_count: chama findByIdAndUpdate', async () => {
        await service.incrementCardsCount?.(deckHex);
        expect(deckModel.findByIdAndUpdate).toHaveBeenCalledWith(deckHex, { $inc: { cards_count: 1 } });

        await service.decrementCardsCount?.(deckHex);
        expect(deckModel.findByIdAndUpdate).toHaveBeenCalledWith(deckHex, { $inc: { cards_count: -1 } });
    });

    it('findOne: lança NotFound se id inválido ou não existente', async () => {
        await expect(service.findOne?.('invalid', ownerHex)).rejects.toBeInstanceOf(NotFoundException);

        (deckModel as any).findById = jest.fn().mockReturnValue({
            lean: () => ({ exec: () => Promise.resolve(null) }),
            exec: () => Promise.resolve(null),
            then: (resolve: any) => resolve(null),
        });
        await expect(service.findOne?.(new Types.ObjectId().toHexString(), ownerHex))
            .rejects.toBeInstanceOf(NotFoundException);
    });
});
