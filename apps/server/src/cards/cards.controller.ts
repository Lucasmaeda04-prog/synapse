import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardResponseDto } from './dto/card-response.dto';

@ApiTags('cards')
@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('decks/:deckId/cards')
  @ApiOperation({ summary: 'Criar um novo card em um deck' })
  @ApiParam({ name: 'deckId', description: 'ID do deck' })
  @ApiResponse({
    status: 201,
    description: 'Card criado com sucesso',
    type: CardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Deck não encontrado' })
  create(
    @Param('deckId') deckId: string,
    @Body(ValidationPipe) createCardDto: CreateCardDto,
  ): Promise<CardResponseDto> {
    return this.cardsService.create(deckId, createCardDto);
  }

  @Get('decks/:deckId/cards')
  @ApiOperation({ summary: 'Listar todos os cards de um deck' })
  @ApiParam({ name: 'deckId', description: 'ID do deck' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cards',
    type: [CardResponseDto],
  })
  findByDeck(@Param('deckId') deckId: string): Promise<CardResponseDto[]> {
    return this.cardsService.findByDeck(deckId);
  }

  @Get('cards/:id')
  @ApiOperation({ summary: 'Buscar um card por ID' })
  @ApiParam({ name: 'id', description: 'ID do card' })
  @ApiResponse({
    status: 200,
    description: 'Card encontrado',
    type: CardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Card não encontrado' })
  findOne(@Param('id') id: string): Promise<CardResponseDto> {
    return this.cardsService.findOne(id);
  }

  @Patch('cards/:id')
  @ApiOperation({ summary: 'Atualizar um card' })
  @ApiParam({ name: 'id', description: 'ID do card' })
  @ApiResponse({
    status: 200,
    description: 'Card atualizado com sucesso',
    type: CardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Card não encontrado' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCardDto: UpdateCardDto,
  ): Promise<CardResponseDto> {
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete('cards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar um card' })
  @ApiParam({ name: 'id', description: 'ID do card' })
  @ApiResponse({ status: 204, description: 'Card deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Card não encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.cardsService.remove(id);
  }
}
