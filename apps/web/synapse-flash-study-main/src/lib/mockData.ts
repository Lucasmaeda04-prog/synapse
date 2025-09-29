export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  teacherId: string;
  createdAt: Date;
  tags: string[];
}

export interface Class {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  studentIds: string[];
  assignedDecks: string[];
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classIds: string[];
}

export const mockDecks: Deck[] = [
  {
    id: '1',
    title: 'Matemática Básica',
    description: 'Fundamentos de álgebra e geometria',
    teacherId: '1',
    createdAt: new Date('2024-01-15'),
    tags: ['matemática', 'álgebra'],
    cards: [
      {
        id: '1-1',
        front: 'Qual a fórmula de Bhaskara?',
        back: 'x = (-b ± √(b² - 4ac)) / 2a',
        deckId: '1',
        nextReview: new Date(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      },
      {
        id: '1-2',
        front: 'Qual o teorema de Pitágoras?',
        back: 'a² + b² = c² (em um triângulo retângulo)',
        deckId: '1',
        nextReview: new Date(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      },
    ],
  },
  {
    id: '2',
    title: 'História do Brasil',
    description: 'Principais eventos da história brasileira',
    teacherId: '1',
    createdAt: new Date('2024-02-10'),
    tags: ['história', 'brasil'],
    cards: [
      {
        id: '2-1',
        front: 'Em que ano foi proclamada a independência do Brasil?',
        back: '1822',
        deckId: '2',
        nextReview: new Date(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      },
    ],
  },
];

export const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Turma 9º A',
    description: 'Turma do 9º ano - Ensino Fundamental',
    teacherId: '1',
    studentIds: ['2', '3', '4'],
    assignedDecks: ['1', '2'],
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    name: 'Turma 8º B',
    description: 'Turma do 8º ano - Ensino Fundamental',
    teacherId: '1',
    studentIds: ['5', '6'],
    assignedDecks: ['1'],
    createdAt: new Date('2024-01-12'),
  },
];

export const mockStudents: Student[] = [
  { id: '2', name: 'João Santos', email: 'aluno@synapse.com', classIds: ['1'] },
  { id: '3', name: 'Maria Oliveira', email: 'maria@synapse.com', classIds: ['1'] },
  { id: '4', name: 'Pedro Costa', email: 'pedro@synapse.com', classIds: ['1'] },
  { id: '5', name: 'Ana Paula', email: 'ana@synapse.com', classIds: ['2'] },
  { id: '6', name: 'Lucas Lima', email: 'lucas@synapse.com', classIds: ['2'] },
];
