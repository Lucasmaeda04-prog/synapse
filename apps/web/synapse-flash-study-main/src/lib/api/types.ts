// Tipos baseados nos DTOs do backend

// ============= DECKS =============

export interface Deck {
  _id: string;
  owner_id: string;
  title: string;
  description?: string;
  tags: string[];
  is_public: boolean;
  cards_count: number;
  org_id?: string;
  school_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeckDto {
  title: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  org_id?: string;
  school_id?: string;
}

export interface UpdateDeckDto {
  title?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
}

export interface QueryDeckDto {
  page?: number;
  limit?: number;
  query?: string;
  tags?: string;
  mine?: boolean;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedDecksResponse {
  data: Deck[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============= CLASSES =============

export interface Class {
  _id: string;
  teacher_id: string;
  name: string;
  student_ids: string[];
  students_count: number;
  org_id?: string;
  school_id?: string;
  created_at: Date;
}

export interface CreateClassDto {
  name: string;
  student_ids?: string[];
  org_id?: string;
  school_id?: string;
}

export interface UpdateClassDto {
  name?: string;
  student_ids?: string[];
}

export interface QueryClassDto {
  page?: number;
  limit?: number;
  query?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface AddStudentsDto {
  student_ids: string[];
}

export interface RemoveStudentsDto {
  student_ids: string[];
}

export interface PaginatedClassesResponse {
  data: Class[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============= ERROR TYPES =============

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
