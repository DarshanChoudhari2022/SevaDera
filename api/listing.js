const site = 'https://aangansetu.vercel.app';
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const escapeHtml = value => String(value).replace(/[&<>"']/g, character =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  const { id, cover } = req.query;
  if (typeof id !== 'string' || !uuid.test(id)) return unavailable(res);
  const { SUPABASE_URL: supabase, SUPABASE_PUBLISHABLE_KEY: apikey } = process.env;
  if (!supabase || !apikey) return res.status(503).send('Listings are temporarily unavailable.');

  const options = {
    method: 'POST',
    headers: { apikey, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000)
  };
  try {
    const result = await fetch(new URL('/rest/v1/rpc/marketplace_public_details', supabase), {
      ...options, body: JSON.stringify({ kind: null, slug: id })
    });
    if (!result.ok) return res.status(503).send('Listings are temporarily unavailable.');
    const [listing] = await result.json();
    if (!listing) return unavailable(res);
    if (cover === '1') {
      const path = listing.photos?.[0];
      if (!path) return unavailable(res);
      const storage = '/storage/v1';
      const object = path.split('/').map(encodeURIComponent).join('/');
      const signed = await fetch(new URL(storage + '/object/sign/property-photos/' + object, supabase), {
        ...options, body: JSON.stringify({ expiresIn: 60 })
      });
      if (!signed.ok) return res.status(502).end();
      const { signedURL } = await signed.json();
      if (typeof signedURL !== 'string' || !signedURL.startsWith('/object/sign/property-photos/')) {
        return res.status(502).end();
      }
      const photo = await fetch(new URL(storage + signedURL, supabase), { signal: options.signal, redirect: 'error' });
      if (!photo.ok) return res.status(502).end();
      const type = photo.headers.get('content-type')?.split(';')[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) return res.status(502).end();
      res.setHeader('Content-Type', type);
      return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(Buffer.from(await photo.arrayBuffer()));
    }
    const url = `${site}/listing/${listing.id}`;
    const image = listing.photos?.length ? `${url}/cover` : '';
    const label = listing.listing_kind === 'item' ? 'Household item' : 'Rental home';
    const title = escapeHtml(listing.public_title || `${label} in ${listing.area}`);
    const fallback = `${listing.area}, Pune · ₹${Number(listing.rent).toLocaleString('en-IN')}${listing.listing_kind === 'home' ? ' / month' : ''}`;
    const description = escapeHtml((listing.public_description || fallback).replace(/\s+/g, ' ').trim().slice(0, 200));
    const assetVersion = encodeURIComponent(process.env.VERCEL_GIT_COMMIT_SHA || '');
    return res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<base href="/"><title>${title} | Sainik Space</title><link rel="canonical" href="${url}">
<meta name="description" content="${description}"><meta property="og:type" content="website">
<meta property="og:site_name" content="Sainik Space"><meta property="og:url" content="${url}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
${image ? `<meta property="og:image" content="${image}"><meta property="og:image:alt" content="${title}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css?v=${assetVersion}"><link rel="stylesheet" href="/army.css?v=${assetVersion}">
</head><body><div id="app" data-public-listing="${listing.id}"><main class="section"><a href="/#home">Sainik Space</a>
<h1>${title}</h1><p>${escapeHtml(fallback)}</p><p>${description}</p></main></div>
<dialog id="modal"><button class="close" aria-label="Close dialog">×</button><div id="modal-body"></div></dialog><div id="toast" role="status"></div>
<script src="/config.js?v=${assetVersion}"></script><script src="/cloud.js?v=${assetVersion}"></script><script src="/app.js?v=${assetVersion}"></script>
</body></html>`);
  } catch {
    return res.status(503).send('Listings are temporarily unavailable.');
  }
};

function unavailable(res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(404).send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Listing unavailable | Sainik Space</title><h1>Listing unavailable</h1><p><a href="/#homes">Browse available homes</a></p></html>');
}
