import {
  IsString,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({
    description: 'Nome da turma',
    example: 'Turma 3A - Matemática',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    description: 'IDs dos alunos da turma',
    required: false,
    type: [String],
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  student_ids?: string[];

  @ApiProperty({ description: 'ID da organização', required: false })
  @IsOptional()
  @IsString()
  org_id?: string;

  @ApiProperty({ description: 'ID da escola', required: false })
  @IsOptional()
  @IsString()
  school_id?: string;
}
