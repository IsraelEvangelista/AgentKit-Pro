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
}
