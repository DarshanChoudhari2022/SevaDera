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
  // Chromium resolves named form controls before inherited element properties.
  Object.defineProperty(window.HTMLFormElement.prototype, 'id', {
    get() { return this.elements.namedItem('id') || this.getAttribute('id') || ''; }
  });
  let selectedPhotos = [];
  const photo = fs.readFileSync(photoPath);
  const NativeFormData = window.FormData;
  window.FormData = class extends NativeFormData {
    constructor(form) {
      super(form);
      if (form?.matches('#listing-form') && selectedPhotos.length) {
        this.delete('photos');
        for (const photo of selectedPhotos) this.append('photos', photo);
      }
    }
  };
  Object.assign(window, { fetch, Headers, Request, Response, TextEncoder, TextDecoder, AbortController, Blob,
    matchMedia: () => ({ matches:true }), scrollTo: () => {}, confirm: () => true,
    createImageBitmap: async () => ({width:1024, height:800, close() {}}) });
  let copiedLink;
  Object.defineProperty(window.navigator, 'clipboard', {value:{writeText:async url => { copiedLink = url; }}});
  window.HTMLCanvasElement.prototype.getContext = () => ({drawImage() {}});
  window.HTMLCanvasElement.prototype.toBlob = callback => callback(new Blob([photo], {type:'image/jpeg'}));
  window.HTMLElement.prototype.scrollIntoView = () => {};
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
  const loginMethod = login.method;
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
    assert.equal(form.id, form.elements.id, 'The test must expose Chromium form control shadowing');
    Object.assign(form.elements.listing_kind,{value:kind});
    form.elements.listing_kind.dispatchEvent(new window.Event('change',{bubbles:true}));
    for (const [name,value] of Object.entries({title,public_title:title,rent:'18000',
      public_description:'Smoke test description for sharing.',
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
    selectedPhotos = Array.from({length:kind === 'home' ? 2 : 1}, (_, index) =>
      new window.File([photo],`demo-${index}.jpg`,{type:'image/jpeg'}));
    if (draftId) {
      const rowPublish = await waitFor(() => document.querySelector(
        `[data-listing-row="${draftId}"] [data-listing-status="published"]`), 'draft row Publish button');
      rowPublish.click();
    } else {
      form.querySelector('[value=publish]').click();
    }
    const link = await waitFor(() => document.querySelector('#listing-status a'), kind + ' editor publish');
    assert.equal(form.method, 'post', 'A native listing submission must keep private fields out of the URL');
    assert.match(link.getAttribute('href'), /\/[0-9a-f-]{36}$/);
    const id = link.getAttribute('href').split('/').at(-1);
    if (draftId) assert.equal(id,draftId);
    copiedLink = undefined;
    document.querySelector('#listing-status [data-copy-listing]').click();
    await waitFor(() => copiedLink, 'copying the public link');
    assert.equal(copiedLink, site + '/listing/' + id, 'Copied links must use the public listing route');
    assert.ok(!posted.some(row => row.id === id), 'Publishing a new listing must not reuse a previous ID');
    posted.push({kind,id,title});
    const published = (await publicFeed(kind)).find(row => row.id === id);
    assert.equal(published?.public_title,title);
    assert.equal(published.photos.length,selectedPhotos.length);
    const response = await fetch(config.supabaseUrl + '/storage/v1/object/sign/property-photos/' + published.photos[0], {
      method:'POST', headers, body:JSON.stringify({expiresIn:60})
    });
    assert.equal(response.status,200);
    const { signedURL } = await response.json();
    const uploaded = await fetch(config.supabaseUrl + '/storage/v1' + signedURL);
    assert.equal(uploaded.status,200);
    assert.deepEqual(Buffer.from(await uploaded.arrayBuffer()),photo);
    console.log(kind + ': staff editor, signed-out feed, and uploaded photo verified');
    selectedPhotos = [];
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
  const shareUrl = site + '/listing/' + home.id;
  let sharedHtml;
  if (!local) {
    const shareResponse = await fetch(shareUrl);
    assert.equal(shareResponse.status,200);
    sharedHtml = await shareResponse.text();
    const metadata = new JSDOM(sharedHtml).window.document;
    assert.equal(metadata.querySelector('[property="og:title"]').content,home.title);
    assert.equal(metadata.querySelector('[property="og:description"]').content,'Smoke test description for sharing.');
    const image = metadata.querySelector('[property="og:image"]').content;
    assert.equal(image, shareUrl + '/cover');
    const cover = await fetch(image);
    assert.equal(cover.status,200);
    assert.match(cover.headers.get('content-type'),/^image\/jpeg/);
    assert.deepEqual(Buffer.from(await cover.arrayBuffer()),photo);
    assert.ok(!sharedHtml.includes('Synthetic test address') && !sharedHtml.includes('0000000000'));
  }
  assert.equal(loginMethod, 'post', 'A native sign-in submission must keep credentials out of the URL');
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
  assert.equal(card.href,shareUrl);
  let viewer = guest;
  if (local) {
    guest.window.location.hash = 'share/' + home.id;
  } else {
    viewer = new JSDOM(sharedHtml, {url:shareUrl, runScripts:'outside-only'});
    Object.assign(viewer.window, {fetch, Headers, Request, Response, TextEncoder, TextDecoder,
      AbortController, matchMedia:() => ({matches:true}), scrollTo:() => {}});
    for (const script of viewer.window.document.querySelectorAll('script[src]')) {
      viewer.window.eval(await (await fetch(new URL(script.getAttribute('src'),site))).text());
    }
  }
  await waitFor(() => viewer.window.document.querySelectorAll('.market-gallery img').length === 2, 'signed-out listing gallery');
  assert.equal(viewer.window.document.querySelector('main h1').textContent, home.title);
  const carousel = viewer.window.document.querySelector('[data-listing-gallery]');
  const track = carousel.querySelector('.listing-track');
  const previous = carousel.querySelector('[data-gallery-step="-1"]');
  const next = carousel.querySelector('[data-gallery-step="1"]');
  Object.defineProperty(track, 'clientWidth', {value:360});
  track.scrollTo = ({left}) => {
    track.scrollLeft = left;
    track.dispatchEvent(new viewer.window.Event('scroll'));
  };
  assert.ok(previous.disabled);
  next.click();
  assert.equal(carousel.querySelector('output').textContent,'2 / 2');
  assert.ok(next.disabled);
  track.dispatchEvent(new viewer.window.KeyboardEvent('keydown',{key:'ArrowLeft'}));
  assert.equal(carousel.querySelector('output').textContent,'1 / 2');
  assert.ok(previous.disabled);
  assert.match(viewer.window.document.querySelector('.listing-price').textContent,/₹18,000/);
  assert.equal(viewer.window.document.querySelector('.market-contact button').textContent, 'Request a quote');
  assert.equal(viewer.window.seva.user, null);
  const visitor = viewer.window.localStorage.getItem('seva-marketplace-visitor');
  assert.ok(visitor);
  await viewer.window.seva.marketplace.visit(home.id,visitor);
  if (!local) {
    const quote = await fetch(site + '/api/early-access', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({kind:'listing',listingId:home.id,name:'Smoke test',email,consent:'on',needs:[]})
    });
    assert.equal(quote.status,201);
  }
  const stats = (await window.seva.marketplace.stats()).find(row => row.id === home.id);
  assert.equal(Number(stats.visits_today),1);
  if (!local) assert.equal(Number(stats.contact_requests),1);
  const form = document.querySelector('#listing-form');
  await window.editListing(home.id);
  assert.equal(form.elements.id.value,home.id);
  form.elements.public_description.value = 'Edited smoke test description.';
  form.querySelector('[value=publish]').click();
  await waitFor(() => document.querySelector('#listing-status').textContent.startsWith('Published.'), 'publishing an edit');
  const [updated] = await publicFeed('home',home.id);
  assert.equal(updated.public_description,'Edited smoke test description.');
  assert.equal(updated.photos.length,2);
  const deleteButton = await waitFor(() => document.querySelector(
    `[data-listing-row="${home.id}"] [data-listing-status="deleted"]`), 'listing Delete action');
  deleteButton.click();
  await waitFor(() => document.querySelector(
    `[data-listing-row="${home.id}"] [data-listing-status="draft"]`), 'listing soft deletion');
  assert.deepEqual(await publicFeed('home',home.id),[]);
  if (!local) {
    assert.equal((await fetch(shareUrl)).status,404);
    assert.equal((await fetch(shareUrl + '/cover')).status,404);
  }
  if (viewer !== guest) viewer.window.close();
  guest.window.close();
  console.log('Signed-out rental details, multiple photos and per-listing analytics verified');
  dom.window.close();
  process.exit(0);
}
main().catch(error => { console.error(error.message); process.exit(1); });
