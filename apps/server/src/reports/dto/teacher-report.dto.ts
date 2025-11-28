import { ApiProperty } from '@nestjs/swagger';

export class StudentProgressDto {
  @ApiProperty({ description: 'ID do aluno' })
  student_id!: string;

  @ApiProperty({ description: 'Nome do aluno' })
  student_name!: string;

  @ApiProperty({ description: 'Email do aluno' })
  student_email!: string;

  @ApiProperty({ description: 'Total de cards' })
  total_cards!: number;

  @ApiProperty({ description: 'Cards aprendidos' })
  learned!: number;

  @ApiProperty({ description: 'Porcentagem de progresso (0-100)' })
  progress_percent!: number;

  @ApiProperty({ description: 'Taxa de acerto (0-100)' })
  accuracy!: number;

  @ApiProperty({ description: 'Tempo de estudo em minutos' })
  time_spent_minutes!: number;

  @ApiProperty({ description: 'Última atividade' })
  last_activity_at?: Date;
}

export class ClassReportDto {
  @ApiProperty({ description: 'ID da turma' })
  class_id!: string;

  @ApiProperty({ description: 'Nome da turma' })
  class_name!: string;

  @ApiProperty({ description: 'Total de alunos' })
  total_students!: number;

  @ApiProperty({ description: 'Total de decks atribuídos' })
  total_decks!: number;

  @ApiProperty({ description: 'Média de progresso da turma (0-100)' })
  avg_progress!: number;

  @ApiProperty({ description: 'Média de acerto da turma (0-100)' })
  avg_accuracy!: number;

  @ApiProperty({ description: 'Progresso por aluno', type: [StudentProgressDto] })
  students!: StudentProgressDto[];
}

export class DeckPerformanceDto {
  @ApiProperty({ description: 'ID do deck' })
  deck_id!: string;

  @ApiProperty({ description: 'Título do deck' })
  deck_title!: string;

  @ApiProperty({ description: 'Total de cards' })
  total_cards!: number;

  @ApiProperty({ description: 'Total de alunos que estudaram' })
  students_count!: number;

  @ApiProperty({ description: 'Média de progresso (0-100)' })
  avg_progress!: number;

  @ApiProperty({ description: 'Média de acerto (0-100)' })
  avg_accuracy!: number;

  @ApiProperty({ description: 'Card mais difícil' })
  hardest_card?: {
    card_id: string;
    front: string;
    accuracy: number;
  };

  @ApiProperty({ description: 'Card mais fácil' })
  easiest_card?: {
    card_id: string;
    front: string;
    accuracy: number;
  };
}

export class TeacherOverviewDto {
  @ApiProperty({ description: 'ID do professor' })
  teacher_id!: string;

  @ApiProperty({ description: 'Total de turmas' })
  total_classes!: number;

  @ApiProperty({ description: 'Total de alunos' })
  total_students!: number;

  @ApiProperty({ description: 'Total de decks criados' })
  total_decks!: number;

  @ApiProperty({ description: 'Total de cards criados' })
  total_cards!: number;

  @ApiProperty({ description: 'Total de atribuições' })
  total_assignments!: number;

  @ApiProperty({ description: 'Média de progresso de todos os alunos (0-100)' })
  avg_student_progress!: number;

  @ApiProperty({ description: 'Média de acerto de todos os alunos (0-100)' })
  avg_student_accuracy!: number;
}

export class CardAnalyticsDto {
  @ApiProperty({ description: 'ID do card' })
  card_id!: string;

  @ApiProperty({ description: 'Frente do card' })
  front!: string;

  @ApiProperty({ description: 'Total de respostas' })
  total_answers!: number;

  @ApiProperty({ description: 'Respostas corretas' })
  correct_answers!: number;

  @ApiProperty({ description: 'Taxa de acerto (0-100)' })
  accuracy!: number;

  @ApiProperty({ description: 'Tempo médio de resposta em segundos' })
  avg_response_time_seconds!: number;
}

export class DeckDetailedReportDto {
  @ApiProperty({ description: 'ID do deck' })
  deck_id!: string;

  @ApiProperty({ description: 'Título do deck' })
  deck_title!: string;

  @ApiProperty({ description: 'Performance por card', type: [CardAnalyticsDto] })
  cards!: CardAnalyticsDto[];
}
