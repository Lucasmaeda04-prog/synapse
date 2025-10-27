import { ApiProperty } from '@nestjs/swagger';

export class DeckResponseDto {
  @ApiProperty({ description: 'ID do deck' })
  _id!: string;

  @ApiProperty({ description: 'ID do proprietário' })
  owner_id!: string;

  @ApiProperty({ description: 'Título do deck' })
  title!: string;

  @ApiProperty({ description: 'Descrição do deck', required: false })
  description?: string;

  @ApiProperty({ description: 'Tags do deck', type: [String] })
  tags!: string[];

  @ApiProperty({ description: 'Se o deck é público' })
  is_public!: boolean;

  @ApiProperty({ description: 'Quantidade de cards' })
  cards_count!: number;

  @ApiProperty({ description: 'ID da organização', required: false })
  org_id?: string;

  @ApiProperty({ description: 'ID da escola', required: false })
  school_id?: string;

  @ApiProperty({ description: 'Data de criação' })
  created_at!: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updated_at!: Date;
}

export class PaginatedDecksResponseDto {
  @ApiProperty({ description: 'Lista de decks', type: [DeckResponseDto] })
  data!: DeckResponseDto[];

  @ApiProperty({ description: 'Total de decks' })
  total!: number;

  @ApiProperty({ description: 'Página atual' })
  page!: number;

  @ApiProperty({ description: 'Itens por página' })
  limit!: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages!: number;
}
