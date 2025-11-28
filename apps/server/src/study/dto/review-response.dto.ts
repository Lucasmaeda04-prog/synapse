import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ description: 'Se a revisão foi registrada com sucesso', example: true })
  success!: boolean;

  @ApiProperty({ description: 'Data da próxima revisão' })
  next_due_at!: Date;

  @ApiProperty({ description: 'Estabilidade calculada pelo algoritmo SRS', example: 0.35 })
  stability!: number;

  @ApiProperty({ description: 'Dificuldade calculada pelo algoritmo SRS', example: 0.28 })
  difficulty!: number;

  @ApiProperty({ description: 'Intervalo em dias até a próxima revisão', example: 3 })
  interval_days!: number;
}
