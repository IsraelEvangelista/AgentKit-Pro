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

  const fileUrl = req.query.url;
  if (!fileUrl) return res.status(400).send('Missing url parameter');

  console.log(`[Vercel Download] Request: ${fileUrl}`);

  try {
    const response = await gotScraping({
      url: fileUrl,
      responseType: 'buffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://skillsmp.com/',
      },
      throwHttpErrors: false,
      followRedirect: true,
      maxRedirects: 5
    });

    if (response.statusCode >= 400) {
      return res.status(response.statusCode).send(`Upstream Error: ${response.statusCode}`);
    }

    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', response.body.length);
    res.send(response.body);

  } catch (error) {
    console.error('[Vercel Download Error]', error);
    res.status(500).send(error.message);
  }
}
