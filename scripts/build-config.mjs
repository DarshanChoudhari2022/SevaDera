import { readFile, writeFile } from 'node:fs/promises';
const supabaseUrl = process.env.SUPABASE_URL || 'https://xqturhxjnwjzakfkypxi.supabase.co';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_MgT_dGTakqNODIhD30mvwA_AkHz3oti';
await writeFile('dist/config.js', `globalThis.__SEVADERA_CONFIG__=${JSON.stringify({supabaseUrl,supabasePublishableKey})};\n`, 'utf8');
const index = await readFile('dist/index.html', 'utf8');
const title = 'SevaDera | Pune homes and relocation for service families';
const description = 'Plan your next posting in Pune. Join SevaDera early access for rental homes, movers, cleaning, internet and tiffin support.';
const siteUrl = 'https://aangansetu.vercel.app/';
const structured = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {'@type':'Organization','@id':siteUrl+'#organisation',name:'SevaDera',url:siteUrl,slogan:'Home, wherever duty takes you.'},
    {'@type':'Service',name:'Relocation support for service families',provider:{'@id':siteUrl+'#organisation'},areaServed:{'@type':'City',name:'Pune'}}
  ]
});
const normalized = index
  .replace(/<!-- seva-seo -->.*?<!-- \/seva-seo -->/gs, '')
  .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
  .replace('</head>', `<!-- seva-seo --><link rel="canonical" href="${siteUrl}"><meta property="og:type" content="website"><meta property="og:url" content="${siteUrl}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${siteUrl}assets/realtora/f453685bd78a198c.png"><script type="application/ld+json">${structured}</script><!-- /seva-seo --></head>`)
  .replace(/<link rel="stylesheet" href="(?:landing|editorial|replica|early-access)\.css">/g, '')
  .replace('</head>', '<link rel="stylesheet" href="early-access.css"></head>')
  .replace('<script src="live.js"></script>', '<script src="landing.js"></script>')
  .replace(/<link rel="stylesheet" href="army\.css">/g, '')
  .replace(/<script src="config\.js"><\/script>/g, '');
await writeFile('dist/index.html', normalized
  .replace('<link rel="stylesheet" href="style.css">', '<link rel="stylesheet" href="style.css"><link rel="stylesheet" href="army.css">')
  .replace('<script src="cloud.js">', '<script src="config.js"></script><script src="cloud.js">'), 'utf8');
