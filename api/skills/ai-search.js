import { gotScraping } from 'got-scraping';

export default async function handler(req, res) {
  // CORS for Vercel
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

  const { q } = req.query;
  const targetUrl = `https://skillsmp.com/api/v1/skills/ai-search?q=${encodeURIComponent(q || '')}`;

  console.log(`[Vercel Search] Forwarding to: ${targetUrl}`);

  try {
    const { body, statusCode } = await gotScraping({
      url: targetUrl,
      method: 'GET',
      responseType: 'json',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SKILLSMP_API_KEY}`,
        'Referer': 'https://skillsmp.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      throwHttpErrors: false
    });

    res.status(statusCode).json(body);
  } catch (error) {
    console.error('[Vercel Search Error]', error);
    res.status(500).json({ error: error.message });
  }
}
