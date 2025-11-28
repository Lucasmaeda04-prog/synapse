import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ReportsService } from './reports.service';
import {
  StudentOverviewDto,
  DeckAnalyticsDto,
  StudentActivityDto,
} from './dto/student-report.dto';
import {
  TeacherOverviewDto,
  ClassReportDto,
  DeckPerformanceDto,
  DeckDetailedReportDto,
} from './dto/teacher-report.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ==================== STUDENT REPORTS ====================

  @Get('student/overview')
  @ApiOperation({
    summary: 'Visão geral do aluno',
    description: 'Retorna estatísticas gerais do aluno em todos os decks que tem acesso',
  })
  @ApiResponse({
    status: 200,
    description: 'Visão geral retornada com sucesso',
    type: StudentOverviewDto,
  })
  async getStudentOverview(@Request() req: any): Promise<StudentOverviewDto> {
    const studentId = req.user.userId;
    return this.reportsService.getStudentOverview(studentId);
  }

  @Get('student/deck/:deckId')
  @ApiOperation({
    summary: 'Estatísticas do aluno em um deck',
    description: 'Retorna estatísticas detalhadas do aluno em um deck específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
    type: DeckAnalyticsDto,
  })
  async getStudentDeckAnalytics(
    @Param('deckId') deckId: string,
    @Request() req: any,
  ): Promise<DeckAnalyticsDto> {
    const studentId = req.user.userId;
    return this.reportsService.getDeckAnalyticsForStudent(deckId, studentId);
  }

  @Get('student/activity')
  @ApiOperation({
    summary: 'Histórico de atividade do aluno',
    description: 'Retorna o histórico de sessões de estudo e streaks',
  })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Número de dias (padrão: 30)' })
  @ApiResponse({
    status: 200,
    description: 'Atividade retornada com sucesso',
    type: StudentActivityDto,
  })
  async getStudentActivity(
    @Query('days') days: string,
    @Request() req: any,
  ): Promise<StudentActivityDto> {
    const studentId = req.user.userId;
    const daysNum = parseInt(days, 10) || 30;
    return this.reportsService.getStudentActivity(studentId, daysNum);
  }

  // ==================== TEACHER REPORTS ====================

  @Get('teacher/overview')
  @ApiOperation({
    summary: 'Visão geral do professor',
    description: 'Retorna estatísticas gerais do professor (turmas, alunos, decks)',
  })
  @ApiResponse({
    status: 200,
    description: 'Visão geral retornada com sucesso',
    type: TeacherOverviewDto,
  })
  async getTeacherOverview(@Request() req: any): Promise<TeacherOverviewDto> {
    const teacherId = req.user.userId;
    return this.reportsService.getTeacherOverview(teacherId);
  }

  @Get('teacher/class/:classId')
  @ApiOperation({
    summary: 'Relatório de turma',
    description: 'Retorna estatísticas de uma turma específica com progresso de cada aluno',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório retornado com sucesso',
    type: ClassReportDto,
  })
  async getClassReport(@Param('classId') classId: string): Promise<ClassReportDto> {
    return this.reportsService.getClassReport(classId);
  }

  @Get('teacher/deck/:deckId/performance')
  @ApiOperation({
    summary: 'Performance de um deck',
    description: 'Retorna métricas de performance de um deck (média de acerto, cards difíceis, etc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance retornada com sucesso',
    type: DeckPerformanceDto,
  })
  async getDeckPerformance(@Param('deckId') deckId: string): Promise<DeckPerformanceDto> {
    return this.reportsService.getDeckPerformance(deckId);
  }

  @Get('teacher/deck/:deckId/detailed')
  @ApiOperation({
    summary: 'Relatório detalhado de deck',
    description: 'Retorna análise de cada card do deck (acerto, tempo médio, etc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório detalhado retornado com sucesso',
    type: DeckDetailedReportDto,
  })
  async getDeckDetailedReport(@Param('deckId') deckId: string): Promise<DeckDetailedReportDto> {
    return this.reportsService.getDeckDetailedReport(deckId);
  }
}
