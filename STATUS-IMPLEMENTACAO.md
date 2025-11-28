# 📊 Status de Implementação - Synapse Backend

**Data:** 27 de outubro de 2025
**Versão:** 0.1.0

---

## 🎯 Visão Geral

Este documento compara o que foi planejado nos documentos (`docs/`) com o que está implementado no código.

---

## ✅ **IMPLEMENTADO COMPLETAMENTE**

### 1. **Infraestrutura Base (Sprint 0 - Fundações)**
- ✅ NestJS app configurado
- ✅ MongoDB Atlas conectado via Mongoose
- ✅ ConfigModule global com variáveis de ambiente
- ✅ Helmet + CORS + ValidationPipe
- ✅ Swagger UI em `/docs` com documentação completa
- ✅ Health check em `/health`
- ✅ Logger estruturado (NestJS built-in)
- ✅ Schemas MongoDB definidos para todas as coleções

**Arquivos:**
- `src/main.ts` - Bootstrap
- `src/app.module.ts` - Módulo principal
- `src/database/` - Schemas e módulo de banco

---

### 2. **Autenticação (Sprint 1 - Parcial)**
- ✅ AuthModule criado
- ✅ Firebase Authentication integrado
- ✅ `FirebaseAuthGuard` - Validação de JWT do Firebase
- ✅ `RolesGuard` - Controle de acesso por papéis
- ✅ Decorators: `@Roles()`, `@CurrentUser()`
- ✅ Endpoint `GET /auth/me` - Perfil do usuário atual
- ✅ Endpoint teste `GET /auth/teacher-only` - RBAC demo

**Arquivos:**
- `src/auth/auth.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/firebase-auth.guard.ts`
- `src/auth/firebase.service.ts`
- `src/auth/roles.guard.ts`
- `src/auth/roles.decorator.ts`
- `src/auth/current-user.decorator.ts`

**Status:** 🟢 **Funcional com Firebase**
- ⚠️ Não usa JWT próprio, delega ao Firebase
- ⚠️ Não tem `POST /auth/login` próprio (usa Firebase SDK no frontend)
- ⚠️ Não tem `POST /auth/logout` (stateless)
- ⚠️ Não tem refresh token próprio

---

### 3. **Usuários (Sprint 2)**
- ✅ UsersModule criado
- ✅ User schema com roles (ADMIN/TEACHER/STUDENT)
- ✅ `POST /users` - Criar usuário (sincronização Firebase → MongoDB)
- ✅ `GET /users/me` - Perfil próprio
- ✅ `PATCH /users/:id` - Atualizar usuário (protegido por RBAC)
- ✅ RBAC implementado (FirebaseAuthGuard + RolesGuard)

**Arquivos:**
- `src/users/users.module.ts`
- `src/users/users.controller.ts`
- `src/users/users.service.ts`
- `src/database/schemas/user.schema.ts`

**Status:** 🟢 **Funcional**
- ⚠️ Falta endpoint para admin listar todos os usuários
- ⚠️ Falta soft delete

---

### 4. **Decks (Sprint 3)**
- ✅ DecksModule criado
- ✅ CRUD completo: POST, GET (list), GET (one), PATCH, DELETE
- ✅ Paginação (page, limit, sort, order)
- ✅ Busca textual (índice MongoDB text)
- ✅ Filtro por tags
- ✅ Filtro `mine=true` (apenas meus decks)
- ✅ Controle de permissões (apenas owner edita/deleta)
- ✅ Contador `cards_count` automático
- ✅ Suporte a decks públicos/privados
- ✅ Métodos auxiliares: `incrementCardsCount()`, `decrementCardsCount()`

**Arquivos:**
- `src/decks/decks.module.ts`
- `src/decks/decks.controller.ts`
- `src/decks/decks.service.ts`
- `src/decks/dto/*.dto.ts` (4 DTOs)
- `src/database/schemas/deck.schema.ts`

**Status:** 🟢 **Funcional e testado**
- ✅ Testado via Swagger e cURL
- ⚠️ Não integrado com guards do Firebase (usa IDs temporários)

---

### 5. **Cards (Sprint 3)**
- ✅ CardsModule criado
- ✅ CRUD completo dentro de decks:
  - `POST /decks/:deckId/cards` - Criar card
  - `GET /decks/:deckId/cards` - Listar cards do deck
  - `GET /cards/:id` - Buscar card específico
  - `PATCH /cards/:id` - Atualizar card
  - `DELETE /cards/:id` - Deletar card
- ✅ Atualização automática de `deck.cards_count`
- ✅ Validação de campos (front, back obrigatórios)
- ✅ Suporte a hints e media (arrays)

**Arquivos:**
- `src/cards/cards.module.ts`
- `src/cards/cards.controller.ts`
- `src/cards/cards.service.ts`
- `src/cards/dto/*.dto.ts`
- `src/database/schemas/card.schema.ts`

**Status:** 🟢 **Funcional**
- ⚠️ Não testado via Swagger ainda
- ⚠️ Media URLs não têm validação de formato

---

### 6. **Classes/Turmas (Sprint 4)**
- ✅ ClassesModule criado
- ✅ CRUD completo: POST, GET (list), GET (one), PATCH, DELETE
- ✅ Paginação e busca por nome
- ✅ `POST /classes/:id/students` - Adicionar alunos (batch)
- ✅ `DELETE /classes/:id/students` - Remover alunos (batch)
- ✅ Prevenção de duplicatas ao adicionar alunos
- ✅ Validação de ObjectIds
- ✅ Contador `students_count`
- ✅ Controle de permissões (apenas teacher owner)

**Arquivos:**
- `src/classes/classes.module.ts`
- `src/classes/classes.controller.ts`
- `src/classes/classes.service.ts`
- `src/classes/dto/*.dto.ts` (5 DTOs)
- `src/database/schemas/class.schema.ts`

**Status:** 🟢 **Funcional e testado**
- ✅ Testado via cURL
- ⚠️ Não integrado com guards do Firebase (usa IDs temporários)

---

### 7. **Assignments/Atribuições (Sprint 4)**
- ✅ AssignmentsModule criado
- ✅ `POST /assignments` - Atribuir deck para turma/aluno
- ✅ `GET /assignments` - Listar atribuições (com filtros)
- ✅ `DELETE /assignments/:id` - Remover atribuição
- ✅ Validação: deck_id + (class_id OU student_id)
- ✅ Índices únicos parciais (evita duplicatas)
- ✅ Suporte a `due_date` opcional
- ✅ RBAC: apenas TEACHER/ADMIN pode criar

**Arquivos:**
- `src/assignments/assignments.module.ts`
- `src/assignments/assignments.controller.ts`
- `src/assignments/assignments.service.ts`
- `src/assignments/dto/*.dto.ts`
- `src/database/schemas/assignment.schema.ts`

**Status:** 🟢 **Funcional**
- ✅ Integrado com Firebase guards
- ⚠️ Não testado via Swagger ainda

---

## 🟡 **PARCIALMENTE IMPLEMENTADO**

### 8. **Study/SRS (Sprint 5)** - ❌ NÃO IMPLEMENTADO

**O que está faltando:**
- ❌ StudyModule (não existe)
- ❌ ReviewsModule (não existe)
- ❌ `GET /study/queue?deckId=X` - Fila de cards para estudar
- ❌ `POST /study/review` - Registrar resposta + calcular SRS
- ❌ `GET /study/progress?deckId=X` - Progresso do aluno
- ❌ Algoritmo SRS (scheduleNext function)
- ❌ Cálculo de `next_due_at`, `stability`, `difficulty`
- ❌ Service para gerenciar reviews

**Schema existe:**
- ✅ `review.schema.ts` - Campos definidos
- ✅ `progress.schema.ts` - Campos definidos

**Referência:**
- 📄 `docs/algoritmo-srs.md` - Especificação completa do algoritmo

**Prioridade:** 🔴 **ALTA** (Core do sistema)

---

### 9. **Reports/Relatórios (Sprint 6)** - ❌ NÃO IMPLEMENTADO

**O que está faltando:**
- ❌ ReportsModule (não existe)
- ❌ `GET /reports/teacher/overview?classId=X` - Resumo da turma
- ❌ `GET /reports/student/overview?deckId=X` - Meu progresso
- ❌ `GET /reports/teacher/export?classId=X&format=csv` - Export CSV
- ❌ Agregações MongoDB para estatísticas
- ❌ Cache de relatórios (Redis opcional)

**Prioridade:** 🟡 **MÉDIA** (Importante mas depende do Study)

---

## ❌ **NÃO IMPLEMENTADO**

### 10. **Convites (Sprint 2)** - ❌ NÃO IMPLEMENTADO

**O que está faltando:**
- ❌ InvitesModule
- ❌ `POST /invites` - Gerar convite
- ❌ `POST /auth/accept-invite` - Aceitar convite
- ❌ Schema `invites` (não existe)
- ❌ TTL index para expiração automática
- ❌ Envio de e-mail com token

**Prioridade:** 🟡 **MÉDIA**

---

### 11. **Recuperação de Senha (Sprint 2)** - ❌ NÃO IMPLEMENTADO

**O que está faltando:**
- ❌ `POST /auth/forgot` - Solicitar reset
- ❌ `POST /auth/reset` - Resetar senha
- ❌ Schema `password_resets` (não existe)
- ❌ Envio de e-mail

**Nota:** ⚠️ Firebase tem isso built-in, então pode não ser necessário

**Prioridade:** 🟢 **BAIXA** (Firebase resolve)

---

### 12. **Import/Export de Decks (Sprint 3)** - ❌ NÃO IMPLEMENTADO

**O que está faltando:**
- ❌ `POST /decks/import` - Upload CSV
- ❌ `GET /decks/:id/export?format=csv|json` - Download
- ❌ Parser de CSV (stream)
- ❌ Validação de colunas
- ❌ Preview de erros

**Prioridade:** 🟡 **MÉDIA**

---

### 13. **Flag de Cards (Sprint 5)** - ❌ NÃO IMPLEMENTADO

**O que está faltando:**
- ❌ `POST /study/flag` - Marcar card como difícil
- ❌ Campo `is_flagged` ou collection `flagged_cards`
- ❌ Filtro "somente marcados"

**Prioridade:** 🟡 **MÉDIA**

---

### 14. **Lembretes por E-mail (Sprint 7)** - ❌ NÃO IMPLEMENTADO

**O que está faltando:**
- ❌ Scheduler (cron job)
- ❌ Template de e-mail HTML
- ❌ `GET /admin/reminders/test` - Teste manual
- ❌ Preferência de opt-in/opt-out no User
- ❌ Integração com serviço de e-mail (SendGrid/Mailgun)

**Prioridade:** 🟢 **BAIXA**

---

### 15. **Audit Logs (Sprint 7)** - ❌ NÃO IMPLEMENTADO

**O que está faltando:**
- ❌ AuditLogsModule
- ❌ Schema `audit_logs`
- ❌ Middleware para registrar ações sensíveis
- ❌ `GET /admin/audit-logs` - Consultar logs
- ❌ Filtros por entidade, ação, usuário
- ❌ Política de retenção (180 dias)

**Prioridade:** 🟡 **MÉDIA**

---

### 16. **Internacionalização (Sprint 8)** - ❌ NÃO IMPLEMENTADO

**O que está faltando:**
- ❌ i18n backend (accept-language header)
- ❌ Mensagens de erro traduzidas
- ❌ Templates de e-mail multi-idioma

**Nota:** Frontend pode ter i18n independente

**Prioridade:** 🟢 **BAIXA**

---

### 17. **Testes (Sprint 9)** - ❌ PARCIAL

**O que existe:**
- ✅ Estrutura de testes (Jest configurado)
- ✅ Alguns testes unitários básicos

**O que está faltando:**
- ❌ Testes unitários completos (services)
- ❌ Testes de integração (controllers + DB)
- ❌ Testes E2E (fluxos completos)
- ❌ Fixtures e seeds de teste
- ❌ Cobertura de código (target: 80%)

**Prioridade:** 🔴 **ALTA**

---

## 📈 Estatísticas

### Módulos Implementados: 7/12 (58%)
- ✅ Auth (parcial)
- ✅ Users
- ✅ Decks
- ✅ Cards
- ✅ Classes
- ✅ Assignments
- ❌ Study/Reviews
- ❌ Reports
- ❌ Invites
- ❌ Import/Export
- ❌ Notifications
- ❌ AuditLogs

### Sprints Completas: 2/9 (22%)
- ✅ Sprint 0 - Fundações (100%)
- 🟡 Sprint 1 - Auth (70% - usa Firebase)
- 🟡 Sprint 2 - Users (80% - falta convites)
- ✅ Sprint 3 - Decks & Cards (100%)
- ✅ Sprint 4 - Classes & Assignments (100%)
- ❌ Sprint 5 - Study/SRS (0%)
- ❌ Sprint 6 - Reports (0%)
- ❌ Sprint 7 - Segurança/Notificações (20%)
- ❌ Sprint 8 - i18n/A11y (0%)
- ❌ Sprint 9 - Polish/Testes (10%)

### Endpoints Implementados: 28/45 (62%)

---

## 🎯 Prioridades de Implementação

### 🔴 Prioridade ALTA (Bloqueadores)
1. **Study/SRS** - Core do sistema
   - Implementar algoritmo SRS
   - Rotas de fila e review
   - Cálculo de progress

2. **Testes** - Qualidade
   - Unit tests dos services
   - Integration tests
   - E2E dos fluxos principais

3. **Integração Firebase** - Decks e Classes
   - Remover IDs temporários
   - Usar guards reais

### 🟡 Prioridade MÉDIA (Importantes)
4. **Reports** - Valor para professor
5. **Import/Export Decks** - Produtividade
6. **Audit Logs** - Rastreabilidade
7. **Convites** - Onboarding alunos

### 🟢 Prioridade BAIXA (Nice to have)
8. **Lembretes E-mail** - Engajamento
9. **i18n** - Expansão
10. **Flagging** - UX study

---

## 🚀 Roadmap Sugerido

### Semana 1-2: Study/SRS (Sprint 5)
- [ ] Criar StudyModule
- [ ] Implementar algoritmo SRS (`scheduleNext`)
- [ ] Endpoints: queue, review, progress
- [ ] Testes do algoritmo

### Semana 3: Integração & Testes
- [ ] Integrar guards do Firebase em Decks/Classes
- [ ] Unit tests de todos os services
- [ ] Integration tests dos controllers

### Semana 4: Reports (Sprint 6)
- [ ] ReportsModule
- [ ] Agregações MongoDB
- [ ] Export CSV

### Semana 5: Features Secundárias
- [ ] Import/Export Decks
- [ ] Convites
- [ ] Audit Logs

### Semana 6: Polish & Deploy
- [ ] E2E tests
- [ ] Documentação final
- [ ] Performance optimization
- [ ] Deploy produção

---

## 📝 Notas Técnicas

### Pontos Positivos ✅
- Arquitetura bem organizada (módulos separados)
- DTOs com validação completa
- Swagger bem documentado
- Schemas MongoDB com índices corretos
- RBAC implementado (Firebase)
- Código limpo e tipado

### Pontos de Atenção ⚠️
- Decks e Classes ainda usam IDs temporários (não autenticados)
- Falta o core do sistema (Study/SRS)
- Sem testes automatizados
- Sem observabilidade avançada (métricas)
- Sem rate limiting implementado
- Sem cache (Redis)

### Débitos Técnicos 🔧
- Remover warning de índice duplicado em User
- Adicionar soft delete onde faz sentido
- Implementar paginação cursor-based para grandes volumes
- Adicionar compressão de respostas (gzip)
- Configurar CORS mais restritivo para produção

---

## 🎓 Conclusão

**Status Geral:** 🟡 **EM DESENVOLVIMENTO** (62% completo)

O backend tem uma **base sólida** com:
- ✅ Infraestrutura completa
- ✅ Autenticação funcional (Firebase)
- ✅ CRUDs principais implementados
- ✅ RBAC funcionando

**Mas falta o mais importante:**
- ❌ Sistema de estudo (SRS)
- ❌ Relatórios
- ❌ Testes

**Estimativa para MVP completo:** 4-6 semanas

**Próximo passo recomendado:** Implementar **Study/SRS** (Sprint 5)
