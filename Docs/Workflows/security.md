---
name: security-audit
description: Audita segredos, logs e acesso a dados, evitando exposição e configurações inseguras.
---

# Security Audit

## Instruções

1. Verifique credenciais e segredos
   - Procure no código por padrões comuns de chaves e tokens (ex: `sk-`, `ey`, `AIza`) e credenciais hardcoded.
   - Se encontrar, mova para `.env` e acesse via variável de ambiente (ex: `process.env`).
   - Garanta que `.env` está no `.gitignore`.
   - Garanta que existe `.env.example` sem valores reais, apenas nomes de variáveis e exemplos inofensivos.

2. Audite logs e saídas
   - Procure por logs que imprimem objetos inteiros de requisição/resposta.
   - Remova logs que possam expor senhas, tokens e dados pessoais.
   - Verifique handlers de erro (`catch`) para garantir que não retornam stack traces completos ou segredos para o cliente.

3. Verifique conectividade e dados
   - Confirme que strings de conexão (Supabase/Postgres/etc.) vêm de variáveis de ambiente.
   - Se houver um secret manager/vault no ambiente de deploy, sugira migração quando aplicável.
   - Em Supabase/Firebase, valide que RLS/controles de acesso estão ativos.
   - Nenhuma tabela com dados de usuário deve estar exposta como pública sem políticas restritivas.

4. Produza um relatório final acionável
   - Liste vulnerabilidades encontradas e correções aplicadas.
   - Para vulnerabilidade crítica que exija mudança de arquitetura, pare e escale para decisão do desenvolvedor.

## Exemplos

### Exemplo 1: Token encontrado no código

- Encontrou uma string começando com `sk-` hardcoded.
- Ação:
  - Remover do código.
  - Inserir a variável no `.env` local.
  - Garantir `.env` no `.gitignore` e atualizar `.env.example`.

### Exemplo 2: Log com risco de PII

- Encontrou `console.log(req.body)` em endpoint de cadastro.
- Ação:
  - Remover log ou mascarar campos sensíveis.
  - Garantir que nenhum token/dado pessoal aparece em logs do cliente.

### Exemplo 3: RLS ausente no Supabase

- Identificou tabela com dados de usuário sem RLS.
- Ação:
  - Ativar RLS.
  - Criar policies mínimas para SELECT/INSERT/UPDATE/DELETE.
  - Fazer teste negativo: usuário não autorizado deve receber erro/vazio.
