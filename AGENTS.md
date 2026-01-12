# AGENTS.md - Orquestrador de Contexto Principal (Template)

## Visão Geral do Projeto

**Projeto:** [NOME_DO_PROJETO]  
**Tecnologia:** [TECNOLOGIAS_PRINCIPAIS]  
**Objetivo:** [OBJETIVO_PRINCIPAL_DO_PROJETO]  

### Arquitetura Técnica
- **Frontend:** [FRAMEWORK_FRONTEND]
- **Backend:** [FRAMEWORK_BACKEND]
- **Database:** [BANCO_DE_DADOS]
- **State Management:** [ESTADO_GLOBAL]
- **Build Tool:** [BUILD_TOOL]
- **Package Manager:** [PACKAGE_MANAGER]

## Agentes Especializados e Personas

### @orchestrator (Principal)
**Função:** Orquestrador principal do contexto e coordenador de tarefas  
**Responsabilidades:**
- Gerenciar fluxo de trabalho entre agentes
- Manter contexto global do projeto
- Alocar recursos e priorizar tarefas
- Tomar decisões arquiteturais

### @analyst
**Função:** Análise de requisitos e especificações  
**Responsabilidades:**
- Analisar requisitos funcionais e não funcionais
- Documentar especificações técnicas
- Identificar dependências e riscos
- Validar escopo do projeto

### @dev
**Função:** Desenvolvimento e implementação  
**Responsabilidades:**
- Implementar features conforme especificações
- Escrever código limpo e documentado
- Realizar testes unitários e integração
- Otimizar performance

### @architect
**Função:** Design arquitetural e técnico  
**Responsabilidades:**
- Definir estrutura de arquivos e componentes
- Estabelecer padrões de código
- Design de APIs e integrações
- Planejamento de escalabilidade

### @qa
**Função:** Controle de qualidade e testes  
**Responsabilidades:**
- Executar testes funcionais
- Validar requisitos de UX/UI
- Identificar e documentar bugs
- Garantir qualidade de entrega

## Instruções Críticas e Regras

### Regras Críticas de Operação
- **NÃO USAR O BROWSER** para validação ou debugging. Solicite ao usuário que faça a validação e forneça feedback.

### Regras de Ativação de Agentes
1. **@orchestrator** sempre ativo por padrão
2. **@analyst** ativado para análise de novos requisitos
3. **@dev** ativado para implementação de features
4. **@architect** ativado para decisões de design estrutural
5. **@qa** ativado para validação e testes

### Convenções de Código
- **Nomenclatura:** [PADRÃO_NOMENCLATURA]
- **TypeScript:** [CONFIGURAÇÃO_TYPESCRIPT]
- **Componentes:** [PADRÃO_COMPONENTES]
- **CSS:** [PADRÃO_ESTILIZAÇÃO]
- **Imports:** [PADRÃO_IMPORTS]

### Estrutura de Arquivos Padrão
```
[STRUTURA_DIRETÓRIOS_PADRÃO]
```

## Contexto dos Arquivos de Documentação

### PROGRESS.md
- **Função:** Rastreamento de progresso e milestones
- **Uso:** Consultar status atual, próximos passos
- **Atualização:** Ao finalizar features significativas

### WORKFLOWS.md
- **Função:** Fluxos de trabalho padronizados
- **Uso:** Seguir processos definidos para tarefas comuns
- **Referência:** Para operações repetitivas e padrões

### BUGS.md
- **Função:** Registro e rastreamento de bugs
- **Uso:** Consultar issues conhecidos e soluções
- **Atualização:** Ao identificar novos bugs ou soluções

### docs/ (diretório)
- **Função:** Documentação detalhada e referências
- **Conteúdo:** Especificações, guias, exemplos

## Uso do MCP ByteRover

### Estratégia de Memória Persistente
1. **Registrar decisões arquiteturais** importantes
2. **Salvar soluções complexas** para reuso
3. **Documentar padrões** de código encontrados
4. **Armazenar contexto** de features desenvolvidas

### Práticas Recomendadas
- **Sincronizar AGENTS.md com ByteRover** para consistência
- **Usar referências de arquivos** para detalhamento just-in-time
- **Priorizar contexto técnico** sobre narrativas
- **Manter versões atualizadas** em ambos os sistemas

## Pendências e TODOs Atuais


## Histórico de Atualizações (Sessão Atual)

### SkillsMP Integration & Scraper Module
- **Objetivo:** Permitir busca, preview e importação de skills diretamente do SkillsMP.com.
- **Componentes Chave:**
  - `ScraperPage.tsx`: Interface principal (Busca, Logs, File Explorer, Import).
  - `skillsmpService.ts`: Cliente da API pública (`/v1/skills/ai-search`).
  - `skillsmp-proxy.js`: Proxy Node.js local para contornar CORS/WAF e fazer download de zips.
  - `skillsService.ts`: Integração com Supabase (DB + Storage).

- **Fluxo de Dados:**
  1. Busca na API SkillsMP (client-side) -> Retorna JSON.
  2. Preview de Arquivos (via Proxy) -> `http://localhost:3001/preview?url=...`.
  3. Download (via Proxy) -> `http://localhost:3001/download?url=...` -> Blob.
  4. Extração Local (JSZip) -> Filtra arquivos relevantes (suporta subpastas).
  5. Upload para Supabase Storage -> Salva arquivos individuais.
  6. Registro no Banco -> Tabela `skills` e `skill_files`.

- **Requisitos de Banco de Dados (Supabase):**
  - Tabela `skills` deve ter colunas: `url`, `storage_path`, `stars`, `forks`, `remote_updated_at`.
  - Tabela `skill_files` par armazenar metadados dos arquivos.

## Regras de Engajamento

### Para Novas Sessões (Development Setup)
1. **Ler AGENTS.md** primeiro para contexto global.
2. **INICIAR AMBIENTE (Obrigatório para SkillsMP):**
   - **Terminal 1 (Proxy):** `node skillsmp-proxy.js` (Deve rodar na porta 3001).
     - *Necessário para downloads, previews e contorno de CORS/WAF.*
   - **Terminal 2 (Frontend):** `npm run dev` (Porta 8080).
   - **Validação:** Acesse `http://localhost:3001` no browser para checar se o proxy está ativo.

### Para Tomada de Decisão
1. **Analisar impacto** no arquitetura existente
2. **Consultar documentação** relevante
3. **Registrar decisão** no ByteRover
4. **Atualizar arquivos** afetados

### Para Comunicação
- **Ser direto e técnico** nas implementações
- **Documentar razões** para decisões importantes
- **Referenciar arquivos** específicos quando aplicável
- **Usar tags @agent** para direcionar responsabilidade

## Referências e Links Rápidos

### Links Locais
- `PROGRESS.md` - Status e roadmap do projeto
- `WORKFLOWS.md` - Processos e padrões
- `BUGS.md` - Issues e soluções conhecidas
- `docs/` - Documentação detalhada

### Links Externos
- [DOCUMENTACAO_PRINCIPAL]
- [DOCUMENTACAO_FRAMEWORK]
- [DOCUMENTACAO_BANCO_DE_DADOS]
- [OUTROS_LINKS_RELEVANTES]

---

**Importante:** Este arquivo serve como orquestrador principal e deve ser mantido em sincronia com o MCP ByteRover para garantir consistência do contexto através das sessões.

---

## INSTRUÇÕES DE USO DO TEMPLATE

### Para usar este template em um novo projeto:

1. **Copie o arquivo** para a raiz do novo projeto
2. **Substitua os placeholders** entre colchetes [ ]:
   - [NOME_DO_PROJETO] → Nome real do projeto
   - [TECNOLOGIAS_PRINCIPAIS] → Ex: React + TypeScript + Node.js
   - [OBJETIVO_PRINCIPAL] → Objetivo claro e conciso
   - [FRAMEWORK_FRONTEND] → Ex: React, Vue, Angular
   - [FRAMEWORK_BACKEND] → Ex: Node.js, Python, Java
   - [BANCO_DE_DADOS] → Ex: PostgreSQL, MongoDB, MySQL
   - [ESTADO_GLOBAL] → Ex: Redux, Context API, Zustand
   - [BUILD_TOOL] → Ex: Vite, Webpack, Parcel
   - [PACKAGE_MANAGER] → Ex: npm, yarn, pnpm
   - [PADRÃO_NOMENCLATURA] → Ex: PascalCase, camelCase
   - [CONFIGURAÇÃO_TYPESCRIPT] → Ex: Strict mode habilitado
   - [PADRÃO_COMPONENTES] → Ex: Funcionais com hooks
   - [PADRÃO_ESTILIZAÇÃO] → Ex: Tailwind CSS, Styled Components
   - [PADRÃO_IMPORTS] → Ex: Organizados por tipo
   - [STRUTURA_DIRETÓRIOS_PADRÃO] → Estrutura de pastas do projeto
   - [PRIMEIRA_TAREFA_IMPORTANTE] → Primeira tarefa do projeto
   - [SEGUNDA_TAREFA_IMPORTANTE] → Segunda tarefa
   - [TERCEIRA_TAREFA_IMPORTANTE] → Terceira tarefa
   - [QUARTA_TAREFA_IMPORTANTE] → Quarta tarefa
   - [DEPENDENCIA_CRITICA_1] → Primeira dependência crítica
   - [DEPENDENCIA_CRITICA_2] → Segunda dependência crítica
   - [DEPENDENCIA_CRITICA_3] → Terceira dependência crítica
   - [DOCUMENTACAO_PRINCIPAL] → Link da doc principal
   - [DOCUMENTACAO_FRAMEWORK] → Link do framework
   - [DOCUMENTACAO_BANCO_DE_DADOS] → Link do banco
   - [OUTROS_LINKS_RELEVANTES] → Outros links úteis

3. **Adapte as regras** conforme necessário para o projeto específico
4. **Configure os agentes** conforme as necessidades do time
5. **Integre com ByteRover** para memória persistente

Este template pode ser usado como base para QUALQUER tipo de projeto (web, mobile, backend, etc.) com as devidas adaptações.
