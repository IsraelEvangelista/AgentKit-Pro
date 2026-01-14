# AGENTS.md - Orquestrador de Contexto Principal

## Visão Geral do Projeto

**Projeto:** AgentKit-Pro
**Tecnologia:** React + TypeScript + Vite + Supabase + Node.js
**Objetivo:** Plataforma cyberpunk-styled para catálogo e gerenciamento de Agent Skills de IA com integração ao SkillsMP.com

### Arquitetura Técnica
- **Frontend:** React com TypeScript + Vite
- **Backend:** Node.js (Vercel Serverless Functions + Local Proxy)
- **Database:** Supabase (PostgreSQL com Storage)
- **State Management:** React Context + useState + Custom Hooks
- **Build Tool:** Vite
- **Package Manager:** npm

## Páginas e Componentes Principais

### Páginas
- **`DashboardPage.tsx`** - Dashboard principal com cards de skills, estatísticas e gerenciamento
- **`SearchPage.tsx`** - Busca e importação de skills do SkillsMP (antiga "Catalog & Scrape")
- **`LoginPage.tsx`** - Autenticação via GitHub OAuth

### Componentes
- **`Layout.tsx`** - Layout principal com sidebar responsiva, navegação e exibição de avatar
- **`AvatarCropper.tsx`** - Modal de crop circular para ajuste de avatar com zoom e movimento
- **`CategorySelector.tsx`** - Modal para seleção/criação de categorias de skills

## Sistema de Roteamento

### Hash Routing Implementado
- **Hook Personalizado:** `hooks/useHashRouter.ts`
- **URLs:**
  - `#/dashboard` - Dashboard
  - `#/search` - Busca de skills
  - `#/settings` - Configurações
- **Navegação:** Botões "voltar/avançar" do navegador funcionam corretamente
- **Sincronização:** Estado interno sincronizado com URL hash

## Sistema de Categorias

### Categorias Pré-definidas (SkillsMP)
1. 🛠️ **Tools** - 18,395 skills
2. 💻 **Development** - 16,232 skills
3. 🧠 **Data & AI** - 10,958 skills
4. 💼 **Business** - 9,388 skills
5. ⚙️ **DevOps** - 9,079 skills
6. 🛡️ **Testing & Security** - 6,727 skills
7. 📄 **Documentation** - 4,708 skills
8. 🎨 **Content & Media** - 4,693 skills
9. 🔍 **Research** - 2,283 skills
10. 🗄️ **Databases** - 1,348 skills
11. ❤️ **Lifestyle** - 1,177 skills
12. ⛓️ **Blockchain** - 502 skills

### Banco de Dados
- **Tabela `categories`**: Armazena categorias (pré-definidas + customizadas)
- **FK `skills.category_id`**: Referência para categoria selecionada
- **RLS Policies:** Usuários podem ver todas as categorias, mas só modificar as próprias

## Sistema de Avatar/Profile Photo

### Componentes de Avatar
- **`AvatarCropper.tsx`**: Modal para crop circular de avatar
  - Usa `react-easy-crop` para crop interativo
  - Suporte a zoom (min: 0.5x, max: 3x)
  - Movimentação livre dentro da área circular
  - **IMPORTANTE:** `restrictPosition` está REMOVIDO (usa default=true) para evitar coordenadas negativas

- **`Layout.tsx`**: Exibição do avatar na sidebar
  - Busca avatar da tabela `profiles.avatar_url` (prioridade)
  - Fallback para `user.avatar` do Supabase Auth (GitHub avatar)

- **`SettingsPage.tsx`**: Página de configuração com upload de avatar

### Services
- **`services/avatarService.ts`**:
  - `uploadAvatar()` - Upload de arquivo para Supabase Storage
  - `deleteAvatar()` - Remoção de arquivo do Storage
  - `getSignedAvatarUrl()` - Gera URL assinada para avatares privados
  - `getPublicAvatarUrl()` - Retorna URL pública do bucket avatars

### Banco de Dados (Storage)
- **Bucket `avatars`**: Armazena fotos de perfil dos usuários
  - **Público:** `public = true` (configurado via migration)
  - **RLS Policy:** "Anyone can view avatars" (acesso público leitura)
  - **Estrutura:** `avatars/{userId}/avatar.{ext}`

### Tabela `profiles`
```sql
avatar_url TEXT -- URL pública do avatar no Supabase Storage
```

### Fluxo de Upload de Avatar
1. Usuário seleciona arquivo de imagem (input type="file")
2. FileReader converte para data URL
3. AvatarCropper abre modal com `react-easy-crop`
4. Usuário ajusta zoom e posição
5. Ao confirmar, canvas faz crop da área selecionada
6. Blob convertido para WebP (melhor compressão)
7. Upload para Supabase Storage (`avatars/{userId}/avatar.webp`)
8. URL pública gerada e salva em `profiles.avatar_url`
9. Preview atualizado com blob URL local
10. Sidebar atualizada automaticamente via useEffect

### Configurações Críticas do react-easy-crop
```typescript
<Cropper
  image={image}
  crop={crop}
  zoom={zoom}
  aspect={1}
  cropShape="round"
  // NÃO usar restrictPosition={false} - causa coordenadas negativas
  minZoom={0.5}
  maxZoom={3}
  zoomWithScroll={true}
  showGrid={false}
  onCropChange={setCrop}
  onZoomChange={setZoom}
  onCropComplete={onCropComplete}
/>
```

## Estrutura do Projeto

### Organização de Pastas
```
AgentKit-Pro/
├── api/                # Vercel Serverless Functions
│   ├── download.js
│   ├── github-api.js
│   ├── preview.js
│   └── skills/ai-search.js
├── components/         # React componentes reutilizáveis
├── hooks/              # Custom React hooks
├── pages/              # Páginas principais
├── scripts/            # Scripts utilitários
│   └── dev/           # Scripts de desenvolvimento
├── services/           # Lógica de negócio e APIs
├── supabase/           # Camada de dados
│   ├── dev/           # Utilitários de desenvolvimento
│   ├── docs/          # Documentação do banco
│   ├── functions/     # Edge Functions
│   └── migrations/    # Migrações do banco (ordenadas por data)
└── [config files]     # Arquivos de configuração
```

### Migrações do Banco (Supabase)
**Ordem de aplicação (cronológica):**
1. `20241201_initial_schema.sql` - Tabela profiles
2. `20241202_skills_tables.sql` - Tabelas skills e skill_files
3. `20241205_schema_fixes.sql` - Correções de schema (user_id, source_url, storage_path)
4. `20241210_schema_fixes_v2.sql` - Correções adicionais
5. `20241211_policies_update.sql` - Atualização de RLS policies
6. `20250113_create_categories_table.sql` - Sistema de categorias
7. `20250113_add_category_functions.sql` - Funções de gestão de categorias
8. `create_avatars_bucket.sql` - Bucket de avatares (privado por padrão)
9. `20260113_make_avatars_bucket_public.sql` - Torna bucket avatars público e atualiza policies
10. `dev_mock_policy.sql` - Policies de desenvolvimento
11. `skills_zip_tree.sql` - Suporte a ZIP com árvore de arquivos
12. `20260114_create_mcp_connections.sql` - Tabela para conexões MCP com tokens por usuário

**Ambiente de Desenvolvimento:**
- `dev/dev_policy.sql` - Policies permissivas para desenvolvimento local
- `dev/insert_dev_user.sql` - Usuário de teste

## Integração SkillsMP

### Arquitetura de Proxy
- **Produção:** Vercel Serverless Functions em `/api/*`
- **Desenvolvimento:** Proxy local (`skillsmp-proxy.js`) na porta 3001
- **Contorno CORS/WAF:** Proxy local bypassa restrições

### Endpoints
- **Busca:** `POST /api/skills/ai-search`
- **Download:** `POST /api/download`
- **Preview:** `POST /api/preview`
- **GitHub API:** `POST /api/github-api`

### Fluxo de Importação
1. Usuário busca skills por keywords
2. Sistema retorna resultados ordenados por stars
3. Usuário seleciona um skill e vê preview
4. **NOVO:** Usuário seleciona categoria (modal)
5. Download do ZIP e extração com JSZip
6. Indexação completa da árvore de arquivos
7. Upload do ZIP para Supabase Storage
8. Salvamento no banco com metadados + categoria

## Integração MCP (AgentKit-Pro)

### Objetivo
- Expor skills do AgentKit-Pro para IDEs/CLIs via MCP STDIO, permitindo leitura de `SKILL.md` e anexos.

### Tools MCP
1. Listar Categorias
2. Listar Nome das Skills
3. Listar Descrição da Skill escolhida
4. Carregar Skill (`SKILL.md` + anexos)

### Autenticação (token por usuário)
- Tokens são gerados na UI (aba MCP) e exibidos somente no momento da geração.
- No Supabase, o token é armazenado como hash (SHA-256) + prefixo para identificação.
- A IDE/CLI do usuário guarda o token (config `mcpServers.env.AGENTKIT_MCP_TOKEN`).
- O backend valida o token via tabela `mcp_connections` e bloqueia tokens revogados.

### Backend MCP
- Rotas em `api/mcp/*` fazem a leitura de skills/anexos no Supabase e aplicam o filtro `allowed_skill_ids` da conexão.
- Em dev, o endpoint MCP deve apontar para a origem do app (ex.: `http://localhost:8080`) e o Vite encaminha `/api/mcp/*` para o proxy local (porta 3001).

### Servidor MCP (STDIO)
- Script: `scripts/mcp/agentkit-mcp-stdio.js`
- Compatibilidade de schema: manter `inputSchema` estrito (`type: "object"`, `properties` explícito, `required` como array) para evitar incompatibilidade com alguns modelos.

### Distribuição do MCP (produção)
- Desenvolvimento local pode exigir `args[0]` com caminho absoluto no Windows (caminhos relativos podem falhar dependendo do diretório de trabalho da IDE).
- Para produção, preferir publicação como pacote npm (execução via `npx`) para não depender de path local do projeto.
- Subpacote pronto para publicação: `scripts/mcp/package.json` com bin `agentkit-pro-mcp`.

## Convenções de Código

### Nomenclatura
- **Componentes:** PascalCase (`CategorySelector.tsx`)
- **Hooks:** camelCase com prefixo `use` (`useHashRouter.ts`)
- **Services:** camelCase (`categoriesService.ts`)
- **Types:** PascalCase para interfaces (`Category`, `Skill`)

### TypeScript
- **Strict mode:** Habilitado
- **Interfaces:** Definidas em `types.ts`
- **Tipagem completa:** Sem `any` exceto para casos específicos documentados

### Componentes React
- **Funcionais** com hooks
- **Props tipadas** com interfaces
- **Event handlers:** Prefixados com `handle`

## Instruções Críticas e Regras

### Regras Críticas de Operação
- **NÃO USAR O BROWSER** para validação ou debugging. Solicite ao usuário que faça a validação e forneça feedback.

### Setup do Ambiente (Obrigatório)
1. **Terminal 1 (Proxy):** `node skillsmp-proxy.js` (Porta 3001)
2. **Terminal 2 (Frontend):** `npm run dev` (Porta 8080)
3. **Validação:** Acesse `http://localhost:3001` para verificar o proxy

### Aplicando Migrations no Supabase
```bash
# Via Supabase CLI (recomendado)
supabase db push

# Ou manualmente no Dashboard SQL Editor
# Execute as migrations em ordem cronológica
```

## Histórico de Atualizações (Sessão Atual)

### Jan 2025 - Avatar/Profile Photo System
- ✅ **AvatarCropper Component:** Modal de crop circular usando `react-easy-crop`
  - Suporte a zoom (scroll do mouse ou botões)
  - Movimentação livre dentro da área circular
  - **FIX CRÍTICO:** `restrictPosition` removido para evitar coordenadas negativas
- ✅ **Upload para Supabase Storage:**
  - Arquivo salvo como `avatar.webp` (melhor compressão)
  - URL pública gerada automaticamente
  - Extensão dinâmica baseada no tipo do arquivo
- ✅ **Layout.tsx Atualizado:** Sidebar exibe avatar do perfil com prioridade sobre avatar do GitHub
- ✅ **Bucket avatars:** Configurado como público via SQL (`20260113_make_avatars_bucket_public.sql`)
- ✅ **Delete functionality:** Botão para remover avatar do Storage e banco

### Jan 2025 - Refactoramento e Organização
- ✅ **Renomeação:** "Catalog & Scrape" → "Search"
- ✅ **Hash Routing:** Sistema de roteamento com URLs dinâmicas (`#/dashboard`, `#/search`)
- ✅ **Categorias:** Sistema completo com 12 categorias pré-definidas + customização
- ✅ **Organização:** Migrações organizadas em `supabase/migrations/`
- ✅ **Modal CategorySelector:** Componente modal overlay (não mais inline)
- ✅ **Limpeza:** Scripts movidos para `scripts/dev/`, zero SQL files na raiz

### SkillsMP Integration (Implementado Anteriormente)
- ✅ Busca semântica com preview em tempo real
- ✅ Download de ZIPs com indexação de árvore
- ✅ Modal "View Details" com preview de arquivos
- ✅ Integração completa com Supabase Storage

### Jan 2026 - MCP (STDIO) e Tokens por Usuário
- ✅ Aba MCP em `SettingsPage.tsx` com geração/rotação de token e seleção de skills ativas (allowlist).
- ✅ Migração `20260114_create_mcp_connections.sql` para conexões MCP por usuário (token hash/prefix + RLS).
- ✅ Servidor MCP STDIO em `scripts/mcp/agentkit-mcp-stdio.js` com 4 tools.
- ✅ Rotas backend MCP em `api/mcp/*` com validação por Bearer token.
- ✅ Subpacote npm do MCP em `scripts/mcp/` para distribuição via `npx` (pendente publicar).

## Links Rápidos

### Documentação Local
- `PROJECT_STRUCTURE.md` - Estrutura completa do projeto
- `supabase/README.md` - Documentação do banco de dados
- `README.md` - Documentação principal do projeto

### Links Externos
- **Supabase:** https://supabase.com/docs
- **Vite:** https://vitejs.dev/
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/

---

**Importante:** Este arquivo serve como orquestrador principal e deve ser mantido em sincronia com o MCP ByteRover para garantir consistência do contexto através das sessões.
