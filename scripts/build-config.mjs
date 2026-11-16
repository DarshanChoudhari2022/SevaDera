import { readFile, writeFile } from 'node:fs/promises';
const supabaseUrl = process.env.SUPABASE_URL || 'https://xqturhxjnwjzakfkypxi.supabase.co';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_MgT_dGTakqNODIhD30mvwA_AkHz3oti';
await writeFile('dist/config.js', `globalThis.__SEVADERA_CONFIG__=${JSON.stringify({supabaseUrl,supabasePublishableKey})};\n`, 'utf8');
const index = await readFile('dist/index.html', 'utf8');
await writeFile('dist/index.html', index.replace('<link rel="stylesheet" href="style.css">', '<link rel="stylesheet" href="style.css"><link rel="stylesheet" href="army.css">').replace('<script src="cloud.js">', '<script src="config.js"></script><script src="cloud.js">'), 'utf8');
