import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeckResponseDto } from '../../decks/dto/deck-response.dto';

export class AssignmentResponseDto {
  @ApiProperty({ description: 'ID do assignment' })
  _id!: string;

  @ApiProperty({ description: 'ID do deck atribuído' })
  deck_id!: string;

  @ApiPropertyOptional({ description: 'Turma alvo', nullable: true })
  class_id?: string | null;

  @ApiPropertyOptional({ description: 'Aluno alvo', nullable: true })
  student_id?: string | null;

  @ApiPropertyOptional({
    description: 'Data limite opcional',
    type: String,
    nullable: true,
  })
  due_date?: Date | null;

  @ApiProperty({ description: 'Data de criação' })
  created_at!: Date;

  @ApiPropertyOptional({
    description: 'Informações resumidas do deck atribuído',
    type: DeckResponseDto,
  })
  deck?: DeckResponseDto;
}
