import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { AddStudentsDto, RemoveStudentsDto } from './dto/add-students.dto';
import {
  ClassResponseDto,
  PaginatedClassesResponseDto,
} from './dto/class-response.dto';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
  // ObjectId temporário para testes (será substituído por JWT)
  private readonly TEMP_TEACHER_ID = new Types.ObjectId().toString();

  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova turma' })
  @ApiResponse({
    status: 201,
    description: 'Turma criada com sucesso',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe) createClassDto: CreateClassDto,
    @Request() req: any,
  ): Promise<ClassResponseDto> {
    // TODO: Implementar autenticação e pegar teacherId do req.user
    const teacherId = req.user?.userId || this.TEMP_TEACHER_ID;
    return this.classesService.create(createClassDto, teacherId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar turmas do professor com filtros e paginação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de turmas',
    type: PaginatedClassesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  findAll(
    @Query(ValidationPipe) queryDto: QueryClassDto,
    @Request() req: any,
  ): Promise<PaginatedClassesResponseDto> {
    // TODO: Implementar autenticação e pegar teacherId do req.user
    const teacherId = req.user?.userId || this.TEMP_TEACHER_ID;
    return this.classesService.findAll(queryDto, teacherId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma turma por ID' })
  @ApiResponse({
    status: 200,
    description: 'Turma encontrada',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ClassResponseDto> {
    // TODO: Implementar autenticação e pegar teacherId do req.user
    const teacherId = req.user?.userId || this.TEMP_TEACHER_ID;
    return this.classesService.findOne(id, teacherId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma turma' })
  @ApiResponse({
    status: 200,
    description: 'Turma atualizada com sucesso',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateClassDto: UpdateClassDto,
    @Request() req: any,
  ): Promise<ClassResponseDto> {
    // TODO: Implementar autenticação e pegar teacherId do req.user
    const teacherId = req.user?.userId || this.TEMP_TEACHER_ID;
    return this.classesService.update(id, updateClassDto, teacherId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar uma turma' })
  @ApiResponse({ status: 200, description: 'Turma deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    // TODO: Implementar autenticação e pegar teacherId do req.user
    const teacherId = req.user?.userId || this.TEMP_TEACHER_ID;
    return this.classesService.remove(id, teacherId);
  }

  @Post(':id/students')
  @ApiOperation({ summary: 'Adicionar alunos à turma' })
  @ApiResponse({
    status: 200,
    description: 'Alunos adicionados com sucesso',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para modificar' })
  @ApiResponse({ status: 400, description: 'IDs de alunos inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  addStudents(
    @Param('id') id: string,
    @Body(ValidationPipe) addStudentsDto: AddStudentsDto,
    @Request() req: any,
  ): Promise<ClassResponseDto> {
    // TODO: Implementar autenticação e pegar teacherId do req.user
    const teacherId = req.user?.userId || this.TEMP_TEACHER_ID;
    return this.classesService.addStudents(id, addStudentsDto, teacherId);
  }

  @Delete(':id/students')
  @ApiOperation({ summary: 'Remover alunos da turma' })
  @ApiResponse({
    status: 200,
    description: 'Alunos removidos com sucesso',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para modificar' })
  @ApiResponse({ status: 400, description: 'IDs de alunos inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  removeStudents(
    @Param('id') id: string,
    @Body(ValidationPipe) removeStudentsDto: RemoveStudentsDto,
    @Request() req: any,
  ): Promise<ClassResponseDto> {
    // TODO: Implementar autenticação e pegar teacherId do req.user
    const teacherId = req.user?.userId || this.TEMP_TEACHER_ID;
    return this.classesService.removeStudents(id, removeStudentsDto, teacherId);
  }
}
