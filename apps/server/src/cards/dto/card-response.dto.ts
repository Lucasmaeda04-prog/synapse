import { ApiProperty } from '@nestjs/swagger';

export class CardResponseDto {
  @ApiProperty({ description: 'ID do card' })
  _id!: string;

  @ApiProperty({ description: 'ID do deck' })
  deck_id!: string;

  @ApiProperty({ description: 'Frente do card' })
  front!: string;

  @ApiProperty({ description: 'Verso do card' })
  back!: string;

  @ApiProperty({ description: 'Dicas', type: [String] })
  hints!: string[];

  @ApiProperty({ description: 'Data de criação' })
  created_at!: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updated_at!: Date;
}
