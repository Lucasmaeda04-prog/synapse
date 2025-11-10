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

    const classEntity = new this.classModel({
      ...createClassDto,
      teacher_id: new Types.ObjectId(teacherId),
      student_ids: studentIds,
    });

    const savedClass = await classEntity.save();
    return this.toResponseDto(savedClass);
  }

  async findAll(
    queryDto: QueryClassDto,
    teacherId?: string,
  ): Promise<PaginatedClassesResponseDto> {
    const {
      page = 1,
      limit = 20,
      query,
      sort = 'created_at',
      order = 'desc',
    } = queryDto;

    const filter: any = {};

    // Se teacherId for fornecido, filtrar apenas turmas desse professor
    // Caso contrário, retornar todas as turmas (para alunos verem todas e filtrar no frontend)
    if (teacherId) {
      filter.teacher_id = new Types.ObjectId(teacherId);
    }

    // Filtro: busca textual no nome
    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField: any = {};
    sortField[sort] = sortOrder;

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

    return {
      data: data.map((classEntity) => this.toResponseDto(classEntity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, teacherId: string): Promise<ClassResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const classEntity = await this.classModel.findById(id).lean().exec();

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Apenas o professor proprietário pode visualizar
    if (classEntity.teacher_id.toString() !== teacherId) {
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
