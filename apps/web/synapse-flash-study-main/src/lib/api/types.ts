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
  cards?: CreateCardDto[];
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

// ============= ASSIGNMENTS =============

export interface Assignment {
  _id: string;
  deck_id: string;
  class_id?: string | null;
  student_id?: string | null;
  due_date?: Date | null;
  created_at: Date;
  deck?: Deck;
}

export interface CreateAssignmentDto {
  deck_id: string;
  class_id?: string;
  student_id?: string;
  due_date?: string;
}

export interface QueryAssignmentDto {
  class_id?: string;
  student_id?: string;
  deck_id?: string;
}

// ============= CARDS =============

export interface Card {
  _id: string;
  deck_id: string;
  front: string;
  back: string;
  hints: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateCardDto {
  front: string;
  back: string;
  hints?: string[];
}

export interface UpdateCardDto {
  front?: string;
  back?: string;
  hints?: string[];
}

// ============= STUDY/SRS =============

export interface CardInQueue {
  card_id: string;
  deck_id: string;
  front: string;
  back: string;
  next_due_at?: Date;
  is_new: boolean;
}

export interface QueueResponse {
  total: number;
  cards: CardInQueue[];
}

export interface QueueQueryDto {
  deckId: string;
  limit?: number;
}

export interface CreateReviewDto {
  card_id: string;
  deck_id: string;
  rating: 0 | 1 | 2 | 3; // 0=Again, 1=Hard, 2=Good, 3=Easy
  elapsed_ms: number;
}

export interface ReviewResponse {
  success: boolean;
  next_due_at: Date;
  stability: number;
  difficulty: number;
  interval_days: number;
}

export interface DeckProgress {
  deck_id: string;
  total_cards: number;
  learned: number;
  due_today: number;
  last_activity_at?: Date;
}

export interface ProgressResponse {
  decks: DeckProgress[];
}

export interface ProgressQueryDto {
  deckId?: string;
}

// ============= REPORTS =============

// Student Reports
export interface DeckAnalytics {
  deck_id: string;
  deck_title: string;
  total_cards: number;
  learned: number;
  due_today: number;
  total_answers: number;
  correct_answers: number;
  accuracy: number;
  time_spent_minutes: number;
  last_activity_at?: Date;
}

export interface StudentOverview {
  student_id: string;
  total_decks: number;
  total_cards: number;
  total_learned: number;
  total_due_today: number;
  overall_accuracy: number;
  total_time_spent_minutes: number;
  decks: DeckAnalytics[];
}

export interface StudySession {
  date: string;
  cards_studied: number;
  accuracy: number;
  time_minutes: number;
}

export interface StudentActivity {
  sessions: StudySession[];
  current_streak: number;
  longest_streak: number;
}

// Teacher Reports
export interface StudentProgressReport {
  student_id: string;
  student_name: string;
  student_email: string;
  total_cards: number;
  learned: number;
  progress_percent: number;
  accuracy: number;
  time_spent_minutes: number;
  last_activity_at?: Date;
}

export interface ClassReport {
  class_id: string;
  class_name: string;
  total_students: number;
  total_decks: number;
  avg_progress: number;
  avg_accuracy: number;
  students: StudentProgressReport[];
}

export interface DeckPerformance {
  deck_id: string;
  deck_title: string;
  total_cards: number;
  students_count: number;
  avg_progress: number;
  avg_accuracy: number;
  hardest_card?: {
    card_id: string;
    front: string;
    accuracy: number;
  };
  easiest_card?: {
    card_id: string;
    front: string;
    accuracy: number;
  };
}

export interface TeacherOverview {
  teacher_id: string;
  total_classes: number;
  total_students: number;
  total_decks: number;
  total_cards: number;
  total_assignments: number;
  avg_student_progress: number;
  avg_student_accuracy: number;
}

// ============= ERROR TYPES =============

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
