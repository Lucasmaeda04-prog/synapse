import apiClient from "./client";
import type {
  Deck,
  CreateDeckDto,
  UpdateDeckDto,
  QueryDeckDto,
  PaginatedDecksResponse,
} from "./types";

// Serviço de API para gerenciar Decks
export const decksApi = {
  // Lista decks com filtros e paginação
  async list(params?: QueryDeckDto): Promise<PaginatedDecksResponse> {
    const response = await apiClient.get<PaginatedDecksResponse>("/decks", {
      params,
    });
    return response.data;
  },

  // Busca um deck específico por ID
  async getById(id: string): Promise<Deck> {
    const response = await apiClient.get<Deck>(`/decks/${id}`);
    return response.data;
  },

  // Cria um novo deck
  async create(data: CreateDeckDto): Promise<Deck> {
    const response = await apiClient.post<Deck>("/decks", data);
    return response.data;
  },

  // Atualiza um deck existente
  async update(id: string, data: UpdateDeckDto): Promise<Deck> {
    const response = await apiClient.patch<Deck>(`/decks/${id}`, data);
    return response.data;
  },

  // Deleta um deck
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/decks/${id}`
    );
    return response.data;
  },
};
