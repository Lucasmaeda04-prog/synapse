import { IsArray, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddStudentsDto {
  @ApiProperty({ description: 'IDs dos alunos a serem adicionados', type: [String], example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  student_ids!: string[];
}

export class RemoveStudentsDto {
  @ApiProperty({ description: 'IDs dos alunos a serem removidos', type: [String], example: ['507f1f77bcf86cd799439011'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  student_ids!: string[];
}
