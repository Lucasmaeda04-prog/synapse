# Guia de Deploy na Vercel

## ⚠️ Problema Comum: Tela em Branco ou "Carregando aplicação..." Infinito

Se você vê uma tela em branco, tela de loading infinita, ou nenhum conteúdo visual na Vercel mas funciona no `npm run dev`, siga este guia.

## 🔍 Como Diagnosticar o Problema

Após fazer deploy, **abra o Console do Navegador (F12)** e verifique:

### ✅ Caso 1: Vê logs começando com "🚀 Synapse iniciando..."
Se você vê os logs de inicialização, o problema pode ser:
- Variáveis de ambiente faltando (veja abaixo)
- Erro na inicialização do Firebase
- Problema de conectividade com a API

### ❌ Caso 2: Não vê nenhum log
Se não há nenhum log no console:
- Verifique se há erros de carregamento de arquivos JS/CSS (tab Network)
- Pode ser problema com o build ou configuração da Vercel

### 🔴 Caso 3: Erro "Variáveis de ambiente do Firebase não configuradas"
**SOLUÇÃO**: Configure as variáveis de ambiente na Vercel (veja seção 2 abaixo)

## Soluções Aplicadas

### 1. Arquivo vercel.json ✅
O arquivo `vercel.json` já está configurado para funcionar com React Router (SPA).

### 2. Variáveis de Ambiente (CRÍTICO) ⚠️

**Você DEVE configurar as variáveis de ambiente na Vercel**, caso contrário a aplicação não funcionará.

#### Passos:

1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável abaixo:

```bash
# Firebase Configuration (OBRIGATÓRIO)
VITE_FIREBASE_API_KEY=AIzaSyAErY4NziC-Uu58S4Z4k5KqtdEpovy3H5E
VITE_FIREBASE_AUTH_DOMAIN=synapse-d47d8.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=synapse-d47d8
VITE_FIREBASE_STORAGE_BUCKET=synapse-d47d8.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=318482974155
VITE_FIREBASE_APP_ID=1:318482974155:web:7076746d4af6b2a49ce24e

# API Configuration (IMPORTANTE)
VITE_API_URL=https://sua-api-de-producao.com

# App Configuration
VITE_APP_NAME=Synapse
```

4. **IMPORTANTE**: Substitua `VITE_API_URL` pela URL da sua API em produção
5. Marque as variáveis para todos os ambientes (Production, Preview, Development)
6. Salve e faça um novo deploy

### 3. Verificação

Após configurar as variáveis:

1. Vá em **Deployments** → **Redeploy**
2. Ou faça um novo push para a branch

#### Console do Navegador

Se ainda houver problemas, abra o console (F12) e verifique:
- ✅ **Sem erros**: Tudo configurado corretamente
- ❌ **"Variáveis de ambiente do Firebase não configuradas"**: Configure as variáveis na Vercel
- ❌ **"Failed to fetch"**: Verifique a URL da API (`VITE_API_URL`)

## Checklist de Deploy

- [ ] Arquivo `vercel.json` está no repositório
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] `VITE_API_URL` aponta para a API de produção (não localhost)
- [ ] Redeploy feito após configurar variáveis
- [ ] Console do navegador sem erros

## Problemas Conhecidos

### Tela em Branco
**Causa**: Variáveis de ambiente não configuradas
**Solução**: Configure as variáveis na Vercel (veja seção 2)

### 404 nas Rotas
**Causa**: `vercel.json` faltando ou incorreto
**Solução**: O arquivo já está configurado, certifique-se de fazer commit

### Erro de API
**Causa**: `VITE_API_URL` aponta para localhost
**Solução**: Configure a URL da API de produção na Vercel

## Suporte

Se o problema persistir:
1. Abra o console do navegador (F12) e capture os erros
2. Verifique os logs de build na Vercel
3. Verifique se todas as variáveis foram salvas corretamente
