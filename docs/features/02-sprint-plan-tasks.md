# Plano de Sprints 

## Sprint 1 (Fundamentos Auth & Infra)
- Base de Autenticação: Endpoints login/logout/me com JWT, hash seguro e rate limit inicial.
- Proteções Básicas: Guards JWT, stub de roles, rotas health/ready e logger com request-id.
- Integração Frontend Auth: Contexto/AuthProvider, interceptors API, ProtectedRoute e fluxo login/logout.
- Documentação Técnica Inicial: Swagger básico, formato padronizado de erros e README de auth.
- Hardening Inicial: Helmet, CORS restrito, estrutura de logs e baseline de segurança.

## Sprint 2 (Usuários & Convites)
- Gestão de Usuários: CRUD do perfil próprio e criação/atualização por admin com validações.
- Convites de Alunos: Gerar tokens expirados e aceitar convite vinculando aluno.
- Perfil do Usuário: Tela para editar dados, idioma e preferência de tema.
- Auditoria Inicial: Registro de eventos user.created, invite.sent e invite.accepted.
- Interface de Convites: UI para enviar, listar pendentes e aceitar convites.

## Sprint 3 (Decks & Cards)
- Decks & Filtros: Listagem paginada com busca e filtros por tag/proprietário.
- CRUD Decks & Tags: Criar/editar/excluir decks e gerenciar tags associadas.
- Cards & Contagem: CRUD de cards atualizando contador e evitando duplicados críticos.
- Import/Export Decks: Importar CSV simples (frente;verso) e exportar JSON do deck.
- UI Edição Conteúdo: Forms deck/card com RHF + Zod e feedback de validação.

## Sprint 4 (Turmas & Publicação)
- Gestão de Turmas: CRUD de turmas e associação/remoção de alunos.
- Publicação de Decks: Atribuir/remover deck em turma criando assignments.
- Conteúdo Atribuído (Aluno): Lista de decks publicados e status de progresso.
- Interface da Turma: Visão consolidada de alunos e decks ativos com ações rápidas.
- Auditoria Publicação: Log de publish/unpublish com metadados (quem, quando, deck).

## Sprint 5 (Estudo & SRS v1)
- Algoritmo SRS v1: Função scheduleNext com intervalo básico e due date.
- Fila de Estudo: Endpoint queue ordenando por due e prioridade.
- Registro de Reviews: Endpoint review atualizando progress e histórico.
- Interface Estudo: UI sessão (flip, avaliação, atalhos teclado, progresso sessão).
- Marcação de Cartas: Flag e filtro para revisões marcadas/difíceis.

## Sprint 6 (Relatórios & Métricas)
- Relatório Professor: Agregações turma/deck (acertos, pendentes, engajamento).
- Relatório Aluno: Resumo por deck (acurácia, cartas due, progresso).
- Exportação CSV Relatórios: Geração de CSV com métricas selecionadas.
- Dashboard Turma: Gráficos principais (barras progresso, linha revisões) com Recharts.
- Métricas de Progresso: Cálculo accuracy/retention e persistência para consultas.

## Sprint 7 (Notificações & Auditoria Ampliada)
- Lembrete Diário: Scheduler selecionando alunos com cartas atrasadas.
- Template de E-mail: Layout HTML acessível com decks e link de estudo.
- UI Logs Auditoria: Tela de eventos com filtros por tipo/usuário/data.
- Recuperação de Senha: Fluxo forgot/reset com token temporário e validações.
- Sanitização & Segurança: Sanitizar inputs, mascarar dados sensíveis e ampliar rate limits.

## Sprint 8 (i18n, Acessibilidade & Polimento)
- Internacionalização Base: Configurar i18next e namespaces core (common, auth, decks).
- Tradução Domínios: Localizar strings Auth/Decks/Study/Reports (pt/en).
- Acessibilidade & Atalhos: ARIA roles, foco consistente e modal de ajuda com atalhos.
- Otimizações Performance: Code splitting por rota e prefetch de queries críticas.
- Tema Refinado: Ajustes dark/light, tokens de cor e contraste AA.

## Sprint 9 (Estabilização & Release)
- Testes End-to-End & QA: Cenários críticos (login→estudo→relatório) e correções.
- Documentação Final: README, .env.example e guia de deploy atualizado.
- Checklist Segurança Final: Revisão headers, validações, dependências e scans.
- Ajustes Finais SRS: Calibração parâmetros a partir de métricas reais.
- Preparação Release: Pipeline final, observabilidade (OTel) e shell mobile inicial.

