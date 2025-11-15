import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassesService } from '../../src/classes/classes.service';

type AnyModel = Partial<Record<string, jest.Mock>> & Partial<Model<any>>;

describe('ClassesService (unit)', () => {
  let service: ClassesService;
  let modelMock: AnyModel;

  // id compartilhado usado pelo mock e pelos calls do teste
  const teacherHex = new Types.ObjectId().toHexString();
  const studentHex = new Types.ObjectId().toHexString();
  const classHex = new Types.ObjectId().toHexString();

  // mock retornado pelo "DB" (usado pelas chamadas Mongoose no service)
  const dbMockClass = {
    _id: { toString: () => classHex },
    teacher_id: { toString: () => teacherHex },
    name: 'Turma A',
    student_ids: [{ toString: () => studentHex }],
    students: [],
  };

  // DTO esperado pelo service (após transformação)
  const expectedDto = {
    _id: classHex,
    teacher_id: teacherHex,
    name: 'Turma A',
    student_ids: [studentHex],
    students_count: 1,
  };

  beforeEach(async () => {
    // query chain mock para .find().sort().skip().limit().lean().exec()
    const findChain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([dbMockClass]),
    };

    // mock para countDocuments().exec()
    const countChain = {
      exec: jest.fn().mockResolvedValue(1),
    };

    // Construtor mock que suporta `new this.classModel(...)` e métodos estáticos usados pelo service
    function ModelMock(this: any, doc?: any) {
      if (!(this instanceof ModelMock)) return new (ModelMock as any)(doc);
      Object.assign(this, doc);
    }
    ModelMock.prototype.save = jest.fn().mockResolvedValue(dbMockClass);

    (ModelMock as any).find = jest.fn().mockReturnValue(findChain);

    // criar um doc "instância" acessível nos testes para checar .save()
    let foundDoc: any;
    foundDoc = {
      ...dbMockClass,
      save: jest.fn().mockResolvedValue(dbMockClass),
    };

    // findById suporta dois fluxos:
    // - .lean().exec() -> returns plain dbMockClass (usado em findOne)
    // - .exec() (ou await direto) -> returns documento com .save() (usado em update)
    (ModelMock as any).findById = jest.fn().mockImplementation(() => {
      return {
        lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(dbMockClass) }),
        exec: jest.fn().mockResolvedValue(foundDoc),
        // permitir await direto (thenable)
        then: (resolve: any) => resolve(foundDoc),
      };
    });
    // --- fim findById ---
    (ModelMock as any).create = jest.fn().mockResolvedValue(dbMockClass);
    (ModelMock as any).findByIdAndUpdate = jest.fn().mockResolvedValue(dbMockClass);
    // return chain with exec() because service calls .findByIdAndDelete(id).exec()
    (ModelMock as any).findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(dbMockClass),
    });
    (ModelMock as any).countDocuments = jest.fn().mockReturnValue(countChain);

    modelMock = ModelMock as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: getModelToken('Class'), useValue: modelMock },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it('deve listar classes', async () => {
    const res = await service.findAll?.({} as any);
    expect(res).toBeDefined();
    expect(modelMock.find).toHaveBeenCalled();
    expect(Array.isArray(res.data || res)).toBe(true);
  });

  it('deve criar uma classe', async () => {
    const payload = { name: 'Turma A' };
    const res = await service.create?.(payload as any, teacherHex);
    // service instancia model e chama .save()
    expect((modelMock as any).prototype.save).toHaveBeenCalled();
    // validar campos principais do DTO retornado
    expect(res).toMatchObject(expectedDto);
  });

  it('deve obter por id', async () => {
    const res = await service.findOne?.(classHex, teacherHex, 'TEACHER');
    expect((modelMock as any).findById).toHaveBeenCalledWith(classHex);
    expect(res).toMatchObject(expectedDto);
  });

  it('deve atualizar uma classe', async () => {
    const payload = { name: 'Turma B' };
    const res = await service.update?.(classHex, payload as any, teacherHex, 'TEACHER');
    // fluxo real: findById -> modifica -> save()
    expect(modelMock.findById).toHaveBeenCalledWith(classHex);
    // se precisar, checar que a instância teve save chamado:
    // const inst = (modelMock as any).findById().exec.mock.results[0].value;
    // expect(inst.save).toHaveBeenCalled();
    expect(res).toMatchObject(expectedDto);
  });

  it('deve deletar uma classe', async () => {
    const res = await service.remove?.(classHex, teacherHex, 'TEACHER');
    expect(modelMock.findByIdAndDelete).toHaveBeenCalledWith(classHex);
    expect(res).toEqual({ message: 'Class deleted successfully' });
  });
});