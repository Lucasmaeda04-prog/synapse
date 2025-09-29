import type { Deck, Card, Class, Assignment, Progress } from '../types'

export const mockDecks: Deck[] = [
  {
    id: '1',
    ownerId: '2',
    title: 'Matemática Básica',
    description: 'Conceitos fundamentais de matemática para o ensino médio',
    tags: ['matemática', 'básico', 'ensino-médio'],
    isPublic: false,
    cardsCount: 25,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    ownerId: '2',
    title: 'História do Brasil',
    description: 'Principais eventos da história brasileira',
    tags: ['história', 'brasil', 'cultura'],
    isPublic: true,
    cardsCount: 40,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-25T16:45:00Z',
  },
  {
    id: '3',
    ownerId: '2',
    title: 'Inglês - Verbos Irregulares',
    description: 'Lista dos principais verbos irregulares em inglês',
    tags: ['inglês', 'verbos', 'gramática'],
    isPublic: false,
    cardsCount: 60,
    createdAt: '2024-01-05T11:30:00Z',
    updatedAt: '2024-01-22T13:15:00Z',
  },
]

export const mockCards: Card[] = [
  {
    id: '1',
    deckId: '1',
    front: 'Qual é a fórmula da área do círculo?',
    back: 'A = π × r²',
    hints: ['Envolve π (pi)', 'Usa o raio ao quadrado'],
    media: [],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    deckId: '1',
    front: 'Como calcular a hipotenusa de um triângulo retângulo?',
    back: 'Teorema de Pitágoras: c² = a² + b²',
    hints: ['Teorema famoso', 'Soma dos quadrados dos catetos'],
    media: [],
    createdAt: '2024-01-15T10:35:00Z',
    updatedAt: '2024-01-15T10:35:00Z',
  },
  {
    id: '3',
    deckId: '2',
    front: 'Em que ano foi proclamada a Independência do Brasil?',
    back: '1822',
    hints: ['Século XIX', 'Dom Pedro I'],
    media: [],
    createdAt: '2024-01-10T09:30:00Z',
    updatedAt: '2024-01-10T09:30:00Z',
  },
]

export const mockClasses: Class[] = [
  {
    id: '1',
    teacherId: '2',
    name: '3º Ano A - Matemática',
    studentIds: ['3', '4', '5'],
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: '2',
    teacherId: '2',
    name: '2º Ano B - História',
    studentIds: ['3', '6', '7'],
    createdAt: '2024-01-01T08:30:00Z',
  },
]

export const mockAssignments: Assignment[] = [
  {
    id: '1',
    deckId: '1',
    classId: '1',
    dueDate: '2024-02-15T23:59:59Z',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    deckId: '2',
    classId: '2',
    dueDate: '2024-02-20T23:59:59Z',
    createdAt: '2024-01-22T14:00:00Z',
  },
]

export const mockProgress: Progress[] = [
  {
    id: '1',
    studentId: '3',
    deckId: '1',
    totalCards: 25,
    learned: 15,
    dueToday: 8,
    lastActivityAt: '2024-01-25T16:30:00Z',
  },
  {
    id: '2',
    studentId: '3',
    deckId: '2',
    totalCards: 40,
    learned: 22,
    dueToday: 12,
    lastActivityAt: '2024-01-24T14:20:00Z',
  },
]