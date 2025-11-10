import {
  IsString,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({
    description: 'Frente do card (pergunta)',
    example: 'O que é mitocôndria?',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  front!: string;

  @ApiProperty({
    description: 'Verso do card (resposta)',
    example: 'Organela responsável pela respiração celular',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  back!: string;

  @ApiProperty({
    description: 'Dicas opcionais',
    required: false,
    type: [String],
    example: ['Pense em energia', 'ATP'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hints?: string[];
}
