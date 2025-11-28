import { ApiProperty } from '@nestjs/swagger';

export class DeckProgressDto {
  @ApiProperty({ description: 'ID do deck', example: '507f1f77bcf86cd799439012' })
  deck_id!: string;

  @ApiProperty({ description: 'Total de cards no deck', example: 50 })
  total_cards!: number;

  @ApiProperty({ description: 'Cards já estudados ao menos uma vez', example: 30 })
  learned!: number;

  @ApiProperty({ description: 'Cards devidos para hoje', example: 10 })
  due_today!: number;

  @ApiProperty({ description: 'Data da última atividade', required: false })
  last_activity_at?: Date;
}

export class ProgressResponseDto {
  @ApiProperty({ description: 'Progresso por deck', type: [DeckProgressDto] })
  decks!: DeckProgressDto[];
}
