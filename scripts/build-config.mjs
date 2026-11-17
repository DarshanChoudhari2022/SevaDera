import { readFile, writeFile } from 'node:fs/promises';
const supabaseUrl = process.env.SUPABASE_URL || 'https://xqturhxjnwjzakfkypxi.supabase.co';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_MgT_dGTakqNODIhD30mvwA_AkHz3oti';
await writeFile('dist/config.js', `globalThis.__SEVADERA_CONFIG__=${JSON.stringify({supabaseUrl,supabasePublishableKey})};\n`, 'utf8');
const index = await readFile('dist/index.html', 'utf8');
const normalized = index
  .replace(/<link rel="stylesheet" href="(?:landing|editorial|replica)\.css">/g, '')
  .replace('</head>', '<link rel="stylesheet" href="replica.css"></head>')
  .replace('<script src="live.js"></script>', '<script src="landing.js"></script>')
  .replace(/<link rel="stylesheet" href="army\.css">/g, '')
  .replace(/<script src="config\.js"><\/script>/g, '');
await writeFile('dist/index.html', normalized
  .replace('<link rel="stylesheet" href="style.css">', '<link rel="stylesheet" href="style.css"><link rel="stylesheet" href="army.css">')
  .replace('<script src="cloud.js">', '<script src="config.js"></script><script src="cloud.js">'), 'utf8');
