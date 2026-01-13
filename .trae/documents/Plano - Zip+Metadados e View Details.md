## Contexto Atual (o que já existe)
- O import atual extrai o ZIP e faz upload de cada arquivo individualmente no bucket `skills`, criando registros em `skill_files` com `file_path` e `storage_path`.
- O modal `View Details` lista `skill_files` por `skill_id` e baixa o conteúdo via `storage_path`.

## Objetivo (novo)
- Fase 1: mudar o fluxo para capturar/armazenar o ZIP como artefato principal e registrar metadados completos da árvore (pastas/arquivos) no banco.
- Fase 2: atualizar o modal para visualizar a estrutura (árvore) e abrir arquivos (ex.: `SKILL.md`) a partir do ZIP, com renderização Markdown para `.md`.

## Fase 1 — ZIP + Metadados + CRUD
### 1) Modelo de dados (DB)
- **Skills**
  - Garantir um campo canônico para o caminho do ZIP no Storage (sugestão: `zip_storage_path` em `skills`).
  - Manter `source_url` (SkillsMP/GitHub) e `metadata` (JSONB) para informações complementares.
- **skill_files (alteração solicitada)**
  - Ampliar a tabela para representar **a estrutura completa**, incluindo pastas.
  - Mudanças sugeridas:
    - `node_type TEXT NOT NULL` (`'file' | 'dir'`) para representar pastas também.
    - `path TEXT NOT NULL` (caminho completo relativo dentro do ZIP, ex.: `src/utils/a.ts` ou `src/utils/`).
    - `dir_path TEXT NOT NULL` (ex.: `src/utils/`), para facilitar agrupamento/árvore.
    - `basename TEXT NOT NULL` (ex.: `a.ts`).
    - `ext TEXT` (ex.: `.ts`).
    - `depth INT` (nível na árvore).
    - `size_bytes BIGINT` (para `file`).
    - `content_type TEXT` (para `file`).
    - `zip_internal_path TEXT` (igual ao `path`, mas explícito que é interno ao zip).
    - `content_storage_path TEXT NULL` (opcional, para cache futuro se o senhor quiser materializar alguns arquivos fora do zip).
    - Índices: `(skill_id, path)` único; índice em `(skill_id, dir_path)`.
- **RLS (qualidade e segurança)**
  - Ajustar policies de `skill_files` para não serem `true` em produção.
  - Política recomendada: permitir SELECT/INSERT/DELETE apenas quando o `skill_id` pertencer ao `user_id` em `skills` (join/exists).
  - Incluir testes negativos (consulta negada para skill de outro usuário) conforme sua regra.

### 2) Storage
- Bucket `skills` continua.
- Convenção de caminho do ZIP:
  - `userId/skillSlug/skill.zip` (ou `userId/skillId/skill.zip` para evitar colisão/renome).
- O ZIP vira o artefato de referência; a árvore/manifesto fica no DB.

### 3) Fluxo de import (SkillsMP → Storage+DB)
- Passos propostos:
  1. Baixar o ZIP da fonte (SkillsMP).
  2. Upload do ZIP inteiro para Storage (`zip_storage_path`).
  3. Abrir o ZIP com JSZip no frontend (sem extrair para Storage).
  4. Gerar a lista de nós (dirs + files) e persistir em `skill_files` (metadados completos).
  5. Criar/atualizar registro em `skills` apontando para `zip_storage_path`.
- Trade-off (senhor decide):
  - **Pró**: menos uploads/requests (1 upload vs centenas), mantém estrutura intacta, custo menor.
  - **Contra**: preview exige baixar o ZIP (pode ser pesado). Mitigação: cache do blob do ZIP em memória no modal; opcional `content_storage_path` para cache de arquivos mais acessados.

### 4) CRUD
- Create:
  - Inserir `skills` + upload ZIP + inserir `skill_files` (bulk insert).
- Read:
  - `getStoredSkills` deve retornar `zip_storage_path` corretamente.
  - `getSkillFiles(skillId)` passa a retornar nós (dirs/files) ordenados por `path`.
- Delete:
  - Excluir `skills` (cascade apaga `skill_files`).
  - Remover o ZIP do Storage (e opcionalmente caches) pelo prefixo.

## Fase 2 — Visualização no Modal “View Details”
### 1) Árvore de arquivos/pastas
- Trocar a lista plana por árvore baseada em `dir_path + basename + depth`.
- Exibir pastas colapsáveis e arquivos clicáveis.
- Mostrar `path` completo no breadcrumb/linha superior.

### 2) Abrir arquivo via ZIP
- Ao selecionar um arquivo:
  - Baixar o ZIP uma vez (usando `zip_storage_path` da skill).
  - Abrir com JSZip no browser.
  - Ler `zip_internal_path` e exibir conteúdo.
- Renderização:
  - Para `.md`: renderizar com `react-markdown` + `rehype-highlight`.
  - Para outros textos: manter `<pre>`.
  - Para binários: mostrar mensagem e botão de download (sem tentar `.text()`).

### 3) Performance/UX
- Cache do ZIP no estado do modal (evita re-download a cada arquivo).
- Indicadores de loading separados: “carregando árvore” vs “carregando ZIP” vs “carregando arquivo”.

## Ajustes Necessários (inconsistências atuais a corrigir no caminho)
- Padronizar campos entre TS e DB:
  - `skills.source_url` vs `Skill.url`.
  - `skills.storage_path` hoje é ambíguo; passar a usar `zip_storage_path` (e mapear no serviço).
- Padronizar `status` (UI usa labels, DB usa `active`). Escolher um padrão e mapear (ex.: armazenar `active/paused/archived` no DB e mapear para labels na UI).

## Entrega em AGENTS.md (o que será atualizado)
- Inserir um bloco em “Histórico de Atualizações (Sessão Atual)” contendo este plano dividido em:
  - Fase 1 (ZIP + metadados + CRUD + RLS)
  - Fase 2 (Modal árvore + preview via ZIP)

## Validação (sem browser por minha parte)
- Validação de schema/policies via scripts SQL + testes negativos.
- Validação funcional: senhor testa no app (8080): importar uma skill com `SKILL.md` + subpastas e confirmar:
  - árvore aparece,
  - abrir `SKILL.md` renderiza,
  - abrir outros arquivos mostra conteúdo,
  - acesso a skill de outro usuário é negado.
