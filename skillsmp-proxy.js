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

console.log("Starting SkillsMP Local Proxy (v4 - Stable)...");

// API Proxy Handler
app.use('/api', async (req, res) => {
    const endpoint = req.url; 
    const targetUrl = `${API_BASE_URL}${endpoint}`;
    
    console.log(`[Proxy] Forwarding: ${endpoint} -> ${targetUrl}`);

    try {
        const { body, statusCode } = await gotScraping({
            url: targetUrl,
            method: req.method,
            responseType: 'text', 
            headers: {
                'Authorization': `Bearer ${process.env.VITE_SKILLSMP_API_KEY}`,
                'Referer': 'https://skillsmp.com/',
                'Origin': 'https://skillsmp.com',
                'Host': 'skillsmp.com'
            },
            headerGeneratorOptions: {
                browsers: [{ name: 'chrome', minVersion: 120 }],
                devices: ['desktop'],
                locales: ['en-US'],
                operatingSystems: ['windows'],
            },
            throwHttpErrors: false
        });

        console.log(`[Proxy] Upstream Status: ${statusCode}`);

        try {
            const data = JSON.parse(body);
            res.status(statusCode).json(data);
        } catch (e) {
            console.error(`[Proxy] Non-JSON Response (length: ${body.length})`);
            if (statusCode === 403) {
                 console.error("⛔ Blocked by Cloudflare WAF");
            }
            res.status(statusCode).json({ 
                error: "Upstream API Error (Non-JSON)", 
                status: statusCode,
                details: "Likely blocked by WAF or invalid response",
                bodyPreview: body.substring(0, 200)
            });
        }

    } catch (error) {
        console.error('[Proxy Fault]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Download Proxy Handler (Improved)
app.get('/download', async (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl) return res.status(400).send('Missing url parameter');

    console.log(`[Proxy] Download Request: ${fileUrl}`);

    try {
        // Use promise-based request to check status first
        const response = await gotScraping({
            url: fileUrl,
            responseType: 'buffer', // Download as binary buffer
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://skillsmp.com/',
                'Accept': '*/*'
            },
            throwHttpErrors: false,
            followRedirect: true, // Explicitly allow redirects
            maxRedirects: 5
        });

        console.log(`[Proxy] Download URL: ${fileUrl}`);
        console.log(`[Proxy] Status: ${response.statusCode}`);
        console.log(`[Proxy] Content-Type: ${response.headers['content-type']}`);
        console.log(`[Proxy] Size: ${response.body.length} bytes`);

        if (response.statusCode >= 400) {
            return res.status(response.statusCode).send(`Upstream Error: ${response.statusCode} - ${response.statusMessage}`);
        }

        if (response.body.length === 0) {
             console.error("[Proxy] 🔴 Empty body received!");
            return res.status(502).send('Empty file received from upstream. URL might be invalid or protected.');
        }

        // Set headers
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        res.setHeader('Content-Length', response.body.length);
        res.send(response.body);

    } catch (error) {
        console.error('[Proxy Download Error]', error);
        res.status(500).send(error.message);
    }
});

// Text Proxy for README/SKILL.md
app.get('/preview', async (req, res) => {
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

// Generic JSON Proxy for GitHub API (to avoid rate limits/CORS on client)
app.get('/github-api', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`✅ Local Proxy running on http://localhost:${PORT}`);
});
