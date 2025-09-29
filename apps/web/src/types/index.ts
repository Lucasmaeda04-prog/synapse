export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Deck {
  id: string
  ownerId: string
  title: string
  description: string
  tags: string[]
  isPublic: boolean
  cardsCount: number
  createdAt: string
  updatedAt: string
}

export interface Card {
  id: string
  deckId: string
  front: string
  back: string
  hints: string[]
  media: MediaItem[]
  createdAt: string
  updatedAt: string
}

export interface MediaItem {
  type: 'image' | 'audio' | 'video'
  url: string
}

export interface Class {
  id: string
  teacherId: string
  name: string
  studentIds: string[]
  createdAt: string
}

export interface Assignment {
  id: string
  deckId: string
  classId?: string
  studentId?: string
  dueDate?: string
  createdAt: string
}

export interface Review {
  id: string
  studentId: string
  cardId: string
  deckId: string
  rating: 0 | 1 | 2 | 3 // Again, Hard, Good, Easy
  elapsedMs: number
  scheduledAt: string
  reviewedAt: string
  nextDueAt: string
  stability: number
  difficulty: number
}

export interface Progress {
  id: string
  studentId: string
  deckId: string
  totalCards: number
  learned: number
  dueToday: number
  lastActivityAt: string
}

export interface StudySession {
  deckId: string
  cards: Card[]
  currentIndex: number
  completed: boolean
}