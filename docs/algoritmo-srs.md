# Algoritmo de Repetição Espaçada (SRS) — Especificação (MVP)

Este documento descreve o algoritmo SRS a ser implementado no backend (NestJS) para o Synapse. Objetivo: simplicidade, previsibilidade e base sólida para evoluções futuras (FSRS completo).

## Objetivos
- Agendar próximas revisões (`next_due_at`) a partir de respostas do usuário.
- Manter estado por `student_id + card_id` (coleção `reviews`).
- Suportar 4 ratings: `0=Again`, `1=Hard`, `2=Good`, `3=Easy`.
- Fornecer uma fila diária previsível (limite de novos e mistura novos/revisões).

## Estado por Card/Aluno
- `stability: number` (0..1) — quão “estável” está a memória do card.
- `difficulty: number` (0..1) — quão difícil o card é para o aluno.
- `next_due_at: Date` — próxima data agendada.
- Derivado (no serviço): `intervalDays = max(1, floor((next_due_at - now)/1d))`.

Inicialização (novo card)
- `stability = 0.30`
- `difficulty = 0.30`
- Primeiro intervalos: `I1 = 1 dia`, `I2 = 3 dias` (após primeira resposta positiva).

## Atualização por Rating
Usaremos um modelo simplificado (inspirado em FSRS) com ajustes aditivos de S/D e multiplicadores de intervalo por rating. Clamps garantem limites mínimos e máximos.

Parâmetros (MVP)
- Ajustes de `difficulty` por rating: `[+0.05, +0.02, -0.01, -0.03]` (Again→Easy).
- Ajustes de `stability` por rating: `[-0.10, -0.05, +0.02, +0.05]`.
- Multiplicadores de intervalo por rating: `[0.50, 0.80, 1.00, 1.30]`.
- Crescimento base por estabilidade: `growth = 1 + (1.5 * stability)`.
- Clamps: `difficulty ∈ [0.05, 0.95]`, `stability ∈ [0.05, 1.00]`, `intervalDays ∈ [1, 3650]`.

Regras de intervalo
- Novos (repetitions < 2): `I1 = 1`, `I2 = 3` para respostas `Good|Easy`; `Again/Hard` mantêm `I = 1`.
- Revistos (repetitions ≥ 2): `I' = round(I * growth * ratingMultiplier)`.

## Função scheduleNext
Entradas
- `prev`: `{ stability, difficulty, scheduled_at, reviewed_at?, next_due_at?, intervalDays? }`
- `rating`: `0|1|2|3`
- `elapsedMs`: número (tempo de resposta em ms)
- `now`: `Date`

Saída
- `{ stability, difficulty, next_due_at }`

Pseudocódigo (TS)
```ts
type Rating = 0 | 1 | 2 | 3;
interface State { stability: number; difficulty: number; intervalDays: number; }

const DIFF_DELTA: Record<Rating, number> = { 0: +0.05, 1: +0.02, 2: -0.01, 3: -0.03 };
const STAB_DELTA: Record<Rating, number> = { 0: -0.10, 1: -0.05, 2: +0.02, 3: +0.05 };
const MULT: Record<Rating, number> = { 0: 0.50, 1: 0.80, 2: 1.00, 3: 1.30 };

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

export function scheduleNext(prev: State | null, rating: Rating, elapsedMs: number, now: Date) {
  // init for new
  let stability = prev?.stability ?? 0.30;
  let difficulty = prev?.difficulty ?? 0.30;
  let interval = prev?.intervalDays ?? 0; // 0 = unseen/new

  // update params
  difficulty = clamp(difficulty + DIFF_DELTA[rating], 0.05, 0.95);
  stability = clamp(stability + STAB_DELTA[rating], 0.05, 1.00);

  // interval progression
  let nextInterval: number;
  if (interval <= 0) {
    // first answer
    nextInterval = rating >= 2 ? 1 : 1;
  } else if (interval === 1) {
    nextInterval = rating >= 2 ? 3 : 1;
  } else {
    const growth = 1 + 1.5 * stability;
    nextInterval = Math.round(interval * growth * MULT[rating]);
  }

  nextInterval = clamp(nextInterval, 1, 3650);
  const nextDue = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);

  return { stability, difficulty, next_due_at: nextDue };
}
```

Notas
- O `elapsedMs` está reservado (futuro: adaptar penalidades/bonificações por tempo de resposta).
- Timezone: API sempre em UTC. O frontend pode mostrar local.
- Diferente do SM-2 clássico (que usa `EF`), aqui usamos S/D explícitos e um multiplicador de crescimento por estabilidade.

## Fila de Estudo (queue)
- `GET /study/queue` deve retornar um lote de cards em ordem de `next_due_at`, misturando revisões e novos.
- Parâmetros recomendados (configuráveis por env):
  - `BATCH_SIZE_DEFAULT = 20`
  - `NEW_PER_DAY = 10` (máximo de novos por dia)
  - Proporção inicial: 70% revisões / 30% novos (quando existirem)
- Novos cards: `next_due_at = now` e sem estado anterior; após primeira resposta, passam a ter estado.

## Critérios de Aceite
- Para uma sequência de 5 respostas “Good” em um card, o intervalo deve crescer monotonicamente e passar de 1 → 3 → ~>=4 dias.
- Para respostas “Again” repetidas, o intervalo não deve crescer e deve manter-se em 1 com estabilidade/dificuldade ajustadas (aumentando dificuldade, reduzindo estabilidade).
- O serviço deve preservar índices e unicidade por (`student_id`,`card_id`) na coleção `reviews`.
- Testes de unidade cobrindo: novo card, transição I1→I2, clamps, ratings extremos, lote de queue.

## Observabilidade
- Métricas por rota: latência e taxa de erro.
- Métricas SRS: distribuição de ratings, variação média de intervalo, quantidade due por dia.

## Evoluções Futuras
- Ajuste adaptativo dos deltas por card/deck/perfil (personalização).
- Integração com FSRS completo e/ou SM-2 como opção.
- Leech handling (suspender ou reforçar cards com muitos Again).
- Ajustes por `elapsedMs` (tempo de resposta) e sessões cronometradas.

