import { auth } from './firebase';
import type {
  CreateDeckDto,
  UpdateDeckDto,
  QueryDeckDto,
  Deck,
  PaginatedDecksResponse,
  CreateClassDto,
  UpdateClassDto,
  QueryClassDto,
  Class,
  PaginatedClassesResponse,
  AddStudentsDto,
  RemoveStudentsDto,
} from './api/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Funções específicas da API
export const api = {
  // Auth
  getCurrentUser: () => apiRequest<{ id: string; email: string; name: string; role: string }>('/auth/me'),
  
  // Users - endpoint público (não requer autenticação)
  createUser: async (data: { uid: string; email: string; name: string; role: 'TEACHER' | 'STUDENT' }) => {
    // Este endpoint não requer autenticação, então não precisa do token
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      const errorMessage = error.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  },
  
  // Decks (quando implementado)
  getDecks: () => apiRequest('/decks'),
  
  // Classes (quando implementado)
  getClasses: () => apiRequest('/classes'),
};

// API para Decks
export const decksApi = {
  list: (params?: QueryDeckDto): Promise<PaginatedDecksResponse> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest<PaginatedDecksResponse>(`/decks${queryString}`);
  },
  getById: (id: string): Promise<Deck> => {
    return apiRequest<Deck>(`/decks/${id}`);
  },
  create: (data: CreateDeckDto): Promise<Deck> => {
    return apiRequest<Deck>('/decks', { method: 'POST', body: JSON.stringify(data) });
  },
  update: (id: string, data: UpdateDeckDto): Promise<Deck> => {
    return apiRequest<Deck>(`/decks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  delete: (id: string): Promise<void> => {
    return apiRequest<void>(`/decks/${id}`, { method: 'DELETE' });
  },
};

// API para Classes
export const classesApi = {
  list: (params?: QueryClassDto): Promise<PaginatedClassesResponse> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest<PaginatedClassesResponse>(`/classes${queryString}`);
  },
  getById: (id: string): Promise<Class> => {
    return apiRequest<Class>(`/classes/${id}`);
  },
  create: (data: CreateClassDto): Promise<Class> => {
    return apiRequest<Class>('/classes', { method: 'POST', body: JSON.stringify(data) });
  },
  update: (id: string, data: UpdateClassDto): Promise<Class> => {
    return apiRequest<Class>(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  delete: (id: string): Promise<void> => {
    return apiRequest<void>(`/classes/${id}`, { method: 'DELETE' });
  },
  addStudents: (id: string, data: AddStudentsDto): Promise<Class> => {
    return apiRequest<Class>(`/classes/${id}/students`, { method: 'POST', body: JSON.stringify(data) });
  },
  removeStudents: (id: string, data: RemoveStudentsDto): Promise<Class> => {
    return apiRequest<Class>(`/classes/${id}/students`, { method: 'DELETE', body: JSON.stringify(data) });
  },
};

