import {
  mockDecks as seedDecks,
  mockClasses as seedClasses,
  mockStudents as seedStudents,
  Deck,
  Class,
  Flashcard,
  Student,
} from './mockData';

// In-memory state (mutable) derived from seed data
let decks: Deck[] = seedDecks.map((d) => ({ ...d, cards: d.cards.map((c) => ({ ...c })) }));
let classesState: Class[] = seedClasses.map((c) => ({ ...c, studentIds: [...c.studentIds], assignedDecks: [...c.assignedDecks] }));
const students: Student[] = seedStudents.map((s) => ({ ...s, classIds: [...s.classIds] }));

const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Decks
export function listDecksByUser(userId: string, role: 'teacher' | 'student'): Deck[] {
  if (role === 'teacher') return decks.filter((d) => d.teacherId === userId);
  // Student: decks atribuídos em suas turmas
  const myClassIds = students.find((s) => s.id === userId)?.classIds ?? [];
  const deckIds = new Set<string>();
  classesState
    .filter((c) => myClassIds.includes(c.id))
    .forEach((c) => c.assignedDecks.forEach((id) => deckIds.add(id)));
  return decks.filter((d) => deckIds.has(d.id));
}

export function getDeckById(deckId: string): Deck | undefined {
  return decks.find((d) => d.id === deckId);
}

export function createDeck(input: { title: string; description: string; tags: string[] }, teacherId: string): Deck {
  const newDeck: Deck = {
    id: genId('deck'),
    title: input.title,
    description: input.description,
    tags: input.tags,
    teacherId,
    createdAt: new Date(),
    cards: [],
  };
  decks = [newDeck, ...decks];
  return newDeck;
}

export function addCardToDeck(deckId: string, card: { front: string; back: string }): Flashcard | undefined {
  const deck = decks.find((d) => d.id === deckId);
  if (!deck) return undefined;
  const newCard: Flashcard = {
    id: genId(`${deckId}-card`),
    deckId,
    front: card.front,
    back: card.back,
    nextReview: new Date(),
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
  };
  deck.cards = [newCard, ...deck.cards];
  return newCard;
}

// Classes
export function listClassesByUser(userId: string, role: 'teacher' | 'student'): Class[] {
  if (role === 'teacher') return classesState.filter((c) => c.teacherId === userId);
  return classesState.filter((c) => c.studentIds.includes(userId));
}

export function getClassById(classId: string): Class | undefined {
  return classesState.find((c) => c.id === classId);
}

export function createClass(input: { name: string; description: string }, teacherId: string): Class {
  const newClass: Class = {
    id: genId('class'),
    name: input.name,
    description: input.description,
    teacherId,
    studentIds: [],
    assignedDecks: [],
    createdAt: new Date(),
  };
  classesState = [newClass, ...classesState];
  return newClass;
}

export function addStudentsToClass(classId: string, studentIds: string[]): void {
  const klass = classesState.find((c) => c.id === classId);
  if (!klass) return;
  const set = new Set(klass.studentIds);
  studentIds.forEach((id) => set.add(id));
  klass.studentIds = Array.from(set);
}

export function assignDeckToClass(classId: string, deckId: string): void {
  const klass = classesState.find((c) => c.id === classId);
  if (!klass) return;
  if (!klass.assignedDecks.includes(deckId)) klass.assignedDecks.push(deckId);
}

export function listStudents(): Student[] {
  return students;
}

export function listAllDecks(): Deck[] {
  return decks;
}

// Study (simplificado)
export function getStudyQueue(deckId: string, _studentId: string): Flashcard[] {
  const deck = getDeckById(deckId);
  if (!deck) return [];
  // Fila: todos os cards, due primeiro
  const now = new Date();
  return [...deck.cards].sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime()).filter((c) => c.nextReview <= now || true);
}

export function submitReview(card: Flashcard, rating: 0 | 1 | 2 | 3): Flashcard {
  // Atualiza um modelo SRS simplificado
  const factorDelta = [ -0.3, -0.15, 0.0, 0.15 ][rating];
  const ef = Math.max(1.3, card.easeFactor + factorDelta);
  const reps = rating < 2 ? 0 : card.repetitions + 1;
  let interval = 1;
  if (reps === 0) interval = 1;
  else if (reps === 1) interval = 1;
  else if (reps === 2) interval = 3;
  else interval = Math.round(card.interval * ef);
  const next = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
  card.easeFactor = ef;
  card.repetitions = reps;
  card.interval = interval;
  card.nextReview = next;
  return card;
}

