# Synapse — Monorepo (Web + API)

Plataforma de estudo com repetição espaçada. Este repositório é um monorepo com os apps Web (Vite/React) e API (NestJS), além de documentação e planos.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: NestJS (TypeScript) + MongoDB (via Mongoose)
- Segurança: Helmet, CORS por ambiente, ValidationPipe
- Documentação: Swagger (OpenAPI) em `/docs`
- Observabilidade inicial: `GET /health` com verificação do Mongo

## Estrutura do repositório
```
synapse/
  apps/
    server/   # API NestJS
    web/      # Frontend Vite/React
  docs/       # Documentação (arquitetura, requisitos)
  features/   # Planos por feature (execução)
  package.json  # Workspaces npm
```

## Pré‑requisitos
- Node.js 18+ e npm 9+
- MongoDB Atlas (ou MongoDB local)
- Acesso liberado ao cluster (IP Allow List, usuário/senha)

## Instalação
Na raiz do repositório:

```
npm install
```

Isso instala as dependências de `apps/server` e `apps/web` via workspaces.

## Configuração de ambiente
Crie os arquivos `.env` específicos de cada app.

- Backend (`apps/server/.env`):
```
PORT=3000
HOST=  # opcional (ex.: 0.0.0.0 para expor na rede)
MONGODB_URI="mongodb+srv://<usuario>:<senha>@<cluster>/<db>?retryWrites=true&w=majority"
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SWAGGER_ENABLED=true
```

- Frontend (`apps/web/.env`):
```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Synapse
```

Observações:
- Utilize URL encode em usuário/senha da URI se houver caracteres especiais.
- Se usar Mongo local, troque `MONGODB_URI` para `mongodb://localhost:27017/synapse`.

## Como rodar (desenvolvimento)
- API (NestJS):
```
npm --workspace apps/server run start:dev
```
  - Saúde: http://localhost:3000/health
  - Swagger: http://localhost:3000/docs

- Web (Vite):
```
npm --workspace apps/web run dev
```
  - Acesse http://localhost:5173
  - A Home consulta a API em `${VITE_API_URL}/health` e mostra o status

## Scripts úteis (raiz)
- `npm install` — instala dependências (workspaces)
- `npm --workspace apps/server run start:dev` — inicia API em watch mode
- `npm --workspace apps/server run build` — compila API (gera `apps/server/dist`)
- `npm --workspace apps/web run dev` — inicia o web (HMR na porta 5173)
- `npm --workspace apps/web run build` — build de produção do web

## Troubleshooting
- Porta em uso (EADDRINUSE): altere `PORT` em `apps/server/.env` ou finalize o processo na porta (macOS/Linux: `lsof -nP -iTCP:3000 -sTCP:LISTEN` e `kill -15 <PID>`).
- Erro de CORS no navegador: adicione a origem do web em `CORS_ORIGINS` (lista separada por vírgulas) e reinicie a API.
- Erro de conexão com Mongo: verifique `MONGODB_URI`, liberação de IP no Atlas e credenciais.
- `localhost` vs `127.0.0.1`: o servidor aceita ambos por padrão; se necessário, defina `HOST=0.0.0.0` no `.env` do server.

## Documentação
- Especificações e requisitos: `docs/`
  - `docs/escopo-synapse-github.md`
  - `docs/synapse-specs.md`
  - `docs/synapse-feature-roadmap.md`
  - `docs/requisitos-nao-funcionais.md`
- Plano do baseline: `features/00-baseline-plan.md`

