---
name: context-governance-sync
description: Sincroniza documentação de governança após epics/tasks complexas para evitar drift.
---

# Context & Governance Sync

## Instruções

1. Confirme que a entrega foi finalizada
   - Use esta skill ao concluir uma Epic ou uma task complexa.
   - Se o trabalho foi apenas exploratório e não resultou em mudança relevante, pare aqui.

2. Atualize EPICS.md
   - Marque como concluídas as tarefas entregues usando `[x]`.
   - Adicione sub-tarefas que surgiram durante o desenvolvimento.
   - Remova itens que ficaram obsoletos e que possam confundir a execução futura.

3. Atualize AGENTS.md
   - Registre decisões técnicas relevantes e verificáveis.
   - Exemplo de decisões: troca/remoção de biblioteca, padrão de pastas, convenção de comandos, políticas de qualidade.
   - Remova contexto antigo que não reflete mais o estado atual do projeto.

4. Atualize BUG.md (se aplicável)
   - Se a sessão foi para corrigir um problema, registre:
     - Sintoma
     - Passos de reprodução
     - Causa-raiz
     - Correção aplicada
     - Impacto (funcional, performance, segurança, UX)

5. Valide consistência
   - Garanta que os arquivos de governança não entram em conflito entre si.
   - Se houver divergência, ajuste o documento de maior autoridade do projeto (geralmente PRD/EPICS) e alinhe os demais.

## Exemplos

### Exemplo 1: Finalização de Epic

- Cenário: Uma Epic foi finalizada e entregou novas rotas e ajustes de autenticação.
- Ações:
  - Atualize EPICS.md marcando as tarefas entregues com `[x]` e adicionando sub-tarefas criadas durante a implementação.
  - Em AGENTS.md, registre a decisão técnica (ex: mudança no fluxo de auth, novo padrão de rotas, comandos de verificação adotados).
  - Se houve bug corrigido no caminho, registre em BUG.md (com causa-raiz e prevenção).

### Exemplo 2: Task complexa sem bug

- Cenário: Refatoração grande que reorganizou pastas e padronizou lint.
- Ações:
  - Atualize EPICS.md para refletir o que foi concluído e o que ficou de follow-up.
  - Atualize AGENTS.md com a nova convenção de estrutura e os comandos de validação.
  - Não atualize BUG.md se não houve correção de problema específico.
