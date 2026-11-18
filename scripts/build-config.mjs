import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { homePage } from '../src/early-access.mjs';
const supabaseUrl = process.env.SUPABASE_URL || 'https://xqturhxjnwjzakfkypxi.supabase.co';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_MgT_dGTakqNODIhD30mvwA_AkHz3oti';
const coordinatorName = (process.env.SEVADERA_COORDINATOR_NAME || '').trim().slice(0, 80);
await writeFile('dist/config.js', `globalThis.__SEVADERA_CONFIG__=${JSON.stringify({supabaseUrl,supabasePublishableKey,coordinatorName})};\n`, 'utf8');
const index = (await readFile('dist/index.html', 'utf8')).replace(/\?v=[a-f0-9]{12}(?=")/g, '');
const title = 'Pune Rooms, Flats, Mess & Tiffin for Army Families | Sainik Space';
const description = 'Looking for a room, PG, flat, mess or tiffin in Pune? Request housing, meals and move-in support around Wanwadi and nearby areas through Sainik Space.';
const siteUrl = 'https://aangansetu.vercel.app/';
const structured = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {'@type':'Organization','@id':siteUrl+'#organisation',name:'Sainik Space',url:siteUrl,slogan:'Home, wherever duty takes you.'},
    {'@type':'Service',name:'Pune housing, mess, tiffin and relocation enquiries',provider:{'@id':siteUrl+'#organisation'},areaServed:{'@type':'City',name:'Pune'}}
  ]
});
const normalized = index
  .replace(/<div id="app">[\s\S]*?<\/div>(?=<dialog id="modal")/, () => `<div id="app">${homePage(coordinatorName)}</div>`)
  .replace(/<!-- seva-seo -->.*?<!-- \/seva-seo -->/gs, '')
  .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
  .replace('</head>', `<!-- seva-seo --><link rel="canonical" href="${siteUrl}"><meta property="og:type" content="website"><meta property="og:url" content="${siteUrl}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${siteUrl}assets/realtora/f453685bd78a198c.png"><script type="application/ld+json">${structured}</script><!-- /seva-seo --></head>`)
  .replace(/<link rel="stylesheet" href="(?:landing|editorial|replica|early-access)\.css">/g, '')
  .replace('</head>', '<link rel="stylesheet" href="early-access.css"></head>')
  .replace('<script src="live.js"></script>', '<script src="landing.js"></script>')
  .replace(/<link rel="stylesheet" href="army\.css">/g, '')
  .replace(/<script src="config\.js"><\/script>/g, '');
const page = normalized
  .replace('<link rel="stylesheet" href="style.css">', '<link rel="stylesheet" href="style.css"><link rel="stylesheet" href="army.css">')
   .replace('<script src="cloud.js">', '<script src="config.js"></script><script src="cloud.js">');
const assets = ['style.css', 'army.css', 'early-access.css', 'config.js', 'cloud.js', 'app.js', 'landing.js'];
const hashes = await Promise.all(assets.map(async asset => createHash('sha256')
  .update(await readFile('dist/' + asset)).digest('hex').slice(0, 12)));
await writeFile('dist/index.html', assets.reduce((html, asset, i) =>
  html.replaceAll('"' + asset + '"', '"' + asset + '?v=' + hashes[i] + '"'), page), 'utf8');
