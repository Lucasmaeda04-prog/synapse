# Frontend — Estado Atual vs Especificações (docs)

Este documento compara o que está implementado no frontend (mock via Lovable) com o que os documentos pedem para o MVP. Inclui próximos passos sugeridos, permitindo manter parte mockada enquanto conectamos gradualmente à API.

## Resumo
- Implementado (mock): layout base, rotas principais, UI com shadcn, páginas Login/Dashboard/Decks/Classes, provider React Query, toasts.
- Faltando: client HTTP (axios), env `VITE_API_URL`, guards/protected routes consistentes, fluxos reais de Auth, CRUDs reais (decks/cards/classes/assignments), telas de estudo (SRS), relatórios, integração com API Nest.

## Baseline & Stack
- Implementado
  - React + Vite + TS + Tailwind + shadcn: `apps/web/synapse-flash-study-main/`.
  - QueryClientProvider configurado: `apps/web/synapse-flash-study-main/src/App.tsx:1`.
  - Rotas base: `/login`, `/dashboard`, `/decks`, `/classes`: `apps/web/synapse-flash-study-main/src/App.tsx:6`.
  - Toasters e Tooltip provider: `apps/web/synapse-flash-study-main/src/App.tsx:1`.
- Faltando (docs/guidelines/synapse-specs.md)
  - Client HTTP (axios) com interceptors (Bearer/refresh).
  - Uso de env `VITE_API_URL` e leitura em um módulo `api`.
  - ErrorBoundary global; estados loading/error padronizados.

## Autenticação & Sessão
- Implementado (mock)
  - Contexto de Auth com usuários de teste: `apps/web/synapse-flash-study-main/src/contexts/AuthContext.tsx:1`.
  - Login usa mock via `useAuth().login` e redireciona: `apps/web/synapse-flash-study-main/src/pages/Login.tsx:1`.
  - Páginas protegidas fazem `Navigate` se não autenticado (por página): `Dashboard/Decks/Classes`.
- Divergências
  - Papéis em mock: `'teacher'|'student'` vs esperado: `TEACHER|STUDENT|ADMIN` (docs).
  - Sem integração com backend (`POST /auth/login`, `GET /users/me`, refresh/logout).
  - Falta storage seguro (cookie httpOnly para web) e interceptador de 401/refresh (quando implementado no backend).
- Próximos passos (pode ser mock agora)
  - Adicionar `ProtectedRoute` reutilizável e remover lógica repetida de `Navigate`.
  - Normalizar `role` em memória para `TEACHER/…` (mesmo que mock) para alinhar com RBAC no backend.
  - Criar `api/client.ts` (axios) com `baseURL` de `import.meta.env.VITE_API_URL` e interceptors stubados (simular token mock no header `Authorization`).

## Usuários & RBAC
- Implementado (parcial)
  - Exibição do usuário/role no Navbar: `apps/web/synapse-flash-study-main/src/components/DashboardLayout.tsx:1`.
- Faltando
  - Telas de administração de usuários (lista/criar/editar) previstas em docs.
  - Guards por papel (ex.: rotas somente para professor/admin).
  - Integração real com `GET/POST/PATCH /users`.
- Próximos passos (mock)
  - Guard simples `RequireRole(['TEACHER'])` para rotas como `/classes` e criação de decks.
  - Placeholders de tela de perfil próprio (edição mínima) com dados mock.

## Decks (CRUD)
- Implementado (mock)
  - Página “Meus Decks” com busca, tags, contagem de cards e ações: `apps/web/synapse-flash-study-main/src/pages/Decks.tsx:1`.
  - Layout/estilos prontos via shadcn.
- Faltando
  - Integração real com `GET /decks?mine&query&tags`, `POST /decks`, `PATCH /decks/:id`, `DELETE /decks/:id`.
  - Página de detalhe do deck e formulário de criação/edição.
  - Paginação e filtro por tags.
  - Para aluno: visão “atribuídos a mim”.
- Próximos passos (mock)
  - Criar rotas `/decks/new` e `/decks/:id` com formulários mock que usam React Query mutations apontando para um serviço mock (que persiste em memória local).
  - Trocar leitura direta de `mockDecks` por hooks `useQuery` chamando serviço mock para preparar a migração para API real.

## Cards (CRUD)
- Implementado
  - Somente exibição de contagem de cards nos decks (sem telas próprias).
- Faltando
  - Lista/edição de cards: `GET /decks/:id/cards`, `POST /decks/:id/cards`, `PATCH /cards/:id`, `DELETE /cards/:id`.
  - Editor “add multiple” (futuro desejável) e validações.
- Próximos passos (mock)
  - Página `/decks/:id/cards` com grid simples e formulário modal, usando serviço mock.

## Turmas & Matrículas
- Implementado (mock)
  - Página “Minhas Turmas” com busca, contagem de alunos e indicação de decks atribuídos: `apps/web/synapse-flash-study-main/src/pages/Classes.tsx:1`.
  - Link para detalhes `/classes/:id` (não implementado) e “Nova Turma”.
- Faltando
  - Detalhes da turma com gestão de alunos (add/remove em lote) e atribuições.
  - Integração real com `GET/POST/PATCH /classes` e `POST /classes/:id/students`.
- Próximos passos (mock)
  - Criar `/classes/:id` para visualizar e gerenciar (mockStudents), e `/classes/new` com formulário básico.

## Atribuições (Assignments)
- Implementado (mock)
  - Indicação de decks atribuídos por turma via `assignedDecks` no mock.
- Faltando
  - Ação “Atribuir Deck” (modal) em turmas e decks; integração com `POST /assignments`.
  - Lista de “Atribuídos a mim” para aluno.
- Próximos passos (mock)
  - Modal de atribuição que altera estado local (mock) e reflete na lista do aluno.

## Estudo (SRS)
- Implementado
  - Não há páginas de estudo; há links para `/study` ou `/study/:deckId` ainda inexistentes.
- Faltando
  - Fila de estudo e fluxo de review: `GET /study/queue`, `POST /study/review`, `GET /study/progress`.
- Próximos passos (mock)
  - Tela `/study/:deckId` com ciclo simples de cards e botões Again/Hard/Good/Easy, atualizando estado mock (inclusive `next_due_at`).

## Relatórios
- Implementado (mock)
  - KPIs no Dashboard com números estáticos/cálculo sobre mocks: `apps/web/synapse-flash-study-main/src/pages/Dashboard.tsx:1`.
- Faltando
  - Telas dedicadas: “Overview do Professor” e “Progresso do Aluno”.
  - Integração com endpoints de reports.
- Próximos passos (mock)
  - Página simples de “Relatórios” com cards KPI e gráfico estático (componente `chart` já existe em `components/ui/chart.tsx`).

## Observabilidade, Estados e Acessibilidade
- Implementado
  - Toasters `@/components/ui/toaster` e `@/components/ui/sonner` e base de componentes acessíveis do shadcn.
- Faltando
  - Padrões consistentes de loading/empty/error via React Query (spinners/skeletons) nas páginas.
  - ErrorBoundary global; aria-live nos toasts relevantes.
- Próximos passos
  - Envolver rotas protegidas com suspense/skeletons e consolidar componentes `EmptyState`, `ErrorState` reutilizáveis.

## Configuração & Infra do App Web
- Implementado
  - Build Vite e assets básicos (`index.html`, `tailwind.config.ts`).
- Faltando
  - Uso de env `VITE_API_URL` e `VITE_APP_VERSION` (docs). Não há client central (`api/`).
  - Preparação Capacitor (futuro): `capacitor.config.ts` não presente.
- Próximos passos
  - Adicionar `src/lib/api/client.ts` (axios), `src/lib/api/auth.ts` etc. e `.env.example` na raiz do app web.

## Roadmap de Ações (curto prazo)
1) Infra de dados no frontend
   - Criar `api/client.ts` (axios + baseURL por `VITE_API_URL`) e hooks `useAuthApi`, `useDecksApi` (mock hoje, fácil trocar para real amanhã).
2) Autenticação coerente
   - `ProtectedRoute` e normalização de `role` para `TEACHER|STUDENT`. Simular token no header para já usar interceptors e React Query.
3) Decks e Classes com Query
   - Trocar leitura de mocks por `useQuery`/`useMutation` chamando serviços mock (fonte única). Acrescentar páginas `/decks/new`, `/decks/:id`, `/classes/new`, `/classes/:id`.
4) Estudo (MVP mock)
   - Implementar `/study/:deckId` com iteração básica e estados locais de review.
5) Relatórios (mock)
   - Página única de Relatórios usando componentes de chart existentes.

## Alinhamento com os Docs
- Especificações de frontend: `docs/guidelines/synapse-specs.md` (seções 5 e 9) pedem client HTTP, rotas, telas MVP e padrões de estado.
- Roadmap por feature: `docs/guidelines/synapse-feature-roadmap.md` orienta a ordem de entrega (Auth → Users/RBAC → Decks → Cards → Classes → Assignments → Study → Reports).
- Este documento mantém a mesma ordem e propõe passos com fallback mock, facilitando o “swap” para API real quando o backend for liberado.

