# Plano de Sprints (9 Sprints) — Synapse

Premissa: 9 sprints (duração sugerida: 2 semanas cada). Planejamento orientado por objetivo de negócio e fluxo de valor (sem estimativas numéricas de pontos aqui). Ajustar prioridades após a Sprint 1 conforme velocidade observada.

## Visão Macro por Sprint
| Sprint | Foco Central | Objetivo de Negócio | Principais Entregas |
|--------|--------------|--------------------|---------------------|
| 1 | Fundamentos Auth + Infra | Habilitar login seguro e base técnica | Auth básico, Users ME, API client, rota protegida |
| 2 | Usuários & Convites | Aumentar aquisição de alunos | Convite alunos, perfil, RBAC inicial |
| 3 | Decks & Cards (CRUD) | Criar conteúdo | CRUD decks/cards + tags + import inicial |
| 4 | Turmas & Publicação | Distribuição organizada | CRUD turmas, assignments (publicar/retirar) |
| 5 | Estudo (SRS v1) | Entregar valor ao aluno | Fila estudo, reviews, progresso básico |
| 6 | Relatórios & Score | Valor para professor | Dashboard turma, export CSV, métricas |
| 7 | Notificações + Auditoria | Retenção & Confiabilidade | Lembrete e-mail, audit logs, hardening |
| 8 | i18n + Acessibilidade + Polimento | Escalabilidade de UX | i18n, atalhos, melhorias UX/perf |
| 9 | Ajustes Finais & Preparação Release | Qualidade para lançamento | End-to-end refinado, testes, refino SRS |

---
## Sprint 1 — Fundamentos Auth & Infra
**Objetivo:** Ter pipeline mínimo para autenticação e consumo real da API no frontend.

Backlog (Comprometido):
- AuthModule: `POST /auth/login`, `POST /auth/logout`, `GET /users/me`
- Hash senha (argon2) + rate limit login
- JWT guard + Roles decorator (stub roles)
- API Client frontend + interceptors
- ProtectedRoute + AuthContext integrado
- Estrutura geração tipos (esqueleto openapi)
- Logger estruturado + `request-id` backend
- Health `/ready`

Opcional (Stretch):
- Esqueleto ErrorBoundary global
- Skeleton inicial de deck list consumindo API

Aceite:
- Login fluxo completo (usuário seed) → dashboard mock
- 0 warnings críticos de segurança básicos (helmet/cors)
- Código erro padronizado nos 401/403

Riscos:
- Falta de definição de roles reais. Mitigação: stub enumerado.

---
## Sprint 2 — Usuários, Perfil & Convites
**Objetivo:** Permitir onboarding de professores e alunos via convite.

Backlog (Comprometido):
- Endpoint `POST /users` (ADMIN) + `PATCH /users/:id`
- Convites: `POST /invites`, `POST /auth/accept-invite`
- TTL + limpeza de convites expirados
- Tela envio convites
- Tela aceitar convite
- Tela Perfil (editar nome / preferências básicas)
- Auditoria: criação usuário / convite emitido / convite aceito

Opcional:
- Preferência lembrete diário (toggle salvo mas inativo)

Aceite:
- Fluxo convite → aluno cria senha → login funciona
- Perfil atualizado reflete no `/users/me`

Riscos:
- E-mail real indisponível: fallback log de token. Mitigação: adapter abstrato.

---
## Sprint 3 — Decks & Cards (CRUD + Tags + Import Consistente)
**Objetivo:** Professores criam e estruturam conteúdo.

Backlog (Comprometido):
- CRUD Decks (`GET list` com paginação + busca + tags)
- CRUD Cards (assíncrono + ordenação básica)
- Tags em cards ou deck-level (decisão: manter tags deck + tags card)
- Atualização `cards_count` consistente
- Import decks CSV (versão mínima sem preview avançado)
- Export deck JSON
- Frontend forms com validação (RHF+Zod)

Opcional:
- Preview de erros no import
- Export CSV

Aceite:
- Criar deck → adicionar cards → listar com contagem correta
- Import arquivo simples gera deck com cards

Riscos:
- Parse CSV grande travar event-loop. Mitigação: stream + limite tamanho.

---
## Sprint 4 — Turmas & Publicação (Assignments)
**Objetivo:** Distribuir decks para grupos.

Backlog (Comprometido):
- CRUD Turmas (classes)
- Adicionar/remover alunos em turma (batch)
- Assignments: publicar (create) / retirar (delete)
- Listar assignments por turma e por aluno
- Tela turma (alunos, decks publicados)
- Página “Atribuídos a mim” (student)
- Auditoria publicar/retirar

Opcional:
- Filtros avançados turma

Aceite:
- Professor publica deck → aluno vê em “atribuídos”
- Retirar some da lista do aluno em < 2s (invalidação cache)

Riscos:
- Índices assignments não otimizados. Mitigação: revisar plano índices.

---
## Sprint 5 — Estudo (SRS v1) & Flags
**Objetivo:** Entregar experiência básica de estudo com repetição espaçada.

Backlog (Comprometido):
- Modelo SRS simplificado (`scheduleNext`)
- `GET /study/queue`
- `POST /study/review`
- Persistência progress (acertos, total)
- Flag card (`POST /study/flag`)
- Interface estudo (fila, virar, avaliar 1..4)
- Timer card + atalhos teclado

Opcional:
- Filtro “somente marcadas”
- Estatística sessão (acurácia, tempo médio)

Aceite:
- Sessão apresenta fila; ao avaliar atualiza próxima data
- Flag aparece e persiste

Riscos:
- Ajustes futuros de algoritmo. Mitigação: abstrair função core.

---
## Sprint 6 — Relatórios & Export
**Objetivo:** Fornecer valor analítico para professores.

Backlog (Comprometido):
- `GET /reports/teacher/overview`
- `GET /reports/student/overview`
- Export CSV relatório turma
- Dashboard turma (gráficos: acurácia média, progresso, top alunos)
- Score por deck (accuracy %)
- Atualizar progress agregando métricas

Opcional:
- Drill-down aluno / deck

Aceite:
- Professor exporta CSV; números batem com UI

Riscos:
- Agregações lentas. Mitigação: índices + pipeline enxuta.

---
## Sprint 7 — Lembretes, Auditoria & Hardening
**Objetivo:** Aumentar engajamento e rastreabilidade.

Backlog (Comprometido):
- Cron diário lembrete (due >0, opt-in)
- Template e-mail básico
- Audit Logs endpoints + UI admin simples
- Logs segurança (login falho, reset senha)
- Reset senha (forgot/reset) (se não entregue antes)
- Sanitização/escape conteúdos

Opcional:
- Teste envio manual admin
- Retenção audit (job limpeza)

Aceite:
- E-mail gerado em ambiente dev (log stdout) com lista de due
- Tabela audit paginada consultável

Riscos:
- Cron local inconsistente. Mitigação: abstrair scheduler.

---
## Sprint 8 — i18n, Acessibilidade & UX Polish
**Objetivo:** Pronto para adoção mais ampla.

Backlog (Comprometido):
- i18n (pt-BR / en) com lazy namespaces
- Atalhos acessíveis (documentação + modal ajuda)
- A11y pass (axe / roles / labels)
- Performance ajustes (cache headers, bundle split)
- Dark/Light refinado & tema coerente

Opcional:
- Pré-busca (prefetch) rotas críticas
- Export JSON completo de relatórios

Aceite:
- Troca idioma sem reload
- Nenhum blocker WCAG básico (focus, labels, contraste)

Riscos:
- Chaves i18n faltando. Mitigação: script validação.

---
## Sprint 9 — Estabilização & Release
**Objetivo:** Preparar versão lançável (MVP robusto).

Backlog (Comprometido):
- Revisão algoritmo SRS (ajustes parâmetros)
- Testes E2E fluxo principal (Login → Criar Deck → Publicar → Estudar → Report)
- Carga leve (seed bigger + smoke)
- Documentação final (`.env.example`, setup, README refinado)
- Checklist segurança (headers, rate, enum validação)
- Ajustes feedback QA (buffer)

Opcional:
- Métricas OpenTelemetry export
- Preparar build Capacitor inicial (shell)

Aceite:
- Todos fluxos core passam testes E2E
- Zero TODO crítico aberto

Riscos:
- Spillover técnico atrasado de sprints anteriores.

---
## Backlog Geral (Não Planejado Explicitamente / Icebox)
- Refresh token flow completo
- Gamificação (streaks, badges)
- FSRS avançado (ajuste dinâmico por perfil)
- Cache Redis relatórios
- PWA / Offline study
- Webhooks / Integrações externas

---
## Dependências e Marcos
| Marco | Sprint Alvo | Dependência |
|-------|-------------|-------------|
| Convites Ativos | 2 | Auth básico (1) |
| Publicação Deck | 4 | CRUD Decks (3) |
| SRS v1 | 5 | Decks/Cards sólidos (3) |
| Dashboard Turma | 6 | Assignments + Reviews (4/5) |
| Lembrete Diário | 7 | Progress consolidado (5) |
| i18n | 8 | UI estável |
| MVP Release | 9 | Todos obrigatórios |
