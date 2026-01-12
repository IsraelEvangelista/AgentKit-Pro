---
name: ui-component-creation
description: Padroniza criação de componentes de UI com consistência e acessibilidade.
---

# UI Component Creation

## Instruções

1. Verifique se já existe algo similar
   - Antes de criar, procure um componente equivalente em `src/components/ui`.
   - Se existir, estenda ou componha; não duplique.

2. Defina estrutura e convenções do arquivo
   - Localização:
     - `src/components/` para componentes funcionais
     - `src/components/ui/` para componentes base
   - Nomeação: PascalCase (ex: `UserProfileCard.tsx`).
   - Ícones: priorize `lucide-react`.

3. Implemente com padrões do projeto
   - Tipagem: defina uma `interface Props` explícita.
   - Evite `React.FC` salvo necessidade clara; prefira função direta.
   - Estilo: use apenas Tailwind CSS.
   - Evite `.css` separado e evite `style={{}}` inline.
   - Mobile-first: classes base para mobile; use `md:` e `lg:` para desktop.

4. Garanta acessibilidade (obrigatório)
   - Imagens possuem `alt`.
   - Botões sem texto possuem `aria-label`.
   - Texto e fundo possuem contraste legível.

## Exemplos

### Exemplo 1: Criar componente novo em src/components/

- Nome: `UserProfileCard.tsx`.
- Passos:
  - Verificar se existe card similar em `src/components/ui`.
  - Criar componente com `interface Props`.
  - Usar Tailwind para layout mobile-first.
  - Se usar ícone, importar de `lucide-react`.

### Exemplo 2: Reaproveitar componente existente

- Cenário: Já existe um `Card` base em `src/components/ui`.
- Passos:
  - Compor `Card` com `UserProfileCard` ao invés de duplicar estilos.
  - Manter o comportamento e acessibilidade do componente base.
