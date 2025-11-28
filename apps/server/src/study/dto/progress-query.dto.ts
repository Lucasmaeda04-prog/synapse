import { IsMongoId, IsOptional } from 'class-validator';

export class ProgressQueryDto {
  @IsOptional()
  @IsMongoId()
  deckId?: string;
}
