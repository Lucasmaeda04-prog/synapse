# 🚀 Guia Rápido de Teste - Synapse API

## ✅ Problema Resolvido!

Corrigi o erro do ObjectId! Agora as rotas usam IDs válidos do MongoDB automaticamente.

## 📋 Passo a Passo para Testar

### 1️⃣ Primeiro: Liberar IP no MongoDB Atlas

**Você PRECISA fazer isso uma vez apenas:**

1. Acesse: https://cloud.mongodb.com/
2. Faça login
3. Selecione seu projeto/cluster
4. Menu lateral esquerdo → **"Network Access"**
5. Clique em **"+ ADD IP ADDRESS"** (botão verde)
6. Na janela que abrir, escolha **"ALLOW ACCESS FROM ANYWHERE"**
7. Confirme (botão **"Confirm"**)
8. Aguarde 30-60 segundos para aplicar

> ⚠️ **"ALLOW ACCESS FROM ANYWHERE"** libera `0.0.0.0/0` - isso é OK apenas para desenvolvimento!

### 2️⃣ Iniciar o Servidor

```bash
cd apps/server
npm run start:dev
```

Aguarde aparecer a mensagem:
```
📚 Swagger documentation available at: http://localhost:3000/docs
```

### 3️⃣ Testar no Swagger

Abra no navegador:
```
http://localhost:3000/docs
```

## 🎯 Testando Decks

### Criar um Deck

1. No Swagger, encontre **"POST /decks"**
2. Clique em **"Try it out"**
3. Cole este JSON no corpo:

```json
{
  "title": "Matemática Básica",
  "description": "Operações fundamentais",
  "tags": ["matemática", "básico"],
  "is_public": false
}
```

4. Clique em **"Execute"**
5. Você verá a resposta com o deck criado incluindo o `_id`

### Listar Decks

1. Encontre **"GET /decks"**
2. Clique em **"Try it out"**
3. Clique em **"Execute"** (sem preencher nada)
4. Você verá todos os decks

### Buscar Deck por ID

1. Encontre **"GET /decks/{id}"**
2. Clique em **"Try it out"**
3. Cole o `_id` do deck que você criou
4. Clique em **"Execute"**

### Atualizar Deck

1. Encontre **"PATCH /decks/{id}"**
2. Clique em **"Try it out"**
3. Cole o `_id` no campo `id`
4. Cole este JSON:

```json
{
  "title": "Matemática Avançada",
  "tags": ["matemática", "avançado"]
}
```

5. Clique em **"Execute"**

### Deletar Deck

1. Encontre **"DELETE /decks/{id}"**
2. Clique em **"Try it out"**
3. Cole o `_id`
4. Clique em **"Execute"**

## 🎯 Testando Classes (Turmas)

### Criar uma Turma

```json
{
  "name": "Turma 3A - Matemática",
  "student_ids": []
}
```

### Adicionar Alunos à Turma

Primeiro você precisa criar alunos (users) no banco. Por enquanto, use ObjectIds válidos:

```json
{
  "student_ids": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

Use o endpoint: **POST /classes/{id}/students**

## 🧪 Testes Alternativos (Sem Swagger)

### Via cURL (Terminal)

```bash
# Criar deck
curl -X POST http://localhost:3000/decks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Matemática Básica",
    "description": "Operações fundamentais",
    "tags": ["matemática", "básico"],
    "is_public": false
  }'

# Listar decks
curl http://localhost:3000/decks

# Health check
curl http://localhost:3000/health
```

### Via Postman/Insomnia

1. Importe a collection (se disponível)
2. Ou crie requests manualmente:
   - **POST** `http://localhost:3000/decks`
   - **GET** `http://localhost:3000/decks`
   - **GET** `http://localhost:3000/decks/:id`
   - **PATCH** `http://localhost:3000/decks/:id`
   - **DELETE** `http://localhost:3000/decks/:id`

## ❓ Perguntas Frequentes

### Preciso de token JWT?

**NÃO!** Por enquanto, as rotas usam IDs temporários automaticamente. A autenticação JWT será implementada na Sprint 1.

### Como sei que está funcionando?

Quando o servidor conectar ao MongoDB, você verá:
```
[Nest] INFO [InstanceLoader] MongooseModule dependencies initialized
```

E o Swagger estará acessível em `http://localhost:3000/docs`

### Ainda dá erro de ObjectId?

Se você ainda ver o erro:
```
BSONError: input must be a 24 character hex string
```

Certifique-se de que:
1. Você salvou as mudanças nos controllers
2. O servidor recarregou (modo watch ativo)
3. Você está usando a versão atualizada do código

### Dá erro 404 Not Found?

Verifique se:
- O servidor está rodando (`npm run start:dev`)
- Você está acessando `http://localhost:3000` (não 5173)
- A rota está correta (ex: `/decks` não `/deck`)

### Como parar o servidor?

No terminal onde está rodando, pressione: `Ctrl + C`

## 🎉 Pronto para Testar!

Depois que você liberar o IP no MongoDB Atlas e iniciar o servidor, tudo funcionará perfeitamente!

As rotas agora geram ObjectIds válidos automaticamente para os testes. 🚀

---

**Status dos Controllers**:
- ✅ DecksController - IDs válidos configurados
- ✅ ClassesController - IDs válidos configurados
- ✅ Swagger UI - Documentação completa
- ✅ Validação - Ativa em todos os endpoints
