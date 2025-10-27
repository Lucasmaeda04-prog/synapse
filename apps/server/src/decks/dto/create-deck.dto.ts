import { IsString, IsOptional, IsBoolean, IsArray, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeckDto {
  @ApiProperty({ description: 'Título do deck', example: 'Matemática Básica' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Descrição do deck', required: false, example: 'Deck sobre operações básicas' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Tags do deck', required: false, type: [String], example: ['matemática', 'básico'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Se o deck é público', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiProperty({ description: 'ID da organização', required: false })
  @IsOptional()
  @IsString()
  org_id?: string;

  @ApiProperty({ description: 'ID da escola', required: false })
  @IsOptional()
  @IsString()
  school_id?: string;
}
