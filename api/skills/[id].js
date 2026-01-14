import { gotScraping } from 'got-scraping';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Missing skill id' });
    return;
  }

  const apiKey = process.env.SKILLSMP_API_KEY;
  if (!apiKey) {
    console.error('[Vercel] SKILLSMP_API_KEY environment variable is required but not set.');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const targetUrl = `https://skillsmp.com/api/v1/skills/${encodeURIComponent(id)}`;

  try {
    const { body, statusCode } = await gotScraping({
      url: targetUrl,
      method: 'GET',
      responseType: 'json',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Referer': 'https://skillsmp.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      throwHttpErrors: false
    });

    res.status(statusCode).json(body);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

