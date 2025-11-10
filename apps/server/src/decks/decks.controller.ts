import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { QueryDeckDto } from './dto/query-deck.dto';
import {
  DeckResponseDto,
  PaginatedDecksResponseDto,
} from './dto/deck-response.dto';

@ApiTags('decks')
@Controller('decks')
export class DecksController {
  // ObjectId temporário para testes (será substituído por JWT)
  private readonly TEMP_USER_ID = new Types.ObjectId().toString();

  constructor(private readonly decksService: DecksService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Criar um novo deck (apenas TEACHER/ADMIN)' })
  @ApiResponse({
    status: 201,
    description: 'Deck criado com sucesso',
    type: DeckResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe) createDeckDto: CreateDeckDto,
    @Request() req: any,
  ): Promise<DeckResponseDto> {
    // TODO: Implementar autenticação e pegar userId do req.user
    const userId = req.user?.userId || this.TEMP_USER_ID;
    return this.decksService.create(createDeckDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar decks com filtros e paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de decks',
    type: PaginatedDecksResponseDto,
  })
  findAll(
    @Query(ValidationPipe) queryDto: QueryDeckDto,
    @Request() req: any,
  ): Promise<PaginatedDecksResponseDto> {
    const userId = queryDto.mine ? req.user?.userId || undefined : undefined;
    return this.decksService.findAll(queryDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um deck por ID' })
  @ApiResponse({
    status: 200,
    description: 'Deck encontrado',
    type: DeckResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Deck não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<DeckResponseDto> {
    // TODO: Implementar autenticação e pegar userId do req.user
    const userId = req.user?.userId || undefined;
    return this.decksService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Atualizar um deck (apenas TEACHER/ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Deck atualizado com sucesso',
    type: DeckResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Deck não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDeckDto: UpdateDeckDto,
    @Request() req: any,
  ): Promise<DeckResponseDto> {
    // TODO: Implementar autenticação e pegar userId do req.user
    const userId = req.user?.userId || this.TEMP_USER_ID;
    return this.decksService.update(id, updateDeckDto, userId);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Deletar um deck (apenas TEACHER/ADMIN)' })
  @ApiResponse({ status: 200, description: 'Deck deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Deck não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    // TODO: Implementar autenticação e pegar userId do req.user
    const userId = req.user?.userId || this.TEMP_USER_ID;
    return this.decksService.remove(id, userId);
  }
}
