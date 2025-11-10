import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardDocument } from '../database/schemas/card.schema';
import { Deck, DeckDocument } from '../database/schemas/deck.schema';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardResponseDto } from './dto/card-response.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    @InjectModel(Deck.name) private deckModel: Model<DeckDocument>,
  ) {}

  async create(
    deckId: string,
    createCardDto: CreateCardDto,
  ): Promise<CardResponseDto> {
    // Verificar se o deck existe
    if (!Types.ObjectId.isValid(deckId)) {
      throw new NotFoundException(`Deck with ID ${deckId} not found`);
    }

    const deck = await this.deckModel.findById(deckId).exec();
    if (!deck) {
      throw new NotFoundException(`Deck with ID ${deckId} not found`);
    }

    // Criar o card
    const card = new this.cardModel({
      ...createCardDto,
      deck_id: new Types.ObjectId(deckId),
    });

    const savedCard = await card.save();

    // Incrementar o contador de cards no deck
    await this.deckModel.findByIdAndUpdate(deckId, {
      $inc: { cards_count: 1 },
    }).exec();

    return this.toResponseDto(savedCard);
  }

  async findByDeck(deckId: string): Promise<CardResponseDto[]> {
    if (!Types.ObjectId.isValid(deckId)) {
      throw new NotFoundException(`Deck with ID ${deckId} not found`);
    }

    const cards = await this.cardModel
      .find({ deck_id: new Types.ObjectId(deckId) })
      .sort({ created_at: 1 })
      .lean()
      .exec();

    return cards.map((card) => this.toResponseDto(card));
  }

  async findOne(id: string): Promise<CardResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    const card = await this.cardModel.findById(id).lean().exec();

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return this.toResponseDto(card);
  }

  async update(
    id: string,
    updateCardDto: UpdateCardDto,
  ): Promise<CardResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    const card = await this.cardModel
      .findByIdAndUpdate(id, updateCardDto, { new: true })
      .lean()
      .exec();

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return this.toResponseDto(card);
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    const card = await this.cardModel.findById(id).exec();

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    const deckId = card.deck_id;

    await this.cardModel.findByIdAndDelete(id).exec();

    // Decrementar o contador de cards no deck
    await this.deckModel.findByIdAndUpdate(deckId, {
      $inc: { cards_count: -1 },
    }).exec();
  }

  private toResponseDto(card: any): CardResponseDto {
    return {
      _id: card._id.toString(),
      deck_id: card.deck_id.toString(),
      front: card.front,
      back: card.back,
      hints: card.hints || [],
      created_at: card.created_at,
      updated_at: card.updated_at,
    };
  }
}
