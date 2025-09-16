# 🧭 Synapse — Roadmap por Feature (Guia de Execução)

> Use este documento como **fonte única** para transformar em *Planos → Tarefas → Implementação com Codex*.

## Índice
- [0) Fundações](#0-fundações-baseline-do-projeto)
- [1) Autenticação & Sessão](#1-autenticação--sessão-auth)
- [2) Usuários & RBAC](#2-usuários--rbac)
- [3) Decks (CRUD)](#3-decks-crud)
- [4) Cards (CRUD)](#4-cards-crud)
- [5) Turmas & Matrículas](#5-turmas-classes--matrículas)
- [6) Atribuições (Assignments)](#6-atribuições-assignments)
- [7) Estudo (SRS) — Fila & Reviews](#7-estudo-srs--fila--reviews)
- [8) Relatórios](#8-relatórios-professoraluno)
- [9) UI/UX & Design System](#9-uiux--design-system-shadcn)
- [10) Capacitor Prep](#10-capacitor-preparo-para-app)
- [11) Segurança & Observabilidade](#11-segurança--observabilidade)
- [12) Polish & Qualidade](#12-polish--qualidade)
- [Milestones sugeridos](#milestones-sugeridos)
- [Definição de Pronto (DoR/DoD)](#definição-de-pronto-dordod)

---

## 0) Fundações (baseline do projeto)
**Objetivo:** preparar monorepo, padrões, CI/CD, deploy e DX.

**Backend**
- [ ] NestJS app base + `ConfigModule` (schema env) + Logger + Helmet + CORS.
- [ ] Conexão MongoDB Atlas (Mongoose) + índices básicos.
- [ ] Swagger `/docs` (com auth simples).
- [ ] Módulos vazios: `auth, users, decks, cards, classes, assignments, study, reports`.

**Frontend**
- [ ] Vite + React + TS + Tailwind + shadcn/ui + React Router + React Query.
- [ ] Axios base + interceptor (Bearer/refresh) + providers (QueryClient).
- [ ] Layout base (Navbar, Sidebar, Toaster, ErrorBoundary).

**DevOps**
- [ ] Cloudflare Pages (build `npm run build`, output `dist`).
- [ ] Pipeline CI (lint/test/build) + deploy web em `main`.
- [ ] Deploy API (Railway/Render/Cloud Run) com secrets.

**Critérios de Aceite**
- [ ] `GET /health` responde 200.
- [ ] Web abre com “Hello” e consome um endpoint público.
- [ ] Lint/Tests rodando no CI.

---

## 1) Autenticação & Sessão (Auth)
**Objetivo:** login/logout, sessão segura, guards, perfil atual.

**Histórias**
- Como usuário, faço **login** e recebo sessão (Web: cookie httpOnly; App: Bearer).
- Como usuário, vejo **meu perfil** (nome, email, role).
- Como usuário, faço **logout**.

**Backend**
- [ ] `POST /auth/login {email, password}` → `{accessToken[, refreshToken]}`.
- [ ] `GET /users/me` (JWT guard).
- [ ] `POST /auth/logout` (invalidar refresh opcional).
- [ ] Hash de senha (argon2), rate limit no login, brute-force mitigation.
- [ ] DTOs + ValidationPipe (whitelist).

**Frontend**
- [ ] Páginas: Login (Registro opcional).
- [ ] Store sessão (Zustand) + hooks `useAuth`.
- [ ] Interceptor Axios (refresh token quando 401).
- [ ] Proteção de rotas (public/protected) + redirects.

**Dados**
- `users`: `_id, email (unique), password_hash, role (ADMIN|TEACHER|STUDENT), name, created_at`.

**Aceite**
- [ ] Rotas protegidas bloqueadas sem JWT.
- [ ] Erros de login claros, sem revelar existência do e-mail.

**Deps:** Fundações.

---

## 2) Usuários & RBAC
**Objetivo:** gestão de usuários e papéis; permissões de acesso.

**Histórias**
- Admin cria professor/aluno.
- Professor/Aluno edita o próprio perfil.

**Backend**
- [ ] `POST /users` (ADMIN).
- [ ] `PATCH /users/:id` (self ou ADMIN).
- [ ] `@Roles()` + `RolesGuard`.

**Frontend**
- [ ] **Perfil** (self).
- [ ] **Admin → Usuários** (lista, criar, editar, filtro por role).

**Aceite**
- [ ] Aluno não acessa admin endpoints.
- [ ] Log/auditoria de criação/edição.

**Deps:** Auth.

---

## 3) Decks (CRUD)
**Objetivo:** criação/edição de decks por professores; listagem/filtragem.

**Histórias**
- Professor cria/edita/deleta **deck** (título, descrição, tags, público/privado).
- Aluno vê **decks atribuídos**.

**Backend**
- [ ] `GET /decks?mine&query&tags`.
- [ ] `POST /decks` (TEACHER), `PATCH /decks/:id`, `DELETE /decks/:id`.
- [ ] Índices: `owner_id`, `tags`, `title`.

**Frontend**
- [ ] **Meus Decks (Professor)** — grid/tabela com busca/tags; modal de novo deck.
- [ ] **Meus Decks (Aluno)** — somente atribuídos.

**Dados**
- `decks`: `_id, owner_id, title, description, tags[], is_public, cards_count, created_at, updated_at`.

**Aceite**
- [ ] Apenas owner/ADMIN edita/deleta.
- [ ] Lista paginada, busca por `title`, filtro por `tags`.

**Deps:** Auth, RBAC.

---

## 4) Cards (CRUD)
**Objetivo:** gerenciar cards de um deck.

**Histórias**
- Professor adiciona/edita **cards** (front/back, dica, mídia).

**Backend**
- [ ] `GET /decks/:id/cards` (owner/admin; aluno se atribuído).
- [ ] `POST /decks/:id/cards`, `PATCH /cards/:id`, `DELETE /cards/:id`.

**Frontend**
- [ ] Editor de cards (atalhos, “Add multiple” a partir de colar linhas).
- [ ] Tabela grid com preview.

**Dados**
- `cards`: `_id, deck_id, front, back, hints[], media[], created_at, updated_at`.

**Aceite**
- [ ] `cards_count` no deck atualiza corretamente.
- [ ] Validação de campos + render seguro (XSS).

**Deps:** Decks.

---

## 5) Turmas (Classes) & Matrículas
**Objetivo:** organizar alunos em turmas geridas por professor.

**Histórias**
- Professor cria **turma** e matricula alunos.

**Backend**
- [ ] `GET /classes` (por `teacher_id`).
- [ ] `POST /classes {name, studentIds[]}`; `PATCH /classes/:id`.
- [ ] `POST /classes/:id/students` (add/remove em lote).

**Frontend**
- [ ] **Turmas** — lista, criar, gerenciar alunos (select com busca).

**Dados**
- `classes`: `_id, teacher_id, name, student_ids[], created_at`.

**Aceite**
- [ ] Professor só gerencia suas turmas.
- [ ] Matrículas refletem em atribuições/relatórios.

**Deps:** Users, RBAC.

---

## 6) Atribuições (Assignments)
**Objetivo:** vincular **decks → turmas/alunos** com `due_date` opcional.

**Histórias**
- Professor atribui deck a turma; alunos passam a ver no “Meus Decks”.

**Backend**
- [ ] `POST /assignments {deckId, classId|studentId, dueDate?}`.
- [ ] `GET /assignments?classId=&studentId=`.

**Frontend**
- [ ] Ação **Atribuir** em Turmas/Decks (modal) + feedback.
- [ ] Listagem do aluno: “Atribuídos a mim”.

**Dados**
- `assignments`: `_id, deck_id, class_id|null, student_id|null, due_date|null, created_at`.

**Aceite**
- [ ] Atribuição aparece em **Meus Decks (Aluno)** rapidamente.
- [ ] Evitar duplicatas por deck/turma.

**Deps:** Decks, Classes.

---

## 7) Estudo (SRS) — Fila & Reviews
**Objetivo:** revisão com algoritmo de **repetição espaçada** (SM‑2/FSRS simplificado).

**Histórias**
- Aluno inicia sessão de estudo de um deck → recebe **fila**.
- Para cada card, responde **Again/Hard/Good/Easy**; sistema agenda **próxima revisão**.

**Backend**
- [ ] `GET /study/queue?deckId=...` (batch de cards “due”).
- [ ] `POST /study/review { cardId, deckId, rating, elapsedMs }` → `next_due_at`.
- [ ] `GET /study/progress?deckId=...` (resumo do aluno).
- [ ] Service SRS `scheduleNext(review)`; índices `(student_id, card_id)`, `next_due_at`.

**Frontend**
- [ ] Página **Estudo** (atalhos/gestos, timer, barra de progresso, resumo final).

**Dados**
- `reviews`: `_id, student_id, card_id, deck_id, rating(0-3), elapsed_ms, scheduled_at, reviewed_at, next_due_at, stability, difficulty`.
- `progress` (view/materializado futuro): `total_cards, learned, due_today, last_activity_at`.

**Aceite**
- [ ] Fila respeita `next_due_at` e batch size diários.
- [ ] Persistência correta dos reviews e cálculo do próximo agendamento.

**Deps:** Cards, Assignments, Auth.

---

## 8) Relatórios (Professor/Aluno)
**Objetivo:** visões de andamento por turma/deck/aluno.

**Histórias**
- Professor vê **overview**: % concluído, due, acertos.
- Aluno vê **meu progresso** por deck.

**Backend**
- [ ] `GET /reports/teacher/overview?classId=...`.
- [ ] `GET /reports/student/overview?deckId=...`.

**Frontend**
- [ ] **Relatórios (Professor)**; **Progresso (Aluno)** (cards KPI + charts simples).

**Aceite**
- [ ] Agregações rápidas com índices e/ou cache simples.

**Deps:** Reviews, Assignments.

---

## 9) UI/UX & Design System (shadcn)
**Objetivo:** padronizar componentes, temas, feedback e acessibilidade.

**Tarefas**
- [ ] shadcn/ui (buttons, inputs, dialog, table, tabs, dropdown).
- [ ] Estados: **empty**, **loading**, **error**.
- [ ] Tema claro/escuro (opcional).
- [ ] Acessibilidade AA: foco, aria, teclado.

**Aceite**
- [ ] Páginas MVP usam componentes padrão.
- [ ] Responsivo mobile-first.

**Deps:** Frontend baseline.

---

## 10) Capacitor (preparo para App)
**Objetivo:** base web compatível com app nativo futuramente.

**Tarefas**
- [ ] `npx cap init` e `cap sync` (iOS/Android futuro).
- [ ] Abstração de storage: web (cookie httpOnly) vs app (Secure Storage + header).
- [ ] Deep links básicos (futuro).
- [ ] Plugins alvo: Local Notifications (futuro).

**Aceite**
- [ ] Web intacta; projeto compila com Capacitor.

**Deps:** Frontend baseline, Auth.

---

## 11) Segurança & Observabilidade
**Objetivo:** hardening, logs e métricas.

**Tarefas**
- [ ] Helmet + rate limit + CORS restrito.
- [ ] Sanitização de entrada, escape seguro de HTML/Markdown.
- [ ] Logs estruturados (request-id); filtros globais de erro.
- [ ] Métricas básicas (latência p95, req/min); Sentry opcional.

**Aceite**
- [ ] Sem dados sensíveis em logs.
- [ ] Alertas básicos configurados.

**Deps:** API baseline.

---

## 12) Polish & Qualidade
**Objetivo:** performance, DX, documentação.

**Tarefas**
- [ ] E2E básicos (Playwright/Cypress) para fluxos críticos.
- [ ] Docs de setup local + `.env`.
- [ ] Perf check (Lighthouse) + lazy onde couber.

**Aceite**
- [ ] Fluxos críticos cobertos (login, estudo, atribuição).
- [ ] README atualizado + Swagger em produção.

---

## Milestones sugeridos
1. **Fundação** → **Auth** → **RBAC/Users**
2. **Decks** → **Cards**
3. **Classes** → **Assignments**
4. **Study (SRS)**
5. **Relatórios**
6. **UI/UX (shadcn)**
7. **Capacitor prep**
8. **Segurança/Observabilidade**
9. **Polish & Qualidade**

---

## Definição de Pronto (DoR/DoD)

**DoR (Definition of Ready)**  
- [ ] Histórias claras + escopo/fora do escopo.  
- [ ] Contratos de API definidos (DTOs, exemplos).  
- [ ] Modelo de dados e índices.  
- [ ] Critérios de aceite mensuráveis.  
- [ ] Riscos/dependências mapeados.  

**DoD (Definition of Done)**  
- [ ] Cobertura básica de testes (unit/e2e do fluxo).  
- [ ] Lint/CI passando; sem TODOs críticos.  
- [ ] Logs/erros padronizados; sem secrets no repo.  
- [ ] Documentação atualizada (README seção + Swagger).  
