const app=document.querySelector('#app');
const modal=document.querySelector('#modal');
const cloud=window.seva;
const photo=(id,w=1200)=>id.startsWith('http')?id:`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const samples=[{id:'as-101',title:'A little room to breathe',area:'Wanowrie',beds:2,rent:24000,size:1050,furnish:'Semi-furnished',image:'photo-1600607687920-4e2a09cf159d'},{id:'as-102',title:'Light-filled family living',area:'Fatima Nagar',beds:3,rent:32000,size:1420,furnish:'Furnished',image:'photo-1600210492486-724fe5c67fb0'},{id:'as-103',title:'Your quiet corner of Pune',area:'Wanwadi',beds:2,rent:22000,size:980,furnish:'Unfurnished',image:'photo-1600566753086-00f18fb6b3ea'}];
let saved=JSON.parse(localStorage.getItem('as-saved')||'[]');
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'₹'+Number(v||0).toLocaleString('en-IN');
function toast(message){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.style.display='block';setTimeout(()=>el.style.display='none',3500)}
function header() {
  return `<header><a class="brand" href="#home"><span class="mark">⌂</span><span>Sainik Space<small>HOMES FOR THOSE WHO SERVE</small></span></a>
    <nav aria-label="Main navigation"><a href="#homes">Homes</a><a href="#items">Household items</a><a href="#support">Contact support</a>${cloud?.staff ? '<a href="#owner">Post a listing</a>' : ''}<a href="#admin">${cloud?.staff ? 'Admin dashboard' : 'Staff sign in'}</a></nav>
    <button class="mobile-menu" aria-label="Open navigation" onclick="document.querySelector('nav').classList.toggle('open')">☰</button></header>`;
}
function footer(){return `<footer><a class="brand" href="#home"><span class="mark">⌂</span>Sainik Space</a><p>Rooted in Wanwadi. Built around your next chapter.<br>Independent housing portal · Free during launch</p><a href="#admin">Staff sign in ↗</a></footer>`}
function card(h){const img=photo(h.image);const id=`property/${h.id}`;return `<article class="property"><div class="property-image"><a href="#${id}"><img src="${img}" alt="${escapeHtml(h.title)}" loading="lazy"></a><button class="save" aria-label="Save ${escapeHtml(h.title)}" onclick="toggleSave('${h.id}')">${saved.includes(h.id)?'♥':'♡'}</button><span class="image-label">Sample home</span></div><div class="property-title"><a href="#${id}"><h3>${escapeHtml(h.title)}</h3></a><strong>${money(h.rent)}<span class="muted"> / mo</span></strong></div><div class="meta">${escapeHtml(h.area)}, Pune · ${h.bedrooms||h.beds} bedrooms · ${h.size_sqft||h.size||'—'} sq ft</div><div class="card-bottom"><span>${escapeHtml(h.furnishing||h.furnish||'')}</span><button class="text-button" onclick="shareHome('${h.id}',false)">Share ↗</button></div></article>`}
function toggleSave(id){saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];localStorage.setItem('as-saved',JSON.stringify(saved));render()}
function services(){return `<div class="services">${[['⌂','Home viewings','Get a closer look before you make the journey. Request a local viewing.'],['▦','Packers & movers','Plan your move, from the first box to the final delivery.'],['✧','A fresh start','Arrange cleaning and small fixes before you collect your keys.'],['⌁','Everyday essentials','Get help organising internet, utilities and your first days at home.'],['▤','Mess & tiffin','Home-style meals for duty days, families and late arrivals. Request a trusted local mess or tiffin plan.']].map(([i,t,d])=>`<article><div class="service-icon">${i}</div><h3>${t}</h3><p>${d}</p><button class="text-button" onclick="requestService('${t}')">Request help ↗</button></article>`).join('')}</div>`}
function homePage(){return `<div class="hero">${header()}<div class="hero-content"><div><div class="eyebrow">For those who serve. For those who stand beside them.</div><h1>Home, wherever<br>duty takes you.</h1></div><div class="hero-aside">A home for your family.<br>A little peace of mind for you.<br>Find your space and settle in, starting in Wanwadi.<br><a href="#homes" class="button light">Find your home <span>↗</span></a></div></div><div class="hero-foot"><span>Wanwadi & neighbouring communities, Pune</span><span>Private introductions · ₹0 platform fee at launch</span></div></div><section class="section intro"><div class="eyebrow">Built around the service community</div><div><h2>You look after the nation.<br>Find a place to call your own.</h2><p>From a new posting to a new beginning. Sainik Space brings private homes and move-in support together for Army families, military doctors, CRPF personnel and public servants.</p><div class="audience">${['Army & service families','Army doctors','CRPF & CAPF','Government & CBI','Veterans & Army brats'].map(x=>`<span class="pill">${x}</span>`).join('')}</div></div></section><section class="section"><div class="section-head"><div><div class="eyebrow">A quieter place to come home to</div><h2>Homes for your next posting.</h2></div><a class="button outline" href="#homes">View all homes ↗</a></div><div class="cards">${samples.map(h=>card(h)).join('')}</div><p class="muted">Illustrative homes show the experience before launch. Reviewed owner listings appear here after admin approval.</p></section><section class="section"><div class="section-head"><div><div class="eyebrow">More than finding a home</div><h2>From moving to settling in.</h2></div><a href="#services">Explore services ↗</a></div>${services()}</section><div class="cta"><div><h2>Open your door to<br>a family that serves.</h2><p>Clear costs. Private contact details. A considered introduction.</p></div><a class="button lime" href="#owner">List your home for free ↗</a></div>${footer()}`}
function authPage() {
  return `${header()}<main class="section staff-access"><p class="eyebrow">Staff access</p><h2>Sainik Space admin sign-in</h2>
    <p>Use your authorised staff account. Customers can <a href="#support">contact support</a> without signing in.</p>
    <form class="form panel staff-login" id="auth-form">
      <label>Email<input type="email" name="email" required autocomplete="username"></label>
      <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
      <button class="button">Sign in</button>
      <button class="text-button" type="button" data-resend-staff-email>Resend verification email</button>
      <p role="status" id="staff-auth-status"></p>
    </form></main>${footer()}`;
}
function ownerPage(){if(!cloud?.staff)return staffGate();return `${header()}<main class="section staff-editor"><div class="eyebrow">Staff listing editor</div><h2>List a home or household item</h2><p>Post on behalf of the owner or seller after getting their consent. Keep phone numbers, exact addresses and identifying details out of the photos.</p><div class="dashboard"><div><div id="my-listings" class="panel"><p>Loading your listings…</p></div></div><form class="form panel" id="listing-form"><input type="hidden" name="id"><label>Listing type<select name="listing_kind"><option value="home">Home for rent</option><option value="item">Second-hand household item</option></select></label><label>Internal title<input name="title" required minlength="3" maxlength="100" placeholder="For example, a 2 BHK flat"></label><label>Neighbourhood<select name="area"><option>Wanwadi</option><option>Wanowrie</option><option>Fatima Nagar</option><option>Salunke Vihar</option></select></label><div class="form-grid"><label><span id="market-price-label">Monthly rent (₹)</span><input name="rent" type="number" min="1" max="1000000" required></label><label data-home-field>Bedrooms<select name="bedrooms"><option>1</option><option>2</option><option>3</option><option>4</option></select></label><label data-home-field>Size (sq ft)<input name="size_sqft" type="number" min="1"></label><label data-home-field>Furnishing<select name="furnishing"><option>Unfurnished</option><option>Semi-furnished</option><option>Furnished</option></select></label></div><label><span id="market-address-label">Exact address</span><input name="exact_address" required minlength="5" maxlength="500"></label><label>Private contact phone<input name="contact_phone" type="tel" required minlength="7" maxlength="25"></label><fieldset class="listing-public-fields"><legend>Visible on the public link</legend><p class="muted">The neighbourhood, price and photos will also be public. Leave out names, phone numbers and exact addresses.</p><label>Public title (optional)<input name="public_title" minlength="3" maxlength="100" placeholder="For example, 2 BHK flat in Wanwadi"></label><label>Public description (optional)<textarea name="public_description" maxlength="1200" rows="3"></textarea></label></fieldset><label>Private listing notes<textarea name="description" maxlength="3000"></textarea></label><label>Listing photos<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><div class="actions"><button class="button" type="submit" value="publish">Publish listing</button><button class="button outline" type="submit" value="draft">Save draft</button></div><p id="listing-status" role="status"></p><p id="listing-cache-status" class="muted">Unfinished changes stay on this browser until you save, publish or sign out.</p><p class="muted">Photos are re-encoded to remove location metadata before upload.</p></form></div></main>${footer()}`}
async function editListing(id){try{const row=(await cloud.listings.mine()).find(x=>x.id===id);if(!row)return;const form=document.querySelector('#listing-form');for(const [name,value] of Object.entries({id:row.id,listing_kind:row.listing_kind,title:row.title,public_title:row.public_title||'',public_description:row.public_description||'',area:row.area,rent:row.rent,bedrooms:row.bedrooms,size_sqft:row.size_sqft||'',furnishing:row.furnishing,description:row.description||'',exact_address:(Array.isArray(row.property_private)?row.property_private[0]:row.property_private)?.exact_address||'',contact_phone:(Array.isArray(row.property_private)?row.property_private[0]:row.property_private)?.contact_phone||''})){if(form.elements[name])form.elements[name].value=value}syncListingFields();cacheListingDraft(form);form.scrollIntoView({block:'start'});toast('Listing loaded for editing.')}catch(e){toast(e.message)}}
async function loadListings(){const el=document.querySelector('#my-listings');if(!el)return;try{const [rows,stats]=await Promise.all([cloud.listings.mine(),cloud.marketplace.stats()]);if(!el.isConnected)return;el.innerHTML=`<h3>Your posts</h3>${rows.map(x=>`<div class="listing-row"><span><strong>${escapeHtml(x.title)}</strong><br><small>${escapeHtml(x.area)} · ${money(x.rent)} · ${escapeHtml(x.status)}<br>${visitSummary(stats.find(stat=>stat.id===x.id))}</small></span><div class="actions">${x.status!=='pending'?`<button class="button outline" onclick="editListing('${x.id}')">Edit</button>`:''}${x.status==='draft'||x.status==='declined'?`<button class="button" data-moderate="approve" data-listing-id="${x.id}">Publish</button>`:x.status==='published'?`<a class="button outline" href="#share/${encodeURIComponent(x.id)}">View live</a><button class="button outline" data-copy-listing="${escapeHtml(x.id)}">Copy public link</button>`:''}</div></div>`).join('')||'<p class="muted">Your first listing starts here.</p>'}` }catch(e){el.innerHTML=`<div class="notice">${escapeHtml(e.message)}</div>`}}
async function moderate(id,action){try{if(action==='approve')await cloud.listings.approve(id);else{const reason=prompt('Reason for rejection?')||'Please update the listing.';await cloud.listings.reject(id,reason)}toast('Review updated.');render()}catch(e){toast(e.message)}}
async function shareHome(slug,live=false){const url=new URL(location.href);url.hash=live?`share/${slug}`:`property/${slug}`;const wa=`https://wa.me/?text=${encodeURIComponent(`Sainik Space home: ${url.href}`)}`;showModal(`<div class="eyebrow">Share this home</div><h2>Ready for WhatsApp.</h2><p>The public link shows photos and public facts only. Private seller details stay protected.</p><input class="share-input" aria-label="Share link" readonly value="${escapeHtml(url.href)}"><div class="actions"><a class="button" href="${wa}" target="_blank" rel="noopener">Share on WhatsApp ↗</a><button class="button outline" id="copy-share">Copy link</button></div>`);document.querySelector('#copy-share').onclick=async()=>{await navigator.clipboard?.writeText(url.href);toast('Share link copied')}}
function showModal(content){document.querySelector('#modal-body').innerHTML=content;modal.showModal()}
function requestService(service){showModal(`<h2>${escapeHtml(service)}</h2><p>Tell us what you need and the Sainik Space team will follow up.</p><form class="form" id="request"><label>Name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Preferred date<input name="date" type="date" required></label><label>Notes<textarea name="notes"></textarea></label><button class="button">Send request</button></form>`);document.querySelector('#request').onsubmit=e=>{e.preventDefault();modal.close();toast('Request saved. We will follow up shortly.')}}
function propertyPage(id){const h=samples.find(x=>x.id===id);return `${header()}<section class="section"><div class="eyebrow">Sample home · ${h?.area||'Pune'}</div><h2>${escapeHtml(h?.title||'Home unavailable')}</h2>${h?`<img class="modal-photo" src="${photo(h.image,2000)}" alt="${escapeHtml(h.title)}"><p>${money(h.rent)} / month · ${h.beds} bedrooms · ${h.furnish}</p><button class="button" onclick="shareHome('${h.id}')">Share photos ↗</button>`:''}</section>${footer()}`}
function render(){const route=location.hash.slice(1).split('?')[0]||'home';if(modal.open)modal.close();if (route.startsWith('share/')) {
  renderMarketPage(route, () => sharedPage(route.slice(6)));
  return;
}
if (route === 'homes' || route === 'items') {
  renderMarketPage(route, () => marketFeed(route === 'items' ? 'item' : 'home'));
  return;
}let html=route==='home'?homePage():route==='owner'?ownerPage():route==='account'?staffGate():route==='admin'?'<div class="empty">Loading admin review…</div>':route.startsWith('property/')?propertyPage(route.slice(9)):route==='support'?supportPage():route==='services'?`${header()}<section class="section"><h2>Move-in services.</h2>${services()}</section>${footer()}`:`${header()}<section class="section"><h2>Page unavailable</h2></section>${footer()}`;app.innerHTML=html;if(route==='owner'&&cloud?.staff){syncListingFields();restoreListingDraft(document.querySelector('#listing-form'));loadListings()}if(route==='admin')renderMarketPage(route,adminPage)}
document.querySelector('.close').onclick=()=>modal.close();modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});window.addEventListener('seva-session',()=>render());

function syncListingFields() {
  const form = document.querySelector('#listing-form');
  if (!form) return;
  const isItem = form.elements.listing_kind.value === 'item';
  form.querySelectorAll('[data-home-field]').forEach(label => {
    label.hidden = isItem;
    label.querySelector('input,select').disabled = isItem;
  });
  form.querySelector('#market-price-label').textContent = isItem ? 'Asking price (₹)' : 'Monthly rent (₹)';
  form.querySelector('#market-address-label').textContent = isItem ? 'Private pickup address' : 'Exact address';
}

let marketRenderVersion = 0;
function renderMarketPage(route, load) {
  const version = ++marketRenderVersion;
  const current = () => version === marketRenderVersion && location.hash.slice(1).split('?')[0] === route;
  app.innerHTML = header() + '<main class="section"><p role="status">Loading…</p></main>';
  load().then(html => { if (current()) app.innerHTML = html; }).catch(() => {
    if (current()) app.innerHTML = header() + '<main class="section"><h2>Couldn’t load this page</h2><p>Please try again shortly.</p></main>' + footer();
  });
}

const publicListingUrl = slug => new URL('#share/' + encodeURIComponent(slug), location.href).href;
const listingLabel = kind => kind === 'item' ? 'Household item' : 'Rental home';

async function listingPhoto(path, alt) {
  if (!path) return '';
  try {
    return `<img class="market-photo" src="${escapeHtml(await cloud.photoUrl(path))}" alt="${escapeHtml(alt)}">`;
  } catch {
    return '<p class="muted">Photo temporarily unavailable.</p>';
  }
}


function marketplaceTitle(row) {
  return row.public_title || listingLabel(row.listing_kind) + ' in ' + row.area;
}

function marketplaceFacts(row) {
  const facts = [];
  if (Number.isInteger(row.rent)) facts.push(money(row.rent) + (row.listing_kind === 'home' ? ' / month' : ''));
  if (row.bedrooms) facts.push(escapeHtml(row.bedrooms) + ' BHK');
  if (row.size_sqft) facts.push(escapeHtml(row.size_sqft) + ' sq ft');
  if (row.furnishing) facts.push(escapeHtml(row.furnishing));
  return facts.join(' · ');
}

async function marketplaceCards(rows) {
  const cards = await Promise.all(rows.map(async row => {
    const title = marketplaceTitle(row);
    return `<article class="market-card">
      <a href="#share/${encodeURIComponent(row.public_slug)}">${await listingPhoto(row.photos?.[0], title)}
        <div class="market-card-body">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(row.area)}, Pune</p>
          <p>${marketplaceFacts(row)}</p>
        </div>
      </a>
    </article>`;
  }));
  return cards.join('');
}

async function mountHomeListings(container) {
  if (!container) return;
  try {
    const rows = await cloud.marketplace.feed('home');
    const cards = await marketplaceCards(rows.slice(0,6));
    if (!container.isConnected) return;
    container.innerHTML = cards ? `<div class="sd-grid">${cards}</div>` :
      '<p>No homes are published right now. Send a request and our Pune team can check what’s available.</p>';
  } catch {
    if (container.isConnected) container.textContent = 'Homes couldn’t load. Open Browse homes to try again.';
  }
}

async function marketFeed(kind) {
  const isItem = kind === 'item';
  const rows = await cloud.marketplace.feed(kind);
  const cards = await marketplaceCards(rows);
  return `${header()}<main class="section market-page">
    <p class="eyebrow">Pune community listings</p>
    <h1>${isItem ? 'Second-hand household items' : 'Rooms and flats in Pune'}</h1>
    <p>${isItem ? 'Browse cupboards, furniture and other household items listed by community sellers. Arrange price and pickup with the seller after contact is approved.' : 'Browse published homes by neighbourhood. Request an introduction to discuss the rent, availability and viewing with the owner.'}</p>
    ${cards.length ? `<div class="cards">${cards}</div>` : '<p class="notice">No listings are published here yet.</p>'}
    <a class="button outline" href="#support">${isItem ? 'Ask us to list an item' : 'Ask us to list a rental'}</a>
    </main>${footer()}`;
}

function recordMarketVisit(listing) {
  try {
    const key = 'seva-marketplace-visitor';
    const visitor = localStorage.getItem(key) || crypto.randomUUID();
    localStorage.setItem(key, visitor);
    cloud.marketplace.visit(listing.public_slug, visitor).catch(() => {});
  } catch { /* Browser storage is optional. */ }
}

async function sharedPage(slug) {
  const listing = await cloud.listings.publicBySlug(decodeURIComponent(slug));
  if (!listing) return header() + '<main class="section"><h2>Listing unavailable</h2></main>' + footer();
  recordMarketVisit(listing);
  const label = listingLabel(listing.listing_kind);
  const title = marketplaceTitle(listing);
  const photos = await Promise.all((listing.photos || []).map((path,index) => listingPhoto(path, label + ', photo ' + (index+1))));
  return `${header()}<main class="section market-page">
    <p class="eyebrow">${label} · Public preview</p>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(listing.area)}, Pune · ${marketplaceFacts(listing)}</p>
    ${listing.public_description ? `<p class="listing-description">${escapeHtml(listing.public_description)}</p>` : ''}
    <div class="market-gallery">${photos.join('') || '<p>Photos are unavailable for this listing.</p>'}</div>
    <section class="market-contact" aria-label="Seller contact">
      <h2>Ask Sainik Space about this listing</h2>
      <p>Leave your details and our team will check availability and coordinate the next step.</p>
      ${guestEnquiry(listing.id)}
      <div class="actions">
        <button class="button outline" data-copy-listing="${escapeHtml(listing.public_slug)}">Copy link</button>
        <a class="button outline" href="https://wa.me/?text=${encodeURIComponent(publicListingUrl(listing.public_slug))}" target="_blank" rel="noopener">Share on WhatsApp</a>
      </div>
    </section>
    </main>${footer()}`;
}

function visitSummary(stats) {
  return stats ? `${stats.visits_today} today · ${stats.visits_30d} in 30 days · ${stats.contact_requests} requests` : '';
}

async function adminPage() {
  if (!cloud.staff) return staffGate();
  const [pending,stats,requests] = await Promise.all([cloud.listings.pending(),cloud.marketplace.stats(),cloud.marketplace.supportInbox()]);
  const pendingCards = await Promise.all(pending.map(async row => {
    const photos = await Promise.all((row.property_photos || []).map(ph => listingPhoto(ph.storage_path, 'Photo for moderation')));
    return `<article class="listing-row"><div>
      <h3>${escapeHtml(row.title)}</h3><p>${listingLabel(row.listing_kind)} · ${escapeHtml(row.area)} · ${money(row.rent)}</p>
      <p>${escapeHtml(row.description)}</p><div class="market-moderation-photos">${photos.join('')}</div>
      </div><div class="actions">
        <button class="button" data-moderate="approve" data-listing-id="${escapeHtml(row.id)}">Publish</button>
        <button class="button outline" data-moderate="reject" data-listing-id="${escapeHtml(row.id)}">Decline</button>
      </div></article>`;
  }));
  return `${header()}<main class="section market-page"><h1>Marketplace admin</h1><div class="actions"><a class="button" href="#owner">Post a property or item</a><button class="button outline" data-staff-signout>Sign out</button></div>
    <section class="panel"><h2>Review queue</h2>
      <p>Check that photos do not expose phone numbers, exact addresses or personal documents before publishing.</p>
      ${pendingCards.join('') || '<p>No listings awaiting review.</p>'}
    </section>
    <section class="panel"><h2>Listing analytics</h2>
      <p>One visit per browser per listing per day. Seller and staff sessions are excluded when signed in.</p>
      ${stats.map(row => `<div class="listing-row"><div><strong>${escapeHtml(row.title)}</strong><br>
        <small>${listingLabel(row.listing_kind)} · ${escapeHtml(row.status)} · ${visitSummary(row)}</small></div>
        ${row.status==='published' ? `<div class="actions"><button class="button outline" data-copy-listing="${escapeHtml(row.public_slug)}">Copy public link</button><button class="button outline" data-moderate="archive" data-listing-id="${escapeHtml(row.id)}">Unpublish</button></div>` : ''}</div>`).join('') || '<p>No listings yet.</p>'}
    </section>
    <section class="panel">${staffInbox(requests)}</section>
    </main>${footer()}`;
}

document.addEventListener('change', event => {
  if (event.target.name === 'listing_kind') syncListingFields();
});
document.addEventListener('click', async event => {
  const button = event.target.closest('button[data-close-support],button[data-staff-signout],button[data-moderate],button[data-copy-listing]');
  if (!button) return;
  button.disabled = true;
  try {
    if (button.dataset.copyListing) {
      const url = publicListingUrl(button.dataset.copyListing);
      try { await navigator.clipboard.writeText(url); toast('Public link copied.'); }
      catch { showModal(`<h2>Public listing link</h2><input class="share-input" readonly value="${escapeHtml(url)}" aria-label="Public listing link">`); }
      return;
    }
    if (button.hasAttribute('data-staff-signout')) {
      await clearListingDraft(cloud.user?.id);
      await cloud.auth.signOut();
      location.hash = 'account';
      return;
    }
    if (button.dataset.closeSupport) {
      await cloud.marketplace.closeSupport(button.dataset.closeSupport);
      toast('Marked as handled.');
    } else if (button.dataset.moderate === 'archive') {
      await cloud.listings.archive(button.dataset.listingId);
      toast('Listing unpublished.');
    } else {
      await moderate(button.dataset.listingId, button.dataset.moderate);
      return;
    }
    render();
  } catch (error) { toast(error.message); }
  finally { button.disabled = false; }
});



let listingDraftDb;
function openListingDraftDb() {
  listingDraftDb ||= new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('Browser storage unavailable'));
    const request = indexedDB.open('sainik-space-staff', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('listing-drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return listingDraftDb;
}

async function listingCache(mode, perform) {
  const db = await openListingDraftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('listing-drafts', mode);
    const request = perform(transaction.objectStore('listing-drafts'));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

function setDraftFiles(form, photos) {
  const input = form.elements.photos;
  if (!photos.length) {
    input.value = '';
    return;
  }
  const selection = new DataTransfer();
  for (const photo of photos) selection.items.add(photo);
  input.files = selection.files;
}

async function cacheListingDraft(form) {
  const staff = cloud.staff && cloud.user?.id;
  if (!staff || !form) return;
  form.dataset.edited = 'true';
  const data = new FormData(form);
  const photos = data.getAll('photos').filter(file => file?.size);
  data.delete('photos');
  const draft = { fields:Object.fromEntries(data), photos };
  try {
    await listingCache('readwrite', store => store.put(draft, staff));
    if (form.isConnected) form.querySelector('#listing-cache-status').textContent = 'Draft cached on this browser. Choose Save draft to store it in your staff account.';
  } catch {
    if (form.isConnected) form.querySelector('#listing-cache-status').textContent = 'Browser storage is unavailable. Choose Save draft before closing.';
  }
}

async function clearListingDraft(staff) {
  if (!staff) return;
  try { await listingCache('readwrite', store => store.delete(staff)); } catch { /* Browser storage can be unavailable. */ }
}

async function restoreListingDraft(form) {
  const staff = cloud.staff && cloud.user?.id;
  if (!staff || !form) return;
  try {
    const draft = await listingCache('readonly', store => store.get(staff));
    if (!draft || !form.isConnected || form.dataset.edited) return;
    for (const [name, value] of Object.entries(draft.fields)) {
      if (form.elements[name]?.type !== 'file' && form.elements[name]) form.elements[name].value = value;
    }
    syncListingFields();
    setDraftFiles(form, draft.photos || []);
    form.querySelector('#listing-cache-status').textContent = 'Restored unfinished draft from this browser.';
  } catch {
    if (form.isConnected) form.querySelector('#listing-cache-status').textContent = 'Browser draft could not be fully restored. Check the form and selected photos.';
  }
}

document.addEventListener('input', event => {
  if (event.target.form?.id === 'listing-form') cacheListingDraft(event.target.form);
});
document.addEventListener('change', event => {
  if (event.target.form?.id === 'listing-form') cacheListingDraft(event.target.form);
});

function staffGate() {
  if (!cloud?.ready) return header() + '<main class="section"><p role="status">Checking staff access…</p></main>' + footer();
  if (!cloud.user) return authPage();
  if (cloud.staff) return header() + '<main class="section"><h2>Staff account</h2><div class="actions"><a class="button" href="#admin">Open dashboard</a><button class="button outline" data-staff-signout>Sign out</button></div></main>' + footer();
  return header() + '<main class="section"><h2>Staff access required</h2><p>This email is not authorised to publish listings.</p><button class="button outline" data-staff-signout>Sign out</button></main>' + footer();
}

function guestEnquiry(listingId = '') {
  return `<form class="form guest-enquiry" data-guest-enquiry method="post" action="/api/early-access">
    ${listingId ? `<input type="hidden" name="listingId" value="${escapeHtml(listingId)}">` : `<label>What can we help with?<select name="service" required><option value="">Choose one</option><option>List a property</option><option>Sell a household item</option><option>Find a room or flat</option><option>Tiffin or move-in support</option></select></label>`}
    <label>Name<input name="name" autocomplete="name" maxlength="100" required></label>
    <label>Email<input type="email" name="email" autocomplete="email" maxlength="254" required></label>
    <label>Phone (optional)<input type="tel" name="phone" autocomplete="tel" maxlength="25"></label>
    <label>What would you like to ask? (optional)<textarea name="message" maxlength="500" rows="3"></textarea></label>
    <label class="visually-hidden" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
    <label class="guest-consent"><input type="checkbox" name="consent" required> I agree that Sainik Space can contact me about this enquiry.</label>
    <button class="button">Send enquiry</button><p role="status"></p>
    </form>`;
}

function supportPage() {
  return `${header()}<main class="section market-page"><h1>Contact Sainik Space</h1>
    <p>Tell us about the property or household item you want us to list, or ask for help finding a home or tiffin. Our team will follow up. Keep phone numbers, exact addresses and service IDs out of your message.</p>
    ${guestEnquiry()}</main>${footer()}`;
}

function staffInbox(requests) {
  return `<h2>Support inbox</h2>${requests.length ? requests.map(row => {
    const details = row.details || {};
    const summary = [details.area, details.date, ...(Array.isArray(details.needs) ? details.needs : [])].filter(Boolean).join(' · ');
    return `<article class="listing-row"><div>
      <h3>${escapeHtml(row.listing_title || details.service || (row.kind === 'relocation' ? 'Pune move request' : 'Support enquiry'))}</h3>
      <p>${escapeHtml(details.name)} · ${escapeHtml(details.email)}${details.phone ? ' · ' + escapeHtml(details.phone) : ''}</p>
      ${summary ? `<p>${escapeHtml(summary)}</p>` : ''}
      ${details.message ? `<p>${escapeHtml(details.message)}</p>` : ''}
      <small>${escapeHtml(new Date(row.received_at).toLocaleString('en-IN'))}</small>
    </div>${row.handled_at ? '<span>Handled</span>' : `<button class="button outline" data-close-support="${escapeHtml(row.id)}">Mark handled</button>`}</article>`;
  }).join('') : '<p>No enquiries yet.</p>'}`;
}

document.addEventListener('submit', async event => {
  const form = event.target;
  if (!['auth-form','listing-form'].includes(form.id) && !form.hasAttribute('data-guest-enquiry')) return;
  event.preventDefault();
  const data = new FormData(form);
  const buttons = [...form.querySelectorAll('button[type=submit],button:not([type])')];
  buttons.forEach(button => button.disabled = true);
  const status = form.querySelector('[role=status]');
  try {
    if (form.id === 'auth-form') {
      status.textContent = 'Signing in…';
      await cloud.auth.signIn(data.get('email'),data.get('password'));
      if (cloud.staff) {
        if (location.hash === '#admin') render();
        else location.hash = 'admin';
      } else {
        render();
      }
      return;
    }
    if (form.id === 'listing-form') {
      if (!cloud.staff) throw new Error('Staff access required.');
      const publish = event.submitter?.value === 'publish';
      const files = data.getAll('photos').filter(file => file?.size);
      if (publish && !data.get('id') && !files.length) throw new Error('Add at least one photo before publishing.');
      status.textContent = 'Saving listing…';
      const id = await cloud.listings.save({
        title:data.get('title'), listing_kind:data.get('listing_kind'), area:data.get('area'),
        bedrooms:Number(data.get('bedrooms') || 1), rent:Number(data.get('rent')),
        furnishing:data.get('furnishing') || 'Unfurnished', description:data.get('description'),
        size_sqft:Number(data.get('size_sqft') || 0),
        public_title:data.get('public_title'), public_description:data.get('public_description')
      }, {exact_address:data.get('exact_address'), contact_phone:data.get('contact_phone')}, data.get('id') || undefined);
      form.elements.id.value = id;
      await cacheListingDraft(form);
      for (let index = 0; index < files.length; index++) {
        await cloud.photoUpload(id, files[index], index);
        setDraftFiles(form, files.slice(index + 1));
        await cacheListingDraft(form);
      }
      if (publish) await cloud.listings.approve(id);
      await clearListingDraft(cloud.user?.id);
      form.reset();
      syncListingFields();
      if (publish) {
        status.innerHTML = `Published. <a href="#share/${encodeURIComponent(id)}">View live listing</a>.`;
      } else {
        status.textContent = 'Draft saved. Choose Publish in Your posts to make it public.';
      }
      loadListings();
      return;
    }
    status.textContent = 'Sending enquiry…';
    const response = await fetch('/api/early-access', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...Object.fromEntries(data), kind:data.has('listingId') ? 'listing' : 'owner', needs:[]})
    });
    if (response.status === 404) throw new Error('This listing is no longer available.');
    if (response.status === 429) throw new Error('Too many enquiries. Please try again later.');
    if (!response.ok) throw new Error('We couldn’t send your enquiry. Please try again.');
    form.reset();
    status.textContent = 'Enquiry received. The Sainik Space team will follow up.';
  } catch (error) {
    const target = form.isConnected ? status : document.querySelector('#staff-auth-status');
    if (target) target.textContent = error.message;
    else toast(error.message);
  } finally {
    buttons.forEach(button => button.disabled = false);
  }
});

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-resend-staff-email]');
  if (!button) return;
  const email = button.form.elements.email;
  if (!email.reportValidity()) return;
  const status = button.form.querySelector('[role=status]');
  button.disabled = true;
  try {
    await cloud.auth.resendConfirmation(email.value.trim());
    status.textContent = 'Check your inbox or spam folder for the verification link.';
  } catch (error) {
    status.textContent = error.message;
  } finally { button.disabled = false; }
});

if (!app.querySelector('.sd') || (location.hash && location.hash !== '#home')) render();
