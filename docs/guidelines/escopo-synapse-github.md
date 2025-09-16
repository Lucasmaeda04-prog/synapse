# 📘 Synapse – Documento de Escopo do Projeto

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Made with ❤️](https://img.shields.io/badge/made%20with-❤️-red)]()

---

## 📑 Sumário
- [1. Visão Geral](#1-visão-geral)
- [2. Usuários do Sistema](#2-usuários-do-sistema)
- [3. Fluxos de Uso](#3-fluxos-de-uso)
- [4. Histórias de Usuário](#4-histórias-de-usuário-user-stories)
- [5. Requisitos Funcionais](#5-requisitos-funcionais)
- [6. Requisitos Não Funcionais](#6-requisitos-não-funcionais)
- [7. Escopo Inicial da Versão 1 (MVP)](#7-escopo-inicial-da-versão-1-mvp)
- [8. Futuras Extensões](#8-futuras-extensões)

---

## 1. Visão Geral  
O **Synapse** é uma plataforma de aprendizado digital baseada em **repetição espaçada**, que permite a professores criarem, distribuírem e monitorarem **decks de flashcards** para suas turmas.  
O objetivo central é **aumentar a retenção de conteúdo e o engajamento dos alunos** através de um estudo personalizado e dirigido.

---

## 2. Usuários do Sistema  

| Perfil | Descrição | Principais Responsabilidades |
|--------|-----------|------------------------------|
| **Professor** | Usuário responsável por criar e gerenciar decks. | - Criar e editar decks<br>- Atribuir decks a turmas ou grupos<br>- Acompanhar desempenho dos alunos<br>- Configurar algoritmo de repetição espaçada |
| **Aluno** | Usuário que consome os decks para estudo. | - Estudar os flashcards seguindo o algoritmo<br>- Acompanhar sua evolução pessoal<br>- Receber decks atribuídos pelo professor |
| **Administrador (interno da plataforma)** | Usuário com permissões de gestão da solução. | - Gerenciar usuários e permissões<br>- Monitorar uso da plataforma<br>- Suporte técnico e auditoria |
| **Pais / Responsáveis (usuários indiretos)** | Não acessam diretamente a plataforma. | - Acompanhar relatórios enviados pelo professor |

---

## 3. Fluxos de Uso  

### 3.1. Fluxo do Professor
1. Login na plataforma.  
2. Criação ou importação de um deck de flashcards.  
3. Personalização (tags, dificuldade, ordem).  
4. Distribuição para uma turma ou grupo.  
5. Acompanhamento via painel de relatórios.  

### 3.2. Fluxo do Aluno
1. Login na plataforma.  
2. Acesso aos decks atribuídos.  
3. Estudo dos flashcards segundo algoritmo de repetição espaçada.  
4. Feedback imediato (acerto/erro/confiança).  
5. Visualização de progresso pessoal.  

### 3.3. Fluxo do Administrador
1. Login administrativo.  
2. Gerenciamento de contas de professores e alunos.  
3. Monitoramento de logs e estatísticas globais.  
4. Suporte técnico e ajustes de configuração.  

---

## 4. Histórias de Usuário (User Stories)

- **Professor**  
  - Como professor, quero **criar decks personalizados**, para que os conteúdos atendam às necessidades da minha turma.  
  - Como professor, quero **atribuir decks a grupos específicos**, para que cada turma tenha material direcionado.  
  - Como professor, quero **acompanhar relatórios de desempenho**, para ajustar minhas estratégias de ensino.  

- **Aluno**  
  - Como aluno, quero **estudar meus flashcards em qualquer dispositivo**, para ter flexibilidade de tempo e lugar.  
  - Como aluno, quero **receber feedback imediato**, para reforçar minha memorização.  
  - Como aluno, quero **visualizar meu progresso**, para acompanhar minha evolução.  

- **Administrador**  
  - Como administrador, quero **gerenciar usuários e permissões**, para garantir o uso correto da plataforma.  
  - Como administrador, quero **monitorar o sistema em tempo real**, para prevenir falhas.  

---

## 5. Requisitos Funcionais  

1. Criação e personalização de decks.  
2. Distribuição de decks para turmas/grupos.  
3. Algoritmo de repetição espaçada ajustável.  
4. Painel de monitoramento e relatórios de desempenho.  
5. Sistema de autenticação seguro.  
6. Interface responsiva e amigável.  

---

## 6. Requisitos Não Funcionais  

- **Segurança:** criptografia de dados e autenticação robusta.  
- **Performance:** resposta rápida do algoritmo e dashboards.  
- **Escalabilidade:** suporte a instituições de grande porte.  
- **Disponibilidade:** uptime de pelo menos 99,5%.  
- **Compatibilidade:** web e mobile (via Capacitor).  

---

## 7. Escopo Inicial da Versão 1 (MVP)  

- Cadastro de professores e alunos.  
- Criação e edição de decks.  
- Estudo com repetição espaçada.  
- Relatório básico de desempenho.  
- Distribuição de decks para grupos.  

---

## 8. Futuras Extensões  

- Gamificação (pontuação, medalhas, ranking).  
- Exportação/Importação de decks entre professores.  
- Integração com IA para sugestão automática de flashcards.  
- Relatórios avançados para pais/responsáveis.  
