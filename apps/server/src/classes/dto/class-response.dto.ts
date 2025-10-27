import { ApiProperty } from '@nestjs/swagger';

export class ClassResponseDto {
  @ApiProperty({ description: 'ID da turma' })
  _id!: string;

  @ApiProperty({ description: 'ID do professor' })
  teacher_id!: string;

  @ApiProperty({ description: 'Nome da turma' })
  name!: string;

  @ApiProperty({ description: 'IDs dos alunos', type: [String] })
  student_ids!: string[];

  @ApiProperty({ description: 'Quantidade de alunos' })
  students_count!: number;

  @ApiProperty({ description: 'ID da organização', required: false })
  org_id?: string;

  @ApiProperty({ description: 'ID da escola', required: false })
  school_id?: string;

  @ApiProperty({ description: 'Data de criação' })
  created_at!: Date;
}

export class PaginatedClassesResponseDto {
  @ApiProperty({ description: 'Lista de turmas', type: [ClassResponseDto] })
  data!: ClassResponseDto[];

  @ApiProperty({ description: 'Total de turmas' })
  total!: number;

  @ApiProperty({ description: 'Página atual' })
  page!: number;

  @ApiProperty({ description: 'Itens por página' })
  limit!: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages!: number;
}
