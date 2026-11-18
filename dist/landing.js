(() => {
  // src/early-access.mjs
  var areas = ["Wanwadi", "Wanowrie", "Fatima Nagar", "Salunke Vihar"];
  var additionalServices = ["Furniture & appliances", "Housekeeping", "Childcare & eldercare leads", "Settling-in assistance"];
  var options = (values) => values.map((value) => `<option>${value}</option>`).join("");
  var select = (label, name, values) => `<label>${label}<select name="${name}"><option value="">Select if known</option>${options(values)}</select></label>`;
  var areaField = select("Preferred Pune area", "area", [...areas, "Nearby areas"]);
  var moveFields = `<label>Posting city<input name="city" value="Pune" readonly></label><label>Move date<input name="date" type="date"></label>${select("Family size", "size", ["1", "2", "3", "4", "5+"])}${select("Monthly budget", "budget", ["Under \u20B920,000", "\u20B920,000\u2013\u20B930,000", "\u20B930,000\u2013\u20B945,000", "\u20B945,000+"])}${select("Property type", "property", ["1 BHK", "2 BHK", "3 BHK", "Independent home", "PG / room"])}`;
  var cardGrid = (items, cls = "") => `<div class="sd-grid ${cls}">${items.map(([title, copy]) => `<article class="sd-card"><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div>`;
  var formEnd = (label) => `<label class="sd-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><label class="sd-consent"><input type="checkbox" name="consent" required> I agree to be contacted about this request.</label><button class="sd-btn">${label}</button><p class="sd-status" role="status"></p>`;
  var navLinks = '<a href="#pune-checklist">Posting checklist</a><a href="#homes">Rooms & flats</a><a href="#move-services">Tiffin & move-in</a><a href="#items">Household items</a>';
  var photo = (file, alt) => `<img loading="lazy" src="assets/realtora/${file}" alt="${alt}" width="480" height="300">`;
  var examples = [
    ["Wanowrie", "2 BHK", "\u20B924,000", "\u20B948,000", "\u20B92,000", "Semi-furnished", "1,050 sq ft", "f453685bd78a198c.png", "as-101"],
    ["Fatima Nagar", "3 BHK", "\u20B932,000", "\u20B964,000", "\u20B93,000", "Furnished", "1,420 sq ft", "447d63eb7aeb4a8d.png", "as-102"],
    ["Wanwadi", "2 BHK", "\u20B922,000", "\u20B944,000", "\u20B92,000", "Unfurnished", "980 sq ft", "bfe7605f5221a4ba.png", "as-103"]
  ];
  var escapeText = (value) => String(value).replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[char]);
  var homePage = (coordinator = "") => `<div class="sd">
<a class="sd-skip" href="#main-content">Skip to content</a>
<header class="sd-head">
<div class="sd-bar"><a class="sd-brand" href="#home">Sainik Space<span>.</span></a><button type="button" class="sd-menu" aria-expanded="false" aria-controls="sd-nav">Menu</button><nav id="sd-nav" aria-label="Main navigation">${navLinks}</nav><a class="sd-btn sd-top" href="#match">Plan my move</a></div></header>
<main id="main-content" tabindex="-1">
<section class="sd-welcome" aria-labelledby="sd-welcome-title">
  <div class="sd-wrap sd-welcome-inner">
    <div class="sd-welcome-copy">
      <p class="sd-welcome-label">Home, wherever duty takes you.</p>
      <h1 id="sd-welcome-title">Posted to Pune? <span class="sd-duty">Let\u2019s get you settled.</span></h1>
      <p>Find a room or flat, arrange your first week of tiffin, and get local help with move-in. One Pune coordinator for defence families, police personnel, doctors and government employees.</p>
      <div class="sd-actions">
        <a class="sd-btn" href="#match" data-event="hero_cta">Plan my Pune move <span aria-hidden="true">\u2197</span></a>
        <a class="sd-btn sd-outline" href="#match" data-need="Tiffin & meals" data-event="hero_tiffin">Check tiffin delivery</a>
      </div>
      <p class="sd-note sd-coverage">Starting in Wanwadi and Wanowrie. Ask about Fatima Nagar and Salunke Vihar.</p>
    </div>
    <figure class="sd-welcome-art">
      <img src="assets/sevadera-service-team.png" width="1536" height="1024" fetchpriority="high" decoding="async" alt="3D-style illustration of an army service member, a doctor and a civil servant">
    </figure>
  </div>
</section>
<section class="sd-wrap sd-local" aria-labelledby="sd-coordinator">
  <div>
    <p class="sd-note">Wanwadi relocation desk</p>
    <h2 id="sd-coordinator">${coordinator ? `Meet ${escapeText(coordinator)}, your local coordinator.` : "A local contact for your move to Wanwadi."}</h2>
  </div>
  <div>
    <p>Share your arrival date, budget and preferred area. We\u2019ll check with owners and local providers and send you the options and costs. Choose what you want help with before committing.</p>
    <a class="sd-btn sd-outline" href="#pune-checklist">Open the Pune posting checklist</a>
  </div>
</section>
<section class="sd-band sd-checklist" id="pune-checklist" aria-labelledby="sd-checklist-title">
  <div class="sd-wrap">
    <h2 id="sd-checklist-title">Your Pune posting checklist</h2>
    <p>Use this free checklist from the day you get your orders through your first week in Pune.</p>
    <ol class="sd-grid">
      <li><h3>When your posting is confirmed</h3><p>Set an arrival window and budget for rent, deposit, travel and first-week meals. Decide whether you need a room, PG or family flat.</p></li>
      <li><h3>Before you arrive</h3><p>Confirm the rent and deposit with the owner. Book a viewing, ask about handover, and check tiffin coverage for the address.</p></li>
      <li><h3>On move-in day</h3><p>Check the keys, utilities and condition of the home. Save the owner\u2019s contact and confirm your first meal delivery window.</p></li>
    </ol>
  </div>
</section>
<section class="sd-wrap" id="homes-preview"><h2>Rooms and flats for rent in Pune</h2><p>Looking around Wanwadi, Wanowrie, Fatima Nagar or Salunke Vihar? Tell us whether you need a room, PG or family flat. The samples below show the details to compare.</p><div class="sd-grid">${examples.map(([area, bhk, rent, deposit, fee, furnishing, size, file, id]) => `<article class="sd-card sd-property">${photo(file, "Illustrative home exterior")}<p class="sd-note">Illustrative example \xB7 not a live listing</p><h3>${bhk} in ${area}</h3><p><strong>${rent} / month</strong> \xB7 ${size}<br>${deposit} deposit \xB7 ${fee} maintenance<br>${furnishing} \xB7 Parking and pets to confirm</p><p class="sd-note">Owner verification, floor plan, exact travel times and viewing slots would appear when confirmed.</p><div class="sd-actions"><button class="sd-btn sd-outline" data-area="${area}">Notify me about viewings</button><a href="#property/${id}">Sample details</a><button data-save="${id}" aria-pressed="false">Save</button><button data-share="${id}">Share</button></div></article>`).join("")}</div><p class="sd-status" id="sd-share-status" role="status"></p></section>
<section class="sd-band" id="move-services">
  <div class="sd-wrap">
    <h2>Meals from day one and help getting the home ready</h2>
    ${cardGrid([
    ["Mess & tiffin in Pune", "Ask about a trial tiffin or a weekly or monthly plan. We\u2019ll confirm the menu, price and delivery window for your address before you order."],
    ["Moving & cleaning", "Ask about packing, moving and cleaning. We\u2019ll confirm availability and share costs before you commit."],
    ["Home setup", "Get help checking internet, utilities, furniture rentals and repairs around your move date."]
  ])}
    <a class="sd-btn" href="#match" data-need="Tiffin & meals">Request mess or tiffin options</a>
  </div>
</section>
<section class="sd-band" id="match"><div class="sd-wrap sd-final"><div><h2>Tell us what you need in Pune.</h2><p>Request a room, flat, meal plan or move-in help. We\u2019ll follow up about availability.</p></div><form method="post" action="/api/early-access" class="sd-card" id="sd-lead" data-lead="relocation" aria-label="Request a relocation plan"><div class="sd-fields"><label>Full name<input name="name" required maxlength="100" autocomplete="name"></label><label>Email<input name="email" type="email" required maxlength="254" autocomplete="email"></label><label>Phone (optional)<input name="phone" type="tel" maxlength="25" autocomplete="tel"></label>${areaField}</div>
<fieldset class="sd-choices"><legend>What do you need?</legend>${["Rental home", "Tiffin & meals", "Movers & packers", "Deep cleaning", "Internet & Wi-Fi", "Utilities", "Repairs & maintenance", "Other"].map((name) => `<label><input type="checkbox" name="needs" value="${name}"> ${name}</label>`).join("")}</fieldset>
<details class="sd-form-more"><summary>Add move date, budget or property type (optional)</summary><div class="sd-fields">${moveFields}</div><fieldset class="sd-choices"><legend>Other move-in services</legend>${additionalServices.map((name) => `<label><input type="checkbox" name="needs" value="${name}"> ${name}</label>`).join("")}</fieldset></details><label class="sd-consent"><input type="checkbox" name="updates"> Send me occasional early-access updates (optional)</label>${formEnd("Request my relocation plan")}<p class="sd-note">We use your details to respond to your request. Please leave out service IDs, posting orders and exact duty locations.</p></form></div></section>
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
      <small>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Sainik Space \xB7 Independent Pune relocation service</small>
      <a href="#main-content">Back to top <span aria-hidden="true">\u2191</span></a>
    </div>
  </div>
</footer></div>`;
  function track(name, properties = {}) {
    window.dispatchEvent(new CustomEvent("seva:analytics", { detail: { name, ...properties } }));
    window.va?.("event", { name, data: properties });
  }
  function mount() {
    const site = document.querySelector(".sd");
    if (!site) return;
    const final = site.querySelector("#sd-lead");
    const menu = site.querySelector(".sd-menu");
    menu.onclick = () => menu.setAttribute("aria-expanded", String(menu.getAttribute("aria-expanded") !== "true"));
    site.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
        menu.setAttribute("aria-expanded", "false");
        menu.focus();
      }
    });
    site.addEventListener("click", async (event) => {
      const target = event.target.closest("button,a");
      if (!target) return;
      if (target.dataset.event) track(target.dataset.event);
      const hash = target.getAttribute("href");
      const section = /^#[\w-]+$/.test(hash || "") && site.querySelector(hash);
      if (section) {
        event.preventDefault();
        menu.setAttribute("aria-expanded", "false");
        if (target.dataset.need) {
          for (const input of final.querySelectorAll("[name=needs]")) {
            if (input.value === target.dataset.need) input.checked = true;
          }
        }
        if (!section.hasAttribute("tabindex")) section.tabIndex = -1;
        section.focus({ preventScroll: true });
        section.scrollIntoView();
      }
      if (target.dataset.area) {
        track("neighbourhood_interest", { area: target.dataset.area });
        final.elements.area.value = target.dataset.area;
        final.scrollIntoView();
        final.elements.name.focus({ preventScroll: true });
      }
      if (target.dataset.save) {
        const key = "sd-saved-" + target.dataset.save;
        const saved = target.getAttribute("aria-pressed") === "true";
        try {
          saved ? localStorage.removeItem(key) : localStorage.setItem(key, "1");
        } catch {
        }
        target.setAttribute("aria-pressed", String(!saved));
        target.textContent = saved ? "Save" : "Saved";
      }
      if (target.dataset.share) {
        const url = new URL(location.href);
        url.hash = "property/" + target.dataset.share;
        const status = site.querySelector("#sd-share-status");
        try {
          if (navigator.share) await navigator.share({ url: url.href, title: "Sainik Space illustrative home" });
          else {
            await navigator.clipboard.writeText(url.href);
            status.textContent = "Sample link copied.";
          }
        } catch {
          status.textContent = url.href;
        }
      }
    });
    for (const button of site.querySelectorAll("[data-save]")) {
      try {
        if (localStorage.getItem("sd-saved-" + button.dataset.save)) {
          button.setAttribute("aria-pressed", "true");
          button.textContent = "Saved";
        }
      } catch {
      }
    }
    site.addEventListener("change", (event) => {
      if (event.target.name === "needs") track("service_selection", { service: event.target.value, selected: event.target.checked });
    });
    site.addEventListener("submit", async (event) => {
      const form = event.target;
      event.preventDefault();
      const kind = form.dataset.lead;
      if (!kind) return;
      const data = new FormData(form);
      const payload = { ...Object.fromEntries(data), needs: data.getAll("needs"), kind };
      const submit = event.submitter || form.querySelector("[type=submit],button");
      const status = form.querySelector(".sd-status");
      submit.disabled = true;
      status.textContent = "Sending your request\u2026";
      try {
        const response = await fetch("/api/early-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (response.status === 429) throw new Error("Too many requests. Please try again later.");
        if (!response.ok) throw new Error("We couldn\u2019t send your request. Your details are still here. Please try again later.");
        status.textContent = kind !== "relocation" ? "Enquiry received. We\u2019ll contact you about next steps." : "Request received. Our team will review your requirements and share relevant options and next steps.";
        track("lead_submitted", { kind });
        form.reset();
      } catch (error) {
        status.textContent = error.message;
      } finally {
        submit.disabled = false;
      }
    });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        for (const { target, isIntersecting } of entries) if (isIntersecting) {
          target.classList.add("sd-enter");
          observer.unobserve(target);
        }
      });
      site.querySelectorAll("main > section").forEach((section) => observer.observe(section));
    }
  }
  if (typeof window !== "undefined") {
    window.homePage = () => homePage(window.__SEVADERA_CONFIG__?.coordinatorName);
    const render = window.render;
    window.render = function() {
      if (document.querySelector(".sd") && ["", "#home"].includes(location.hash)) return;
      render();
      mount();
    };
    if (!document.querySelector(".sd")) render();
    mount();
  }
})();
