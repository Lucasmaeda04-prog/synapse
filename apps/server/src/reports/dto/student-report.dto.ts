import { ApiProperty } from '@nestjs/swagger';

export class DeckAnalyticsDto {
  @ApiProperty({ description: 'ID do deck' })
  deck_id!: string;

  @ApiProperty({ description: 'Título do deck' })
  deck_title!: string;

  @ApiProperty({ description: 'Total de cards no deck' })
  total_cards!: number;

  @ApiProperty({ description: 'Cards aprendidos' })
  learned!: number;

  @ApiProperty({ description: 'Cards para revisar hoje' })
  due_today!: number;

  @ApiProperty({ description: 'Total de respostas' })
  total_answers!: number;

  @ApiProperty({ description: 'Respostas corretas (Good + Easy)' })
  correct_answers!: number;

  @ApiProperty({ description: 'Taxa de acerto (0-100)' })
  accuracy!: number;

  @ApiProperty({ description: 'Tempo total de estudo em minutos' })
  time_spent_minutes!: number;

  @ApiProperty({ description: 'Última atividade' })
  last_activity_at?: Date;
}

export class StudentOverviewDto {
  @ApiProperty({ description: 'ID do aluno' })
  student_id!: string;

  @ApiProperty({ description: 'Total de decks' })
  total_decks!: number;

  @ApiProperty({ description: 'Total de cards em todos os decks' })
  total_cards!: number;

  @ApiProperty({ description: 'Cards aprendidos em todos os decks' })
  total_learned!: number;

  @ApiProperty({ description: 'Cards para revisar hoje' })
  total_due_today!: number;

  @ApiProperty({ description: 'Taxa de acerto geral (0-100)' })
  overall_accuracy!: number;

  @ApiProperty({ description: 'Tempo total de estudo em minutos' })
  total_time_spent_minutes!: number;

  @ApiProperty({ description: 'Estatísticas por deck', type: [DeckAnalyticsDto] })
  decks!: DeckAnalyticsDto[];
}

export class StudySessionDto {
  @ApiProperty({ description: 'Data da sessão' })
  date!: string;

  @ApiProperty({ description: 'Cards estudados' })
  cards_studied!: number;

  @ApiProperty({ description: 'Taxa de acerto' })
  accuracy!: number;

  @ApiProperty({ description: 'Tempo em minutos' })
  time_minutes!: number;
}

export class StudentActivityDto {
  @ApiProperty({ description: 'Histórico de sessões de estudo', type: [StudySessionDto] })
  sessions!: StudySessionDto[];

  @ApiProperty({ description: 'Sequência atual de dias estudando' })
  current_streak!: number;

  @ApiProperty({ description: 'Maior sequência de dias' })
  longest_streak!: number;
}
