const app=document.querySelector('#app');
const modal=document.querySelector('#modal');
const cloud=window.seva;
const photo=(id,w=1200)=>id.startsWith('http')?id:`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const samples=[{id:'as-101',title:'A little room to breathe',area:'Wanowrie',beds:2,rent:24000,size:1050,furnish:'Semi-furnished',image:'photo-1600607687920-4e2a09cf159d'},{id:'as-102',title:'Light-filled family living',area:'Fatima Nagar',beds:3,rent:32000,size:1420,furnish:'Furnished',image:'photo-1600210492486-724fe5c67fb0'},{id:'as-103',title:'Your quiet corner of Pune',area:'Wanwadi',beds:2,rent:22000,size:980,furnish:'Unfurnished',image:'photo-1600566753086-00f18fb6b3ea'}];
let saved=JSON.parse(localStorage.getItem('as-saved')||'[]');
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'₹'+Number(v||0).toLocaleString('en-IN');
function toast(message){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.style.display='block';setTimeout(()=>el.style.display='none',3500)}
function header(){const user=cloud?.user;return `<header><a class="brand" href="#home"><span class="mark">⌂</span><span>Sainik Space<small>HOMES FOR THOSE WHO SERVE</small></span></a><nav><a href="#homes">Homes</a><a href="#items">Household items</a><a href="#owner">${user?'My listings':'List your home ↗'}</a><a href="#account">${user?'My account':'Sign in'}</a>${cloud?.staff?'<a class="button" href="#admin">Admin review</a>':''}</nav><button class="mobile-menu" aria-label="Open navigation" onclick="document.querySelector('nav').classList.toggle('open')">☰</button></header>`}
function footer(){return `<footer><a class="brand" href="#home"><span class="mark">⌂</span>Sainik Space</a><p>Rooted in Wanwadi. Built around your next chapter.<br>Independent housing portal · Free during launch</p><a href="#account">My account ↗</a></footer>`}
function card(h){const img=photo(h.image);const id=`property/${h.id}`;return `<article class="property"><div class="property-image"><a href="#${id}"><img src="${img}" alt="${escapeHtml(h.title)}" loading="lazy"></a><button class="save" aria-label="Save ${escapeHtml(h.title)}" onclick="toggleSave('${h.id}')">${saved.includes(h.id)?'♥':'♡'}</button><span class="image-label">Sample home</span></div><div class="property-title"><a href="#${id}"><h3>${escapeHtml(h.title)}</h3></a><strong>${money(h.rent)}<span class="muted"> / mo</span></strong></div><div class="meta">${escapeHtml(h.area)}, Pune · ${h.bedrooms||h.beds} bedrooms · ${h.size_sqft||h.size||'—'} sq ft</div><div class="card-bottom"><span>${escapeHtml(h.furnishing||h.furnish||'')}</span><button class="text-button" onclick="shareHome('${h.id}',false)">Share ↗</button></div></article>`}
function toggleSave(id){saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];localStorage.setItem('as-saved',JSON.stringify(saved));render()}
function services(){return `<div class="services">${[['⌂','Home viewings','Get a closer look before you make the journey. Request a local viewing.'],['▦','Packers & movers','Plan your move, from the first box to the final delivery.'],['✧','A fresh start','Arrange cleaning and small fixes before you collect your keys.'],['⌁','Everyday essentials','Get help organising internet, utilities and your first days at home.'],['▤','Mess & tiffin','Home-style meals for duty days, families and late arrivals. Request a trusted local mess or tiffin plan.']].map(([i,t,d])=>`<article><div class="service-icon">${i}</div><h3>${t}</h3><p>${d}</p><button class="text-button" onclick="requestService('${t}')">Request help ↗</button></article>`).join('')}</div>`}
function homePage(){return `<div class="hero">${header()}<div class="hero-content"><div><div class="eyebrow">For those who serve. For those who stand beside them.</div><h1>Home, wherever<br>duty takes you.</h1></div><div class="hero-aside">A home for your family.<br>A little peace of mind for you.<br>Find your space and settle in, starting in Wanwadi.<br><a href="#homes" class="button light">Find your home <span>↗</span></a></div></div><div class="hero-foot"><span>Wanwadi & neighbouring communities, Pune</span><span>Private introductions · ₹0 platform fee at launch</span></div></div><section class="section intro"><div class="eyebrow">Built around the service community</div><div><h2>You look after the nation.<br>Find a place to call your own.</h2><p>From a new posting to a new beginning. Sainik Space brings private homes and move-in support together for Army families, military doctors, CRPF personnel and public servants.</p><div class="audience">${['Army & service families','Army doctors','CRPF & CAPF','Government & CBI','Veterans & Army brats'].map(x=>`<span class="pill">${x}</span>`).join('')}</div></div></section><section class="section"><div class="section-head"><div><div class="eyebrow">A quieter place to come home to</div><h2>Homes for your next posting.</h2></div><a class="button outline" href="#homes">View all homes ↗</a></div><div class="cards">${samples.map(h=>card(h)).join('')}</div><p class="muted">Illustrative homes show the experience before launch. Reviewed owner listings appear here after admin approval.</p></section><section class="section"><div class="section-head"><div><div class="eyebrow">More than finding a home</div><h2>From moving to settling in.</h2></div><a href="#services">Explore services ↗</a></div>${services()}</section><div class="cta"><div><h2>Open your door to<br>a family that serves.</h2><p>Clear costs. Private contact details. A considered introduction.</p></div><a class="button lime" href="#owner">List your home for free ↗</a></div>${footer()}`}
function authPage(){return `${header()}<section class="section"><div class="eyebrow">Private access</div><h2>Sign in to your Sainik Space space.</h2><div class="dashboard"><form class="form panel" id="auth-form"><label>Email<input type="email" name="email" required autocomplete="email"></label><label>Password<input type="password" name="password" required minlength="8" autocomplete="current-password"></label><label class="signup-only">Your name<input name="display_name" maxlength="80"></label><label class="signup-only">I am a<select name="seller_category"><option>Army personnel</option><option>Army doctor</option><option>CRPF / CAPF</option><option>Government / CBI</option><option>Veteran / Army brat</option><option>Other</option></select></label><button class="button" id="auth-submit">Sign in ↗</button><button type="button" class="text-button" id="auth-toggle">Create a seller account</button><p class="muted">Your phone, exact address and identity details stay private.</p></form></div></section>${footer()}`}
function ownerPage(){if(!cloud?.user)return `${header()}<section class="section"><div class="notice">Sign in to create and manage a listing.</div><a class="button" href="#account">Sign in ↗</a></section>${footer()}`;return `${header()}<section class="section"><div class="eyebrow">Seller dashboard</div><h2>List a home or household item</h2><p>Submit photos for review. Keep all phone numbers, addresses and identifying details out of the photos.</p><div class="dashboard"><div><div id="my-listings" class="panel"><p>Loading your listings…</p></div><div id="owner-contact-queue" class="panel"></div></div><form class="form panel" id="listing-form"><input type="hidden" name="id"><label>Listing type<select name="listing_kind"><option value="home">Home for rent</option><option value="item">Second-hand household item</option></select></label><label>Listing title<input name="title" required maxlength="100" placeholder="For example, a 2 BHK flat or a wooden cupboard"></label><label>Neighbourhood<select name="area"><option>Wanwadi</option><option>Wanowrie</option><option>Fatima Nagar</option><option>Salunke Vihar</option></select></label><div class="form-grid"><label><span id="market-price-label">Monthly rent (₹)</span><input name="rent" type="number" min="1" max="1000000" required></label><label data-home-field>Bedrooms<select name="bedrooms"><option>1</option><option>2</option><option>3</option><option>4</option></select></label><label data-home-field>Size (sq ft)<input name="size_sqft" type="number" min="1"></label><label data-home-field>Furnishing<select name="furnishing"><option>Unfurnished</option><option>Semi-furnished</option><option>Furnished</option></select></label></div><label><span id="market-address-label">Exact address</span><input name="exact_address" required minlength="5" maxlength="500"></label><label>Private contact phone<input name="contact_phone" type="tel" required minlength="7" maxlength="25"></label><label>Private listing notes<textarea name="description" maxlength="3000"></textarea></label><label>Listing photos<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><button class="button">Save draft and upload photos ↗</button><p class="muted">Photos are re-encoded to remove location metadata before upload.</p></form></div></section>${footer()}`}
async function editListing(id){try{const row=(await cloud.listings.mine()).find(x=>x.id===id);if(!row)return;const form=document.querySelector('#listing-form');for(const [name,value] of Object.entries({id:row.id,listing_kind:row.listing_kind,title:row.title,area:row.area,rent:row.rent,bedrooms:row.bedrooms,size_sqft:row.size_sqft||'',furnishing:row.furnishing,description:row.description||'',exact_address:(Array.isArray(row.property_private)?row.property_private[0]:row.property_private)?.exact_address||'',contact_phone:(Array.isArray(row.property_private)?row.property_private[0]:row.property_private)?.contact_phone||''})){if(form.elements[name])form.elements[name].value=value}syncListingFields();form.scrollIntoView({block:'start'});toast('Listing loaded for editing.')}catch(e){toast(e.message)}}
async function loadListings(){const el=document.querySelector('#my-listings');if(!el)return;try{const [rows,stats,requests]=await Promise.all([cloud.listings.mine(),cloud.marketplace.stats(),cloud.marketplace.requests()]);if(!el.isConnected)return;const queue=document.querySelector('#owner-contact-queue');if(queue)queue.innerHTML=contactQueue(requests.filter(r=>rows.some(x=>x.id===r.property_id)),stats);el.innerHTML=`<h3>Your listings</h3>${rows.map(x=>`<div class="listing-row"><span><strong>${escapeHtml(x.title)}</strong><br><small>${escapeHtml(x.area)} · ${money(x.rent)} · ${escapeHtml(x.status)}<br>${visitSummary(stats.find(stat=>stat.id===x.id))}</small></span><div class="actions">${x.status!=='published' && x.status!=='pending'?`<button class="button outline" onclick="editListing('${x.id}')">Edit</button>`:''}${x.status==='draft'||x.status==='declined'?`<button class="button" onclick="submitListing('${x.id}')">Submit for review</button>`:x.status==='published'?`<button class="button outline" data-copy-listing="${escapeHtml(x.id)}">Copy public link</button>`:''}</div></div>`).join('')||'<p class="muted">Your first listing starts here.</p>'}` }catch(e){el.innerHTML=`<div class="notice">${escapeHtml(e.message)}</div>`}}
async function submitListing(id){try{await cloud.listings.submit(id);toast('Listing sent for admin review.');loadListings()}catch(e){toast(e.message)}}
async function moderate(id,action){try{if(action==='approve')await cloud.listings.approve(id);else{const reason=prompt('Reason for rejection?')||'Please update the listing.';await cloud.listings.reject(id,reason)}toast('Review updated.');render()}catch(e){toast(e.message)}}
async function shareHome(slug,live=false){const url=new URL(location.href);url.hash=live?`share/${slug}`:`property/${slug}`;const wa=`https://wa.me/?text=${encodeURIComponent(`Sainik Space home: ${url.href}`)}`;showModal(`<div class="eyebrow">Share this home</div><h2>Ready for WhatsApp.</h2><p>The public link shows photos and public facts only. Private seller details stay protected.</p><input class="share-input" aria-label="Share link" readonly value="${escapeHtml(url.href)}"><div class="actions"><a class="button" href="${wa}" target="_blank" rel="noopener">Share on WhatsApp ↗</a><button class="button outline" id="copy-share">Copy link</button></div>`);document.querySelector('#copy-share').onclick=async()=>{await navigator.clipboard?.writeText(url.href);toast('Share link copied')}}
function showModal(content){document.querySelector('#modal-body').innerHTML=content;modal.showModal()}
function requestService(service){showModal(`<h2>${escapeHtml(service)}</h2><p>Tell us what you need and the Sainik Space team will follow up.</p><form class="form" id="request"><label>Name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Preferred date<input name="date" type="date" required></label><label>Notes<textarea name="notes"></textarea></label><button class="button">Send request</button></form>`);document.querySelector('#request').onsubmit=e=>{e.preventDefault();modal.close();toast('Request saved. We will follow up shortly.')}}
function propertyPage(id){const h=samples.find(x=>x.id===id);return `${header()}<section class="section"><div class="eyebrow">Sample home · ${h?.area||'Pune'}</div><h2>${escapeHtml(h?.title||'Home unavailable')}</h2>${h?`<img class="modal-photo" src="${photo(h.image,2000)}" alt="${escapeHtml(h.title)}"><p>${money(h.rent)} / month · ${h.beds} bedrooms · ${h.furnish}</p><button class="button" onclick="shareHome('${h.id}')">Share photos ↗</button>`:''}</section>${footer()}`}
function account(){if(!cloud?.user)return authPage();return `${header()}<section class="section"><div class="eyebrow">Everything in one place</div><h2>Your Sainik Space account.</h2><div class="notice">Signed in as ${escapeHtml(cloud.user.email)}</div><div class="actions"><a class="button" href="#owner">My listings ↗</a>${cloud.staff?'<a class="button outline" href="#admin">Admin review ↗</a>':''}<button class="button outline" onclick="cloud.auth.signOut().then(()=>render())">Sign out</button></div></section>${footer()}`}
function render(){const route=location.hash.slice(1).split('?')[0]||'home';if(modal.open)modal.close();if (route.startsWith('share/')) {
  renderMarketPage(route, () => sharedPage(route.slice(6)));
  return;
}
if (route === 'homes' || route === 'items') {
  renderMarketPage(route, () => marketFeed(route === 'items' ? 'item' : 'home'));
  return;
}let html=route==='home'?homePage():route==='owner'?ownerPage():route==='account'?account():route==='admin'?'<div class="empty">Loading admin review…</div>':route.startsWith('property/')?propertyPage(route.slice(9)):route==='services'?`${header()}<section class="section"><h2>Move-in services.</h2>${services()}</section>${footer()}`:`${header()}<section class="section"><h2>Page unavailable</h2></section>${footer()}`;app.innerHTML=html;if(route==='owner'&&cloud?.user){syncListingFields();loadListings()}if(route==='admin')renderMarketPage(route,adminPage)}
document.querySelector('.close').onclick=()=>modal.close();modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});window.addEventListener('seva-session',()=>render());
document.addEventListener('submit',async e=>{if(e.target.id==='auth-form'){e.preventDefault();const f=new FormData(e.target);try{if(document.body.dataset.signup==='1')await cloud.auth.signUp(f.get('email'),f.get('password'),f.get('display_name'),f.get('seller_category'));else await cloud.auth.signIn(f.get('email'),f.get('password'));toast('Welcome to Sainik Space.');const next=new URLSearchParams(location.hash.split('?')[1]||'').get('next');location.hash=next&&/^share\/[a-z0-9-]+$/i.test(next)?next:'account'}catch(err){toast(err.message)}}if(e.target.id==='listing-form'){e.preventDefault();if(!cloud.user)return toast('Sign in first.');const f=new FormData(e.target);try{const id=await cloud.listings.save({title:f.get('title'),listing_kind:f.get('listing_kind'),area:f.get('area'),bedrooms:Number(f.get('bedrooms')||1),rent:Number(f.get('rent')),deposit:0,maintenance:0,brokerage:0,furnishing:f.get('furnishing')||'Unfurnished',description:f.get('description'),size_sqft:Number(f.get('size_sqft')||0)},{exact_address:f.get('exact_address'),contact_phone:f.get('contact_phone')},f.get('id')||undefined);const files=[...(f.getAll('photos')||[])].filter(x=>x?.size);for(let i=0;i<files.length;i++)await cloud.photoUpload(id,files[i],i);toast('Draft saved. Submit it from My listings.');e.target.reset();syncListingFields();loadListings()}catch(err){toast(err.message)}}});
document.addEventListener('click',e=>{if(e.target.id==='auth-toggle'){document.body.dataset.signup=document.body.dataset.signup==='1'?'0':'1';document.querySelectorAll('.signup-only').forEach(x=>x.style.display=document.body.dataset.signup==='1'?'block':'none');document.querySelector('#auth-submit').textContent=document.body.dataset.signup==='1'?'Create account ↗':'Sign in ↗';e.target.textContent=document.body.dataset.signup==='1'?'Already have an account? Sign in':'Create a seller account'}});

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

async function marketFeed(kind) {
  const isItem = kind === 'item';
  const rows = await cloud.marketplace.feed(kind);
  const cards = await Promise.all(rows.map(async row => {
    const title = listingLabel(row.listing_kind);
    return `<article class="market-card">
      <a href="#share/${encodeURIComponent(row.public_slug)}">${await listingPhoto(row.photos?.[0], title + ' in ' + row.area)}<h3>${title} · ${escapeHtml(row.area)}</h3></a>
    </article>`;
  }));
  return `${header()}<main class="section market-page">
    <p class="eyebrow">Pune community listings</p>
    <h1>${isItem ? 'Second-hand household items' : 'Rooms and flats in Pune'}</h1>
    <p>${isItem ? 'Browse cupboards, furniture and other household items listed by community sellers. Arrange price and pickup with the seller after contact is approved.' : 'Browse published homes by neighbourhood. Request an introduction to discuss the rent, availability and viewing with the owner.'}</p>
    ${cards.length ? `<div class="cards">${cards.join('')}</div>` : '<p class="notice">No listings are published here yet.</p>'}
    <a class="button outline" href="#owner">${isItem ? 'Sell a household item' : 'List a rental'}</a>
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
  const user = cloud.user;
  const request = user ? await cloud.marketplace.myRequest(listing.id) : null;
  const contact = user && request?.status === 'approved' ? await cloud.marketplace.privateContact(listing.id) : null;
  const photos = await Promise.all((listing.photos || []).map((path,index) => listingPhoto(path, label + ', photo ' + (index+1))));
  return `${header()}<main class="section market-page">
    <p class="eyebrow">${label} · Public preview</p>
    <h1>${escapeHtml(listing.area)}, Pune</h1>
    <div class="market-gallery">${photos.join('')}</div>
    <section class="market-contact" aria-label="Seller contact">
      ${contact ? `<h2>Seller approved your request</h2><p>Phone: ${escapeHtml(contact.contact_phone)}<br>Address: ${escapeHtml(contact.exact_address)}</p>` :
        request ? `<p>Your contact request is ${escapeHtml(request.status)}. Seller details are shared after approval.</p>` :
        user ? `<p>Ask the seller to share their contact details and discuss availability.</p><button class="button" data-request-contact="${escapeHtml(listing.id)}">Request contact</button>` :
        `<p>Sign in to request contact. The seller decides who can see their phone number and address.</p><a class="button" href="#account?next=${encodeURIComponent('share/' + slug)}">Sign in to request contact</a>`}
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

function contactQueue(requests, stats) {
  return `<h3>Contact requests</h3>${requests.length ? requests.map(request => {
    const title = stats.find(row => row.id === request.property_id)?.title || 'Listing';
    return `<div class="listing-row"><span>${escapeHtml(title)}</span><div class="actions">
      <button class="button" data-contact-decision="approved" data-request-id="${escapeHtml(request.id)}">Share phone and address</button>
      <button class="button outline" data-contact-decision="declined" data-request-id="${escapeHtml(request.id)}">Decline</button>
    </div></div>`;
  }).join('') : '<p>No pending contact requests.</p>'}`;
}

async function adminPage() {
  if (!cloud.staff) return header() + '<main class="section"><p class="notice">Sign in with a staff account to use admin review.</p><a href="#account">Sign in</a></main>' + footer();
  const [pending,stats,requests] = await Promise.all([cloud.listings.pending(),cloud.marketplace.stats(),cloud.marketplace.requests()]);
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
  return `${header()}<main class="section market-page"><h1>Marketplace admin</h1>
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
    <section class="panel">${contactQueue(requests,stats)}</section>
    </main>${footer()}`;
}

document.addEventListener('change', event => {
  if (event.target.name === 'listing_kind') syncListingFields();
});
document.addEventListener('click', async event => {
  const button = event.target.closest('button[data-request-contact],button[data-contact-decision],button[data-moderate],button[data-copy-listing]');
  if (!button) return;
  button.disabled = true;
  try {
    if (button.dataset.copyListing) {
      const url = publicListingUrl(button.dataset.copyListing);
      try { await navigator.clipboard.writeText(url); toast('Public link copied.'); }
      catch { showModal(`<h2>Public listing link</h2><input class="share-input" readonly value="${escapeHtml(url)}" aria-label="Public listing link">`); }
      return;
    }
    if (button.dataset.requestContact) {
      await cloud.marketplace.request(button.dataset.requestContact);
      toast('Contact request sent.');
    } else if (button.dataset.contactDecision) {
      await cloud.marketplace.decide(button.dataset.requestId, button.dataset.contactDecision);
      toast('Contact request updated.');
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

if (!app.querySelector('.sd') || (location.hash && location.hash !== '#home')) render();
