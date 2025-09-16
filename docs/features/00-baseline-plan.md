# 0) Baseline do Projeto — Plano de Execução

Objetivo: preparar monorepo, backend e frontend básicos para iniciar o desenvolvimento do Synapse. Sem CI/CD nesta fase. Incluir `.env` para configuração local.

Escopo desta entrega
- Monorepo com workspaces: `apps/web` e `apps/server`.
- Backend (NestJS): app base, Config, Helmet, CORS, conexão Mongo, rota `/health`, Swagger e módulos vazios.
- Frontend (Vite+React+TS): scaffold, Tailwind, React Router, React Query, axios base com interceptor, layout shell mínimo.
- `.env` de desenvolvimento com variáveis essenciais.

Passos
1) Monorepo & workspaces
   - Criar estrutura `synapse/apps/{server,web}` e `package.json` raiz com `workspaces`.

2) Backend — App base
   - NestJS mínimo com `AppModule` e `main.ts` (ValidationPipe, Helmet, CORS, Logger).
   - `ConfigModule` global e leitura de `.env` (PORT, MONGODB_URI, CORS_ORIGINS, SWAGGER_ENABLED).
   - `MongooseModule.forRootAsync` (conexão MongoDB).
   - `HealthModule` com `GET /health` retornando 200.
   - Swagger em `/docs` (condicional por env).
   - Módulos vazios: `auth, users, decks, cards, classes, assignments, study, reports`.

3) Frontend — App base
   - Vite + React + TS com estrutura `src/` mínima.
   - Tailwind configurado (base, components, utilities).
   - React Router (rotas básicas) + React Query provider.
   - Axios client com `baseURL` de `VITE_API_URL` e interceptor.
   - Layout shell simples (Navbar placeholder) e páginas Home/NotFound.

4) `.env` e documentação local
   - Criar `.env` com valores padrão de desenvolvimento.
   - Notas rápidas no README para rodar localmente (opcional).

Critérios de Aceite
- `GET /health` responde 200 no backend (código implementado).
- Frontend carrega página inicial e lê `VITE_API_URL` do `.env`.
- CORS restrito às origens indicadas por env.
- Swagger acessível em `/docs` quando habilitado via env.

Fora de Escopo nesta fase
- CI/CD, deploys e builds de produção.
- shadcn/ui (instalação de componentes) — será feito em UI/UX.
- Autenticação e RBAC — serão tratados nas features seguintes.

