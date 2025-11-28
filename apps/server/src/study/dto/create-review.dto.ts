import { IsInt, IsMongoId, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID do card sendo revisado',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  card_id!: string;

  @ApiProperty({
    description: 'ID do deck ao qual o card pertence',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  deck_id!: string;

  @ApiProperty({
    description: 'Avaliação do aluno: 0=Again, 1=Hard, 2=Good, 3=Easy',
    enum: [0, 1, 2, 3],
    example: 2,
  })
  @IsInt()
  @Min(0)
  @Max(3)
  rating!: 0 | 1 | 2 | 3;

  @ApiProperty({
    description: 'Tempo de resposta em milissegundos',
    example: 5000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  elapsed_ms!: number;
}
