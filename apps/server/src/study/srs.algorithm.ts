/**
 * Algoritmo de Repetição Espaçada (SRS) - MVP
 * Baseado em FSRS simplificado
 */

export type Rating = 0 | 1 | 2 | 3; // Again | Hard | Good | Easy

export interface SRSState {
  stability: number;
  difficulty: number;
  intervalDays: number;
}

export interface ScheduleResult {
  stability: number;
  difficulty: number;
  next_due_at: Date;
  intervalDays: number;
}

// Parâmetros do algoritmo
const DIFF_DELTA: Record<Rating, number> = {
  0: +0.05, // Again
  1: +0.02, // Hard
  2: -0.01, // Good
  3: -0.03, // Easy
};

const STAB_DELTA: Record<Rating, number> = {
  0: -0.10, // Again
  1: -0.05, // Hard
  2: +0.02, // Good
  3: +0.05, // Easy
};

const RATING_MULTIPLIER: Record<Rating, number> = {
  0: 0.50, // Again
  1: 0.80, // Hard
  2: 1.00, // Good
  3: 1.30, // Easy
};

// Valores iniciais para novos cards
const INITIAL_STABILITY = 0.30;
const INITIAL_DIFFICULTY = 0.30;

// Limites (clamps)
const MIN_DIFFICULTY = 0.05;
const MAX_DIFFICULTY = 0.95;
const MIN_STABILITY = 0.05;
const MAX_STABILITY = 1.00;
const MIN_INTERVAL_MINUTES = 1;
const MAX_INTERVAL_MINUTES = 525600; // ~1 ano em minutos

// Intervalos iniciais em MINUTOS para cada rating
const INITIAL_INTERVALS: Record<Rating, number> = {
  0: 1,      // Again: 1 minuto
  1: 10,     // Hard: 10 minutos
  2: 60,     // Good: 1 hora
  3: 240,    // Easy: 4 horas
};

/**
 * Função auxiliar para clampar valores
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calcula o próximo agendamento baseado no rating do aluno
 *
 * @param prevState - Estado anterior do card (null se novo)
 * @param rating - Avaliação do aluno (0=Again, 1=Hard, 2=Good, 3=Easy)
 * @param elapsedMs - Tempo de resposta em ms (reservado para futuro)
 * @param now - Data/hora atual
 * @returns Novo estado e próxima data de revisão
 */
export function scheduleNext(
  prevState: SRSState | null,
  rating: Rating,
  elapsedMs: number,
  now: Date = new Date(),
): ScheduleResult {
  // Inicializar valores (novo card ou usar estado anterior)
  let stability = prevState?.stability ?? INITIAL_STABILITY;
  let difficulty = prevState?.difficulty ?? INITIAL_DIFFICULTY;
  let interval = prevState?.intervalDays ?? 0; // 0 = novo/nunca visto

  // Atualizar parâmetros baseado no rating
  difficulty = clamp(difficulty + DIFF_DELTA[rating], MIN_DIFFICULTY, MAX_DIFFICULTY);
  stability = clamp(stability + STAB_DELTA[rating], MIN_STABILITY, MAX_STABILITY);

  // Calcular próximo intervalo em MINUTOS
  let nextIntervalMinutes: number;

  if (interval <= 0 || rating === 0) {
    // Card novo OU "Again" - usar intervalos iniciais baseados no rating
    // "Again" sempre reseta para o intervalo mínimo
    nextIntervalMinutes = INITIAL_INTERVALS[rating];
  } else {
    // Respostas subsequentes (Hard, Good, Easy) - multiplicar intervalo anterior
    const growth = 1 + 1.5 * stability;
    const prevIntervalMinutes = interval * 24 * 60; // Converter dias para minutos
    nextIntervalMinutes = Math.round(prevIntervalMinutes * growth * RATING_MULTIPLIER[rating]);
  }

  // Aplicar limites
  nextIntervalMinutes = clamp(nextIntervalMinutes, MIN_INTERVAL_MINUTES, MAX_INTERVAL_MINUTES);

  // Calcular próxima data (em MINUTOS, não dias)
  const nextDue = new Date(now.getTime() + nextIntervalMinutes * 60 * 1000);

  // Converter minutos de volta para dias para armazenar
  const intervalDays = nextIntervalMinutes / (24 * 60);

  return {
    stability,
    difficulty,
    next_due_at: nextDue,
    intervalDays,
  };
}

/**
 * Calcula o intervalo em dias entre duas datas
 */
export function calculateIntervalDays(from: Date, to: Date): number {
  const diffMs = to.getTime() - from.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(1, diffDays);
}

/**
 * Verifica se um card está "due" (pronto para revisar)
 */
export function isDue(nextDueAt: Date, now: Date = new Date()): boolean {
  return nextDueAt <= now;
}

/**
 * Converte rating string para número
 */
export function parseRating(rating: string | number): Rating {
  const parsed = typeof rating === 'string' ? parseInt(rating, 10) : rating;

  if (![0, 1, 2, 3].includes(parsed)) {
    throw new Error(`Invalid rating: ${rating}. Must be 0 (Again), 1 (Hard), 2 (Good), or 3 (Easy)`);
  }

  return parsed as Rating;
}

/**
 * Retorna o nome do rating
 */
export function getRatingName(rating: Rating): string {
  const names: Record<Rating, string> = {
    0: 'Again',
    1: 'Hard',
    2: 'Good',
    3: 'Easy',
  };
  return names[rating];
}
