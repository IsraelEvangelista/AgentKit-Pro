import express from 'express';
import cors from 'cors';
import { gotScraping } from 'got-scraping';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// --- SPECIFIC API ROUTES (Matching api/ folder structure) ---

// 1. Download Proxy Handler (/api/download)
app.get('/api/download', async (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl) return res.status(400).send('Missing url parameter');

    console.log(`[Proxy] Download Request: ${fileUrl}`);

    try {
        const response = await gotScraping({
            url: fileUrl,
            responseType: 'buffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://skillsmp.com/',
                'Accept': '*/*'
            },
            throwHttpErrors: false,
            followRedirect: true, 
            maxRedirects: 5
        });

        if (response.statusCode >= 400) {
            return res.status(response.statusCode).send(`Upstream Error: ${response.statusCode} - ${response.statusMessage}`);
        }

        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        res.setHeader('Content-Length', response.body.length);
        res.send(response.body);

    } catch (error) {
        console.error('[Proxy Download Error]', error);
        res.status(500).send(error.message);
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

// 4. General API Proxy Handler (/api/*)
// This catches /api/skills/ai-search etc.
app.use('/api', async (req, res) => {
    const endpoint = req.url; 
    // IMPORTANT: req.url here is RELATIVE to /api mount point.
    // If request is /api/skills/ai-search, req.url is /skills/ai-search
    
    const targetUrl = `${API_BASE_URL}${endpoint}`;
    
    console.log(`[Proxy] Forwarding: ${endpoint} -> ${targetUrl}`);

    try {
        const { body, statusCode } = await gotScraping({
            url: targetUrl,
            method: req.method,
            responseType: 'text', 
            headers: {
                'Authorization': `Bearer ${process.env.VITE_SKILLSMP_API_KEY}`,
                // ... headers
            },
            throwHttpErrors: false
        });

        // ... response handling
        try {
            const data = JSON.parse(body);
             res.status(statusCode).json(data);
        } catch (e) {
             res.status(statusCode).send(body);
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`✅ Local Proxy running on http://localhost:${PORT}`);
    console.log(`   - Download: http://localhost:${PORT}/api/download`);
    console.log(`   - Preview:  http://localhost:${PORT}/api/preview`);
    console.log(`   - Search:   http://localhost:${PORT}/api/skills/ai-search`);
});
