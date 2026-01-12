import { gotScraping } from 'got-scraping';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'Missing url' });

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
    res.status(500).json({ error: e.message });
  }
}
