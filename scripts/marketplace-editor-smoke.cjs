// Called by marketplace-live-smoke.py with disposable credentials on stdin.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require(path.join(process.env.SMOKE_NODE_MODULES, 'jsdom'));

async function main() {
  const { site, email, password, photoPath, local, draftTitle } = JSON.parse(fs.readFileSync(0, 'utf8'));
  const html = await (await fetch(site)).text();
  const dom = new JSDOM(html, {url:(local ? 'http://127.0.0.1:4173/?preview=staff' : site + '/') + '#owner', runScripts:'outside-only'});
  const { window } = dom;
  const { document } = window;
  let selectedPhoto;
  const photo = fs.readFileSync(photoPath);
  const NativeFormData = window.FormData;
  window.FormData = class extends NativeFormData {
    constructor(form) {
      super(form);
      if (form?.id === 'listing-form' && selectedPhoto) this.set('photos', selectedPhoto);
    }
  };
  Object.assign(window, { fetch, Headers, Request, Response, TextEncoder, TextDecoder, AbortController, Blob,
    matchMedia: () => ({ matches:true }), scrollTo: () => {},
    createImageBitmap: async () => ({width:1024, height:800, close() {}}) });
  let copiedLink;
  Object.defineProperty(window.navigator, 'clipboard', {value:{writeText:async url => { copiedLink = url; }}});
  window.HTMLCanvasElement.prototype.getContext = () => ({drawImage() {}});
  window.HTMLCanvasElement.prototype.toBlob = callback => callback(new Blob([photo], {type:'image/jpeg'}));
  // Simulate the browser refusing to complete a local draft write. Publishing must
  // still reach the server. Browsers can delay storage while a tab is suspended.
  window.indexedDB = {open: () => ({})};
  for (const script of document.querySelectorAll('script[src]')) {
    const file = script.getAttribute('src');
    const source = local ? fs.readFileSync(path.join('dist',file.split('?')[0]),'utf8') :
      await (await fetch(new URL(file,site))).text();
    window.eval(source);
  }
  async function waitFor(predicate, phase) {
    for (let i = 0; i < 100; i++) {
      const match = predicate();
      if (match) return match;
      await new Promise(resolve => setTimeout(resolve,75));
    }
    throw new Error(phase + ' did not finish. Status: ' +
      (document.querySelector('#listing-status,#staff-auth-status')?.textContent || 'none'));
  }
  const login = await waitFor(() => document.querySelector('#auth-form'), 'staff login page');
  login.elements.email.value = email;
  login.elements.password.value = password;
  login.querySelector('button[type=submit],button:not([type])').click();
  await waitFor(() => window.seva.staff, 'staff authentication');
  assert.equal(window.location.hash, '#owner', 'Direct editor sign-in must return to the editor');
  const posted = [];
  const config = window.__SEVADERA_CONFIG__;
  const headers = {apikey:config.supabasePublishableKey,'Content-Type':'application/json'};
  const publicFeed = async (kind, slug) => {
    const response = await fetch(config.supabaseUrl + '/rest/v1/rpc/marketplace_public_details', {
      method:'POST', headers, body:JSON.stringify({kind, ...(slug && {slug})})
    });
    assert.equal(response.status,200);
    return response.json();
  };
  for (const [kind, title] of [['home','Demo — editor rental'],['item','Demo — editor cupboard']]) {
    const form = await waitFor(() => document.querySelector('#listing-form'), 'listing editor');
    Object.assign(form.elements.listing_kind,{value:kind});
    form.elements.listing_kind.dispatchEvent(new window.Event('change',{bubbles:true}));
    for (const [name,value] of Object.entries({title,public_title:title,rent:'18000',
      exact_address:'Synthetic test address',contact_phone:'0000000000'})) form.elements[name].value = value;
    let draftId;
    if (kind === 'home') {
      form.querySelector('[value=publish]').click();
      await waitFor(() => document.querySelector('#listing-status').textContent.includes('Add a photo'),
        'saving a private draft when a photo is missing');
      draftId = form.elements.id.value;
      assert.ok(draftId, 'The form should retain the ID for retrying publication');
      assert.deepEqual(await publicFeed(kind,draftId), []);
    }
    selectedPhoto = new window.File([photo],'demo.jpg',{type:'image/jpeg'});
    form.querySelector('[value=publish]').click();
    const link = await waitFor(() => document.querySelector('#listing-status a[href^="#share/"]'), kind + ' editor publish');
    assert.match(link.getAttribute('href'), /^#share\/[0-9a-f-]{36}$/);
    const id = link.getAttribute('href').split('/')[1];
    if (draftId) assert.equal(id,draftId);
    copiedLink = undefined;
    document.querySelector('#listing-status [data-copy-listing]').click();
    await waitFor(() => copiedLink, 'copying the public link');
    assert.equal(copiedLink, site + '/#share/' + id, 'The share link must use the production site, even from localhost');
    assert.ok(!posted.some(row => row.id === id), 'Publishing a new listing must not reuse a previous ID');
    posted.push({kind,id,title});
    const published = (await publicFeed(kind)).find(row => row.id === id);
    assert.equal(published?.public_title,title);
    const response = await fetch(config.supabaseUrl + '/storage/v1/object/sign/property-photos/' + published.photos[0], {
      method:'POST', headers, body:JSON.stringify({expiresIn:60})
    });
    assert.equal(response.status,200);
    const { signedURL } = await response.json();
    const uploaded = await fetch(config.supabaseUrl + '/storage/v1' + signedURL);
    assert.equal(uploaded.status,200);
    assert.deepEqual(Buffer.from(await uploaded.arrayBuffer()),photo);
    console.log(kind + ': staff editor, signed-out feed, and uploaded photo verified');
    selectedPhoto = null;
  }
  if (draftTitle) {
    const form = document.querySelector('#listing-form');
    form.elements.listing_kind.value = 'home';
    form.elements.listing_kind.dispatchEvent(new window.Event('change',{bubbles:true}));
    for (const [name,value] of Object.entries({title:draftTitle,rent:'18000',
      exact_address:'Synthetic test address',contact_phone:'0000000000'})) form.elements[name].value = value;
    form.querySelector('[value=draft]').click();
    await waitFor(() => document.querySelector('#listing-status')?.textContent.startsWith('Private draft saved.'), 'retained draft save');
    console.log('Private test draft saved through the staff editor');
  }
  for (const {kind,id,title} of posted) assert.equal((await publicFeed(kind,id))[0]?.public_title,title);
  const home = posted.find(row => row.kind === 'home');
  const guest = new JSDOM(html, {url:site + '/#homes', runScripts:'outside-only'});
  Object.assign(guest.window, {fetch, Headers, Request, Response, TextEncoder, TextDecoder,
    AbortController, matchMedia:() => ({matches:true}), scrollTo:() => {}});
  for (const script of document.querySelectorAll('script[src]')) {
    const file = script.getAttribute('src');
    guest.window.eval(local ? fs.readFileSync(path.join('dist',file.split('?')[0]),'utf8') :
      await (await fetch(new URL(file,site))).text());
  }
  const card = await waitFor(() => [...guest.window.document.querySelectorAll('.market-card a')]
    .find(anchor => anchor.querySelector('h3')?.textContent === home.title), 'signed-out rental card');
  card.click();
  await waitFor(() => guest.window.document.querySelector('.market-gallery img'), 'signed-out listing gallery');
  assert.equal(guest.window.document.querySelector('main h1').textContent, home.title);
  assert.equal(guest.window.seva.user, null);
  guest.window.close();
  console.log('Signed-out rentals page and listing photo gallery verified');
  dom.window.close();
  process.exit(0);
}
main().catch(error => { console.error(error.message); process.exit(1); });
