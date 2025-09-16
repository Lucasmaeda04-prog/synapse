# Requisitos Não Funcionais — Diretrizes de Implementação

Este documento define como a plataforma atenderá requisitos não funcionais essenciais, com orientações práticas de implementação no backend (NestJS), frontend (Vite/React) e infraestrutura adjacente.

## Escalabilidade
- Arquitetura stateless na API (NestJS) para suportar escalonamento horizontal e múltiplas instâncias.
- MongoDB Atlas com índices obrigatórios (ex.: `decks: owner_id, title (text), tags`; `cards: deck_id`; `reviews: student_id+card_id, next_due_at`) e pool de conexões ajustável por env.
- Padrão de paginação e filtros em todos os endpoints de listagem (`page`, `limit` [padrão 20, máx. 100], `sort`), evitando retornos massivos.
- Processamento assíncrono para cargas pesadas (BullMQ/Redis) em relatórios e cálculos intensivos; jobs idempotentes e com backoff.
- Estratégia de cache: ETag/Last-Modified nas listagens; Redis TTL curto para endpoints de leitura intensiva; invalidação em alterações.
- Limites e timeouts: limite de payload (1–2MB), timeouts de request, proteção contra N+1 e rate limiting na borda.

## Segurança
- Cabeçalhos de segurança via Helmet (frameguard, noSniff, referrer-policy) e CSP configurável por ambiente quando necessário.
- Autenticação JWT (access de curta duração + refresh opcional) com RBAC por papéis; senhas com argon2 e mitigação de brute-force.
- Validação com class-validator e sanitização de entradas (escape de HTML/Markdown) para conteúdo usuário; limites de tamanho de payload.
- CORS restrito por env (`CORS_ORIGINS`); cookies httpOnly/SameSite=Lax na web; Bearer token no app (Capacitor).
- Auditoria de ações sensíveis (criação/edição/atribuíção), mascaramento de PII nos logs e gestão de segredos via variáveis de ambiente.
- Dependências atualizadas e práticas OWASP; backups/retentiva de dados gerenciados pelo Atlas.

## Compatibilidade
- Versionamento da API por prefixo (`/v1`) e documentação OpenAPI/Swagger com DTOs e formatos de erro.
- Respostas JSON estáveis; datas em ISO 8601 (UTC); paginação por `page/limit` e opção de `cursor` onde necessário.
- Suporte a IPv4/IPv6; `HOST` e `PORT` configuráveis por env; CORS consistente entre domínios do frontend.
- Navegadores alvo: últimas 2 versões modernas; uso progressivo de features com fallbacks para interações críticas.
- Frontend responsivo, compatível com Capacitor; abstração de armazenamento (cookies vs header Bearer) e detecção de plataforma.
- Internacionalização planejada: strings preparadas para tradução; backend opera em UTC e converte no cliente quando aplicável.

## Acessibilidade
- Componentes com Radix/shadcn e atributos ARIA corretos; foco visível e navegação por teclado em todos os fluxos.
- Contraste mínimo AA; tema respeitando `prefers-color-scheme`; opção de aumentar fonte e reduzir movimento.
- Semântica HTML adequada (headings ordenados, links descritivos, `alt` em imagens) e formulários com rótulos/erros acessíveis.
- Estados de interface acessíveis (loading/empty/error) com `aria-live` para toasts/erros e feedbacks assíncronos.
- Modais/menus com trap de foco e fechamento por ESC; links de “pular para conteúdo”.
- Lint de a11y (eslint-plugin-jsx-a11y) e checklist de revisão a11y nas PRs.

## Observabilidade
- Logs estruturados (pino/winston) com `request-id` e correlação; níveis por ambiente; sem dados sensíveis.
- Health checks: `/health` (liveness) e `/ready` (readiness incluindo DB e dependências externas).
- Métricas (Prometheus/OpenTelemetry): latência p95/p99 por rota, taxa de erros, métricas do pool do Mongo, filas de jobs e métricas do processo.
- Rastreamento distribuído (OpenTelemetry) para DB e chamadas HTTP externas; amostragem ajustável.
- Dashboards e alertas com thresholds para latência, 5xx e indisponibilidade de dependências.
- Política de retenção e rotação de logs, com campos padrão (timestamp, level, route, userId opcional).

## Manutenibilidade
- Monorepo com workspaces; módulos por domínio; DTOs tipados e TypeScript no modo `strict`.
- Padrões de código: ESLint + Prettier; scripts `lint`, `format`, `test`; convenções de commits e PR template.
- Documentação de setup local, `.env.example` e ADRs para decisões arquiteturais relevantes.
- Estratégia de testes: unit (services/utilitários), integração (controllers/repos) e E2E para fluxos críticos; fixtures e seeds de desenvolvimento.
- Convenções de API (erros com `code/message/details`, paginação consistente, versionamento `/v1`) e tratamento uniforme de exceções.
- Migrações/índices: scripts idempotentes para criação de índices e seeds iniciais, com validação em ambiente de staging antes da produção.

