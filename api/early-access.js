const { createHmac } = require('node:crypto');

const limits = { name: 100, email: 254, phone: 25, currentCity: 80, city: 40, area: 60, date: 10, size: 4, budget: 40, property: 40, service: 60, homeStatus: 40 };

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).end();
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || JSON.stringify(body).length > 5000) return res.status(400).end();
  } catch { return res.status(400).end(); }
  const { kind, consent, website, needs, updates } = body;
  if (!['relocation','owner','partner'].includes(kind) || consent !== 'on' || website) return res.status(400).end();
  const details = {};
  for (const [key, max] of Object.entries(limits)) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== 'string' || body[key].length > max) return res.status(400).end();
    if (body[key].trim()) details[key] = body[key].trim();
  }
  if (!details.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email || '')) return res.status(400).end();
  if (details.date && !/^\d{4}-\d{2}-\d{2}$/.test(details.date)) return res.status(400).end();
  if (!Array.isArray(needs) || needs.length > 12 || needs.some(value => typeof value !== 'string' || value.length > 60)) return res.status(400).end();
  details.needs = needs;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).end();
  const client = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const rateKey = createHmac('sha256', key).update(String(client).split(',')[0].trim()).digest('hex');
  try {
    const result = await fetch(new URL('/rest/v1/rpc/record_early_access_lead', url), {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json', ...(key.startsWith('ey') ? {Authorization: 'Bearer ' + key} : {}) },
      body: JSON.stringify({ lead_kind: kind, lead_details: details, wants_updates: updates === 'on', rate_key: rateKey }),
      signal: AbortSignal.timeout(8000)
    });
    if (!result.ok) return res.status(503).end();
    return res.status(await result.json() === true ? 201 : 429).end();
  } catch { return res.status(503).end(); }
};
