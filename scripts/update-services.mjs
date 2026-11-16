import { readFile, writeFile } from 'node:fs/promises';
const path = 'dist/app.js';
let source = await readFile(path, 'utf8');
const old = "[['⌂','Home viewings','Get a closer look before you make the journey. Request a local viewing.'],['▦','Packers & movers','Plan your move, from the first box to the final delivery.'],['✧','A fresh start','Arrange cleaning and small fixes before you collect your keys.'],['⌁','Everyday essentials','Get help organising internet, utilities and your first days at home.']]";
const updated = "[['⌂','Home viewings','Get a closer look before you make the journey. Request a local viewing.'],['▦','Packers & movers','Plan your move, from the first box to the final delivery.'],['✧','A fresh start','Arrange cleaning and small fixes before you collect your keys.'],['⌁','Everyday essentials','Get help organising internet, utilities and your first days at home.'],['▤','Mess & tiffin','Home-style meals for duty days, families and late arrivals. Request a trusted local mess or tiffin plan.']]";
if (source.includes(updated)) process.exit(0);
if (!source.includes(old)) throw new Error('Service catalogue text not found');
await writeFile(path, source.replace(old, updated), 'utf8');
