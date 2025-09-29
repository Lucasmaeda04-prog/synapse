# Synapse — Modelo de Dados (MongoDB)

> Fonte: alinhado com `docs/guidelines/synapse-specs.md` e roadmap de features. Banco alvo: MongoDB Atlas com Mongoose no backend NestJS.

## Visão Geral
- Abordagem: coleções normalizadas com referências (`ObjectId`) e índices focados em leitura/consulta.
- Escopo multi-tenant simples (opcional): `org_id` e/ou `school_id` onde aplicável.
- Papéis: `ADMIN`, `TEACHER`, `STUDENT`.
- Padrões: timestamps `created_at`, `updated_at` (UTC ISO) e soft-constraints por aplicação (RBAC/guards).

## Relacionamentos (ER textual)
- `users (1) ──< (n) decks` via `decks.owner_id`
- `decks (1) ──< (n) cards` via `cards.deck_id`
- `users(teacher) (1) ──< (n) classes` via `classes.teacher_id`
- `classes (1) ──< (n) users(student)` via `classes.student_ids[]`
- `decks (1) ──< (n) assignments` (turma ou aluno) via `assignments.deck_id`
- `assignments (turma)` implica disponibilização a todos os `classes.student_ids`
- `users(student) (1) ──< (n) reviews` e `decks/cards (1) ──< (n) reviews`
- `progress` agrega por `student_id + deck_id` (materializado / consulta agregada)

## Coleções e Campos

### users
- `_id: ObjectId`
- `role: 'ADMIN'|'TEACHER'|'STUDENT'` (required)
- `email: string` (required, unique, lowercase)
- `password_hash: string` (required)
- `name: string` (required)
- `org_id?: ObjectId` (opcional)
- `school_id?: ObjectId` (opcional)
- `created_at: Date`, `updated_at: Date`

Índices:
- `unique(email)`
- Opcional: composto por multi-tenant, ex.: `{ org_id: 1, email: 1 }` unique

---

### decks
- `_id: ObjectId`
- `owner_id: ObjectId` → `users._id` (required, TEACHER)
- `title: string` (required)
- `description: string` (optional)
- `tags: string[]` (default: [])
- `is_public: boolean` (default: false)
- `cards_count: number` (default: 0, atualizado por triggers na app)
- `org_id?: ObjectId`, `school_id?: ObjectId`
- `created_at: Date`, `updated_at: Date`

Índices:
- `{ owner_id: 1, created_at: -1 }`
- `{ title: 'text', tags: 1 }` (busca)
- Opcional multi-tenant: `{ org_id: 1, owner_id: 1, created_at: -1 }`

---

### cards
- `_id: ObjectId`
- `deck_id: ObjectId` → `decks._id` (required)
- `front: string` (required)
- `back: string` (required)
- `hints: string[]` (default: [])
- `media: { type: 'image'|'audio'|'video', url: string }[]` (default: [])
- `created_at: Date`, `updated_at: Date`

Índices:
- `{ deck_id: 1 }`

---

### classes
- `_id: ObjectId`
- `teacher_id: ObjectId` → `users._id` (TEACHER, required)
- `name: string` (required)
- `student_ids: ObjectId[]` → `users._id` (STUDENT, default: [])
- `org_id?: ObjectId`, `school_id?: ObjectId`
- `created_at: Date`

Índices:
- `{ teacher_id: 1, created_at: -1 }`
- Opcional: `{ org_id: 1, teacher_id: 1 }`

---

### assignments
- `_id: ObjectId`
- `deck_id: ObjectId` → `decks._id` (required)
- `class_id?: ObjectId` → `classes._id` (exclusivo com student)
- `student_id?: ObjectId` → `users._id` (STUDENT, exclusivo com class)
- `due_date?: Date`
- `created_at: Date`

Regras:
- Exigir pelo menos um de `class_id` ou `student_id` (validação por aplicação/esquema)
- Evitar duplicatas por `(deck_id, class_id)` e `(deck_id, student_id)`

Índices:
- `{ deck_id: 1, class_id: 1 }`, unique parcial onde `class_id` existe
- `{ deck_id: 1, student_id: 1 }`, unique parcial onde `student_id` existe

---

### reviews
- `_id: ObjectId`
- `student_id: ObjectId` → `users._id` (required)
- `card_id: ObjectId` → `cards._id` (required)
- `deck_id: ObjectId` → `decks._id` (required, denormalizado para consultas)
- `rating: 0|1|2|3` (Again/Hard/Good/Easy)
- `elapsed_ms: number` (tempo de resposta)
- `scheduled_at: Date` (quando foi agendado)
- `reviewed_at: Date` (quando respondeu)
- `next_due_at: Date` (próxima revisão)
- `stability: number`, `difficulty: number` (parâmetros SRS)

Índices:
- `unique({ student_id: 1, card_id: 1 })` (estado atual por card/aluno)
- `{ student_id: 1, next_due_at: 1 }` (fila “due”)
- `{ deck_id: 1, student_id: 1 }` (relatórios)

Observação:
- Para histórico de múltiplas revisões, use coleção adicional `review_logs` (futuro) ou mantenha campo `history[]` com snapshots — fora do MVP.

---

### progress (view/materializado)
- `_id: ObjectId`
- `student_id: ObjectId` → `users._id`
- `deck_id: ObjectId` → `decks._id`
- `total_cards: number`
- `learned: number`
- `due_today: number`
- `last_activity_at: Date`

Índices:
- `unique({ student_id: 1, deck_id: 1 })`

Observação:
- Pode ser materializado periodicamente ou calculado on‑the‑fly via agregações.

---

## Índices (Mongo Shell exemplos)
```js
// users
db.users.createIndex({ email: 1 }, { unique: true });

// decks
db.decks.createIndex({ owner_id: 1, created_at: -1 });
db.decks.createIndex({ title: "text", tags: 1 });

// cards
db.cards.createIndex({ deck_id: 1 });

// classes
db.classes.createIndex({ teacher_id: 1, created_at: -1 });

// assignments (evitar duplicatas)
db.assignments.createIndex(
  { deck_id: 1, class_id: 1 },
  { unique: true, partialFilterExpression: { class_id: { $exists: true } } }
);
db.assignments.createIndex(
  { deck_id: 1, student_id: 1 },
  { unique: true, partialFilterExpression: { student_id: { $exists: true } } }
);

// reviews
db.reviews.createIndex({ student_id: 1, card_id: 1 }, { unique: true });
db.reviews.createIndex({ student_id: 1, next_due_at: 1 });
db.reviews.createIndex({ deck_id: 1, student_id: 1 });

// progress
db.progress.createIndex({ student_id: 1, deck_id: 1 }, { unique: true });
```

## Validações (JSON Schema — exemplo de users)
```js
// Exemplo de validação de esquema (opcional) para users
 db.runCommand({
   collMod: "users",
   validator: {
     $jsonSchema: {
       bsonType: "object",
       required: ["email", "password_hash", "role", "name"],
       properties: {
         email: { bsonType: "string", pattern: "^.+@.+\\..+$" },
         password_hash: { bsonType: "string" },
         role: { enum: ["ADMIN", "TEACHER", "STUDENT"] },
         name: { bsonType: "string", minLength: 1 },
         org_id: { bsonType: ["objectId", "null"] },
         school_id: { bsonType: ["objectId", "null"] },
         created_at: { bsonType: "date" },
         updated_at: { bsonType: "date" }
       }
     }
   },
   validationLevel: "moderate"
 });
```

## Notas de Implementação (NestJS + Mongoose)
- Usar `timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }`.
- Normalizar `email` em lowercase e indexar único.
- Regras de unicidade de `assignments` via índices parciais para turma vs aluno.
- Denormalizar `deck_id` em `reviews` para evitar join adicional nas consultas de fila e relatórios.
- Padrões de paginação: `page`, `limit` (20/100), `sort` com whitelists por coleção.
- Sanitização/escape de campos ricos (front/back de cards) no backend.

## Checklist de Aderência ao Roadmap/Specs
- Auth + Users/RBAC: `users` com `role` e index email (OK)
- Decks/Cards: relacionamentos e índices por owner/deck (OK)
- Classes/Assignments: vínculos turma/aluno e prevenção de duplicatas (OK)
- Study (SRS): `reviews` com `next_due_at`, `stability/difficulty` (OK)
- Relatórios: `progress` + índices de agregação (OK)

## Futuras Extensões (fora do MVP)
- `organizations`/`schools` coleções formais quando multi-tenant for exigido.
- `review_logs` para histórico completo de revisões.
- `imports/exports` de decks, `media_assets` dedicada com metadados.
- `gamification` (badges, points) com coleções e agregações específicas.

