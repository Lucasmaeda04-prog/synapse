# 📚 Guia de Teste do Swagger - Synapse API

## Problema Atual: Conexão MongoDB Atlas

O servidor está enfrentando um erro de conexão com o MongoDB Atlas:
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster.
```

### Solução: Adicionar IP à Whitelist

1. Acesse o [MongoDB Atlas](https://cloud.mongodb.com/)
2. Faça login com a conta: `lucasmaedatrabalhos_db_user`
3. Vá em **Network Access** (Acesso à Rede)
4. Clique em **Add IP Address**
5. Escolha uma das opções:
   - **Add Current IP Address** (adiciona seu IP atual)
   - **Allow Access from Anywhere** (0.0.0.0/0) - apenas para desenvolvimento!
6. Salve e aguarde alguns segundos

### Alternativa: Usar MongoDB Local

Se preferir testar localmente, você pode usar MongoDB local:

```bash
# Instalar MongoDB localmente (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Iniciar MongoDB
brew services start mongodb-community

# Atualizar .env
MONGODB_URI=mongodb://localhost:27017/synapse
```

## Acessar o Swagger

Após resolver a conexão do banco:

1. Certifique-se de que o servidor está rodando:
   ```bash
   cd apps/server
   npm run start:dev
   ```

2. Acesse no navegador:
   ```
   http://localhost:3000/docs
   ```

## Testando as Rotas no Swagger

### 1. Health Check
- **GET /health** - Verifica se a API e o banco estão funcionando

### 2. Decks (Flashcards)

#### Criar um Deck
- **POST /decks**
- Body exemplo:
```json
{
  "title": "Matemática Básica",
  "description": "Operações fundamentais",
  "tags": ["matemática", "básico"],
  "is_public": false
}
```

#### Listar Decks
- **GET /decks**
- Query params disponíveis:
  - `mine=true` - Apenas meus decks
  - `query=matemática` - Busca textual
  - `tags=matemática,básico` - Filtrar por tags
  - `page=1` - Número da página
  - `limit=20` - Itens por página (máx: 100)
  - `sort=created_at` - Campo de ordenação
  - `order=desc` - Ordem (asc/desc)

#### Buscar Deck Específico
- **GET /decks/:id**
- Substitua `:id` pelo ID retornado ao criar um deck

#### Atualizar Deck
- **PATCH /decks/:id**
- Body exemplo:
```json
{
  "title": "Matemática Avançada",
  "tags": ["matemática", "avançado"]
}
```

#### Deletar Deck
- **DELETE /decks/:id**

### 3. Classes (Turmas)

#### Criar uma Turma
- **POST /classes**
- Body exemplo:
```json
{
  "name": "Turma 3A - Matemática",
  "student_ids": []
}
```

#### Listar Turmas
- **GET /classes**
- Query params:
  - `query=3A` - Busca por nome
  - `page=1`
  - `limit=20`
  - `sort=created_at`
  - `order=desc`

#### Buscar Turma Específica
- **GET /classes/:id**

#### Atualizar Turma
- **PATCH /classes/:id**
- Body exemplo:
```json
{
  "name": "Turma 3B - Matemática"
}
```

#### Adicionar Alunos à Turma
- **POST /classes/:id/students**
- Body exemplo:
```json
{
  "student_ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

#### Remover Alunos da Turma
- **DELETE /classes/:id/students**
- Body exemplo:
```json
{
  "student_ids": ["507f1f77bcf86cd799439011"]
}
```

#### Deletar Turma
- **DELETE /classes/:id**

## Recursos do Swagger

### Try it out
1. Clique em qualquer endpoint
2. Clique no botão **"Try it out"**
3. Preencha os parâmetros/body
4. Clique em **"Execute"**
5. Veja a resposta abaixo

### Schemas
- Role até o final da página para ver todos os schemas/DTOs disponíveis
- Exemplos de CreateDeckDto, UpdateDeckDto, DeckResponseDto, etc.

### Autenticação
- Por enquanto, a autenticação está desabilitada (IDs temporários)
- Quando implementarmos JWT, você verá um botão **"Authorize"** no topo

## Próximos Passos

1. **Resolver conexão do MongoDB** (whitelist ou local)
2. **Testar todas as rotas** no Swagger
3. **Implementar autenticação JWT** (Sprint 1)
4. **Adicionar rotas de Cards** (criar cards dentro dos decks)
5. **Implementar Assignments** (publicar decks para turmas)
6. **Sistema de Study** (SRS - repetição espaçada)

## Dicas

- Use o botão "Copy" nos exemplos do Swagger para copiar JSONs
- Os IDs retornados são ObjectIds do MongoDB (24 caracteres hex)
- A validação está ativa - campos inválidos retornarão erro 400
- Paginação tem limite máximo de 100 itens por página
- Tags podem ser filtradas com vírgula: `tags=tag1,tag2`

## Troubleshooting

### Porta 3000 já em uso
```bash
lsof -ti:3000 | xargs kill -9
```

### Limpar cache do Nest
```bash
cd apps/server
rm -rf dist
npm run build
```

### Ver logs detalhados
O servidor está rodando em modo watch, qualquer alteração recarrega automaticamente.
