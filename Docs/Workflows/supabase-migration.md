---
name: supabase-migration-types-quick
description: Guia rápido para migration no Supabase e atualização de tipos TypeScript.
---

# Supabase Migration (Quick)

## Instruções

1. Planeje
   - Defina a alteração no schema antes de mexer no frontend.
   - Cheque impacto em RLS.

2. Gere e revise a migration
   - `supabase db diff -f nome_da_mudanca`
   - Revise o SQL em `supabase/migrations`.
   - Aplique localmente conforme o fluxo do projeto.

3. Atualize tipos (crítico)
   - Rode `npm run update-types`.
   - Alternativa: `supabase gen types typescript --local > src/types/supabase.ts`.

4. Valide
   - Frontend compila com os tipos novos.
   - RLS permite acesso legítimo e bloqueia acesso indevido (teste negativo).

## Exemplos

### Exemplo 1: Pipeline mínima

- `supabase db diff -f add_column_x`
- Revisar migration em `supabase/migrations`
- Aplicar localmente
- `npm run update-types`
- Rodar build/typecheck do projeto
