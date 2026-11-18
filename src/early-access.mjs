const areas = ['Wanwadi', 'Wanowrie', 'Fatima Nagar', 'Salunke Vihar'];
const additionalServices = ['Furniture & appliances', 'Housekeeping', 'Childcare & eldercare leads', 'Settling-in assistance'];

const options = values => values.map(value => `<option>${value}</option>`).join('');
const select = (label, name, values) => `<label>${label}<select name="${name}"><option value="">Select if known</option>${options(values)}</select></label>`;
const areaField = select('Preferred Pune area', 'area', [...areas, 'Nearby areas']);
const moveFields = `<label>Posting city<input name="city" value="Pune" readonly></label><label>Move date<input name="date" type="date"></label>${select('Family size','size',['1','2','3','4','5+'])}${select('Monthly budget','budget',['Under ₹20,000','₹20,000–₹30,000','₹30,000–₹45,000','₹45,000+'])}${select('Property type','property',['1 BHK','2 BHK','3 BHK','Independent home','PG / room'])}`;
const cardGrid = (items, cls = '') => `<div class="sd-grid ${cls}">${items.map(([title, copy]) => `<article class="sd-card"><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>`;
const formEnd = label => `<label class="sd-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><label class="sd-consent"><input type="checkbox" name="consent" required> I agree to be contacted about this request.</label><button class="sd-btn">${label}</button><p class="sd-status" role="status"></p>`;
const navLinks = '<a href="#homes">Rooms & flats</a><a href="#move-services">Mess, tiffin & moving</a><a href="#items">Household items</a>';
const photo = (file, alt) => `<img loading="lazy" src="assets/realtora/${file}" alt="${alt}" width="480" height="300">`;
const examples = [
  ['Wanowrie','2 BHK','₹24,000','₹48,000','₹2,000','Semi-furnished','1,050 sq ft','f453685bd78a198c.png','as-101'],
  ['Fatima Nagar','3 BHK','₹32,000','₹64,000','₹3,000','Furnished','1,420 sq ft','447d63eb7aeb4a8d.png','as-102'],
  ['Wanwadi','2 BHK','₹22,000','₹44,000','₹2,000','Unfurnished','980 sq ft','bfe7605f5221a4ba.png','as-103']
];

const escapeText = value => String(value).replace(/[&<>]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[char]));
export const homePage = (coordinator = '') => `<div class="sd">
<a class="sd-skip" href="#main-content">Skip to content</a>
<header class="sd-head">
<div class="sd-bar"><a class="sd-brand" href="#home">Sainik Space<span>.</span></a><button type="button" class="sd-menu" aria-expanded="false" aria-controls="sd-nav">Menu</button><nav id="sd-nav" aria-label="Main navigation">${navLinks}</nav><a class="sd-btn sd-top" href="#match">Find a home</a></div></header>
<main id="main-content" tabindex="-1">
<section class="sd-welcome" aria-labelledby="sd-welcome-title">
  <div class="sd-wrap sd-welcome-inner">
    <div class="sd-welcome-copy">
      <p class="sd-welcome-label">Relocation support · Pune</p>
      <h1 id="sd-welcome-title">Home, <span class="sd-duty">wherever duty takes you.</span></h1>
      <p>Find rooms and flats for rent, mess and tiffin options, and move-in support in Pune. For Army personnel, other service families, doctors and civil servants.</p>
      <div class="sd-actions">
        <a class="sd-btn" href="#match" data-event="hero_cta">Plan your move <span aria-hidden="true">↗</span></a>
        <a class="sd-btn sd-outline" href="#homes">Browse live rentals</a>
      </div>
    </div>
    <figure class="sd-welcome-art">
      <img src="assets/sevadera-service-team.png" width="1536" height="1024" fetchpriority="high" decoding="async" alt="3D-style illustration of an army service member, a doctor and a civil servant">
    </figure>
  </div>
</section>
<section class="sd-wrap sd-local" aria-labelledby="sd-coordinator">
  <div>
    <p class="sd-note">Wanwadi relocation desk</p>
    <h2 id="sd-coordinator">${coordinator ? `Meet ${escapeText(coordinator)}, your local coordinator.` : 'A local contact for your move to Wanwadi.'}</h2>
  </div>
  <div>
    <p>Tell us what you need before you arrive. Your coordinator will check which rooms or flats are available, help arrange a viewing, and confirm local tiffin prices and delivery coverage.</p>
    <a class="sd-btn" href="#match">Ask the Wanwadi team</a>
  </div>
</section>
<section class="sd-wrap" id="homes-preview"><h2>Rooms and flats for rent in Pune</h2><p>Looking around Wanwadi, Wanowrie, Fatima Nagar or Salunke Vihar? Tell us whether you need a room, PG or family flat. The samples below show the details to compare.</p><div class="sd-grid">${examples.map(([area,bhk,rent,deposit,fee,furnishing,size,file,id]) => `<article class="sd-card sd-property">${photo(file,'Illustrative home exterior')}<p class="sd-note">Illustrative example · not a live listing</p><h3>${bhk} in ${area}</h3><p><strong>${rent} / month</strong> · ${size}<br>${deposit} deposit · ${fee} maintenance<br>${furnishing} · Parking and pets to confirm</p><p class="sd-note">Owner verification, floor plan, exact travel times and viewing slots would appear when confirmed.</p><div class="sd-actions"><button class="sd-btn sd-outline" data-area="${area}">Notify me about viewings</button><a href="#property/${id}">Sample details</a><button data-save="${id}" aria-pressed="false">Save</button><button data-share="${id}">Share</button></div></article>`).join('')}</div><p class="sd-status" id="sd-share-status" role="status"></p></section>
<section class="sd-band" id="move-services">
  <div class="sd-wrap">
    <h2>Mess, tiffin and move-in essentials</h2>
    ${cardGrid([
      ['Mess & tiffin in Pune', 'Ask for local mess options, daily tiffin delivery or a monthly meal plan near your new home.'],
      ['Moving & cleaning', 'Request help with movers, packing and cleaning before you move in.'],
      ['Home setup', 'Get help finding internet, utility, furniture rental and repair options.']
    ])}
    <a class="sd-btn" href="#match" data-need="Tiffin & meals">Request mess or tiffin options</a>
  </div>
</section>
<section class="sd-band" id="match"><div class="sd-wrap sd-final"><div><h2>Tell us what you need in Pune.</h2><p>Request a room, flat, meal plan or move-in help. We’ll follow up about availability.</p></div><form method="post" action="/api/early-access" class="sd-card" id="sd-lead" data-lead="relocation" aria-label="Request a relocation plan"><div class="sd-fields"><label>Full name<input name="name" required maxlength="100" autocomplete="name"></label><label>Email<input name="email" type="email" required maxlength="254" autocomplete="email"></label><label>Phone (optional)<input name="phone" type="tel" maxlength="25" autocomplete="tel"></label>${areaField}</div>
<fieldset class="sd-choices"><legend>What do you need?</legend>${['Rental home','Tiffin & meals','Movers & packers','Deep cleaning','Internet & Wi-Fi','Utilities','Repairs & maintenance','Other'].map(name => `<label><input type="checkbox" name="needs" value="${name}"> ${name}</label>`).join('')}</fieldset>
<details class="sd-form-more"><summary>Add move date, budget or property type (optional)</summary><div class="sd-fields">${moveFields}</div><fieldset class="sd-choices"><legend>Other move-in services</legend>${additionalServices.map(name => `<label><input type="checkbox" name="needs" value="${name}"> ${name}</label>`).join('')}</fieldset></details><label class="sd-consent"><input type="checkbox" name="updates"> Send me occasional early-access updates (optional)</label>${formEnd('Request my relocation plan')}<p class="sd-note">We use your details to respond to your request. Please leave out service IDs, posting orders and exact duty locations.</p></form></div></section>
<section class="sd-wrap sd-local" aria-labelledby="sd-resale">
  <div><p class="sd-note">Community marketplace</p><h2 id="sd-resale">Buy and sell second-hand household items.</h2></div>
  <div><p>Find cupboards, beds, desks and other essentials listed by Army families, veterans and community members. Ask to contact the seller directly to agree on the price and pickup.</p>
  <div class="sd-actions"><a class="sd-btn" href="#items">Browse household items</a><a class="sd-btn sd-outline" href="#owner">List an item</a></div></div>
</section>
</main>
<footer class="sd-footer">
  <div class="sd-wrap">
    <div class="sd-footer-main">
      <div class="sd-footer-brand">
        <a class="sd-brand" href="#main-content">Sainik Space<span>.</span></a>
        <p>Home, wherever duty takes you.<br>Starting in Pune, India.</p>
      </div>
      <nav aria-label="Explore Sainik Space">
        <h2>Explore</h2>
        <a href="#homes-preview">Homes</a>
        <a href="#move-services">Mess, tiffin & moving</a>
      </nav>
      <nav aria-label="Owners and partners">
        <h2>Get involved</h2>
        <a href="#owner">List a property</a>
        <a href="#account">Sign in</a>
      </nav>
    </div>
    <div class="sd-footer-bottom">
      <small>© ${new Date().getFullYear()} Sainik Space · Early access</small>
      <a href="#main-content">Back to top <span aria-hidden="true">↑</span></a>
    </div>
  </div>
</footer></div>`;

function track(name, properties = {}) {
  window.dispatchEvent(new CustomEvent('seva:analytics', { detail: { name, ...properties } }));
  window.va?.('event', { name, data: properties });
}

function mount() {
  const site = document.querySelector('.sd');
  if (!site) return;
  const final = site.querySelector('#sd-lead');
  const menu = site.querySelector('.sd-menu');
  menu.onclick = () => menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') !== 'true'));
  site.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      menu.setAttribute('aria-expanded', 'false');
      menu.focus();
    }
  });
  site.addEventListener('click', async event => {
    const target = event.target.closest('button,a');
    if (!target) return;
    if (target.dataset.event) track(target.dataset.event);
    const hash = target.getAttribute('href');
    const section = /^#[\w-]+$/.test(hash || '') && site.querySelector(hash);
    if (section) {
      event.preventDefault();
      menu.setAttribute('aria-expanded', 'false');
      if (target.dataset.need) {
        for (const input of final.querySelectorAll('[name=needs]')) {
          if (input.value === target.dataset.need) input.checked = true;
        }
      }
      if (!section.hasAttribute('tabindex')) section.tabIndex = -1;
      section.focus({preventScroll:true});
      section.scrollIntoView();
    }
    if (target.dataset.area) {
      track('neighbourhood_interest', { area: target.dataset.area });
      final.elements.area.value = target.dataset.area;
      final.scrollIntoView();
      final.elements.name.focus({preventScroll:true});
    }
    if (target.dataset.save) {
      const key = 'sd-saved-' + target.dataset.save;
      const saved = target.getAttribute('aria-pressed') === 'true';
      try { saved ? localStorage.removeItem(key) : localStorage.setItem(key, '1'); } catch {}
      target.setAttribute('aria-pressed', String(!saved));
      target.textContent = saved ? 'Save' : 'Saved';
    }
    if (target.dataset.share) {
      const url = new URL(location.href);
      url.hash = 'property/' + target.dataset.share;
      const status = site.querySelector('#sd-share-status');
      try {
        if (navigator.share) await navigator.share({url:url.href, title:'Sainik Space illustrative home'});
        else {
          await navigator.clipboard.writeText(url.href);
          status.textContent = 'Sample link copied.';
        }
      } catch { status.textContent = url.href; }
    }
  });
  for (const button of site.querySelectorAll('[data-save]')) {
    try {
      if (localStorage.getItem('sd-saved-' + button.dataset.save)) {
        button.setAttribute('aria-pressed','true');
        button.textContent = 'Saved';
      }
    } catch {}
  }
  site.addEventListener('change', event => {
    if (event.target.name === 'needs') track('service_selection', { service:event.target.value, selected:event.target.checked });
  });
  site.addEventListener('submit', async event => {
    const form = event.target;
    event.preventDefault();
    const kind = form.dataset.lead;
    if (!kind) return;
    const data = new FormData(form);
    const payload = {...Object.fromEntries(data), needs:data.getAll('needs'), kind};
    const submit = event.submitter || form.querySelector('[type=submit],button');
    const status = form.querySelector('.sd-status');
    submit.disabled = true;
    status.textContent = 'Sending your request…';
    try {
      const response = await fetch('/api/early-access', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      if (response.status === 429) throw new Error('Too many requests. Please try again later.');
      if (!response.ok) throw new Error('We couldn’t send your request. Your details are still here. Please try again later.');
      status.textContent = kind !== 'relocation' ? 'Enquiry received. We’ll contact you about next steps.' : 'Request received. Our team will review your requirements and share relevant options and next steps.';
      track('lead_submitted', {kind});
      form.reset();
    } catch (error) { status.textContent = error.message; }
    finally { submit.disabled = false; }
  });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const {target,isIntersecting} of entries) if (isIntersecting) {
        target.classList.add('sd-enter');
        observer.unobserve(target);
      }
    });
    site.querySelectorAll('main > section').forEach(section => observer.observe(section));
  }
}

if (typeof window !== 'undefined') {
  window.homePage = () => homePage(window.__SEVADERA_CONFIG__?.coordinatorName);
  const render = window.render;
  window.render = function () {
    if (document.querySelector('.sd') && ['','#home'].includes(location.hash)) return;
    render();
    mount();
  };
  if (!document.querySelector('.sd')) render();
  mount();
}
