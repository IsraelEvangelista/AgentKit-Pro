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
- **`Layout.tsx`** - Layout principal com sidebar responsiva e navegação
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
8. `create_avatars_bucket.sql` - Bucket de avatares
9. `dev_mock_policy.sql` - Policies de desenvolvimento
10. `skills_zip_tree.sql` - Suporte a ZIP com árvore de arquivos

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

## Pendências e TODOs Atuais
- Implementar link para Política de Privacidade do aplicativo
- Implementar link para Termos de Serviço do aplicativo

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
