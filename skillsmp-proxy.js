import express from 'express';
import cors from 'cors';
import got from 'got';
import { gotScraping } from 'got-scraping';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mcpCategories from './api/mcp/categories.js';
import mcpSkills from './api/mcp/skills.js';
import mcpSkillDescription from './api/mcp/skill-description.js';
import mcpLoadSkill from './api/mcp/load-skill.js';

// ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const API_BASE_URL = "https://skillsmp.com/api/v1";

console.log("Starting SkillsMP Local Proxy (v5 - Vercel Compatible)...");

const getSkillsmpApiKey = () => {
    const apiKey = process.env.SKILLSMP_API_KEY;

    if (!apiKey) {
        console.error('[Proxy] SKILLSMP_API_KEY environment variable is required but not set.');
    }

    return apiKey;
};

// --- SPECIFIC API ROUTES (Matching api/ folder structure) ---

// 1. Download Proxy Handler (/api/download)
app.get('/api/download', async (req, res) => {
    const rawUrl = req.query.url;
    const fileUrl = Array.isArray(rawUrl) ? rawUrl[0] : rawUrl;
    if (typeof fileUrl !== 'string' || !fileUrl) return res.status(400).send('Missing url parameter');
    if (!/^https?:\/\//i.test(fileUrl)) return res.status(400).send('Invalid url parameter');

    console.log(`[Proxy] Download Request: ${fileUrl}`);

    try {
        const urlObj = new URL(fileUrl);
        const isGithub = urlObj.hostname === 'github.com' || urlObj.hostname === 'codeload.github.com';
        const isSkillsmp = urlObj.hostname.endsWith('skillsmp.com');
        const apiKey = getSkillsmpApiKey();
        const authorizationHeader =
          isSkillsmp && apiKey
            ? `Bearer ${apiKey}`
            : undefined;

        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': isSkillsmp ? 'https://skillsmp.com/' : undefined,
          'Accept': '*/*',
          'Authorization': authorizationHeader
        };

        const response = isGithub
          ? await got(fileUrl, {
              responseType: 'buffer',
              headers,
              throwHttpErrors: false,
              followRedirect: true,
              maxRedirects: 5
            })
          : await gotScraping({
              url: fileUrl,
              responseType: 'buffer',
              headers,
              throwHttpErrors: false,
              followRedirect: true,
              maxRedirects: 5
            });

        if (response.statusCode >= 400) {
            return res.status(response.statusCode).send(`Upstream Error: ${response.statusCode} - ${response.statusMessage || ''}`.trim());
        }

        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        res.setHeader('Content-Length', response.body.length);
        res.send(response.body);

    } catch (error) {
        console.error('[Proxy Download Error]', error);
        res.status(500).send(error instanceof Error ? error.message : 'Unknown error');
    }
});

// 2. Text Proxy for README/SKILL.md (/api/preview)
app.get('/api/preview', async (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl) return res.status(400).send('Missing url');

    try {
        const { body } = await gotScraping({
            url: fileUrl,
            responseType: 'text',
            throwHttpErrors: false
        });
        res.send(body);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// 3. GitHub API Proxy (/api/github-api)
app.get('/api/github-api', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: 'Missing url' });

    console.log(`[Proxy] GitHub API Request: ${targetUrl}`);
    
    try {
        const { body } = await gotScraping({
            url: targetUrl,
            responseType: 'json',
            headers: {
                'Authorization': process.env.GITHUB_TOKEN ? `Bearer ${process.env.GITHUB_TOKEN}` : undefined,
                'User-Agent': 'AgentKit-Pro-Proxy',
                'Accept': 'application/vnd.github.v3+json'
            },
            throwHttpErrors: false
        });
        res.json(body);
    } catch (e) {
        console.error('[Proxy GitHub API Error]', e);
        res.status(500).json({ error: e.message });
    }
});

// 4. MCP API (local dev) - forwarded to Supabase with per-user token
app.get('/api/mcp/categories', (req, res) => mcpCategories(req, res));
app.get('/api/mcp/skills', (req, res) => mcpSkills(req, res));
app.get('/api/mcp/skill-description', (req, res) => mcpSkillDescription(req, res));
app.post('/api/mcp/load-skill', (req, res) => mcpLoadSkill(req, res));

// 5. General API Proxy Handler (/api/*)
// This catches /api/skills/ai-search etc.
app.use('/api', async (req, res) => {
    const endpoint = req.url;
    // IMPORTANT: req.url here is RELATIVE to /api mount point.
    // If request is /api/skills/ai-search, req.url is /skills/ai-search

    const targetUrl = `${API_BASE_URL}${endpoint}`;

    console.log(`[Proxy] Forwarding: ${endpoint} -> ${targetUrl}`);

    try {
        const apiKey = getSkillsmpApiKey();
        if (!apiKey) {
            res.status(500).json({ error: 'Missing SKILLSMP_API_KEY' });
            return;
        }

        const { body, statusCode } = await gotScraping({
            url: targetUrl,
            method: req.method,
            responseType: 'text',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://skillsmp.com/',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Origin': 'https://skillsmp.com',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site'
            },
            throwHttpErrors: false,
            followRedirect: true,
            maxRedirects: 5,
            https: {
                rejectUnauthorized: false
            }
        });

        // ... response handling
        try {
            const data = JSON.parse(body);
             res.status(statusCode).json(data);
        } catch (e) {
             res.status(statusCode).send(body);
        }

    } catch (error) {
        console.error('[Proxy Forward Error]', error.message);
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`✅ Local Proxy running on http://localhost:${PORT}`);
    console.log(`   - Download: http://localhost:${PORT}/api/download`);
    console.log(`   - Preview:  http://localhost:${PORT}/api/preview`);
    console.log(`   - Search:   http://localhost:${PORT}/api/skills/ai-search`);
});
