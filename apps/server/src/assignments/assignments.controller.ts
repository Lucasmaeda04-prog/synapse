import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { QueryAssignmentDto } from './dto/query-assignment.dto';
import { UserRole } from '../database/schemas/user.schema';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    userId: string;
    role: UserRole;
  };
}

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atribuir um deck a uma turma ou aluno' })
  @ApiResponse({
    status: 201,
    description: 'Assignment criado com sucesso',
    type: AssignmentResponseDto,
  })
  create(
    @Body(ValidationPipe) createDto: CreateAssignmentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<AssignmentResponseDto> {
    const user = this.getUserOrThrow(req);
    return this.assignmentsService.create(createDto, user.userId, user.role);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar assignments filtrando por turma, aluno ou deck',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de assignments',
    type: [AssignmentResponseDto],
  })
  findAll(
    @Query(ValidationPipe) query: QueryAssignmentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<AssignmentResponseDto[]> {
    const user = this.getUserOrThrow(req);
    return this.assignmentsService.findAll(query, user.userId, user.role);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover um assignment' })
  @ApiResponse({ status: 200, description: 'Assignment removido com sucesso' })
  remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const user = this.getUserOrThrow(req);
    return this.assignmentsService.remove(id, user.userId, user.role);
  }

  private getUserOrThrow(req: AuthenticatedRequest) {
    if (!req.user?.userId || !req.user.role) {
      throw new BadRequestException('Usuário não autenticado');
    }
    return req.user;
  }
}
