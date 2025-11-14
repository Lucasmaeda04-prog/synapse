import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsMongoId, ValidateIf } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'ID do deck que será atribuído' })
  @IsMongoId({ message: 'deck_id deve ser um ObjectId válido' })
  deck_id!: string;

  @ApiPropertyOptional({
    description:
      'ID da turma que receberá o deck (obrigatório se student_id não for enviado)',
  })
  @ValidateIf((obj: CreateAssignmentDto) => !obj.student_id)
  @IsMongoId({ message: 'class_id deve ser um ObjectId válido' })
  class_id?: string;

  @ApiPropertyOptional({
    description:
      'ID do aluno que receberá o deck (obrigatório se class_id não for enviado)',
  })
  @ValidateIf((obj: CreateAssignmentDto) => !obj.class_id)
  @IsMongoId({ message: 'student_id deve ser um ObjectId válido' })
  student_id?: string;

  @ApiPropertyOptional({
    description: 'Data limite para conclusão (ISO 8601)',
    type: String,
  })
  @ValidateIf((obj: CreateAssignmentDto) => obj.due_date !== undefined)
  @IsDateString({}, { message: 'due_date deve ser uma data válida' })
  due_date?: string;
}
