import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueueQueryDto {
  @ApiProperty({
    description: 'ID do deck para buscar a fila de estudo',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  deckId!: string;

  @ApiProperty({
    description: 'Número máximo de cards a retornar',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
