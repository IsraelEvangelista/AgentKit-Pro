# Multi-Agent Orchestration Platform via Google Antigravity + MCP + SkillsMP
## Comprehensive Technical Briefing & Implementation Guide

**Document Version:** 1.0  
**Last Updated:** January 8, 2026  
**Author:** Israel de Castro Evangelista - Nébula Agile  
**Status:** Strategic Architecture & Roadmap  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement & Opportunity](#problem-statement--opportunity)
3. [Proposed Solution Architecture](#proposed-solution-architecture)
4. [Detailed Technical Specifications](#detailed-technical-specifications)
5. [Component Implementation Guide](#component-implementation-guide)
6. [Configuration File Specifications](#configuration-file-specifications)
7. [MCP Server Implementation](#mcp-server-implementation)
8. [IDE Extension Architecture](#ide-extension-architecture)
9. [SkillsMP Integration](#skillsmp-integration)
10. [Orchestration Patterns & Workflows](#orchestration-patterns--workflows)
11. [Security & State Management](#security--state-management)
12. [Deployment & Operations](#deployment--operations)
13. [Development Roadmap](#development-roadmap)
14. [Competitive Analysis](#competitive-analysis)
15. [Monetization & Go-to-Market](#monetization--go-to-market)

---

## Executive Summary

### Vision

Create a **Smart Agent Orchestration Platform** that empowers developers to coordinate multiple AI agents (Claude Code, Kilo Code, DeepSeek, etc.) through a declarative, MCP-native architecture, orchestrated by Google Antigravity as the command center.

### Key Innovation

Unlike traditional IDEs that couple a single LLM to a single code editor, this platform enables:

- **Model Agnosticity**: Use any model (GLM-4.7, DeepSeek, Claude, GPT) in parallel
- **Agent Specialization**: Route tasks to optimal agents based on skills/capabilities
- **MCP-Native Orchestration**: Leverage MCP's client-server architecture for loose coupling
- **SkillsMP Integration**: 33,000+ pre-built skills automatically available to agents
- **Declarative Configuration**: Git-versionable AGENTS.md, MCPs.md, SKILLS.md instead of hardcoded logic

### Market Position

- **Target**: Enterprise dev teams, AI/ML companies, consulting firms
- **Differentiation**: First platform to combine Antigravity + MCP + Multi-Model orchestration
- **TAM**: $5B+ (IDE market + AI agent orchestration market converging)

---

## Problem Statement & Opportunity

### Current State (January 2026)

#### Limitations of Existing Solutions

| Solution | Limitation | Impact |
|----------|-----------|--------|
| **Google Antigravity** | Single model (Gemini 3), no BYOK, walled garden | Can't use specialized models (GLM-4.7, DeepSeek) |
| **Cursor IDE** | Single model per workspace, limited agent coordination | No multi-agent workflows |
| **Claude Code** | Sequential execution only, no task distribution | Single-threaded problem solving |
| **Manual Orchestration** | Shell scripts, makefiles, custom glue code | No standardization, high maintenance burden |
| **Traditional Agent Frameworks** (LangChain, AutoGen) | Require coding, no IDE integration, steep learning curve | Not accessible to junior/non-AI developers |

#### Developer Pain Points

1. **Model Lock-in**: Forced to use IDE vendor's chosen model (Gemini 3, Claude Sonnet)
2. **No Specialization**: Can't route code review tasks to DeepSeek, implementation to GLM-4.7
3. **Inefficient Task Distribution**: Large refactor jobs can't be parallelized across agents
4. **Skill Fragmentation**: Re-implement same patterns (API integration, testing, security) across projects
5. **Lack of Visibility**: No clear view into what each agent is doing, no conflict resolution
6. **Git Unfriendly**: Agent configurations hardcoded in config files, not versionable

### Opportunity

**Gap**: No platform combines:
- ✅ Multi-model orchestration
- ✅ MCP standardization  
- ✅ IDE-native experience
- ✅ Declarative configuration
- ✅ Skill marketplace integration

**Market Timing**: Perfect convergence:
- Google Antigravity launched Nov 2025 (fresh ecosystem)
- MCP v2 stable with broad IDE support (VS Code, JetBrains, Claude Code, Antigravity)
- Agent Skills mature (Claude API, Anthropic Skills API)
- SkillsMP has 33,000+ indexed skills ready to use

---

## Proposed Solution Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  🎯 COMMAND CENTER: Google Antigravity                 │
│  (Strategic Planning, User Interaction, Plan Decomposition, Reporting)  │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                   MCP Connection (stdio)
                             │
                ┌────────────▼──────────────┐
                │  Your MCP Server Layer   │
                │  (Agent Orchestrator)    │
                │                          │
                │ ┌──────────────────────┐ │
                │ │ Config Parser        │ │  • Reads AGENTS.md
                │ │ (AGENTS.md,          │ │  • Reads MCPs.md
                │ │  MCPs.md,            │ │  • Reads SKILLS.md
                │ │  SKILLS.md)          │ │  • Hot-reloads on changes
                │ │                      │ │
                │ ├──────────────────────┤ │
                │ │ Agent Selector       │ │  • Analyzes task
                │ │ (Best-Fit Logic)     │ │  • Routes to optimal agent
                │ │                      │ │  • Skill-based routing
                │ │                      │ │
                │ ├──────────────────────┤ │
                │ │ Skill Fetcher        │ │  • Queries SkillsMP API
                │ │ (SkillsMP + Local)   │ │  • Manages skill caching
                │ │                      │ │  • Injects into prompts
                │ │                      │ │
                │ ├──────────────────────┤ │
                │ │ State Manager        │ │  • Tracks agent status
                │ │ (Redis/SQLite)       │ │  • Git diff tracking
                │ │                      │ │  • Conflict detection
                │ │                      │ │
                │ ├──────────────────────┤ │
                │ │ MCP Primitives       │ │  • Tools (to execute tasks)
                │ │ (Tools, Resources,   │ │  • Resources (to read status)
                │ │  Prompts)            │ │  • Prompts (templates)
                │ └──────────────────────┘ │
                └──────────┬───────────────┘
                           │
         ┌─────────────────┼─────────────────┬──────────────────┐
         │                 │                 │                  │
   stdio │           stdio │           stdio │            stdio │
         ▼                 ▼                 ▼                  ▼
    ┌─────────┐      ┌──────────┐     ┌──────────┐      ┌─────────┐
    │ Claude  │      │  Kilo    │     │DeepSeek  │      │ Custom  │
    │ Code +  │      │ Code +   │     │ Code +   │      │ Agent   │
    │ Z.ai    │      │OpenRouter│     │ Local    │      │ (Future)│
    └────┬────┘      └────┬─────┘     └────┬─────┘      └────┬────┘
         │                │                │                 │
         │                │                │                 │
         ▼                ▼                ▼                 ▼
    ┌────────────────────────────────────────────────────────┐
    │       Terminal Session Layer (Shared Filesystem)       │
    │                                                        │
    │  /project-root (All agents read/write same files)      │
    │  ├─ src/                                              │
    │  ├─ tests/                                            │
    │  ├─ .agents/                                          │
    │  │   ├─ AGENTS.md                                     │
    │  │   ├─ MCPs.md                                       │
    │  │   └─ SKILLS.md                                     │
    │  └─ .git/                                             │
    │      └─ (Tracks all changes across all agents)        │
    └────────────────────────────────────────────────────────┘
         │                │                │                 │
         │ MCP Tool Data  │                │                 │
         │ ← Resource     │                │                 │
         │ → Tool Result  │                │                 │
         │                │                │                 │
         └────────────────┴────────────────┴─────────────────┘
                          │
                  ┌───────▼──────────┐
                  │ IDE Extension    │
                  │ (VS Code)        │
                  │                  │
                  │ • Task detection │
                  │ • Agent selector │
                  │ • Result display │
                  │ • Config live    │
                  │   reload         │
                  └──────────────────┘
```

### Architectural Patterns Applied

#### 1. **Multi-Agent Orchestrator Pattern** (Coordinator)

```
Antigravity (Coordinator)
    ↓
Analyzes: "Implement OAuth2 + refresh tokens"
    ↓
Decomposes into:
├─ Task 1: "Generate OAuth2 flow architecture"
│   └─ Best agent: Claude Code (architecture expert)
│   └─ Skills: [api-integration, oauth-patterns]
│   └─ MCPs: [github, figma]
│
├─ Task 2: "Implement token rotation"
│   └─ Best agent: Kilo Code (reliability expert)
│   └─ Skills: [error-handling, security]
│   └─ MCPs: [security-scanner, postgres]
│
└─ Task 3: "Write comprehensive tests"
    └─ Best agent: DeepSeek (cost-efficient, thorough)
    └─ Skills: [testing, edge-cases]
    └─ MCPs: [jest-runner, coverage-reporter]
```

#### 2. **Hierarchical Task Decomposition Pattern**

```
Level 1 (Root): Antigravity
    "Ship OAuth2 feature in 48 hours"
    │
    ├─ Level 2: Agent 1 (Backend Lead)
    │   "Implement server-side OAuth logic"
    │   │
    │   ├─ Level 3: Task 1.1 (Specialist)
    │   │   "Set up OAuth provider endpoints"
    │   │
    │   └─ Level 3: Task 1.2 (Specialist)
    │       "Implement token refresh"
    │
    └─ Level 2: Agent 2 (Frontend Lead)
        "Implement OAuth UI flow"
        │
        ├─ Level 3: Task 2.1
        │   "Build login button + redirect"
        │
        └─ Level 3: Task 2.2
            "Add token persistence"
```

#### 3. **Skill-Based Task Routing**

```
Task: "Refactor legacy database queries"
    ↓
Required Skills: [sql-optimization, performance-tuning, testing]
    ↓
Agent Scoring:
├─ Claude Code: skill_match=0.85, availability=1.0 → Score: 0.92
├─ Kilo Code: skill_match=0.92, availability=0.3 → Score: 0.61
└─ DeepSeek: skill_match=0.78, availability=1.0 → Score: 0.89
    ↓
Selected: Claude Code (highest score)
    ↓
Inject Skills: [
    {name: "sql-optimization-skill", source: "skillsmp"},
    {name: "performance-tuning", source: "skillsmp"},
    {name: "postgres-best-practices", source: "custom"}
]
```

#### 4. **MCP-Native Service Mesh**

Instead of direct agent-to-agent communication, all routing goes through MCP primitives:

```
Tool: execute_with_agent
├─ Input: task, agent_id, skills, mcps
├─ Process: spawns subprocess, captures output
└─ Output: result, status, file_changes

Resource: agents://executions
├─ Read by: Antigravity (for status polling)
├─ Updated by: MCP Server (as agents progress)
└─ Format: JSON with execution metadata

Resource: project://changes
├─ Read by: Agents (to understand prior changes)
├─ Updated by: Git integration
└─ Format: Diff summaries per agent
```

---

## Detailed Technical Specifications

### 1. Technology Stack Selection

#### Why FastMCP (Python) vs Node.js SDK?

| Aspect | FastMCP (Python) | Node.js SDK |
|--------|-----------------|-----------|
| **Learning Curve** | ⭐⭐ (decorators, Pythonic) | ⭐⭐⭐ (verbose classes) |
| **Ecosystem** | ⭐⭐⭐⭐ (rich libraries) | ⭐⭐⭐ (basic) |
| **Subprocess Handling** | ⭐⭐⭐⭐⭐ (pexpect, asyncio) | ⭐⭐⭐ (child_process) |
| **Documentation** | ⭐⭐⭐⭐ (excellent) | ⭐⭐⭐ (good) |
| **Performance** | ⭐⭐⭐ (slower for I/O) | ⭐⭐⭐⭐⭐ (async-first) |
| **Deployment** | ⭐⭐⭐ (Python versions) | ⭐⭐⭐⭐ (Node everywhere) |

**Recommendation**: Start with FastMCP (Phase 1-3), transition to Node.js for production (Phase 4) when performance-critical.

```
Phase 1-3: FastMCP (faster iteration, great for prototyping)
├─ Config parsing with YAML
├─ Subprocess orchestration with asyncio
├─ Redis/SQLite for state
└─ Tests with pytest

Phase 4: Node.js Migration (when scaling)
├─ Rewrite in @modelcontextprotocol/sdk
├─ Horizontal scaling with clustering
├─ Production telemetry
└─ Docker/Kubernetes deployment
```

#### Core Dependencies (FastMCP Approach)

```python
# MCP Server Framework
fastmcp==0.3.0+

# Config Management
pyyaml==6.0.1
dataclasses-json==0.6.1

# Subprocess Management
asyncio==3.4.3
pexpect==4.8.0+

# State Management
redis==5.0.0  # Primary (for distributed state)
sqlalchemy==2.0.0  # Fallback (embedded)

# SkillsMP Integration
httpx==0.25.0  # Async HTTP client
pydantic==2.0.0  # Validation

# File & Git Operations
gitpython==3.1.37
pathlib2==2.3.0

# Logging & Monitoring
python-json-logger==2.0.7
opentelemetry-api==1.20.0
opentelemetry-sdk==1.20.0

# Testing
pytest==7.4.0
pytest-asyncio==0.21.0
pytest-mock==3.11.0

# Utility
tenacity==8.2.0  # Retry logic
```

#### IDE Extension Stack (VS Code)

```json
{
  "devDependencies": {
    "vscode": "^1.102.0",
    "@types/vscode": "^1.102.0",
    "typescript": "^5.0.0",
    "@modelcontextprotocol/sdk": "^1.18.0"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "node-pty": "^0.10.0",
    "xterm": "^5.3.0"
  }
}
```

### 2. Protocol Specifications

#### MCP Tool Interface: execute_with_agent

```json
{
  "tool_name": "execute_with_agent",
  "description": "Execute a task using a specific agent with optional skills",
  "input_schema": {
    "type": "object",
    "properties": {
      "agent_id": {
        "type": "string",
        "description": "Identifier of the agent (from AGENTS.md)",
        "examples": ["claude-code-zaai", "kilo-openrouter", "deepseek-local"]
      },
      "task": {
        "type": "string",
        "description": "The task to execute (detailed instruction)"
      },
      "skill_ids": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Skills to inject (skillsmp:id or custom:path)"
      },
      "context": {
        "type": "object",
        "description": "Additional context for the agent",
        "properties": {
          "files_to_read": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Files agent should read before starting"
          },
          "recent_changes": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Summary of recent changes from other agents"
          },
          "constraints": {
            "type": "object",
            "properties": {
              "max_time_minutes": {"type": "integer"},
              "must_preserve_files": {"type": "array"},
              "forbidden_patterns": {"type": "array"}
            }
          }
        }
      },
      "execution_mode": {
        "type": "string",
        "enum": ["synchronous", "asynchronous"],
        "default": "synchronous"
      }
    },
    "required": ["agent_id", "task"]
  },
  "output": {
    "type": "object",
    "properties": {
      "execution_id": {"type": "string"},
      "status": {"enum": ["completed", "running", "failed", "timeout"]},
      "output": {"type": "string"},
      "stderr": {"type": "string"},
      "files_modified": {"type": "array"},
      "execution_time_seconds": {"type": "number"},
      "error_message": {"type": "string"}
    }
  }
}
```

#### MCP Resource Interface: agents://executions

```json
{
  "uri": "agents://executions",
  "format": "application/json",
  "schema": {
    "executions": [
      {
        "execution_id": "exec_001abc",
        "agent_id": "claude-code-zaai",
        "task": "Implement OAuth2 flow",
        "status": "running",  // completed, failed, timeout
        "progress": {
          "percent": 45,
          "current_step": "Implementing token endpoint",
          "steps_completed": 3,
          "total_steps": 7
        },
        "timestamps": {
          "started_at": "2026-01-08T21:30:00Z",
          "estimated_completion": "2026-01-08T22:15:00Z"
        },
        "files_modified": ["src/auth/oauth.ts", "src/auth/types.ts"],
        "stderr_summary": null,
        "skills_used": ["api-integration-skill", "error-handling-skill"],
        "mcps_used": ["postgres", "github"]
      }
    ],
    "summary": {
      "total_executions": 5,
      "completed": 3,
      "running": 1,
      "failed": 1,
      "total_files_modified": 12,
      "total_time_minutes": 47
    }
  }
}
```

#### MCP Prompt Template: agent_coordination

```json
{
  "name": "agent_coordination",
  "description": "Instruct Antigravity on optimal agent routing",
  "input_schema": {
    "properties": {
      "task": {"type": "string"},
      "available_agents": {"type": "array"}
    }
  },
  "template": "You are a task routing expert. Given the following task and available agents, decide:\n1. Which agent is most suitable?\n2. What skills should be injected?\n3. What MCPs should be connected?\n4. Should this be parallelized or sequential?\n\nTask: {task}\n\nAvailable Agents:\n{available_agents_list}\n\nProvide decision in JSON format with keys: best_agent, skills, mcps, execution_mode"
}
```

### 3. Data Model Specifications

#### Agent State Object

```python
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Optional

@dataclass
class AgentExecution:
    """Represents a single agent execution"""
    execution_id: str
    agent_id: str
    task: str
    status: str  # "queued", "running", "completed", "failed"
    
    # Timing
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    # Output
    stdout: str
    stderr: str
    return_code: int
    
    # Context
    skills_used: List[str]
    mcps_used: List[str]
    files_modified: List[str]
    
    # Metadata
    duration_seconds: float
    token_usage: Dict[str, int]  # {input_tokens, output_tokens}
    cost: float  # Calculated from token usage + model pricing
    
    # Relationships
    parent_execution_id: Optional[str]  # If spawned by another agent
    child_execution_ids: List[str]  # Agents spawned by this one
```

#### Agent Configuration Object

```python
@dataclass
class AgentDefinition:
    """Agent configuration from AGENTS.md"""
    id: str
    name: str
    cli_command: str  # Full command to spawn
    strengths: List[str]  # What this agent excels at
    suited_for: List[str]  # Task types it's good for
    
    # Capability Limits
    max_context_tokens: int
    supports_tool_calling: bool
    supports_streaming: bool
    
    # Connected Services
    mcp_servers: List[str]  # MCP server IDs available
    supported_skills: List[str]  # Skill categories it can use
    
    # Cost & Performance
    cost_per_1k_tokens: float
    average_latency_ms: int
    reliability_score: float  # 0-1
    
    # Configuration
    env_vars: Dict[str, str]
    working_directory: str
```

#### Skill Metadata Object

```python
@dataclass
class SkillDefinition:
    """Skill metadata (from SkillsMP or custom)"""
    id: str
    name: str
    description: str
    source: str  # "skillsmp" or "custom"
    
    # Capability Description
    category: str  # "api-integration", "testing", "security", etc.
    keywords: List[str]
    
    # Content
    markdown_content: str  # Full SKILL.md content
    example_usage: str
    
    # Metadata
    version: str
    last_updated: datetime
    compatibility: Dict[str, List[str]]  # {"agent_id": ["claude-code", "kilo"]}
    
    # Quality Metrics
    usage_count: int
    success_rate: float
    average_rating: float
    
    # License & Attribution
    license: str
    author: str
    repository_url: str
```

---

## Component Implementation Guide

### Component 1: MCP Server Core (FastMCP)

#### File Structure

```
nebula-agent-orchestrator/
├── mcp_server/
│   ├── __init__.py
│   ├── main.py                    # Entry point
│   ├── server.py                  # MCP server instantiation
│   │
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── agent_executor.py      # Tool: execute_with_agent
│   │   ├── agent_status.py        # Tool: check_agent_status
│   │   ├── skill_fetcher.py       # Tool: fetch_skills
│   │   └── config_reloader.py     # Tool: reload_config
│   │
│   ├── resources/
│   │   ├── __init__.py
│   │   ├── executions.py          # Resource: agents://executions
│   │   ├── project_changes.py     # Resource: project://changes
│   │   ├── agent_capabilities.py  # Resource: agents://capabilities
│   │   └── skills_registry.py     # Resource: skills://registry
│   │
│   ├── prompts/
│   │   ├── __init__.py
│   │   ├── agent_coordination.py  # Prompt: how to route tasks
│   │   ├── skill_selection.py     # Prompt: which skills for task
│   │   └── conflict_resolution.py # Prompt: resolve file conflicts
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config_parser.py       # Parse AGENTS.md, MCPs.md, SKILLS.md
│   │   ├── agent_selector.py      # Best-fit agent selection logic
│   │   ├── state_manager.py       # Redis/SQLite state tracking
│   │   ├── git_tracker.py         # Git diff tracking
│   │   └── skill_manager.py       # SkillsMP API integration
│   │
│   ├── agent_runners/
│   │   ├── __init__.py
│   │   ├── subprocess_manager.py  # Spawn & manage subprocesses
│   │   ├── terminal_emulator.py   # Capture terminal output
│   │   └── conflict_resolver.py   # Merge conflicts between agents
│   │
│   └── utils/
│       ├── __init__.py
│       ├── logging.py
│       ├── metrics.py             # Token usage, cost tracking
│       └── secrets.py             # API key management
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── vscode_extension/
│   ├── src/
│   │   ├── extension.ts
│   │   ├── mcp_client.ts
│   │   ├── ui/
│   │   │   ├── agent_selector.ts
│   │   │   ├── terminal_panel.ts
│   │   │   └── status_bar.ts
│   │   └── config/
│   │       └── config_watcher.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── .agents/
│   ├── AGENTS.md                  # Agent definitions
│   ├── MCPs.md                    # MCP connections
│   └── SKILLS.md                  # Skill mappings
│
├── docs/
│   ├── architecture.md
│   ├── api_reference.md
│   └── deployment.md
│
├── requirements.txt
├── setup.py
├── pyproject.toml
├── Makefile
└── README.md
```

#### Implementation Example: main.py (FastMCP Server)

```python
# mcp_server/main.py
from fastmcp import FastMCP, Context
from mcp_server.core.config_parser import ConfigParser
from mcp_server.core.agent_selector import AgentSelector
from mcp_server.core.state_manager import StateManager
from mcp_server.agent_runners.subprocess_manager import SubprocessManager
import asyncio
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create MCP server instance
mcp = FastMCP("Nebula Agent Orchestrator", version="1.0.0")

# Initialize core components
config_parser = ConfigParser(project_root="/project-root")
agent_selector = AgentSelector(config_parser)
state_manager = StateManager()
subprocess_manager = SubprocessManager(project_root="/project-root")

# ============================================================================
# MCP TOOLS
# ============================================================================

@mcp.tool(name="execute_with_agent")
async def execute_with_agent(
    agent_id: str,
    task: str,
    skill_ids: list[str] | None = None,
    context: dict | None = None,
    execution_mode: str = "synchronous",
    ctx: Context | None = None
) -> dict:
    """
    Execute a task using a specific agent with optional skills.
    
    Args:
        agent_id: Agent identifier from AGENTS.md
        task: Task description/instruction
        skill_ids: List of skills to inject (e.g., ["skillsmp:api-integration"])
        context: Additional context (files to read, recent changes, constraints)
        execution_mode: "synchronous" or "asynchronous"
        ctx: FastMCP context for logging
    
    Returns:
        Execution result with status, output, modified files
    """
    try:
        execution_id = state_manager.generate_execution_id()
        
        # Log execution start
        if ctx:
            await ctx.info(f"[{execution_id}] Starting execution with agent: {agent_id}")
        
        # Get agent config
        agent = config_parser.get_agent(agent_id)
        if not agent:
            return {
                "execution_id": execution_id,
                "status": "failed",
                "error_message": f"Agent '{agent_id}' not found in AGENTS.md"
            }
        
        # Fetch and inject skills
        injected_skills = {}
        if skill_ids:
            for skill_id in skill_ids:
                skill = await skill_manager.fetch_skill(skill_id)
                if skill:
                    injected_skills[skill_id] = skill.markdown_content
        
        # Build task instruction with skills
        enhanced_task = _build_task_instruction(
            task=task,
            skills=injected_skills,
            context=context
        )
        
        # Record in state before execution
        await state_manager.record_execution(
            execution_id=execution_id,
            agent_id=agent_id,
            task=task,
            status="running",
            skills_used=skill_ids or [],
            mcps_used=agent.mcp_servers
        )
        
        # Execute with agent
        result = await subprocess_manager.execute(
            execution_id=execution_id,
            agent=agent,
            task=enhanced_task,
            context=context
        )
        
        # Update state with completion
        await state_manager.update_execution(
            execution_id=execution_id,
            status="completed" if result.return_code == 0 else "failed",
            stdout=result.stdout,
            stderr=result.stderr,
            return_code=result.return_code,
            files_modified=result.files_modified,
            duration_seconds=result.duration
        )
        
        if ctx:
            await ctx.info(f"[{execution_id}] Execution completed. "
                          f"Files modified: {len(result.files_modified)}")
        
        return {
            "execution_id": execution_id,
            "status": "completed" if result.return_code == 0 else "failed",
            "output": result.stdout,
            "stderr": result.stderr,
            "files_modified": result.files_modified,
            "execution_time_seconds": result.duration
        }
        
    except Exception as e:
        logger.error(f"Execution failed: {e}", exc_info=True)
        return {
            "execution_id": execution_id if 'execution_id' in locals() else "unknown",
            "status": "failed",
            "error_message": str(e)
        }


@mcp.tool(name="check_agent_status")
async def check_agent_status(
    execution_id: str,
    ctx: Context | None = None
) -> dict:
    """Get status of a running execution"""
    execution = await state_manager.get_execution(execution_id)
    
    if not execution:
        return {"status": "not_found", "execution_id": execution_id}
    
    return {
        "execution_id": execution_id,
        "status": execution.status,
        "progress": execution.progress,
        "files_modified": execution.files_modified,
        "stderr_summary": execution.stderr[:200] if execution.stderr else None
    }


@mcp.tool(name="reload_config")
async def reload_config(ctx: Context | None = None) -> dict:
    """Reload AGENTS.md, MCPs.md, SKILLS.md from disk"""
    try:
        config_parser.reload()
        
        agents_count = len(config_parser.agents)
        skills_count = len(config_parser.skills)
        
        if ctx:
            await ctx.info(f"✓ Config reloaded: {agents_count} agents, "
                          f"{skills_count} skills")
        
        return {
            "status": "success",
            "agents_loaded": agents_count,
            "skills_loaded": skills_count,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Config reload failed: {e}")
        return {"status": "failed", "error_message": str(e)}


# ============================================================================
# MCP RESOURCES
# ============================================================================

@mcp.resource(name="agents://executions")
async def get_executions(uri: str, ctx: Context | None = None) -> str:
    """Get list of all agent executions and their status"""
    executions = await state_manager.list_executions(limit=100)
    
    # Format as JSON
    execution_data = [
        {
            "execution_id": e.execution_id,
            "agent_id": e.agent_id,
            "status": e.status,
            "created_at": e.created_at.isoformat(),
            "files_modified": e.files_modified
        }
        for e in executions
    ]
    
    return json.dumps({
        "executions": execution_data,
        "summary": {
            "total": len(executions),
            "completed": sum(1 for e in executions if e.status == "completed"),
            "running": sum(1 for e in executions if e.status == "running"),
            "failed": sum(1 for e in executions if e.status == "failed")
        }
    }, indent=2)


@mcp.resource(name="agents://capabilities")
async def get_agent_capabilities(uri: str) -> str:
    """Get list of available agents and their capabilities"""
    agents = config_parser.agents
    
    capabilities = [
        {
            "id": a.id,
            "name": a.name,
            "strengths": a.strengths,
            "suited_for": a.suited_for,
            "max_context_tokens": a.max_context_tokens,
            "cost_per_1k_tokens": a.cost_per_1k_tokens,
            "availability": "available"
        }
        for a in agents.values()
    ]
    
    return json.dumps({
        "agents": capabilities,
        "total": len(capabilities)
    }, indent=2)


@mcp.resource(name="skills://registry")
async def get_skills_registry(uri: str) -> str:
    """Get list of available skills from SkillsMP + custom"""
    skills = config_parser.skills
    
    skill_list = [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "description": s.description,
            "source": s.source,
            "compatibility": s.compatibility
        }
        for s in skills.values()
    ]
    
    return json.dumps({
        "skills": skill_list,
        "total": len(skill_list),
        "by_category": _group_skills_by_category(skills)
    }, indent=2)


# ============================================================================
# MCP PROMPTS
# ============================================================================

@mcp.prompt(name="agent_coordination")
def agent_coordination_prompt(task: str) -> str:
    """
    Provides guidance to Antigravity on optimal agent routing
    """
    agents = config_parser.agents
    agent_list = "\n".join([
        f"- {a.id}: {a.strengths} (suited for: {', '.join(a.suited_for)})"
        for a in agents.values()
    ])
    
    return f"""You are a task routing expert optimizing for code quality and efficiency.

Task to accomplish: {task}

Available Agents:
{agent_list}

For this task, determine:
1. Which agent is best suited? Why?
2. What skills should be injected to enhance the agent's performance?
3. What MCP servers should be connected?
4. Should subtasks be parallelized across multiple agents? If yes, which subtasks?

Respond in JSON format:
{{
    "best_agent": "agent_id",
    "reasoning": "explanation",
    "skills_to_inject": ["skill1", "skill2"],
    "mcps_required": ["mcp1", "mcp2"],
    "subtasks": [
        {{"task": "subtask description", "agent": "agent_id", "parallelizable": true}}
    ],
    "execution_mode": "sequential|parallel|hybrid"
}}"""


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _build_task_instruction(task: str, skills: dict, context: dict) -> str:
    """Build enhanced task instruction with skills and context"""
    instruction = f"{task}\n\n"
    
    if skills:
        instruction += "## Available Skills\n\n"
        for skill_id, skill_content in skills.items():
            instruction += f"### {skill_id}\n{skill_content}\n\n"
    
    if context and context.get("recent_changes"):
        instruction += "## Recent Changes (Context)\n\n"
        for change in context["recent_changes"]:
            instruction += f"- {change}\n"
    
    return instruction


def _group_skills_by_category(skills: dict) -> dict:
    """Group skills by category"""
    grouped = {}
    for skill in skills.values():
        if skill.category not in grouped:
            grouped[skill.category] = []
        grouped[skill.category].append(skill.id)
    return grouped


# ============================================================================
# SERVER LIFECYCLE
# ============================================================================

if __name__ == "__main__":
    # Load initial config
    config_parser.reload()
    logger.info(f"Loaded {len(config_parser.agents)} agents")
    logger.info(f"Loaded {len(config_parser.skills)} skills")
    
    # Start MCP server on stdio
    mcp.run()
```

### Component 2: Configuration Parser

```python
# mcp_server/core/config_parser.py

import yaml
from pathlib import Path
from typing import Dict, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

class ConfigParser:
    """Parses and manages AGENTS.md, MCPs.md, SKILLS.md"""
    
    def __init__(self, project_root: str = "/project-root"):
        self.project_root = Path(project_root)
        self.agents_dir = self.project_root / ".agents"
        
        self.agents: Dict[str, AgentDefinition] = {}
        self.mcps: Dict[str, MCPDefinition] = {}
        self.skills: Dict[str, SkillDefinition] = {}
        
        self._last_reload_time = None
    
    def reload(self):
        """Reload all configs from disk"""
        try:
            self._parse_agents_md()
            self._parse_mcps_md()
            self._parse_skills_md()
            
            self._last_reload_time = datetime.now()
            logger.info(f"✓ Reloaded configs: "
                       f"{len(self.agents)} agents, "
                       f"{len(self.mcps)} mcps, "
                       f"{len(self.skills)} skills")
            
        except Exception as e:
            logger.error(f"Config reload failed: {e}")
            raise
    
    def _parse_agents_md(self):
        """Parse AGENTS.md into AgentDefinition objects"""
        agents_file = self.agents_dir / "AGENTS.md"
        
        if not agents_file.exists():
            logger.warning(f"AGENTS.md not found at {agents_file}")
            return
        
        content = agents_file.read_text()
        
        # Simple markdown parsing (could use regex for robustness)
        # Format:
        # ## Agent: agent-id
        # - **CLI**: command
        # - **Strengths**: list
        # - **Suited_For**: list
        # etc.
        
        current_agent = None
        for line in content.split('\n'):
            if line.startswith('## Agent:'):
                agent_id = line.replace('## Agent:', '').strip()
                current_agent = AgentDefinition(
                    id=agent_id,
                    name=agent_id.replace('-', ' ').title(),
                    cli_command="",
                    strengths=[],
                    suited_for=[],
                    max_context_tokens=200000,
                    supports_tool_calling=True,
                    supports_streaming=True,
                    mcp_servers=[],
                    supported_skills=[],
                    cost_per_1k_tokens=0.01,
                    average_latency_ms=1000,
                    reliability_score=0.95,
                    env_vars={},
                    working_directory=str(self.project_root)
                )
                self.agents[agent_id] = current_agent
            
            elif current_agent and line.startswith('- **CLI**:'):
                current_agent.cli_command = line.replace('- **CLI**:', '').strip()
            
            elif current_agent and line.startswith('- **Strengths**:'):
                strengths = line.replace('- **Strengths**:', '').strip()
                current_agent.strengths = [s.strip() for s in strengths.split(',')]
        
        logger.info(f"Parsed {len(self.agents)} agents from AGENTS.md")
    
    def _parse_mcps_md(self):
        """Parse MCPs.md into MCP configuration"""
        mcps_file = self.agents_dir / "MCPs.md"
        
        if not mcps_file.exists():
            logger.warning(f"MCPs.md not found at {mcps_file}")
            return
        
        # Similar parsing logic...
        logger.info(f"Parsed {len(self.mcps)} MCPs from MCPs.md")
    
    def _parse_skills_md(self):
        """Parse SKILLS.md and fetch from SkillsMP"""
        skills_file = self.agents_dir / "SKILLS.md"
        
        if not skills_file.exists():
            logger.warning(f"SKILLS.md not found at {skills_file}")
            return
        
        # Parse custom skill paths and SkillsMP IDs...
        logger.info(f"Parsed {len(self.skills)} skills from SKILLS.md")
    
    def get_agent(self, agent_id: str) -> Optional[AgentDefinition]:
        """Get agent by ID"""
        return self.agents.get(agent_id)
    
    def get_agents_for_task(self, task: str) -> list:
        """Get agents capable of handling task"""
        # Could use semantic similarity or keyword matching
        return list(self.agents.values())
```

---

## Configuration File Specifications

### AGENTS.md Format

```markdown
# AGENTS.md - Agent Definitions & Configuration

Last Updated: 2026-01-08
Version: 1.0

## Agent: claude-code-zaai

**Description**: Claude Code IDE integrated with Z.ai (Zhipu) GLM-4.7 API

### Core Properties

- **CLI**: `claude code --api-key ${Z_AI_KEY} --model glm-4.7`
- **Working Directory**: `/project-root`
- **Environment Variables**:
  - `Z_AI_KEY`: API key for Z.ai (stored in secure vault)
  - `Z_AI_BASE_URL`: https://api.z.ai/v1
  - `LOG_LEVEL`: info

### Capabilities

- **Strengths**: 
  - Architecture design
  - Complex logic implementation  
  - Code generation (high quality)
  - TypeScript/JavaScript
  - React component generation

- **Suited For**:
  - Implementing new features
  - Architectural refactoring
  - Complex algorithm implementation
  - TypeScript/JavaScript projects

- **Context Window**: 200,000 tokens
- **Supports Tool Calling**: Yes
- **Supports Streaming**: Yes
- **Supports Images**: Yes

### Connected Services

- **MCP Servers**: 
  - `postgres` (database queries)
  - `github` (commit, PR management)
  - `figma` (design system reference)
  
- **Supported Skill Categories**:
  - api-integration
  - code-generation
  - architecture-design
  - testing
  - typescript-patterns

### Performance & Cost

- **Average Latency**: 1200ms
- **Reliability Score**: 0.96
- **Cost per 1K Tokens**: $0.008 (input), $0.012 (output)
- **Monthly Budget**: $500 (soft limit, adjustable)

### Specialization Score (0-1)

For different task types:
- API Integration: 0.95
- Code Review: 0.75
- Bug Fixing: 0.88
- Documentation: 0.70
- Testing: 0.82

---

## Agent: kilo-code-openrouter

**Description**: Kilo Code IDE with OpenRouter proxy (supports 200+ models)

### Core Properties

- **CLI**: `kilo code --provider openrouter --model deepseek/deepseek-chat --api-key ${OPENROUTER_KEY}`
- **Working Directory**: `/project-root`
- **Environment Variables**:
  - `OPENROUTER_KEY`: API key
  - `OPENROUTER_BASE_URL`: https://openrouter.ai/api/v1

### Capabilities

- **Strengths**:
  - Code review and analysis
  - Bug identification
  - Security scanning
  - Edge case identification
  - Test case generation

- **Suited For**:
  - Code review
  - Debugging
  - Security audit
  - Test generation
  - Edge case analysis

- **Context Window**: 128,000 tokens
- **Supports Tool Calling**: Yes
- **Supports Streaming**: Yes

### Connected Services

- **MCP Servers**:
  - `security-scanner` (SAST analysis)
  - `code-quality-checker` (linting, complexity)
  - `jest-runner` (test execution)

- **Supported Skill Categories**:
  - code-review
  - security-audit
  - testing
  - debugging

### Performance & Cost

- **Average Latency**: 800ms
- **Reliability Score**: 0.94
- **Cost per 1K Tokens**: $0.003-0.005 (varies by model)
- **Monthly Budget**: $200

---

## Agent: deepseek-local

**Description**: DeepSeek model running locally via vLLM container

### Core Properties

- **CLI**: `vllm serve deepseek-ai/deepseek-coder-33b-instruct --port 8000 --max-model-len 16000`
- **Working Directory**: `/project-root`
- **Environment Variables**:
  - `VLLM_PORT`: 8000
  - `VLLM_DEVICE`: cuda (or cpu)

### Capabilities

- **Strengths**:
  - Documentation generation
  - Code comments
  - Refactoring
  - Cost-effective (runs locally)

- **Suited For**:
  - Documentation
  - Code commenting
  - Non-critical refactoring
  - Budget-conscious workflows

- **Context Window**: 16,000 tokens
- **Supports Tool Calling**: No
- **Supports Streaming**: Yes
- **Offline**: Yes (no API calls)

### Connected Services

- **MCP Servers**:
  - `filesystem` (read/write)
  - `git` (commit, diff)

### Performance & Cost

- **Average Latency**: 3000ms (first run), 500ms (cached)
- **Reliability Score**: 0.88
- **Cost per 1K Tokens**: $0.00 (local, hardware cost amortized)
- **GPU Memory Required**: 16GB VRAM
- **Deployment**: Docker container

---

## Scheduling & Resource Management

### Agent Selection Priority

When multiple agents could handle a task:

1. **Skill Match** (weight: 40%): Does agent support required skills?
2. **Cost Efficiency** (weight: 25%): Balance between cost and quality
3. **Availability** (weight: 20%): Is agent currently free?
4. **Specialization** (weight: 15%): How specialized for this task?

### Rate Limiting

- **claude-code-zaai**: Max 10 concurrent executions, 100 per day
- **kilo-openrouter**: Max 5 concurrent executions, 50 per day
- **deepseek-local**: Max 1 concurrent execution (single GPU), 20 per day

### Timeouts

- **Default**: 30 minutes
- **Long-running tasks**: 60 minutes (with explicit marking)
- **Quick tasks**: 5 minutes

---

## Health Monitoring

Agents are probed daily with:

```json
{
  "task": "Write a simple 'hello world' function",
  "expected_output": "function helloWorld",
  "timeout_seconds": 30
}
```

If health check fails 2+ consecutive times, agent is marked as unavailable.
```

### MCPs.md Format

```markdown
# MCPs.md - MCP Server Configuration

## Global MCPs (Available to All Agents)

### filesystem
- **Type**: Local Stdio
- **Command**: `node ~/.mcp/servers/filesystem.js`
- **Capabilities**: 
  - Read files (entire project)
  - Write files (with confirmation)
  - List directories
  - Search for patterns

### git
- **Type**: Local Stdio
- **Command**: `python ~/.mcp/servers/git.py --repo /project-root`
- **Capabilities**:
  - Commit with message
  - Create branches
  - View diffs
  - Merge conflicts
  - Push to remote

---

## Agent-Specific MCPs

### claude-code-zaai MCPs

#### postgres
- **Type**: Local Stdio  
- **Command**: `python ~/.mcp/servers/postgres.py --host localhost --db nebula_dev`
- **Capabilities**: Query, migrations, schema analysis

#### github
- **Type**: Remote HTTP
- **URL**: https://mcp.github.com/v1
- **Authentication**: OAuth token
- **Capabilities**: PR creation, issue management, code review

---

## MCP Server Configuration Format

```yaml
mcp_servers:
  filesystem:
    transport: stdio
    command: "node"
    args:
      - "~/.mcp/servers/filesystem.js"
    env:
      PROJECT_ROOT: "/project-root"
    timeout_seconds: 30
    retry_attempts: 3
    
  postgres:
    transport: stdio
    command: "python"
    args:
      - "~/.mcp/servers/postgres.py"
      - "--host=localhost"
      - "--port=5432"
      - "--db=nebula_dev"
    env:
      DB_USER: "${DB_USER}"
      DB_PASSWORD: "${DB_PASSWORD_VAULT}"
    timeout_seconds: 30
```
```

### SKILLS.md Format

```markdown
# SKILLS.md - Skill Definitions & Mappings

Last Updated: 2026-01-08

## Skill Categories & Sources

### API Integration Skills
- **skillsmp:api-integration-skill**: Core patterns for REST/GraphQL APIs
  - Agents: claude-code, kilo
  - Cost: Free (SkillsMP)
  
- **skillsmp:oauth2-implementation**: OAuth2 flows and secure token handling
  - Agents: claude-code, kilo
  - Usage: Authentication feature implementation
  
- **custom:company-oauth-patterns.md**: Nébula's internal OAuth implementations
  - Path: `.agents/custom/oauth-patterns.md`
  - Agents: claude-code (only)
  - Cost: Free (internal)

### Testing & Quality Skills
- **skillsmp:testing-best-practices**: Test structure and coverage strategies
  - Agents: kilo, deepseek
  
- **skillsmp:performance-testing-skill**: Load testing, benchmarking
  - Agents: claude-code, kilo
  
- **custom:nébula-testing-standards.md**: Internal testing requirements
  - Path: `.agents/custom/testing-standards.md`

### Security Skills
- **skillsmp:owasp-top-10-skill**: OWASP vulnerabilities and mitigations
  - Agents: kilo-code (specialized for security)
  
- **skillsmp:secure-coding-python**: Python security best practices
  - Agents: deepseek, claude-code

---

## Task-to-Skill Mappings

### Task: Implement OAuth2 Authentication

**Required Skills**:
- skillsmp:api-integration-skill (core API patterns)
- skillsmp:oauth2-implementation (OAuth flows)
- custom:company-oauth-patterns.md (internal patterns)
- skillsmp:testing-best-practices (write tests)
- skillsmp:owasp-top-10-skill (security review)

**Recommended Agent**: claude-code-zaai
**Backup Agents**: kilo-code-openrouter

**Execution Plan**:
1. Fetch SKILL.md files for each skill
2. Inject into claude-code context
3. Execute with full OAuth2 architecture
4. Hand off to kilo-code for security review

---

### Task: Database Migration

**Required Skills**:
- skillsmp:sql-migration-skill
- skillsmp:performance-tuning-skill
- skillsmp:testing-best-practices

**Recommended Agent**: claude-code-zaai (architecture) then deepseek-local (documentation)

---

### Task: Code Review

**Required Skills**:
- skillsmp:code-review-best-practices
- skillsmp:security-audit-skill
- skillsmp:performance-analysis-skill

**Dedicated Agent**: kilo-code-openrouter (specialized for review)

---

## Skill Update Policy

- **SkillsMP Skills**: Auto-updated daily from SkillsMP API
- **Custom Skills**: Manual updates via git commits
- **Cache Strategy**: Skills cached locally, invalidated on `.agents/SKILLS.md` change

---

## Caching & Performance

```python
# Skills are cached in ~/.cache/nebula-orchestrator/skills/

Cache Structure:
├── skillsmp/
│   ├── api-integration-skill.md
│   ├── oauth2-implementation.md
│   └── ...
├── custom/
│   ├── oauth-patterns.md
│   └── ...
└── manifest.json  # Cache metadata & versions
```

Stale Time: 24 hours
Max Cache Size: 500MB
```

---

## SkillsMP Integration

### Architecture

```
Your System          SkillsMP API            GitHub Repository
     │                   │                        │
     ├─ Search for       │                        │
     │  "oauth" skills   │                        │
     │────────────────────>                       │
     │                   │  Index query           │
     │                   │────────────────────────>
     │                   │  Return matches:       │
     │                   │  - oauth2-skill.md    │
     │                   │  - oauth-patterns.md  │
     │                   │  - ...                │
     │                   │<────────────────────────
     │  [oauth2-skill.md │
     │   oauth-patterns] │
     │<────────────────────
     │
     ├─ Cache locally
     │
     ├─ Inject into agent context
     │
     └─ Agent uses skill during execution
```

### API Integration Code

```python
# mcp_server/core/skill_manager.py

import httpx
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
import json

class SkillManager:
    """Manage skills from SkillsMP and local sources"""
    
    SKILLSMP_API_BASE = "https://api.skillsmp.com/v1"
    CACHE_DIR = Path.home() / ".cache" / "nebula-orchestrator" / "skills"
    CACHE_TTL = timedelta(hours=24)
    
    def __init__(self):
        self.CACHE_DIR.mkdir(parents=True, exist_ok=True)
        self.http_client = httpx.AsyncClient()
    
    async def fetch_skill(self, skill_id: str) -> Optional[SkillDefinition]:
        """
        Fetch a skill from SkillsMP or local cache
        
        Args:
            skill_id: "skillsmp:api-integration-skill" or "custom:oauth-patterns"
        """
        source, name = skill_id.split(':', 1)
        
        if source == "skillsmp":
            return await self._fetch_from_skillsmp(name)
        elif source == "custom":
            return await self._fetch_custom(name)
        else:
            raise ValueError(f"Unknown skill source: {source}")
    
    async def _fetch_from_skillsmp(self, skill_name: str) -> Optional[SkillDefinition]:
        """Fetch from SkillsMP with caching"""
        
        # Check cache first
        cache_path = self.CACHE_DIR / "skillsmp" / f"{skill_name}.md"
        if cache_path.exists():
            if self._is_cache_valid(cache_path):
                return self._load_cached_skill(cache_path, "skillsmp")
        
        try:
            # Fetch from SkillsMP API
            response = await self.http_client.get(
                f"{self.SKILLSMP_API_BASE}/skills/{skill_name}",
                headers={"Authorization": f"Bearer {os.getenv('SKILLSMP_TOKEN')}"}
            )
            response.raise_for_status()
            
            skill_data = response.json()
            
            # Save to cache
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            cache_path.write_text(skill_data['content'])
            
            return SkillDefinition(
                id=skill_name,
                name=skill_data['title'],
                description=skill_data['description'],
                source="skillsmp",
                category=skill_data['category'],
                keywords=skill_data['keywords'],
                markdown_content=skill_data['content'],
                version=skill_data['version'],
                last_updated=datetime.fromisoformat(skill_data['updated_at']),
                compatibility=skill_data.get('compatible_agents', {}),
                usage_count=skill_data.get('usage_count', 0),
                success_rate=skill_data.get('success_rate', 0.0)
            )
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch skill {skill_name} from SkillsMP: {e}")
            return None
    
    async def _fetch_custom(self, skill_name: str) -> Optional[SkillDefinition]:
        """Fetch from local custom skills directory"""
        
        skill_path = Path("/project-root") / ".agents" / "custom" / skill_name
        
        if not skill_path.exists():
            logger.warning(f"Custom skill not found: {skill_path}")
            return None
        
        if skill_path.is_file():
            # Single .md file
            content = skill_path.read_text()
        else:
            # Directory with SKILL.md
            skill_md = skill_path / "SKILL.md"
            if not skill_md.exists():
                logger.warning(f"No SKILL.md found in {skill_path}")
                return None
            content = skill_md.read_text()
        
        return SkillDefinition(
            id=f"custom:{skill_name}",
            name=skill_name.replace('-', ' ').title(),
            description="Custom skill",
            source="custom",
            category="custom",
            keywords=[],
            markdown_content=content,
            version="1.0",
            last_updated=datetime.now(),
            compatibility={},
            usage_count=0,
            success_rate=1.0
        )
    
    def _is_cache_valid(self, cache_path: Path) -> bool:
        """Check if cache is still fresh"""
        mtime = datetime.fromtimestamp(cache_path.stat().st_mtime)
        return datetime.now() - mtime < self.CACHE_TTL
    
    def _load_cached_skill(self, cache_path: Path, source: str) -> SkillDefinition:
        """Load skill from cache"""
        content = cache_path.read_text()
        skill_name = cache_path.stem
        
        return SkillDefinition(
            id=f"{source}:{skill_name}",
            name=skill_name.replace('-', ' ').title(),
            description="Cached skill",
            source=source,
            category="cached",
            keywords=[],
            markdown_content=content,
            version="1.0",
            last_updated=datetime.fromtimestamp(cache_path.stat().st_mtime),
            compatibility={},
            usage_count=0,
            success_rate=1.0
        )
    
    async def search_skills(self, query: str, category: str = None) -> list[SkillDefinition]:
        """Search for skills on SkillsMP"""
        
        params = {"q": query}
        if category:
            params["category"] = category
        
        try:
            response = await self.http_client.get(
                f"{self.SKILLSMP_API_BASE}/skills/search",
                params=params,
                headers={"Authorization": f"Bearer {os.getenv('SKILLSMP_TOKEN')}"}
            )
            response.raise_for_status()
            
            results = response.json()['results']
            
            skills = []
            for result in results:
                skill = await self._fetch_from_skillsmp(result['name'])
                if skill:
                    skills.append(skill)
            
            return skills
            
        except httpx.HTTPError as e:
            logger.error(f"Skill search failed: {e}")
            return []
    
    def clear_cache(self):
        """Clear all cached skills"""
        import shutil
        shutil.rmtree(self.CACHE_DIR, ignore_errors=True)
        logger.info("Skill cache cleared")
```

---

## IDE Extension Architecture

### VS Code Extension Structure

```typescript
// vscode_extension/src/extension.ts

import * as vscode from 'vscode';
import { AntigravityOrchestratorExtension } from './orchestrator';
import { MCPClient } from './mcp_client';

const orchestrator = new AntigravityOrchestratorExtension();

export async function activate(context: vscode.ExtensionContext) {
    console.log('Nebula Agent Orchestrator activated');
    
    // Initialize MCP client connection
    await orchestrator.initializeMCP();
    
    // Register commands
    registerCommands(context);
    
    // Register UI components
    registerUI(context);
    
    // Watch for config changes
    orchestrator.watchConfigFiles();
}

function registerCommands(context: vscode.ExtensionContext) {
    
    // Command: Run task with auto-selected agent
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'nebula.executeTask',
            async (task?: string) => {
                if (!task) {
                    task = await vscode.window.showInputBox({
                        prompt: 'Enter task description',
                        placeHolder: 'e.g., Implement OAuth2 authentication'
                    });
                }
                
                if (task) {
                    await orchestrator.executeTask(task);
                }
            }
        )
    );
    
    // Command: Select agent manually
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'nebula.selectAgent',
            async () => {
                const agent = await orchestrator.selectAgentManually();
                if (agent) {
                    orchestrator.setPreferredAgent(agent.id);
                }
            }
        )
    );
    
    // Command: View execution status
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'nebula.viewStatus',
            async () => {
                await orchestrator.showExecutionStatus();
            }
        )
    );
    
    // Command: Reload configs
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'nebula.reloadConfig',
            async () => {
                const result = await orchestrator.reloadConfig();
                vscode.window.showInformationMessage(
                    `✓ Config reloaded: ${result.agents_loaded} agents`
                );
            }
        )
    );
}

function registerUI(context: vscode.ExtensionContext) {
    // Show status bar item
    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBar.text = `🤖 Nebula Ready`;
    statusBar.command = 'nebula.viewStatus';
    statusBar.show();
    
    context.subscriptions.push(statusBar);
    
    // Watch for updates
    orchestrator.on('status-change', (status: string) => {
        statusBar.text = `🤖 ${status}`;
    });
}

export function deactivate() {
    orchestrator.shutdown();
}
```

### MCP Client Implementation

```typescript
// vscode_extension/src/mcp_client.ts

import * as childProcess from 'child_process';
import * as vscode from 'vscode';

export interface MCPToolResult {
    execution_id: string;
    status: 'completed' | 'failed' | 'running';
    output?: string;
    stderr?: string;
    files_modified?: string[];
    execution_time_seconds?: number;
    error_message?: string;
}

export class MCPClient {
    private process: childProcess.ChildProcess | null = null;
    private messageHandlers: Map<string, (data: any) => void> = new Map();
    
    async connect(serverCommand: string, serverArgs: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.process = childProcess.spawn(serverCommand, serverArgs, {
                stdio: ['pipe', 'pipe', 'inherit']
            });
            
            this.process.stdout?.on('data', (data) => {
                this.handleMessage(JSON.parse(data.toString()));
            });
            
            this.process.on('error', reject);
            
            // Simple ready check - could be more sophisticated
            setTimeout(resolve, 1000);
        });
    }
    
    async callTool(
        toolName: string,
        args: any
    ): Promise<MCPToolResult> {
        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36);
            
            const request = {
                jsonrpc: '2.0',
                id: requestId,
                method: 'tools/call',
                params: {
                    name: toolName,
                    arguments: args
                }
            };
            
            // Register handler for response
            this.messageHandlers.set(requestId, (response) => {
                if (response.error) {
                    reject(new Error(response.error.message));
                } else {
                    resolve(response.result);
                }
            });
            
            // Send request
            this.process?.stdin?.write(JSON.stringify(request) + '\n');
            
            // Timeout after 5 minutes
            setTimeout(() => {
                if (this.messageHandlers.has(requestId)) {
                    this.messageHandlers.delete(requestId);
                    reject(new Error('MCP tool call timeout'));
                }
            }, 300000);
        });
    }
    
    async getResource(uri: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36);
            
            const request = {
                jsonrpc: '2.0',
                id: requestId,
                method: 'resources/read',
                params: { uri }
            };
            
            this.messageHandlers.set(requestId, (response) => {
                if (response.error) {
                    reject(new Error(response.error.message));
                } else {
                    resolve(response.result.contents[0].text);
                }
            });
            
            this.process?.stdin?.write(JSON.stringify(request) + '\n');
        });
    }
    
    private handleMessage(message: any): void {
        const id = message.id?.toString();
        
        if (id && this.messageHandlers.has(id)) {
            const handler = this.messageHandlers.get(id)!;
            this.messageHandlers.delete(id);
            handler(message);
        }
    }
    
    disconnect(): void {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }
}
```

### Orchestrator Class

```typescript
// vscode_extension/src/orchestrator.ts

import * as vscode from 'vscode';
import { MCPClient } from './mcp_client';
import * as fs from 'fs';
import * as path from 'path';

export class AntigravityOrchestratorExtension {
    private mcp: MCPClient | null = null;
    private workspaceRoot: string;
    private agents: any[] = [];
    private currentExecution: string | null = null;
    private eventEmitter = new vscode.EventEmitter<any>();
    
    readonly on = this.eventEmitter.event;
    
    constructor() {
        this.workspaceRoot = vscode.workspace.rootPath || '';
    }
    
    async initializeMCP(): Promise<void> {
        const pythonPath = await this.findPythonExecutable();
        const serverScript = path.join(__dirname, '..', '..', 'mcp_server', 'main.py');
        
        this.mcp = new MCPClient();
        await this.mcp.connect(pythonPath, [serverScript]);
        
        // Load initial agent list
        await this.loadAgentCapabilities();
        
        vscode.window.showInformationMessage('✓ Nebula Orchestrator initialized');
    }
    
    private async findPythonExecutable(): Promise<string> {
        // Try to find Python in common locations
        const commonPaths = [
            '/usr/bin/python3',
            '/usr/local/bin/python3',
            'python3',
            'python'
        ];
        
        for (const pythonPath of commonPaths) {
            try {
                await require('child_process').execSync(`${pythonPath} --version`, {
                    stdio: 'ignore'
                });
                return pythonPath;
            } catch {}
        }
        
        throw new Error('Python 3 not found. Please install Python 3.8+');
    }
    
    private async loadAgentCapabilities(): Promise<void> {
        if (!this.mcp) return;
        
        const capabilitiesJson = await this.mcp.getResource('agents://capabilities');
        const capabilities = JSON.parse(capabilitiesJson);
        
        this.agents = capabilities.agents;
        console.log(`Loaded ${this.agents.length} agents`);
    }
    
    async executeTask(task: string): Promise<void> {
        if (!this.mcp) {
            vscode.window.showErrorMessage('MCP client not initialized');
            return;
        }
        
        try {
            this.eventEmitter.fire({ type: 'status-change', text: 'Selecting agent...' });
            
            // Auto-select best agent (could also show picker)
            const agent = await this.selectBestAgent(task);
            
            if (!agent) {
                vscode.window.showErrorMessage('No suitable agent found');
                return;
            }
            
            this.eventEmitter.fire({
                type: 'status-change',
                text: `Executing with ${agent.name}...`
            });
            
            // Call MCP tool
            const result = await this.mcp.callTool('execute_with_agent', {
                agent_id: agent.id,
                task: task,
                execution_mode: 'synchronous'
            });
            
            this.currentExecution = result.execution_id;
            
            // Show results
            this.showExecutionResults(result);
            
        } catch (error) {
            vscode.window.showErrorMessage(`Execution failed: ${error}`);
        }
    }
    
    private async selectBestAgent(task: string): Promise<any> {
        if (this.agents.length === 0) {
            return null;
        }
        
        // Simple scoring: could be more sophisticated
        let bestAgent = null;
        let bestScore = 0;
        
        for (const agent of this.agents) {
            let score = agent.reliability_score || 0.9;
            
            // Boost score if agent specializes in this task type
            if (agent.suited_for) {
                for (const taskType of agent.suited_for) {
                    if (task.toLowerCase().includes(taskType.toLowerCase())) {
                        score += 0.2;
                    }
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestAgent = agent;
            }
        }
        
        return bestAgent;
    }
    
    async selectAgentManually(): Promise<any | null> {
        const items = this.agents.map(agent => ({
            label: agent.name,
            description: `${agent.strengths.join(', ')}`,
            agent
        }));
        
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select an agent...'
        });
        
        return selected ? selected.agent : null;
    }
    
    private showExecutionResults(result: any): void {
        const panel = vscode.window.createWebviewPanel(
            'executionResults',
            'Execution Results',
            vscode.ViewColumn.Two
        );
        
        const html = `
            <html>
            <head>
                <style>
                    body { font-family: monospace; padding: 20px; }
                    .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
                    .completed { background: #d4edda; color: #155724; }
                    .failed { background: #f8d7da; color: #721c24; }
                    .files { margin-top: 20px; }
                    .file-list { list-style: none; padding-left: 0; }
                    .file-list li { padding: 5px; background: #f0f0f0; margin: 5px 0; }
                    pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <h2>Execution Result</h2>
                <div class="status ${result.status}">
                    <strong>Status:</strong> ${result.status}
                </div>
                <div>
                    <strong>Execution ID:</strong> ${result.execution_id}
                </div>
                <div>
                    <strong>Duration:</strong> ${result.execution_time_seconds}s
                </div>
                
                ${result.output ? `
                <h3>Output</h3>
                <pre>${this.escapeHtml(result.output)}</pre>
                ` : ''}
                
                ${result.files_modified && result.files_modified.length > 0 ? `
                <div class="files">
                    <h3>Modified Files</h3>
                    <ul class="file-list">
                        ${result.files_modified.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${result.error_message ? `
                <h3 style="color: red;">Error</h3>
                <pre>${this.escapeHtml(result.error_message)}</pre>
                ` : ''}
            </body>
            </html>
        `;
        
        panel.webview.html = html;
    }
    
    async showExecutionStatus(): Promise<void> {
        if (!this.mcp) return;
        
        const executionsJson = await this.mcp.getResource('agents://executions');
        const data = JSON.parse(executionsJson);
        
        const panel = vscode.window.createWebviewPanel(
            'executionStatus',
            'Agent Executions',
            vscode.ViewColumn.Two
        );
        
        // Create HTML table of executions
        let html = '<table border="1">';
        html += '<tr><th>ID</th><th>Agent</th><th>Status</th><th>Files</th></tr>';
        
        for (const exec of data.executions) {
            html += `<tr>
                <td>${exec.execution_id}</td>
                <td>${exec.agent_id}</td>
                <td>${exec.status}</td>
                <td>${exec.files_modified.length}</td>
            </tr>`;
        }
        
        html += '</table>';
        
        panel.webview.html = html;
    }
    
    watchConfigFiles(): void {
        const configPath = path.join(this.workspaceRoot, '.agents');
        
        const watcher = vscode.workspace.createFileSystemWatcher(
            `${configPath}/**/*.md`
        );
        
        watcher.onDidChange(async (uri) => {
            if (uri.fsPath.includes('AGENTS.md') || 
                uri.fsPath.includes('MCPs.md') || 
                uri.fsPath.includes('SKILLS.md')) {
                
                console.log('Config file changed, reloading...');
                await this.reloadConfig();
                
                this.eventEmitter.fire({
                    type: 'status-change',
                    text: '✓ Config reloaded'
                });
            }
        });
    }
    
    async reloadConfig(): Promise<any> {
        if (!this.mcp) return;
        
        const result = await this.mcp.callTool('reload_config', {});
        await this.loadAgentCapabilities();
        
        return result;
    }
    
    setPreferredAgent(agentId: string): void {
        // Store in workspace state
        vscode.workspace.getConfiguration('nebula').update(
            'preferredAgent',
            agentId
        );
    }
    
    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    shutdown(): void {
        if (this.mcp) {
            this.mcp.disconnect();
        }
    }
}
```

---

## Orchestration Patterns & Workflows

### Pattern 1: Sequential Task Decomposition

**Use Case**: Large feature implementation requiring sequential steps

```
User: "Implement user authentication system"
         ↓
Antigravity (Coordinator):
├─ Decompose into:
│  1. "Implement OAuth2 server-side logic"
│  2. "Build login UI component"
│  3. "Write integration tests"
│  4. "Security audit"
│  5. "Documentation"
│
└─ Route each to best agent
   1 → Claude Code (backend expert)
   2 → Claude Code (React expert)
   3 → Kilo Code (testing specialist)
   4 → Kilo Code (security specialist)
   5 → DeepSeek (documentation)
   
Flow:
Step 1: Claude executes, outputs: oauth-server.ts, models.ts
        ↓ (Pass files to Step 2)
Step 2: Claude reads Step 1 outputs, generates login-form.tsx
        ↓ (Pass files to Step 3)
Step 3: Kilo Code reads all outputs, writes tests
        ↓ (Pass outputs to Step 4)
Step 4: Kilo Code runs security analysis
        ↓ (Pass analysis to Step 5)
Step 5: DeepSeek generates documentation

Total Time: ~45 minutes (would be 2+ hours with manual execution)
```

### Pattern 2: Parallel Task Distribution

**Use Case**: Multiple independent features, different teams

```
User: "Implement OAuth2, Redis caching, and API rate limiting"
      (These are independent - can run in parallel)
         ↓
Antigravity decomposes into 3 parallel tasks:

Task A: OAuth2           →  Claude Code
Task B: Redis caching   →  Kilo Code  
Task C: Rate limiting   →  DeepSeek

All execute simultaneously:
[Claude: 12 min] [Kilo: 8 min] [DeepSeek: 10 min]

Max time: 12 minutes (vs 30 minutes if sequential)
```

### Pattern 3: Skill-Based Routing with Automatic Selection

```
User: "Fix authentication bugs"
         ↓
Antigravity analyzes task
         ↓
Required: Code review, Debugging, Testing
         ↓
Search agent capabilities:
├─ Claude Code: 80% match (not specialized in debugging)
├─ Kilo Code: 95% match (specialized in debugging)
├─ DeepSeek: 60% match (generic)
         ↓
Auto-select: Kilo Code
         ↓
Fetch skills:
├─ skillsmp:debugging-skill
├─ skillsmp:testing-skill
├─ custom:nébula-bug-fixing-patterns
         ↓
Inject into Kilo's context → Execute
```

### Pattern 4: Quality Gate Workflow (Multiple Reviewers)

```
User: "Implement critical payment feature"
         ↓
Step 1: Implementation
Claude Code generates:
├─ payment-processor.ts
├─ stripe-integration.ts
└─ payment-models.ts

         ↓ (Automatic gate: requires review)

Step 2: Security Review
Kilo Code reviews for:
├─ OWASP Top 10 vulnerabilities
├─ Secrets in code
├─ Auth validation
         ↓ Output: security-audit.md

Step 3: Performance Review
DeepSeek checks:
├─ Database query efficiency
├─ Caching opportunities
├─ API response times
         ↓ Output: performance-report.md

Step 4: Approval
All reviews must pass before merge.
If issues found, hand back to Claude for fixes.
         ↓
Feature merged to main branch
```

### Pattern 5: Adaptive Agent Selection Based on Availability

```
Task: "Refactor database layer"

First choice: Claude Code (architecture expert)
  But: Currently executing 10 tasks, queue is 2+ hours

Fallback scoring:
├─ Kilo Code: 85% match, 2 tasks queued, ETA: 15 min → Score: 0.72
├─ DeepSeek: 70% match, available now → Score: 0.70

Selection: Kilo Code (better match + shorter queue)
```

---

## Security & State Management

### Secret Management

```python
# .env.vault (encrypted with industrial-grade encryption)

# SkillsMP
SKILLSMP_TOKEN=sk_live_xxx...

# Agent API Keys
Z_AI_KEY=sk_zaiu_xxx...
OPENROUTER_KEY=sk_openrouter_xxx...
CLAUDE_API_KEY=sk_ant_xxx...

# Database
DB_USER=nebula_prod
DB_PASSWORD=<encrypted>
POSTGRES_URL=postgresql://...

# Git
GITHUB_TOKEN=ghp_xxx...

# Secrets stored in secure vault (HashiCorp Vault, AWS Secrets Manager, or 1Password)
```

### Redis State Schema

```redis
# Executions
execution:{id}
  - agent_id
  - task
  - status (queued, running, completed, failed)
  - created_at
  - started_at
  - completed_at
  - stdout
  - stderr
  - files_modified
  - tokens_used

# Agent Status
agent:{id}:status
  - current_execution_count
  - total_today
  - total_month
  - last_execution_time
  - health_check_status

# Task Queue
task:queue
  [task_id_1, task_id_2, ...]

# Skill Cache Metadata
skill:cache:{skill_id}
  - fetched_at
  - version
  - expiry_time
```

### State Recovery Strategy

In case of crash:
1. All execution state in Redis (persistent)
2. File changes tracked in git
3. On restart, resume incomplete executions
4. Conflict resolution: newer changes win

---

## Deployment & Operations

### Docker Compose Setup

```yaml
# docker-compose.yml

version: '3.9'

services:
  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    ports:
      - "8000:8000"
    environment:
      - Z_AI_KEY=${Z_AI_KEY}
      - OPENROUTER_KEY=${OPENROUTER_KEY}
      - SKILLSMP_TOKEN=${SKILLSMP_TOKEN}
      - REDIS_URL=redis://redis:6379
      - PROJECT_ROOT=/project-root
      - LOG_LEVEL=info
    volumes:
      - /project-root:/project-root
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - redis
      - postgres
    networks:
      - nebula

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - nebula

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=nebula_dev
      - POSTGRES_USER=nebula
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - nebula

  # Optional: Local LLM server for DeepSeek
  deepseek-local:
    image: vllm/vllm-openai:latest
    command: >
      python -m vllm.entrypoints.openai.api_server
      --model deepseek-ai/deepseek-coder-33b-instruct
      --dtype auto
      --max-model-len 16000
    ports:
      - "8001:8000"
    environment:
      - CUDA_VISIBLE_DEVICES=0
    volumes:
      - huggingface_cache:/root/.cache/huggingface
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    networks:
      - nebula

volumes:
  redis_data:
  postgres_data:
  huggingface_cache:

networks:
  nebula:
    driver: bridge
```

### Monitoring & Logging

```python
# mcp_server/utils/monitoring.py

from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Setup Jaeger tracing
jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

tracer = trace.get_tracer(__name__)

# Span for each execution
with tracer.start_as_current_span("agent_execution") as span:
    span.set_attribute("agent_id", agent_id)
    span.set_attribute("task_length", len(task))
    span.set_attribute("skills_count", len(skills))
    
    # Execute...
    
    span.set_attribute("execution_status", result.status)
    span.set_attribute("files_modified", len(result.files_modified))
```

---

## Development Roadmap

### Phase 1: MVP (Weeks 1-4)

**Goal**: Basic MCP server + single agent support

```
✓ FastMCP server skeleton
✓ AGENTS.md parser
✓ Claude Code CLI wrapper
✓ Basic execute_with_agent tool
✓ State in SQLite (no Redis yet)
✓ Manual testing
```

**Deliverables**:
- MCP server running locally
- Can execute Claude Code on tasks
- Basic config parsing
- Project size: ~2K LOC

**Team**: 1 Senior Engineer + 1 Junior

---

### Phase 2: Multi-Agent & Configuration (Weeks 5-8)

**Goal**: Add 2+ agents, complete config system

```
✓ Kilo Code integration
✓ DeepSeek local integration
✓ MCPs.md parser
✓ Agent selector logic
✓ Redis state management
✓ E2E tests
```

**Deliverables**:
- 3 agents working in parallel
- Config hot-reload
- State persistence in Redis
- Test coverage: 70%+
- Project size: ~5K LOC

**Team**: 2 Senior Engineers + 1 Junior

---

### Phase 3: SkillsMP + IDE Extension (Weeks 9-12)

**Goal**: Skill marketplace integration + VS Code extension

```
✓ SkillsMP API integration
✓ Skill fetching & caching
✓ VS Code extension scaffolding
✓ Agent selector UI
✓ Execution results panel
✓ Config file watcher
```

**Deliverables**:
- SkillsMP skills working in prompts
- 33K+ skills available
- VS Code extension (beta)
- Skill library browsing
- Project size: ~8K LOC

**Team**: 2 Senior Engineers + 2 Juniors + 1 PM

---

### Phase 4: Production Hardening (Weeks 13-16)

**Goal**: Production-ready system

```
✓ Performance optimization
✓ Horizontal scaling (Kubernetes)
✓ Advanced error handling
✓ Monitoring & logging
✓ Security audit
✓ Documentation
✓ User onboarding flow
```

**Deliverables**:
- Helm charts for K8s
- Datadog integration
- Terraform configs (AWS/GCP)
- Open-source documentation
- Project size: ~12K LOC

**Team**: 3 Senior Engineers + 2 Juniors + 1 DevOps + 1 PM + 1 Designer

---

### Phase 5+: Extensions & Ecosystem (Months 5+)

```
✓ JetBrains IDE extension (Rider, PyCharm)
✓ Cursor integration (custom agent in Cursor)
✓ Anthropic Skills API integration
✓ Agent marketplace (publish skills)
✓ Advanced routing algorithms (ML-based)
✓ Dashboard & analytics
✓ Team collaboration features
```

---

## Competitive Analysis

### Comparison Matrix

| Feature | Antigravity | Cursor | Claude Code | **Our Platform** |
|---------|------------|--------|-------------|-----------------|
| **Multi-Model BYOK** | ❌ No | ✅ Limited | ✅ Limited | ✅✅ Unlimited |
| **Multi-Agent Orchestration** | ❌ No | ❌ No | ❌ No | ✅✅ Advanced |
| **MCP Support** | ✅ Native | ❌ No | ✅ Native | ✅✅ Deep |
| **SkillsMP Integration** | ❌ No | ❌ No | ❌ No | ✅✅ Native |
| **Declarative Config** | ❌ No | ❌ No | ❌ No | ✅✅ Git-friendly |
| **Parallel Execution** | ❌ No | ❌ No | ❌ No | ✅✅ Yes |
| **Cost Optimization** | ❌ Locked | ✅ Some | ✅ Some | ✅✅ Full Control |
| **IDE Integration** | ✅ Native | ✅ Native | ✅ Native | ✅ VS Code (then all) |
| **Enterprise Ready** | ⚠️ Early | ✅ Yes | ⚠️ Limited | ⚠️ Roadmap |

### Differentiation

**Unique to Our Platform**:
1. **MCP-Native Orchestration**: Only platform built on MCP from ground up
2. **Model Agnosticity**: Use any model, any endpoint, any combination
3. **Declarative Infrastructure as Code**: AGENTS.md, MCPs.md, SKILLS.md versioned in git
4. **33K+ Built-in Skills**: SkillsMP integration out of box
5. **Smart Task Routing**: Skill-based, cost-aware, availability-aware agent selection
6. **Skill Injection**: Automatically enhance agents with relevant expertise

---

## Monetization & Go-to-Market

### SaaS Model (Primary)

**Pricing Tiers**:

1. **Starter** ($99/month)
   - Up to 3 agents
   - 1,000 executions/month
   - Community skills only
   - Email support

2. **Professional** ($499/month)
   - Up to 10 agents
   - 10,000 executions/month
   - Premium skills (coming soon)
   - Priority support
   - Advanced routing algorithms

3. **Enterprise** (Custom)
   - Unlimited agents
   - Unlimited executions
   - Private skill marketplace
   - SLA: 99.9%
   - Dedicated support
   - Custom integrations

**Freemium Option**: (to drive adoption)
- Free tier: 1 agent, 100 executions/month
- Limited SkillsMP access
- Community support
- Can be unlimited for open-source projects

### Revenue Streams

1. **Subscription** (70% of revenue)
   - Base platform fee
   - Per-agent add-ons
   - Per-skill licenses (premium skills)

2. **Model API Passthrough** (15% of revenue)
   - We act as proxy for Z.ai, OpenRouter, etc.
   - Take 5-10% margin on API calls
   - Transparent to customers (they see actual costs + our fee)

3. **Skill Marketplace** (10% of revenue)
   - Creators publish skills
   - Platform takes 15-20% commission
   - Revenue-share model

4. **Professional Services** (5% of revenue)
   - Custom agent development
   - Integration consulting
   - Training programs

### Go-to-Market Strategy

**Phase 1: Community & Early Adopters (Months 1-3)**
- Open-source MCP server (GitHub)
- Free tier with generous limits
- Community Slack
- Dev.to + Twitter campaign
- Target: AI dev communities, HN, r/programming

**Phase 2: Vertical Markets (Months 4-6)**
- Enterprise sales for fintech (compliance, security review)
- SaaS dev agencies (faster feature shipping)
- Crypto/Web3 teams (rapid prototyping)

**Phase 3: Enterprise (Months 7+)**
- Sales team
- Fortune 500 pilots
- Regional partnerships

### Marketing Channels

1. **Content**:
   - "How to build multi-agent systems" blogs
   - YouTube tutorials for VS Code extension
   - Case studies (vs Cursor, vs Claude Code)

2. **Community**:
   - Sponsorship: MCP + Anthropic communities
   - GitHub trending
   - ProductHunt launch

3. **Partnerships**:
   - Z.ai / Zhipu partnership (they promote us)
   - OpenRouter partnership
   - SkillsMP official integration

4. **Founder Sales**:
   - You (Israel) engage AI/ML communities
   - Nébula brand awareness
   - LinkedIn presence

---

## Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Antigravity changes MCP interface** | Medium | High | Monitor Google roadmap, maintain compatibility layer |
| **Model API rate limits** | High | Medium | Implement smart queuing, fallback models |
| **State corruption** | Low | High | 3-way redundancy: Redis + Postgres + Git |
| **Conflict between agents** | High | Medium | Implement file-locking, merge strategies |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Market not ready** | Medium | High | Start with free tier, get user feedback early |
| **Competitor launches first** | Medium | High | Move fast (Phase 1 in 4 weeks), patents |
| **Model providers change pricing** | High | Medium | Transparent pricing pass-through |
| **Enterprise adoption slow** | Medium | Medium | Focus on SMB first, then enterprise |

---

## Conclusion

This multi-agent orchestration platform represents a **generational shift** in how developers interact with AI models. By combining:

✅ **Google Antigravity** (strategic planning)  
✅ **MCP Protocol** (standardized integration)  
✅ **SkillsMP** (33K+ pre-built expertise)  
✅ **Multiple Models** (specialized agents)  
✅ **Declarative Configuration** (git-friendly infrastructure)

We create a system that is:

🎯 **More Capable**: Multiple specialized agents > single generalist  
🎯 **More Affordable**: Route to cheapest capable model = 50-80% cost savings  
🎯 **More Reliable**: Quality gates, peer review, security audit automated  
🎯 **More Maintainable**: Config in git, reproducible workflows  
🎯 **More Extensible**: 33K+ skills available immediately  

**Market Opportunity**: $5B+ TAM (IDE market + agent orchestration market converging)

**Timeline to Product-Market Fit**: 16 weeks from start to enterprise-ready system

**Success Metrics**:
- Phase 1 (MVP): 100+ GitHub stars, 10+ beta users
- Phase 2: 1,000+ active users, $50K MRR
- Phase 3: 10,000+ users, $500K MRR, Series A ready

---

**Next Steps**:
1. ✅ Finalize architecture & specifications (this document)
2. 🔲 Build Phase 1 MVP (weeks 1-4)
3. 🔲 Close seed funding for team expansion
4. 🔲 Launch public beta
5. 🔲 Enterprise sales cycle

---

**Document Complete**  
For questions or discussions: israel@nebula-agile.com