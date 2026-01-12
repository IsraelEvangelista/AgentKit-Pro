---
name: supabase-migration-types
description: Aplica migrações no Supabase com segurança e sincroniza tipos TypeScript.
---

# Supabase Migration & Types

## Instruções

1. Planeje a mudança antes do frontend
   - Defina a alteração no schema (tabelas/colunas/índices/constraints).
   - Verifique impacto em políticas de segurança (RLS).

2. Execute migrations com abordagem local-first
   - Não faça mudanças estruturais diretamente no dashboard de produção.
   - Gere a migration localmente:
     - `supabase db diff -f nome_da_mudanca`
   - Revise o SQL gerado em `supabase/migrations`.
   - Aplique localmente (ex: `supabase db reset`) ou use o fluxo de push conforme o projeto.

3. Sincronize tipos TypeScript (obrigatório)
   - Após aplicar a migration, atualize os tipos:
     - `npm run update-types`
     - ou `supabase gen types typescript --local > src/types/supabase.ts`
   - Se o comando falhar, trate como bloqueante e corrija antes de avançar.

4. Valide o resultado
   - O frontend compila com os novos tipos.
   - As novas colunas/tabelas estão acessíveis conforme as políticas RLS.

## Exemplos

### Exemplo 1: Adicionar coluna e atualizar tipos

- Gerar migration: `supabase db diff -f add_messages_status`.
- Revisar o SQL em `supabase/migrations`.
- Aplicar localmente.
- Atualizar tipos com `npm run update-types`.
- Confirmar que o build compila e que RLS não bloqueia fluxos legítimos.

### Exemplo 2: Mudança que exige ajuste de RLS

- Cenário: nova coluna usada em filtros de SELECT.
- Ação:
  - Ajustar policy para permitir leitura/escrita conforme regra de negócio.
  - Fazer teste negativo: usuário não autorizado deve receber erro/vazio.
