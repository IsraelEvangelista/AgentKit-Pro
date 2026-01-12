---
name: react2shell-mitigation
description: Mitiga React2Shell (RCE) em Next.js/React e valida build sem downgrade inseguro.
---

# React2Shell Mitigation Protocol

## Instruções

1. Contexto e objetivo
   - Atue como AppSec sênior.
   - Objetivo: detectar, corrigir e validar build para mitigar a vulnerabilidade React2Shell (RCE) associada a Next.js/React Server Components.
   - Prioridade: crítica (CVSS 10.0).
   - Referências: CVE-2025-55182 / CVE-2025-66478.

2. Diagnóstico (fase 1)
   - Inspecione `package.json` e o arquivo de lock (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` ou `bun.lockb`).
   - Verifique critérios de risco:
     - Next.js 15.x: versão < 15.0.4
     - Next.js 14.x: versão < 14.2.21
     - Next.js canary: versão < 14.3.0-canary.77
     - React: 19.0.0-rc-* ou canary antigo
     - Dependência indireta: `react-server-dom-webpack` desatualizado na árvore
   - Se qualquer item estiver vulnerável, siga para remediação.

3. Remediação (fase 2)
   - Tente as estratégias em ordem, buscando uma correção estável.
   - Estratégia A (prioritária): usar o script oficial que resolve e deduplica dependências.
     - `npx fix-react2shell-next`
   - Estratégia B (fallback): atualização manual para versões mínimas seguras.
     - next: >= 15.0.4 (v15)
     - next: >= 14.2.21 (v14)
     - react: >= 19.0.0 (stable)
     - react-dom: >= 19.0.0 (stable)

4. Sanitização (fase 3)
   - Objetivo: impedir que cache/lock mantenham versões antigas.
   - Em vez de executar comandos destrutivos automaticamente, descreva claramente ao desenvolvedor o que remover e em qual ambiente executar:
     - `node_modules`
     - cache de build (ex: `.next`, `.turbo`, `dist`)
     - lockfile atual
   - Depois, reinstalar dependências do zero.

5. Validação (fase 4)
   - Confirme versões instaladas (ex: `npm list next` ou equivalente).
   - Execute build (ex: `npm run build`).
   - Regra de ouro: se o build falhar, adapte o código à versão segura. Não faça downgrade para “fazer passar”.

6. Gere relatório final (fase 5)
   - Entregue um resumo padronizado em markdown.

## Exemplos

### Exemplo 1: Relatório final

```md
### Relatório de Mitigação React2Shell
- [ ] Vulnerabilidade Detectada: Sim
- [ ] Gerenciador de Pacotes: pnpm
- [ ] Estratégia Usada: Script Auto
- [ ] Versão Final Next.js: 15.0.4
- [ ] Status do Build: Sucesso
```

### Exemplo 2: Checklist rápido

- Checar versões em `package.json` + lockfile.
- Aplicar `npx fix-react2shell-next`.
- Fazer reinstalação limpa (dev executa externamente).
- Rodar build e corrigir incompatibilidades sem downgrade.
