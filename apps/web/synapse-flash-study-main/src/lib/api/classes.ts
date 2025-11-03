import apiClient from "./client";
import type {
  Class,
  CreateClassDto,
  UpdateClassDto,
  QueryClassDto,
  AddStudentsDto,
  RemoveStudentsDto,
  PaginatedClassesResponse,
} from "./types";

// Serviço de API para gerenciar Classes (Turmas)
export const classesApi = {
  // Lista classes com filtros e paginação
  async list(params?: QueryClassDto): Promise<PaginatedClassesResponse> {
    const response = await apiClient.get<PaginatedClassesResponse>("/classes", {
      params,
    });
    return response.data;
  },

  // Busca uma classe específica por ID
  async getById(id: string): Promise<Class> {
    const response = await apiClient.get<Class>(`/classes/${id}`);
    return response.data;
  },

  // Cria uma nova classe
  async create(data: CreateClassDto): Promise<Class> {
    const response = await apiClient.post<Class>("/classes", data);
    return response.data;
  },

  // Atualiza uma classe existente
  async update(id: string, data: UpdateClassDto): Promise<Class> {
    const response = await apiClient.patch<Class>(`/classes/${id}`, data);
    return response.data;
  },

  // Deleta uma classe
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/classes/${id}`
    );
    return response.data;
  },

  //Adiciona alunos a uma classe
  async addStudents(id: string, data: AddStudentsDto): Promise<Class> {
    const response = await apiClient.post<Class>(
      `/classes/${id}/students`,
      data
    );
    return response.data;
  },

  // Remove alunos de uma classe
  async removeStudents(id: string, data: RemoveStudentsDto): Promise<Class> {
    const response = await apiClient.delete<Class>(`/classes/${id}/students`, {
      data,
    });
    return response.data;
  },
};
