import apiClient from "./client";
import type { Card, CreateCardDto, UpdateCardDto } from "./types";

export const cardsApi = {
  // Listar cards de um deck
  async listByDeck(deckId: string): Promise<Card[]> {
    const response = await apiClient.get<Card[]>(`/decks/${deckId}/cards`);
    return response.data;
  },

  // Buscar um card por ID
  async getById(id: string): Promise<Card> {
    const response = await apiClient.get<Card>(`/cards/${id}`);
    return response.data;
  },

  // Criar um novo card
  async create(deckId: string, data: CreateCardDto): Promise<Card> {
    const response = await apiClient.post<Card>(`/decks/${deckId}/cards`, data);
    return response.data;
  },

  // Atualizar um card
  async update(id: string, data: UpdateCardDto): Promise<Card> {
    const response = await apiClient.patch<Card>(`/cards/${id}`, data);
    return response.data;
  },

  // Deletar um card
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/cards/${id}`);
  },
};
