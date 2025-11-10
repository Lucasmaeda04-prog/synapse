import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from '../database/schemas/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { AddStudentsDto, RemoveStudentsDto } from './dto/add-students.dto';
import {
  ClassResponseDto,
  PaginatedClassesResponseDto,
} from './dto/class-response.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
  ) {}

  async create(
    createClassDto: CreateClassDto,
    teacherId: string,
  ): Promise<ClassResponseDto> {
    const studentIds =
      createClassDto.student_ids?.map((id) => {
        if (!Types.ObjectId.isValid(id)) {
          throw new BadRequestException(`Invalid student ID: ${id}`);
        }
        return new Types.ObjectId(id);
      }) || [];

    const teacherObjectId = new Types.ObjectId(teacherId);
    console.log('[ClassesService] Criando turma - teacherId (string):', teacherId, 'teacherObjectId:', teacherObjectId.toString());

    const classEntity = new this.classModel({
      ...createClassDto,
      teacher_id: teacherObjectId,
      student_ids: studentIds,
    });

    const savedClass = await classEntity.save();
    console.log('[ClassesService] Turma criada - _id:', savedClass._id.toString(), 'teacher_id:', savedClass.teacher_id.toString());
    return this.toResponseDto(savedClass);
  }

  async findAll(
    queryDto: QueryClassDto,
    userId?: string,
    userRole?: string,
  ): Promise<PaginatedClassesResponseDto> {
    const {
      page = 1,
      limit = 20,
      query,
      sort = 'created_at',
      order = 'desc',
    } = queryDto;

    const filter: any = {};

    // Para professores/admins: sempre retornar apenas suas turmas (teacher_id)
    if (userRole === 'TEACHER' || userRole === 'ADMIN') {
      if (!userId) {
        // Se não tiver userId, retornar vazio (não deveria acontecer, mas por segurança)
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
      filter.teacher_id = new Types.ObjectId(userId);
      console.log('[ClassesService] Filtrando por teacher_id:', userId, 'ObjectId:', filter.teacher_id.toString());
    }
    else if (userRole === 'STUDENT') {
      if (!userId) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
      // MongoDB verifica automaticamente se o ObjectId está no array student_ids
      filter.student_ids = new Types.ObjectId(userId);
    }

    // Filtro: busca textual no nome
    if (query && query !== 'undefined' && query.trim() !== '') {
      filter.name = { $regex: query, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField: any = {};
    sortField[sort] = sortOrder;

    // Converter teacher_id para ObjectId se existir (JSON.stringify não mostra ObjectId corretamente)
    const filterForLog: any = { ...filter };
    if (filter.teacher_id) {
      filterForLog.teacher_id = filter.teacher_id.toString();
    }
    if (filter.student_ids) {
      filterForLog.student_ids = filter.student_ids.toString();
    }
    console.log('[ClassesService] Filter aplicado:', JSON.stringify(filterForLog, null, 2));

    const [data, total] = await Promise.all([
      this.classModel
        .find(filter)
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.classModel.countDocuments(filter).exec(),
    ]);

    console.log('[ClassesService] Resultado:', { total, returned: data.length });
    if (data.length > 0) {
      console.log('[ClassesService] Primeira turma encontrada - _id:', data[0]._id, 'teacher_id:', data[0].teacher_id);
    }

    return {
      data: data.map((classEntity) => this.toResponseDto(classEntity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(
    id: string,
    userId: string,
    userRole?: string,
  ): Promise<ClassResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const classEntity = await this.classModel.findById(id).lean().exec();

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Verificar acesso baseado no role
    // Professores/Admins: podem ver se são o dono (teacher_id)
    // Alunos: podem ver se estão na turma (student_ids)
    if (userRole === 'TEACHER' || userRole === 'ADMIN') {
      if (classEntity.teacher_id.toString() !== userId) {
        throw new ForbiddenException('You do not have access to this class');
      }
    } else if (userRole === 'STUDENT') {
      const isStudentInClass = classEntity.student_ids.some(
        (studentId) => studentId.toString() === userId,
      );
      if (!isStudentInClass) {
        throw new ForbiddenException('You do not have access to this class');
      }
    } else {
      // Role desconhecido ou não fornecido
      throw new ForbiddenException('You do not have access to this class');
    }

    return this.toResponseDto(classEntity);
  }

  async update(
    id: string,
    updateClassDto: UpdateClassDto,
    teacherId: string,
  ): Promise<ClassResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const classEntity = await this.classModel.findById(id).exec();

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Apenas o professor proprietário pode editar
    if (classEntity.teacher_id.toString() !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to update this class',
      );
    }

    // Validar student_ids se fornecidos
    if (updateClassDto.student_ids) {
      const studentIds = updateClassDto.student_ids.map((id) => {
        if (!Types.ObjectId.isValid(id)) {
          throw new BadRequestException(`Invalid student ID: ${id}`);
        }
        return new Types.ObjectId(id);
      });
      classEntity.student_ids = studentIds;
      delete updateClassDto.student_ids;
    }

    Object.assign(classEntity, updateClassDto);
    const updatedClass = await classEntity.save();

    return this.toResponseDto(updatedClass);
  }

  async remove(id: string, teacherId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const classEntity = await this.classModel.findById(id).exec();

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Apenas o professor proprietário pode deletar
    if (classEntity.teacher_id.toString() !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to delete this class',
      );
    }

    await this.classModel.findByIdAndDelete(id).exec();

    return { message: 'Class deleted successfully' };
  }

  async addStudents(
    id: string,
    addStudentsDto: AddStudentsDto,
    teacherId: string,
  ): Promise<ClassResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const classEntity = await this.classModel.findById(id).exec();

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Apenas o professor proprietário pode adicionar alunos
    if (classEntity.teacher_id.toString() !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to modify this class',
      );
    }

    // Validar e converter IDs
    const newStudentIds = addStudentsDto.student_ids.map((id) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid student ID: ${id}`);
      }
      return new Types.ObjectId(id);
    });

    // Adicionar apenas IDs que ainda não existem
    const existingIds = new Set(
      classEntity.student_ids.map((id) => id.toString()),
    );
    const uniqueNewIds = newStudentIds.filter(
      (id) => !existingIds.has(id.toString()),
    );

    if (uniqueNewIds.length > 0) {
      classEntity.student_ids.push(...uniqueNewIds);
      await classEntity.save();
    }

    return this.toResponseDto(classEntity);
  }

  async removeStudents(
    id: string,
    removeStudentsDto: RemoveStudentsDto,
    teacherId: string,
  ): Promise<ClassResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const classEntity = await this.classModel.findById(id).exec();

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Apenas o professor proprietário pode remover alunos
    if (classEntity.teacher_id.toString() !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to modify this class',
      );
    }

    // Validar IDs
    const idsToRemove = removeStudentsDto.student_ids.map((id) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid student ID: ${id}`);
      }
      return id;
    });

    // Remover IDs
    const idsToRemoveSet = new Set(idsToRemove);
    classEntity.student_ids = classEntity.student_ids.filter(
      (id) => !idsToRemoveSet.has(id.toString()),
    );

    await classEntity.save();

    return this.toResponseDto(classEntity);
  }

  private toResponseDto(classEntity: any): ClassResponseDto {
    return {
      _id: classEntity._id.toString(),
      teacher_id: classEntity.teacher_id.toString(),
      name: classEntity.name,
      student_ids: classEntity.student_ids.map((id: Types.ObjectId) =>
        id.toString(),
      ),
      students_count: classEntity.student_ids.length,
      org_id: classEntity.org_id,
      school_id: classEntity.school_id,
      created_at: classEntity.created_at,
    };
  }
}
