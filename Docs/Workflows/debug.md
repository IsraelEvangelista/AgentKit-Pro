---
name: debug-qa-check
description: Diagnostica e corrige falhas de type-check, lint e build com validação final.
---

# Debug & QA Check

## Instruções

1. Faça o diagnóstico inicial
   - Antes de alterar código, rode as verificações para entender o estado atual.
   - Execute, nesta ordem:
     - Type check (ex: `npm run type-check` ou `tsc --noEmit`)
     - Lint (ex: `npm run lint`)
     - Build de produção (ex: `npm run build`)

2. Analise logs com ceticismo
   - Se houver erros, não corrija no escuro.
   - Leia a mensagem completa do terminal e identifique:
     - Arquivo(s) e linha(s) afetados
     - Stack trace
     - Comando que falhou
   - Se o erro for obscuro, pesquise usando apenas a mensagem sanitizada (sem segredos/PII).

3. Aplique a estratégia de correção por categoria
   - TypeScript:
     - Corrija tipos na origem (interfaces, contratos, retornos e nullability).
     - Não use `any` para silenciar erro, salvo instrução explícita.
   - Lint:
     - Tente primeiro `npm run lint -- --fix`.
     - Se persistir, ajuste o código respeitando as regras do projeto.
   - Build:
     - Verifique imports circulares.
     - Verifique variáveis de ambiente exigidas no build.
     - Verifique dependências ausentes ou versões incompatíveis.

4. Revalide até zerar falhas
   - Após cada correção, rode novamente o diagnóstico inicial.
   - Encerre apenas quando type-check, lint e build passarem (exit code 0).

## Exemplos

### Exemplo 1: TypeScript falhando por tipo incompatível

- Rodar `tsc --noEmit`.
- Localizar o arquivo e linha indicados.
- Ajustar o tipo no contrato (interface) ou na transformação de dados.
- Rodar novamente `tsc --noEmit` para confirmar.

### Exemplo 2: Lint com correção automática

- Rodar `npm run lint -- --fix`.
- Reexecutar `npm run lint` para confirmar que não sobrou erro.
- Se ainda falhar, corrigir manualmente e rodar novamente.

### Exemplo 3: Build quebrando por variável de ambiente

- Rodar `npm run build`.
- Identificar a variável faltante no erro.
- Garantir que a variável esteja documentada e disponível no ambiente de build.
- Rodar `npm run build` novamente até passar.
