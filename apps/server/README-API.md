# 🚀 Synapse API - Backend

API REST do Synapse desenvolvida com NestJS, MongoDB e Mongoose.

## ✅ Implementado

### Rotas CRUD de Decks
- ✅ `POST /decks` - Criar deck
- ✅ `GET /decks` - Listar com paginação, busca e filtros
- ✅ `GET /decks/:id` - Buscar por ID
- ✅ `PATCH /decks/:id` - Atualizar deck
- ✅ `DELETE /decks/:id` - Deletar deck

### Rotas CRUD de Classes (Turmas)
- ✅ `POST /classes` - Criar turma
- ✅ `GET /classes` - Listar com paginação e busca
- ✅ `GET /classes/:id` - Buscar por ID
- ✅ `PATCH /classes/:id` - Atualizar turma
- ✅ `DELETE /classes/:id` - Deletar turma
- ✅ `POST /classes/:id/students` - Adicionar alunos
- ✅ `DELETE /classes/:id/students` - Remover alunos

### Infraestrutura
- ✅ Swagger UI completo em `/docs`
- ✅ Validação automática com class-validator
- ✅ DTOs tipados com decorators do Swagger
- ✅ Paginação padronizada (page, limit, sort, order)
- ✅ Tratamento de erros HTTP
- ✅ Helmet para segurança
- ✅ CORS configurável
- ✅ Health check em `/health`

## 📁 Estrutura de Arquivos

```
apps/server/src/
├── decks/
│   ├── dto/
│   │   ├── create-deck.dto.ts        # DTO de criação
│   │   ├── update-deck.dto.ts        # DTO de atualização
│   │   ├── query-deck.dto.ts         # DTO de query params
│   │   └── deck-response.dto.ts      # DTO de resposta
│   ├── decks.controller.ts           # Controller com rotas
│   ├── decks.service.ts              # Lógica de negócio
│   └── decks.module.ts               # Módulo NestJS
├── classes/
│   ├── dto/
│   │   ├── create-class.dto.ts
│   │   ├── update-class.dto.ts
│   │   ├── query-class.dto.ts
│   │   ├── add-students.dto.ts       # DTO para adicionar/remover alunos
│   │   └── class-response.dto.ts
│   ├── classes.controller.ts
│   ├── classes.service.ts
│   └── classes.module.ts
├── database/
│   ├── schemas/
│   │   ├── deck.schema.ts            # Schema Mongoose
│   │   ├── class.schema.ts
│   │   ├── card.schema.ts
│   │   ├── user.schema.ts
│   │   └── ...
│   └── database.module.ts
├── app.module.ts                     # Módulo principal (registra Decks e Classes)
├── main.ts                           # Bootstrap + Swagger config
└── health.controller.ts              # Health check
```

## 🔧 Configuração

### 1. Resolver Conexão MongoDB Atlas

**Problema atual**: IP não está na whitelist do MongoDB Atlas.

**Solução**:
1. Acesse https://cloud.mongodb.com/
2. Faça login
3. Vá em **Network Access**
4. Clique em **Add IP Address**
5. Adicione seu IP atual ou `0.0.0.0/0` (apenas dev!)
6. Salve e aguarde ~1 minuto

### 2. Variáveis de Ambiente

O arquivo `.env` já está configurado:
```env
PORT=3000
MONGODB_URI="mongodb+srv://..."
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SWAGGER_ENABLED=true
```

### 3. Iniciar o Servidor

```bash
cd apps/server
npm install  # se ainda não instalou
npm run start:dev
```

O servidor iniciará em: `http://localhost:3000`

### 4. Acessar o Swagger

Após o servidor conectar ao banco:
```
http://localhost:3000/docs
```

## 📚 Documentação das Rotas

Consulte o arquivo [SWAGGER-TESTING.md](./SWAGGER-TESTING.md) para:
- Exemplos completos de cada endpoint
- Como usar o Swagger UI
- Query params disponíveis
- Estrutura dos payloads
- Dicas de teste

## 🎯 Recursos Implementados

### Validação Automática
Todos os DTOs têm validação com class-validator:
- `@IsString()`, `@IsNumber()`, `@IsBoolean()`
- `@MinLength()`, `@MaxLength()`
- `@Min()`, `@Max()`
- `@IsArray()`, `@IsOptional()`

Retorna erro 400 com detalhes se inválido.

### Paginação
Query params padrão em todas as listagens:
- `page` (padrão: 1, mínimo: 1)
- `limit` (padrão: 20, máximo: 100)
- `sort` (campo de ordenação)
- `order` (asc/desc)

Resposta sempre inclui:
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### Filtros Específicos

**Decks**:
- `mine=true` - Apenas meus decks
- `query=texto` - Busca textual (title, description, tags)
- `tags=tag1,tag2` - Filtrar por tags

**Classes**:
- `query=nome` - Busca por nome da turma

### Controle de Permissões
- Apenas o owner pode editar/deletar decks
- Apenas o teacher owner pode editar/deletar turmas
- Decks privados só são acessíveis pelo owner
- Validação de ObjectIds do MongoDB

### Funcionalidades Especiais

**Decks**:
- Contador automático de cards (`cards_count`)
- Métodos auxiliares: `incrementCardsCount()`, `decrementCardsCount()`
- Suporte a decks públicos/privados
- Índice de texto para busca

**Classes**:
- Adicionar/remover alunos em lote
- Prevenção de duplicatas ao adicionar
- Contador de alunos (`students_count`)
- Validação de student_ids

## 🔜 Próximos Passos

### Sprint 1 (em andamento)
- [ ] Implementar AuthModule (JWT)
- [ ] Adicionar guards de autenticação
- [ ] Substituir `temp-user-id` por userId real do token
- [ ] Criar rotas de login/logout

### Sprint 2-3
- [ ] Rotas CRUD de Cards (dentro de decks)
- [ ] Rotas de Assignments (publicar decks para turmas)
- [ ] Sistema de convites para alunos

### Sprint 4-5
- [ ] Sistema de Study (SRS - repetição espaçada)
- [ ] Rotas de Reviews
- [ ] Cálculo de `next_due_at`

### Sprint 6+
- [ ] Relatórios e métricas
- [ ] Exportação CSV
- [ ] Lembretes por e-mail
- [ ] Audit logs

## 🐛 Troubleshooting

### Porta 3000 ocupada
```bash
lsof -ti:3000 | xargs kill -9
npm run start:dev
```

### Erro de conexão MongoDB
- Verifique a whitelist de IPs no Atlas
- Teste a connection string no MongoDB Compass
- Verifique se o usuário/senha estão corretos

### Warnings de índice duplicado
É um warning conhecido do Mongoose com múltiplos índices. Não afeta o funcionamento.

### Limpar cache
```bash
rm -rf dist node_modules
npm install
npm run build
```

## 📦 Dependências Principais

- **NestJS**: Framework
- **Mongoose**: ODM para MongoDB
- **class-validator**: Validação de DTOs
- **class-transformer**: Transformação de tipos
- **@nestjs/swagger**: Documentação automática
- **helmet**: Segurança HTTP

## 🎨 Padrões de Código

- TypeScript strict mode
- Decorators do Swagger em todos os endpoints
- DTOs separados (Create, Update, Query, Response)
- Services com lógica de negócio
- Controllers apenas com rotas
- Modules isolados e exportáveis
- Validação em todos os inputs
- Tratamento de erros HTTP padronizado

## 📝 Notas Técnicas

- ObjectIds são convertidos automaticamente
- Timestamps automáticos (created_at, updated_at)
- Índices configurados nos schemas
- Soft deletes não implementados (hard delete)
- RBAC planejado mas não implementado ainda
- Rate limiting planejado mas não implementado ainda

---

**Status**: ✅ Rotas funcionais, aguardando conexão com MongoDB

**Última atualização**: 27 de outubro de 2025
