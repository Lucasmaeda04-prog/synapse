# 📐 Synapse – Guia de Especificações do Projeto

> Este guia define **arquitetura**, **padrões**, **modelos de dados**, **contratos de API**, **estrutura de pastas** e **roteiro de implementação** para acelerar o desenvolvimento com *planos → tarefas → Codex*.

---

## 1) Visão & Escopo Técnico

- **Frontend (Web/App):** React + Vite + Capacitor, UI com **shadcn/ui**, build **estático**. Deploy: **Cloudflare Pages**.  
- **Backend (API):** **NestJS** (REST), validação com `class-validator`, autenticação JWT.  
- **Banco:** **MongoDB Atlas** (multi-tenant simples por `orgId`/`schoolId` quando aplicável).  
- **Objetivo do produto:** plataforma de **repetição espaçada** com criação de decks por professores, distribuição para turmas e acompanhamento de progresso.

---

## 2) Arquitetura (alto nível)

```
┌──────────────┐   HTTPS   ┌───────────────────┐      ┌──────────────────┐
│  React/Vite  │──────────▶│   API NestJS      │─────▶│ MongoDB Atlas     │
│  (Cloudflare │◀──────────│ (JWT, RBAC, SRS)  │      │ (collections)     │
│   Pages)     │  JSON     └───────────────────┘      └──────────────────┘
│  + Capacitor │
└──────────────┘
         │ (Capacitor bridge: nativo iOS/Android futuramente)
         ▼
   App Store / Play Store (builds móveis)
```

- **Auth:** JWT (access + refresh opcionais). Cookies *httpOnly* para web, **Secure** e **SameSite=Lax**. Para app (Capacitor), `Authorization: Bearer` no header.
- **CORS:** liberar apenas domínios do Frontend/Pages.
- **RBAC mínimo:** `ADMIN`, `TEACHER`, `STUDENT`.

---

## 3) Estrutura de Repositórios

- **Monorepo recomendado** (pnpm workspaces ou npm workspaces):
```
synapse/
  apps/
    web/            # React + Vite + shadcn (Cloudflare Pages)
    server/         # NestJS API
  packages/
    ui/             # (opcional) componentes compartilhados
    tsconfig/       # (opcional) bases TS
  .github/workflows # CI/CD
  README.md
```
> Alternativa: *polyrepo* (dois repositórios separados).

---

## 4) Padrões de Código & Qualidade

- **Linguagem:** TypeScript (strict).  
- **Lint/Format:** ESLint + Prettier (configs unificadas).  
- **Commits:** Conventional Commits (`feat:`, `fix:`, etc.).  
- **Branches:** `main` (produção), `develop` (integração), `feat/*`, `fix/*`.  
- **Tests:** Vitest/RTL (frontend), Jest (backend).  
- **CI:** build + lint + tests a cada PR; deploy automático em `main`.

---

## 5) Frontend – Especificações

### 5.1 Stack
- **React 18 + Vite**
- **shadcn/ui** (Radix + Tailwind) – design system leve.
- **State:** Zustand (leve) + React Query (server-state).
- **Roteamento:** React Router.
- **Env vars Vite:** prefixo `VITE_` (ex.: `VITE_API_URL`).

### 5.2 Estrutura de pastas
```
apps/web/
  src/
    app/
      (public)/
      (protected)/
    components/
    features/
      auth/
      decks/
      study/
      classes/
      reports/
    lib/
    store/
    styles/
    assets/
  index.html
  vite.config.ts
  capacitor.config.ts
  tailwind.config.ts
```

### 5.3 Telas (MVP)
- **Auth:** Login / Registro / Esqueci senha (futuro).
- **Professor:** Dashboard, Decks (CRUD), Turmas (CRUD), Relatórios básicos.
- **Aluno:** Meus Decks, Estudo (SRS), Progresso.

### 5.4 Capacitor – Notas
- Rota base e assets compatíveis Web/App.
- Plugins futuros: Local Notifications, Secure Storage, App Version.

### 5.5 Cloudflare Pages
- Build: `npm run build` (Vite). Output: `dist/`.
- Vars: `VITE_API_URL`, `VITE_APP_VERSION`.
- Regras de segurança/cache estático.

---

## 6) Backend – Especificações (NestJS)

### 6.1 Módulos (MVP)
- `AuthModule`, `UsersModule`, `DecksModule`, `CardsModule`, `ClassesModule`, `AssignmentsModule`, `StudyModule`, `ReportsModule`.

### 6.2 Estrutura
```
apps/server/
  src/
    common/
    config/
    auth/
    users/
    decks/
    classes/
    study/
    reports/
    main.ts
```

### 6.3 Segurança
- `ValidationPipe` global, Helmet, Rate limit, CORS restrito.
- JWT: access (15m) + refresh (7d, opcional). Revogação por `token_version`.
- Logs (Pino/Winston) + request-id. Swagger em `/docs` com auth.

### 6.4 .env (exemplo)
```
PORT=3000
NODE_ENV=development
JWT_ACCESS_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES=7d
MONGODB_URI=mongodb+srv://.../synapse?retryWrites=true&w=majority
ALLOWED_ORIGINS=https://synapse.pages.dev,https://*.synapse.app
```

---

## 7) Modelos de Dados (MongoDB)

### users
{ "_id": "ObjectId", "role": "ADMIN|TEACHER|STUDENT", "email": "string", "password_hash": "string", "name": "string", "created_at": "Date", "updated_at": "Date" }

### decks
{ "_id": "ObjectId", "owner_id": "ObjectId", "title": "string", "description": "string", "tags": ["string"], "is_public": false, "cards_count": 0, "created_at": "Date", "updated_at": "Date" }

### cards
{ "_id": "ObjectId", "deck_id": "ObjectId", "front": "string", "back": "string", "hints": ["string"], "media": [{ "type": "image|audio|video", "url": "string" }], "created_at": "Date", "updated_at": "Date" }

### classes
{ "_id": "ObjectId", "teacher_id": "ObjectId", "name": "string", "student_ids": ["ObjectId"], "created_at": "Date" }

### assignments
{ "_id": "ObjectId", "deck_id": "ObjectId", "class_id": "ObjectId|null", "student_id": "ObjectId|null", "due_date": "Date|null", "created_at": "Date" }

### reviews
{ "_id": "ObjectId", "student_id": "ObjectId", "card_id": "ObjectId", "deck_id": "ObjectId", "rating": "0|1|2|3", "elapsed_ms": 12345, "scheduled_at": "Date", "reviewed_at": "Date", "next_due_at": "Date", "stability": 0.0, "difficulty": 0.0 }

### progress
{ "_id": "ObjectId", "student_id": "ObjectId", "deck_id": "ObjectId", "total_cards": 120, "learned": 48, "due_today": 30, "last_activity_at": "Date" }

---

## 8) Contratos de API (MVP)
- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /users/me`
- Users: `POST /users`, `PATCH /users/:id`
- Decks: `GET /decks`, `POST /decks`, `PATCH /decks/:id`, `DELETE /decks/:id`
- Cards: `GET /decks/:id/cards`, `POST /decks/:id/cards`, `PATCH /cards/:id`, `DELETE /cards/:id`
- Classes: `GET /classes`, `POST /classes`, `PATCH /classes/:id`
- Assignments: `POST /assignments`, `GET /assignments`
- Study: `GET /study/queue`, `POST /study/review`, `GET /study/progress`
- Reports: `GET /reports/teacher/overview`, `GET /reports/student/overview`

---

## 9) Roteiro (passo-a-passo)
- Monorepo → Backend base → Frontend base → Auth → Users/RBAC → Decks → Cards → Classes → Assignments → Study → Reports → UI/UX → Capacitor → Segurança/Observabilidade → Polish.

---

## 10) Convenções de UI/UX
- shadcn/ui, estados vazios/loading/erro padronizados, acessibilidade AA, mobile-first.

---

## 11) Observabilidade
- Logs estruturados, métricas básicas, auditoria (ações sensíveis).

---

## 12) Segurança & Privacidade
- argon2, JWT curto + refresh opcional, rate limit, sanitização, rotação de chaves.

---

### Checklist MVP
- Auth segura
- CRUDs (Decks/Cards/Classes/Assignments)
- Estudo SRS funcionando
- Relatórios básicos
- Deploy web (Pages) + API gerenciada
- Swagger + docs atualizadas
