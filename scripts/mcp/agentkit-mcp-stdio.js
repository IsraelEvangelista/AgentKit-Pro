import readline from 'node:readline';

const endpoint = (process.env.AGENTKIT_MCP_ENDPOINT || '').replace(/\/+$/g, '');
const token = process.env.AGENTKIT_MCP_TOKEN || '';

const jsonWrite = (obj) => {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
};

const isObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

const httpJson = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : 30_000;
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }
    if (!res.ok) {
      const message = typeof json?.error === 'string' ? json.error : `HTTP ${res.status}`;
      throw new Error(message);
    }
    return json;
  } finally {
    clearTimeout(t);
  }
};

const toolResult = (data) => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  structuredContent: data,
  isError: false,
});

const toolError = (message) => ({
  content: [{ type: 'text', text: String(message || 'Unknown error') }],
  isError: true,
});

const requireConfig = () => {
  if (!endpoint) throw new Error('Missing AGENTKIT_MCP_ENDPOINT');
  if (!token) throw new Error('Missing AGENTKIT_MCP_TOKEN');
};

const tools = [
  {
    name: 'list_categories',
    title: 'Listar Categorias',
    description: 'Lista as categorias disponíveis dentre as skills ativas no MCP.',
    inputSchema: { type: 'object', properties: {}, required: [], additionalProperties: false },
  },
  {
    name: 'list_skill_names',
    title: 'Listar Nome das Skills',
    description: 'Lista os nomes e IDs das skills ativas no MCP, com filtro opcional por categoria.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Slug da categoria (opcional)' },
        categoryId: { type: 'string', description: 'ID da categoria (opcional)' },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'get_skill_description',
    title: 'Listar Descrição da Skill Escolhida',
    description: 'Retorna metadados e descrição da skill (somente se ativa no MCP).',
    inputSchema: {
      type: 'object',
      properties: { skillId: { type: 'string', minLength: 1 } },
      required: ['skillId'],
      additionalProperties: false,
    },
  },
  {
    name: 'load_skill',
    title: 'Carregar Skill',
    description: 'Carrega SKILL.md e lista anexos. Pode incluir conteúdo de arquivos específicos.',
    inputSchema: {
      type: 'object',
      properties: {
        skillId: { type: 'string', minLength: 1 },
        paths: { type: 'array', items: { type: 'string' } },
        includeAllAttachments: { type: 'boolean' },
        maxAttachmentBytes: { type: 'integer', minimum: 1 },
        maxFiles: { type: 'integer', minimum: 1 },
      },
      required: ['skillId'],
      additionalProperties: false,
    },
  },
];

const handleToolsCall = async (name, args) => {
  requireConfig();
  const a = isObject(args) ? args : {};

  if (name === 'list_categories') {
    const data = await httpJson(`${endpoint}/api/mcp/categories`);
    return toolResult(data);
  }

  if (name === 'list_skill_names') {
    const qs = new URLSearchParams();
    if (typeof a.category === 'string' && a.category) qs.set('category', a.category);
    if (typeof a.categoryId === 'string' && a.categoryId) qs.set('categoryId', a.categoryId);
    const url = `${endpoint}/api/mcp/skills${qs.toString() ? `?${qs.toString()}` : ''}`;
    const data = await httpJson(url);
    const names = (data?.skills || []).map((s) => ({ id: s.id, title: s.title, category: s.category, category_id: s.category_id }));
    return toolResult({ skills: names });
  }

  if (name === 'get_skill_description') {
    const skillId = typeof a.skillId === 'string' ? a.skillId : '';
    if (!skillId) return toolError('Missing skillId');
    const data = await httpJson(`${endpoint}/api/mcp/skill-description?skillId=${encodeURIComponent(skillId)}`);
    return toolResult(data);
  }

  if (name === 'load_skill') {
    const skillId = typeof a.skillId === 'string' ? a.skillId : '';
    if (!skillId) return toolError('Missing skillId');
    const body = {
      paths: Array.isArray(a.paths) ? a.paths : undefined,
      includeAllAttachments: Boolean(a.includeAllAttachments),
      maxAttachmentBytes: typeof a.maxAttachmentBytes === 'number' ? a.maxAttachmentBytes : undefined,
      maxFiles: typeof a.maxFiles === 'number' ? a.maxFiles : undefined,
    };
    const data = await httpJson(`${endpoint}/api/mcp/load-skill?skillId=${encodeURIComponent(skillId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    return toolResult(data);
  }

  return toolError(`Unknown tool: ${name}`);
};

const handleRequest = async (msg) => {
  const id = msg?.id;
  const method = msg?.method;

  if (!method || typeof method !== 'string') return;

  if (method === 'initialize') {
    const pv = msg?.params?.protocolVersion || '2025-11-25';
    jsonWrite({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: pv,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'agentkit-pro', version: '0.1.0' },
      },
    });
    return;
  }

  if (method === 'ping') {
    jsonWrite({ jsonrpc: '2.0', id, result: {} });
    return;
  }

  if (method === 'tools/list') {
    jsonWrite({ jsonrpc: '2.0', id, result: { tools } });
    return;
  }

  if (method === 'tools/call') {
    try {
      const name = msg?.params?.name;
      const args = msg?.params?.arguments;
      const result = await handleToolsCall(name, args);
      jsonWrite({ jsonrpc: '2.0', id, result });
    } catch (e) {
      const result = toolError(e instanceof Error ? e.message : 'Tool execution failed');
      jsonWrite({ jsonrpc: '2.0', id, result });
    }
    return;
  }

  if (!id) return;

  jsonWrite({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  });
};

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', async (line) => {
  const trimmed = String(line || '').trim();
  if (!trimmed) return;
  let msg = null;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return;
  }
  await handleRequest(msg);
});
