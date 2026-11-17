const areas = [
  ['Wanwadi', 'Start with your daily route. Compare apartment societies for lift access, parking and security.'],
  ['Wanowrie', 'Compare furnished and unfurnished flats. Check broadband options and the building’s pet policy.'],
  ['Fatima Nagar', 'Shortlist apartments around your grocery, clinic and school runs. Check traffic at your actual commute time.'],
  ['Salunke Vihar', 'Compare family flats for storage, parking and everyday errands. Ask about move-in hours and delivery access.']
];
const services = [
  ['Movers & packers', 'Packing, transport and unloading. Confirm inventory and transit cover.'],
  ['Deep cleaning', 'Kitchen, bathrooms and move-in cleaning. Confirm the rooms and surfaces included.'],
  ['Internet & Wi-Fi', 'Check building coverage and installation slots.'],
  ['Utilities', 'Plan electricity, water and gas handover with the owner.'],
  ['Furniture & appliances', 'Compare rental periods, delivery and collection terms.'],
  ['Repairs & maintenance', 'Describe the issue and confirm labour and material charges.'],
  ['Tiffin & meals', 'Ask about menus, delivery areas and trial meal plans.'],
  ['Housekeeping', 'Discuss tasks, visit frequency and availability.'],
  ['Childcare & eldercare leads', 'Request local leads and assess suitability directly.'],
  ['Settling-in assistance', 'Work through local errands and the first-week checklist.']
];
const faqs = [
  ['Is SevaDera affiliated with the government or Armed Forces?', 'SevaDera is an independent platform with no official affiliation or endorsement.'],
  ['Which areas do you currently serve?', 'Early access focuses on Wanwadi, Wanowrie, Fatima Nagar and Salunke Vihar in Pune.'],
  ['Are listings live?', 'Homes shown here are illustrative. Request early access for availability updates.'],
  ['How do you verify owners and properties?', 'The existing listing flow includes admin review. Ask which checks have been completed before relying on a listing or paying a deposit.'],
  ['Do you charge tenants?', 'There is no SevaDera platform fee during early access. Rent, deposits and partner quotes are separate.'],
  ['How are service providers selected?', 'Partner intake is open. Ask for the provider’s identity, scope and terms before accepting a quote.'],
  ['Can I request only tiffin or cleaning?', 'Yes. Select just the service you need in your request.'],
  ['What if my move date changes?', 'Use your request confirmation to identify your plan when contacting the team. Confirm any cancellation terms with your provider.'],
  ['How do deposits and rent payments work?', 'Agree each charge, recipient and refund condition in writing with the owner or authorised manager. The early-access form takes no payments.'],
  ['What personal information do you collect?', 'We request contact details and move preferences to respond. Leave out service IDs, posting orders and exact duty locations.'],
  ['Can I list my property?', 'Yes. Use the owner dashboard to submit a draft for review or register interest below.'],
  ['How do I become a service partner?', 'Send your business name, email and service category through the partner form.'],
  ['Which areas are coming next?', 'Expansion depends on local supply and demand. No additional areas are confirmed.']
];

const options = values => values.map(value => `<option>${value}</option>`).join('');
const select = (label, name, values) => `<label>${label}<select name="${name}"><option value="">Select if known</option>${options(values)}</select></label>`;
const areaField = select('Preferred Pune area', 'area', [...areas.map(([name]) => name), 'Nearby areas']);
const needs = ['Rental home', ...services.map(([name]) => name)];
const choices = list => `<fieldset class="sd-choices"><legend>What do you need?</legend>${list.map(name => `<label><input type="checkbox" name="needs" value="${name}"> ${name}</label>`).join('')}</fieldset>`;
const moveFields = `<label>Posting city<input name="city" value="Pune" readonly></label>${areaField}<label>Move date<input name="date" type="date"></label>${select('Family size','size',['1','2','3','4','5+'])}${select('Monthly budget','budget',['Under ₹20,000','₹20,000–₹30,000','₹30,000–₹45,000','₹45,000+'])}${select('Property type','property',['1 BHK','2 BHK','3 BHK','Independent home','PG / room'])}`;
const cardGrid = (items, cls = '') => `<div class="sd-grid ${cls}">${items.map(([title, copy]) => `<article class="sd-card"><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>`;
const formEnd = label => `<label class="sd-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><label class="sd-consent"><input type="checkbox" name="consent" required> I agree to be contacted about this request.</label><button class="sd-btn">${label}</button><p class="sd-status" role="status"></p>`;
const navLinks = '<a href="#homes-preview">Homes</a><a href="#move-services">Moving & settling in</a><a href="#neighbourhoods">Neighbourhoods</a><a href="#owners">For owners</a><a href="#partners">For partners</a><a href="#faq">FAQ</a>';
const photo = (file, alt) => `<img loading="lazy" src="assets/realtora/${file}" alt="${alt}" width="480" height="300">`;
const examples = [
  ['Wanowrie','2 BHK','₹24,000','₹48,000','₹2,000','Semi-furnished','1,050 sq ft','f453685bd78a198c.png','as-101'],
  ['Fatima Nagar','3 BHK','₹32,000','₹64,000','₹3,000','Furnished','1,420 sq ft','447d63eb7aeb4a8d.png','as-102'],
  ['Wanwadi','2 BHK','₹22,000','₹44,000','₹2,000','Unfurnished','980 sq ft','bfe7605f5221a4ba.png','as-103']
];

window.homePage = () => `<div class="sd">
<a class="sd-skip" href="#main-content">Skip to content</a>
<div class="sd-head"><div class="sd-ann">Early access now open for Pune <span>· Get relocation support before your next posting.</span></div>
<div class="sd-bar"><a class="sd-brand" href="#home">SevaDera<span>.</span></a><button type="button" class="sd-menu" aria-expanded="false" aria-controls="sd-nav">Menu</button><nav id="sd-nav" aria-label="Main navigation">${navLinks}</nav><a class="sd-btn sd-top" href="#match">Find a home</a></div></div>
<main id="main-content" tabindex="-1">
<section class="sd-hero sd-wrap"><div><p class="sd-kicker">Home, wherever duty takes you.</p><h1 id="sd-headline">Your next posting, made feel like home.</h1><p class="sd-intro">SevaDera helps service families find a home, manage the move, and settle into a new city with trusted local support—starting in Pune.</p><div class="sd-actions"><a class="sd-btn" href="#match" data-event="hero_cta" id="sd-cta">Find a home near your next posting</a><a class="sd-btn sd-outline" href="#early-access">Join early access</a></div><p class="sd-note">Wanwadi, Wanowrie, Fatima Nagar & Salunke Vihar · No platform fee during early access</p></div>
<figure><img src="assets/realtora/f453685bd78a198c.png" alt="Illustrative residential home with greenery" fetchpriority="high"><figcaption>Pune early access · Illustrative image</figcaption></figure></section>
<section id="match" class="sd-wrap sd-match"><form class="sd-card" id="sd-match"><h2>Tell us what your move looks like.</h2><div class="sd-fields">${moveFields}</div>${choices(['Rental home','Movers & packers','Deep cleaning','Tiffin & meals','Internet & Wi-Fi','Utilities','Repairs & maintenance'])}<button class="sd-btn">Get matched homes & support</button><p class="sd-note">Add your contact details next so we can follow up as options open.</p></form></section>
<section class="sd-wrap"><h2>Relocation shouldn’t feel like starting from zero.</h2>${cardGrid([
['An unfamiliar area','Finding a suitable home when you don’t know the streets or your commute.'],
['Viewings from another city','Coordinating owners, paperwork and deposits without being there.'],
['A list of move-day jobs','Booking movers, cleaning, utilities and repairs around one date.'],
['Meals from day one','Finding dependable food before the kitchen is up and running.'],
['New family routines','Planning school runs, pet arrangements and everyday errands.'],
['A demanding new role','Keeping the move on track while getting ready for work.']
])}</section>
<section class="sd-band"><div class="sd-wrap"><h2>One place for your next home—and everything that makes it liveable.</h2>${cardGrid([
['Find the right home','Plan your rental shortlist, neighbourhood checks and viewings.'],
['Move without chaos','Coordinate packing, transport, cleaning and handover.'],
['Settle in quickly','Work through internet, utilities, rentals and repairs.'],
['Live comfortably','Explore meal plans, housekeeping and everyday local support.']
],'sd-four')}<p class="sd-note">Service availability varies by neighbourhood and partner. SevaDera coordinates local services independently of government and Armed Forces.</p><a class="sd-btn" href="#early-access">Request a relocation plan</a></div></section>
<section class="sd-wrap"><h2>From posting to move-in</h2>${cardGrid([
['1. Share your preferences','Tell us your preferred area, date, household size and budget.'],
['2. Get a shortlist','Review options as availability opens, alongside a move checklist.'],
['3. Coordinate viewings','Discuss visits, quotes and service dates.'],
['4. Settle in','Plan your first meals, repairs and everyday errands.']
],'sd-four')}<p class="sd-note">Example timeline · Posting confirmed → shortlist target within 48 hours of matching opening → viewings → move-in → first 30 days. Timing is a goal and depends on availability.</p></section>
<section class="sd-wrap" id="neighbourhoods"><h2>Four neighbourhoods to start with</h2><div class="sd-map-layout"><div class="sd-map" aria-label="Schematic Pune area map"><p>Pune · approximate layout</p>${areas.map(([name],i) => `<button type="button" class="sd-pin sd-pin-${i}" data-map="${i}" aria-pressed="${i === 0}">${name}</button>`).join('')}</div><article class="sd-card" id="sd-area" aria-live="polite"></article></div><p class="sd-note">Check routes to hospitals, schools, offices, markets and transport from the exact address. Current rent bands and commute estimates are pending local verification.</p><a class="sd-btn" href="#match">Plan a move in Pune</a></section>
<section class="sd-wrap" id="homes-preview"><h2>See what a home listing could look like</h2><div class="sd-grid">${examples.map(([area,bhk,rent,deposit,fee,furnishing,size,file,id]) => `<article class="sd-card sd-property">${photo(file,'Illustrative home exterior')}<p class="sd-note">Illustrative example · not a live listing</p><h3>${bhk} in ${area}</h3><p><strong>${rent} / month</strong> · ${size}<br>${deposit} deposit · ${fee} maintenance<br>${furnishing} · Parking and pets to confirm</p><p class="sd-note">Owner verification, floor plan, exact travel times and viewing slots would appear when confirmed.</p><div class="sd-actions"><button class="sd-btn sd-outline" data-area="${area}">Notify me about viewings</button><a href="#property/${id}">Sample details</a><button data-save="${id}" aria-pressed="false">Save</button><button data-share="${id}">Share</button></div></article>`).join('')}</div><p class="sd-status" id="sd-share-status" role="status"></p></section>
<section class="sd-band" id="move-services"><div class="sd-wrap"><h2>Build your move-in bundle</h2>${cardGrid(services.map(([title,copy]) => [title,`${copy}<br><small>Request quote · Local partner coordination</small>`]))}<p class="sd-note">Ask for provider verification status, response time, cancellation terms and support before booking. Ratings will appear when genuine feedback is available.</p><form class="sd-card sd-bundle" id="sd-bundle"><div class="sd-fields">${select('Home status','homeStatus',['Still looking','Already arranged'])}<label>Move date<input type="date" name="date"></label></div>${choices(services.map(([name]) => name))}<p id="sd-checklist" aria-live="polite">Select services to build your checklist.</p><button class="sd-btn">Request a customised plan</button></form></div></section>
<section class="sd-wrap" id="trust"><h2>Know what to check before committing</h2>${cardGrid([
['Listing review','Owner submissions enter admin review. Ask for evidence of ownership or authorisation and confirm photos, availability and total costs before committing.'],
['Payments & cancellations','Early access takes no payments. Confirm who you contract with, cancellation and refund terms, and how to raise concerns in writing. Avoid pressure to pay an unconfirmed recipient.'],
['Privacy & support','We use your email and move preferences to respond. Phone is optional. Requests are stored in a restricted database. Ask the team to correct or delete your details when they contact you.']
])}<p class="sd-note">SevaDera is an independent platform. It is not affiliated with, endorsed by, or operated on behalf of any government department or armed force.</p><p>Early-access cohort now forming. The rollout starts with requests, then reviewed listings and local service availability.</p></section>
<section class="sd-wrap sd-grid sd-two"><article class="sd-card" id="owners"><h2>Fill vacancies with reliable, long-stay tenants.</h2><p>Reach relocation-focused households and get guidance on photos, viewing arrangements and listing details. No listing fee during early access.</p><div class="sd-actions"><a class="sd-btn" href="#owner" data-event="owner_cta">List your property free</a></div><form data-lead="owner"><h3>Register owner interest</h3><label>Full name<input name="name" required maxlength="100" autocomplete="name"></label><label>Email<input name="email" type="email" required maxlength="254" autocomplete="email"></label>${areaField}${formEnd('Send owner enquiry')}</form></article>
<article class="sd-card" id="partners"><h2>Grow your business with families who need you most.</h2><p>Tell us your service area and availability. Discuss verification, lead handling and commercial terms before joining.</p><form data-lead="partner"><label>Business name<input name="name" required maxlength="100" autocomplete="organization"></label><label>Email<input name="email" type="email" required maxlength="254" autocomplete="email"></label>${select('Service category','service',services.map(([name]) => name))}${formEnd('Become a SevaDera partner')}</form></article></section>
<section class="sd-wrap sd-faq" id="faq"><h2>Frequently asked questions</h2>${faqs.map(([q,a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>
<section class="sd-band" id="early-access"><div class="sd-wrap sd-final"><div><h2>Make your next posting feel like home.</h2><p>Join early access for homes, move-in support and everyday services in Pune.</p><a class="sd-btn sd-outline" href="#sd-lead" data-event="team_cta">Talk to our relocation team</a></div><form class="sd-card" id="sd-lead" data-lead="relocation" aria-label="Request a relocation plan"><div class="sd-fields"><label>Full name<input name="name" required maxlength="100" autocomplete="name"></label><label>Email<input name="email" type="email" required maxlength="254" autocomplete="email"></label><label>Phone (optional)<input name="phone" type="tel" maxlength="25" autocomplete="tel"></label><label>Current city<input name="currentCity" maxlength="80"></label>${moveFields}</div>${choices([...needs,'Other'])}<label class="sd-consent"><input type="checkbox" name="updates"> Send me occasional early-access updates (optional)</label>${formEnd('Request my relocation plan')}</form></div></section>
</main><footer class="sd-footer"><div class="sd-wrap"><a class="sd-brand" href="#home">SevaDera<span>.</span></a><p>Home, wherever duty takes you. Starting in Pune, India.</p><nav aria-label="Footer navigation">${navLinks}<a href="#trust">Privacy & booking terms</a><a href="#account">Sign in</a></nav><small>© ${new Date().getFullYear()} SevaDera · Early access v1</small></div></footer></div>`;

function track(name, properties = {}) {
  window.dispatchEvent(new CustomEvent('seva:analytics', { detail: { name, ...properties } }));
  window.va?.('event', { name, data: properties });
}

function mount() {
  const site = document.querySelector('.sd');
  if (!site) return;
  const final = site.querySelector('#sd-lead');
  let fromMatch = false;
  function showArea(index) {
    const [name, copy] = areas[index];
    site.querySelectorAll('[data-map]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.map) === index)));
    site.querySelector('#sd-area').innerHTML = `<h3>${name}</h3><p>${copy}</p><a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(name + ', Pune')}" target="_blank" rel="noopener">View area on OpenStreetMap</a><p><button class="sd-btn" data-area="${name}">Notify me for ${name}</button></p>`;
  }
  function transfer(form) {
    const data = new FormData(form);
    for (const key of ['area','date','size','budget','property']) {
      if (data.get(key)) final.elements[key].value = data.get(key);
    }
    for (const input of final.querySelectorAll('[name=needs]')) {
      if (data.getAll('needs').includes(input.value)) input.checked = true;
    }
    if (data.has('homeStatus')) final.dataset.homeStatus = data.get('homeStatus');
    final.scrollIntoView();
    final.elements.name.focus({preventScroll:true});
  }
  showArea(0);
  const variants = new URLSearchParams(location.search);
  if (variants.get('headline') === 'short') site.querySelector('#sd-headline').textContent = 'Make your next posting feel like home.';
  if (variants.get('cta') === 'short') site.querySelector('#sd-cta').textContent = 'Find a home in Pune';
  if (variants.get('form') === 'short') {
    for (const key of ['phone','currentCity','size','budget','property']) final.elements[key].closest('label').hidden = true;
  }
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
      if (!section.hasAttribute('tabindex')) section.tabIndex = -1;
      section.focus({preventScroll:true});
      section.scrollIntoView();
    }
    if (target.dataset.map !== undefined) {
      showArea(Number(target.dataset.map));
      track('neighbourhood_click', { area: target.textContent });
    }
    if (target.dataset.area) {
      track('neighbourhood_interest', { area: target.dataset.area });
      final.elements.area.value = target.dataset.area;
      transfer(final);
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
        if (navigator.share) await navigator.share({url:url.href, title:'SevaDera illustrative home'});
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
    if (event.target.form?.id === 'sd-bundle') {
      const selected = new FormData(event.target.form).getAll('needs');
      site.querySelector('#sd-checklist').textContent = selected.length ? 'Confirm availability, scope and quotes for: ' + selected.join(', ') + '.' : 'Select services to build your checklist.';
    }
  });
  site.addEventListener('submit', async event => {
    const form = event.target;
    event.preventDefault();
    if (form.id === 'sd-match' || form.id === 'sd-bundle') {
      fromMatch = form.id === 'sd-match';
      track(fromMatch ? 'search_submit' : 'bundle_submit');
      transfer(form);
      return;
    }
    const kind = form.dataset.lead;
    if (!kind) return;
    const data = new FormData(form);
    const payload = {...Object.fromEntries(data), needs:data.getAll('needs'), homeStatus:form.dataset.homeStatus, kind};
    const submit = event.submitter || form.querySelector('[type=submit],button');
    const status = form.querySelector('.sd-status');
    submit.disabled = true;
    status.textContent = 'Sending your request…';
    try {
      const response = await fetch('/api/early-access', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      if (response.status === 429) throw new Error('Too many requests. Please try again later.');
      if (!response.ok) throw new Error('We couldn’t send your request. Your details are still here. Please try again later.');
      status.textContent = kind !== 'relocation' ? 'Enquiry received. We’ll contact you about next steps.' : fromMatch ? 'Thanks—we’ll notify you when verified homes and support services open near your next posting.' : 'Request received. Our team will review your requirements and share relevant options and next steps.';
      track('lead_submitted', {kind});
      form.reset();
      delete form.dataset.homeStatus;
      if (kind === 'relocation') fromMatch = false;
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

const render = window.render;
window.render = function () {
  if (document.querySelector('.sd') && ['','#home'].includes(location.hash)) return;
  render();
  mount();
};
render();
mount();
