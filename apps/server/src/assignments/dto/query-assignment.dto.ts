import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class QueryAssignmentDto {
  @ApiPropertyOptional({ description: 'Filtra por turma' })
  @IsOptional()
  @IsMongoId({ message: 'class_id deve ser um ObjectId válido' })
  class_id?: string;

  @ApiPropertyOptional({ description: 'Filtra por aluno' })
  @IsOptional()
  @IsMongoId({ message: 'student_id deve ser um ObjectId válido' })
  student_id?: string;

  @ApiPropertyOptional({ description: 'Filtra por deck' })
  @IsOptional()
  @IsMongoId({ message: 'deck_id deve ser um ObjectId válido' })
  deck_id?: string;
}
