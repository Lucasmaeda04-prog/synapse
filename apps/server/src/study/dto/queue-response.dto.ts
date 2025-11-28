import { ApiProperty } from '@nestjs/swagger';

export class CardInQueueDto {
  @ApiProperty({ description: 'ID do card', example: '507f1f77bcf86cd799439011' })
  card_id!: string;

  @ApiProperty({ description: 'ID do deck', example: '507f1f77bcf86cd799439012' })
  deck_id!: string;

  @ApiProperty({ description: 'Frente do card', example: 'O que é NestJS?' })
  front!: string;

  @ApiProperty({ description: 'Verso do card', example: 'Framework Node.js para construir aplicações server-side' })
  back!: string;

  @ApiProperty({ description: 'Tags do card', example: ['backend', 'nodejs'], required: false })
  tags?: string[];

  @ApiProperty({ description: 'Data da próxima revisão (se não for novo)', required: false })
  next_due_at?: Date;

  @ApiProperty({ description: 'Se é um card novo (nunca estudado)', example: true })
  is_new!: boolean;
}

export class QueueResponseDto {
  @ApiProperty({ description: 'Total de cards na fila', example: 15 })
  total!: number;

  @ApiProperty({ description: 'Lista de cards para estudar', type: [CardInQueueDto] })
  cards!: CardInQueueDto[];
}
