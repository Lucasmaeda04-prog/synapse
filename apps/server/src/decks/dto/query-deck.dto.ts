import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDeckDto {
  @ApiProperty({ description: 'Buscar apenas decks próprios', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  mine?: boolean;

  @ApiProperty({
    description: 'Texto para busca',
    required: false,
    example: 'matemática',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'Filtrar por tags (separadas por vírgula)',
    required: false,
    example: 'matemática,básico',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    description: 'Número da página',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Itens por página',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({
    description: 'Campo de ordenação',
    required: false,
    example: 'created_at',
    enum: ['created_at', 'title', 'cards_count'],
  })
  @IsOptional()
  @IsString()
  sort?: string = 'created_at';

  @ApiProperty({
    description: 'Ordem de ordenação',
    required: false,
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';
}
