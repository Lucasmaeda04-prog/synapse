import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { StudyService } from './study.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueueQueryDto } from './dto/queue-query.dto';
import { ProgressQueryDto } from './dto/progress-query.dto';
import { QueueResponseDto } from './dto/queue-response.dto';
import { ProgressResponseDto } from './dto/progress-response.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

@ApiTags('study')
@Controller('study')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class StudyController {
  // Temporário: usar ObjectId válido para testes sem JWT
  private readonly TEMP_STUDENT_ID = new Types.ObjectId().toString();

  constructor(private readonly studyService: StudyService) {}

  @Get('queue')
  @ApiOperation({
    summary: 'Buscar fila de estudo',
    description: 'Retorna os cards que o aluno precisa estudar (novos + devidos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Fila de estudo retornada com sucesso',
    type: QueueResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Deck não encontrado ou sem acesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  getQueue(@Query(ValidationPipe) queryDto: QueueQueryDto, @Request() req: any): Promise<QueueResponseDto> {
    const studentId = req.user?.userId || this.TEMP_STUDENT_ID;
    return this.studyService.getQueue(queryDto, studentId);
  }

  @Post('review')
  @ApiOperation({
    summary: 'Submeter revisão de card',
    description: 'Registra a resposta do aluno e calcula a próxima data de revisão usando o algoritmo SRS',
  })
  @ApiResponse({
    status: 201,
    description: 'Revisão registrada com sucesso',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Card não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Rating inválido ou card não pertence ao deck',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  submitReview(@Body(ValidationPipe) reviewDto: CreateReviewDto, @Request() req: any): Promise<ReviewResponseDto> {
    const studentId = req.user?.userId || this.TEMP_STUDENT_ID;
    return this.studyService.submitReview(reviewDto, studentId);
  }

  @Get('progress')
  @ApiOperation({
    summary: 'Buscar progresso do aluno',
    description: 'Retorna estatísticas de progresso (total, aprendidos, devidos) para um ou todos os decks',
  })
  @ApiResponse({
    status: 200,
    description: 'Progresso retornado com sucesso',
    type: ProgressResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  getProgress(@Query(ValidationPipe) queryDto: ProgressQueryDto, @Request() req: any): Promise<ProgressResponseDto> {
    const studentId = req.user?.userId || this.TEMP_STUDENT_ID;
    return this.studyService.getProgress(queryDto, studentId);
  }

}

/**
 * Controller interno para endpoints de desenvolvimento (sem autenticação)
 */
@ApiTags('study-dev')
@Controller('study/dev')
export class StudyDevController {
  constructor(private readonly studyService: StudyService) {}

  @Delete('reset/:deckId/:studentId')
  @ApiOperation({
    summary: '[DEV] Resetar reviews de um deck para um aluno',
    description: 'Remove todos os reviews do aluno para um deck específico. Apenas para desenvolvimento/testes. SEM AUTENTICAÇÃO.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews resetados com sucesso',
  })
  async resetDeckReviews(
    @Param('deckId') deckId: string,
    @Param('studentId') studentId: string,
  ): Promise<{ deleted: number }> {
    return this.studyService.resetDeckReviews(deckId, studentId);
  }

  @Delete('reset-all/:deckId')
  @ApiOperation({
    summary: '[DEV] Resetar TODOS os reviews de um deck',
    description: 'Remove todos os reviews de TODOS os alunos para um deck. Apenas para desenvolvimento/testes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews resetados com sucesso',
  })
  async resetAllDeckReviews(@Param('deckId') deckId: string): Promise<{ deleted: number }> {
    return this.studyService.resetAllDeckReviews(deckId);
  }
}
