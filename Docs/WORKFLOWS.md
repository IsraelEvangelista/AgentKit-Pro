# WORKFLOWS.md - Metodologia e Fluxos de Trabalho (Template)

## Visão Geral da Metodologia BMAD

**BMAD (Business Model Architecture & Development)** é uma metodologia ágil que utiliza arquitetura de sub-agentes especializados para desenvolvimento dirigido por especificações (spec-driven development).

### Arquitetura de Agentes Especializados

#### @bmad-orchestrator (Agente Principal)
**Função:** Coordenador central e gestor de contexto  
**Responsabilidades:**
- Orquestrar fluxo de trabalho entre agentes
- Gerenciar alocação de recursos
- Tomar decisões estratégicas
- Manter visão global do projeto

#### @analyst (Business Analyst)
**Função:** Análise de requisitos e especificações  
**Responsabilidades:**
- Levantar requisitos funcionais e não funcionais
- Criar especificações técnicas detalhadas
- Identificar dependências e riscos
- Validar escopo com stakeholders

#### @architect (Architect Agent)
**Função:** Design arquitetural e técnico  
**Responsabilidades:**
- Definir estrutura de software
- Estabelecer padrões e convenções
- Design de APIs e integrações
- Planejar escalabilidade e performance

#### @dev (Full Stack Developer)
**Função:** Implementação e codificação  
**Responsabilidades:**
- Implementar features conforme specs
- Escrever código limpo e testável
- Realizar refatoração quando necessário
- Otimizar performance

#### @qa (Quality Assurance)
**Função:** Garantia de qualidade e testes  
**Responsabilidades:**
- Executar testes funcionais e automatizados
- Validar requisitos de UX/UI
- Identificar e documentar bugs
- Garantir padrões de qualidade

---

## Ciclo de Trabalho PREVC

O ciclo **PREVC (Planejar, Revisar, Executar, Validar, Confirmar)** é obrigatório para cada iteração de desenvolvimento.

### P - Planejar (Plan)

**Objetivo:** Definir requisitos claros e plano de implementação  
**Responsável:** @analyst com apoio do @architect

### R - Revisar (Review)

**Objetivo:** Validação sistemática de planos e arquitetura  
**Responsável:** @architect com validação do @bmad-orchestrator

### E - Executar (Execute)

**Objetivo:** Implementação baseada no planejamento  
**Responsável:** @dev com supervisão do @architect

### V - Validar (Validate)

**Objetivo:** Testes e validação da qualidade  
**Responsável:** @qa com apoio do @dev

### C - Confirmar (Confirm)

**Objetivo:** Finalização do ciclo e documentação  
**Responsável:** @bmad-orchestrator

---

## Fluxos de Trabalho Específicos

### Workflow 1: Nova Feature
`Início → @analyst (P) → @architect (R) → @dev (E) → @qa (V) → @orchestrator (C) → Fim`

### Workflow 2: Bug Fix
`Bug Report → @qa (Análise) → @dev (E) → @qa (V) → @orchestrator (C) → Deploy`

### Workflow 3: Refatoração
`Identificação → @architect (P+R) → @dev (E) → @qa (V) → @orchestrator (C)`

---

## Comandos e Ferramentas Padrão

### Comandos de Ciclo PREVC
- `/plan` - Iniciar fase de planejamento
- `/review` - Executar fase de revisão
- `/implement` - Iniciar fase de execução
- `/validate` - Executar fase de validação
- `/confirm` - Finalizar ciclo

### Comandos de Qualidade
- `/run-tests` - Executar suíte de testes
- `/performance-check` - Verificar performance

### Comandos de Documentação
- `/update-progress` - Atualizar PROGRESS.md
- `/document-decision` - Registrar decisão no AGENTS.md
- `/create-spec` - Criar especificação técnica

---

## INSTRUÇÕES DE USO DO TEMPLATE

1. **Copie o arquivo** para a pasta `Docs/` do novo projeto.
2. **Adapte os workflows** conforme as necessidades do projeto.
3. **Configure os comandos** específicos das suas ferramentas, se necessário.
