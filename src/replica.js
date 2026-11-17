import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const asset=n=>`assets/realtora/${n}`;
const img=(n,alt,cls='')=>`<img class="${cls}" src="${asset(n)}" alt="${alt}" loading="lazy">`;
const servicesData=[
 ['ba40211363487499.svg','Reviewed listings','Owner-submitted photos, prices and property details, with admin review before publication.'],
 ['2d7d8c77b10e80ca.svg','Move-in support','A place to organise viewings, moving dates and the practical details of a new posting.'],
 ['b4a217db36bd0db6.svg','Mess & tiffin','Plan everyday meals for your family, busy duty days and your first week in a new city.'],
 ['e7c597768ab03a33.svg','Packers & movers','Request help with packing and transport, from the first box to the final handover.'],
 ['dd25c053ace72e9c.svg','Local home search','Start around Wanwadi, Wanowrie, Fatima Nagar and Salunke Vihar.'],
 ['124928846b5c311b.svg','Everyday essentials','Bring cleaning, internet, utilities and small home fixes into your move-in plan.']];
const needs=[['Defence & police families','A new posting, a familiar routine','A place for the family, a manageable move and meals from the first week. Bring the everyday details together before you arrive.','ebee2988a73b102f.png'],['Doctors & healthcare professionals','Less to organise around a busy rota','Shortlist a home, plan the move and find everyday meal support around the time you have available.','b38a11a22d6bd429.png'],['Government employees','A clearer start in a new city','Understand the area and the costs, keep track of your move, and share personal details only when the next step calls for them.','e1cb91ab620babef.png']];
let slide=0,context,events;
const brand='<span class="r-brand">SevaDera</span>';
const nav=()=>`<div class="r-nav"><a href="#home" aria-label="SevaDera home">${brand}</a><button class="r-menu" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button><nav aria-label="Main navigation"><a href="#home">Home</a><a href="#home" data-section="r-about">About Us</a><a href="#homes">Properties</a><a href="#home" data-section="r-services">Services</a></nav><a class="r-button r-contact" href="#account">${window.seva?.user?'My account':'Sign in'}</a></div>`;
const sectionHead=(h,p)=>`<div class="r-section-head"><h2 class="r-reveal">${h}</h2><p>${p}</p></div>`;
const slideHTML=()=>`<div class="r-person">${img(needs[slide][3],'Illustrative portrait')}<h3>${needs[slide][0]}</h3><p>Illustrative service scenario</p></div><div class="r-quote"><h3>${needs[slide][1]}</h3><p>${needs[slide][2]}</p></div>`;
window.homePage=()=>`<main class="r-site">${nav()}<section class="r-hero"><img class="r-hero-image" src="${asset('56d9b78bc1a788ba.png')}" alt="Illustrative house and garden at dusk" fetchpriority="high"><div class="r-hero-copy"><h1>Find the Right Home<br>For Your Next Posting</h1></div><div class="r-hero-bottom"><span>Wanwadi, Pune · Free at launch</span><a href="#owner">List your property</a></div></section>
<section class="r-section r-about" id="r-about"><span class="r-eyebrow">About SevaDera</span><div><h2 class="r-blur">SevaDera brings homes, moving support and everyday meals together for the people who serve and the families beside them.</h2><p>From a new posting to a new beginning, there is more to a move than finding a property. Start with local homes, organise your move and plan everyday essentials in one place, beginning in Wanwadi, Pune.</p><a class="r-button r-lime" href="#account">Get started</a></div><div class="r-stats">${[['4','Starting neighbourhoods'],['6','Support categories'],['₹0','Platform fee at launch'],['1','Place to plan your move']].map(([n,l])=>`<div><strong>${n}</strong><span>${l}</span></div>`).join('')}</div></section>
<section class="r-section">${sectionHead('Explore Neighbourhoods<br>That Feel Like Home','Begin your search around Pune’s service communities. Images below illustrate the experience; they are not photographs of these neighbourhoods.')}<div class="r-neighbourhoods">${[['eb50d7f8f7106f39.jpg','Wanwadi'],['127d5d37fa97e8c6.jpg','Wanowrie'],['f1cc40a357b2ea9a.jpg','Salunke Vihar']].map(([f,n])=>`<a href="#homes" class="r-image-card">${img(f,'Illustrative home')}<h3>${n}</h3><p>Explore homes in the area</p></a>`).join('')}</div></section>
<section class="r-section" id="r-services">${sectionHead('Our Move-in Services','SevaDera brings the practical parts of finding a home, moving and settling in together.')}<div class="r-service-grid">${servicesData.map(([f,t,d])=>`<a href="#services" class="r-service">${img(f,'')}<h3>${t}</h3><p>${d}</p></a>`).join('')}</div></section>
<section class="r-process"><div class="r-process-title"><h2 class="r-reveal">How We Work</h2><p>A considered approach to your next move</p></div><div class="r-process-cards">${[['Your needs & move-in plan','Start with your preferred area, budget and move date. Build a plan around your family and everyday routine.'],['Home search & introductions','Explore available homes, compare the stated costs and request a viewing before making your decision.'],['Packing, meals & home setup','Request help with movers, cleaning, utilities and mess or tiffin services for your first days at home.'],['Move in & settle down','Review the handover with the owner and keep the practical details of settling in together in your account.']].map(([t,p])=>`<article><h3>${t}</h3><p>${p}</p></article>`).join('')}</div></section>
<section class="r-section" id="r-properties">${sectionHead('Find Your Next Home<br>or List Your Property','A first look at the SevaDera experience. These are illustrative homes, not live listings or confirmed local availability.')}<div class="r-properties">${[['bfe7605f5221a4ba.png','A home for your family','as-101'],['f453685bd78a198c.png','Space for a fresh start','as-102'],['447d63eb7aeb4a8d.png','Room to settle in','as-103'],['c7b6ad3f25013664.png','Your next chapter','as-101']].map(([f,t,id])=>`<a href="#property/${id}" class="r-image-card">${img(f,'Illustrative property exterior')}<div class="r-property-label"><h3>${t}</h3><span>Illustrative home</span></div></a>`).join('')}</div></section>
<section class="r-media"><h2 class="r-reveal">Explore, Plan, and Find the Support You Need for Your Next Home and Move</h2><div class="r-video-wrap"><video src="${asset('neighbourhood.mp4')}" muted loop playsinline preload="metadata" aria-label="Illustrative neighbourhood aerial footage"></video><button class="r-video-toggle" aria-label="Play neighbourhood film">Play film</button><small>Illustrative neighbourhood film</small></div></section>
<section class="r-section r-community">${sectionHead('Built Around the<br>People Who Serve','Every move is different. These scenarios describe the needs we aim to support, not customer testimonials.')}<div class="r-carousel-controls"><button data-slide="-1" aria-label="Previous scenario">${img('ab2283a3d2a447af.svg','')}</button><button data-slide="1" aria-label="Next scenario">${img('7776667752f1617a.svg','')}</button></div><div class="r-slide" aria-live="polite">${slideHTML()}</div></section>
<section class="r-signup"><h2 class="r-reveal">Let SevaDera Guide<br>Your Next Move</h2><p>Find a home, plan your meals and organise the everyday.<br>Your next chapter starts with one account.</p><form id="r-start"><label class="r-sr" for="r-email">Email address</label><input id="r-email" type="email" autocomplete="email" placeholder="Enter your email" required><button class="r-button">Get Started</button></form></section>${window.footer()}<div class="r-cursor" aria-hidden="true"></div></main>`;
window.footer=()=>`<footer class="r-footer"><div class="r-footer-main"><div><a href="#home">${brand}</a><p>Homes and move-in support for defence, police, medical and government communities.</p></div><div><span>Your account</span><a href="#account">Sign in to SevaDera</a><a href="#owner">List your property</a></div><div><span>Starting in Pune</span><p>Wanwadi & Wanowrie<br>Fatima Nagar & Salunke Vihar</p></div><div><span>Move-in support</span><a href="#services">Mess & tiffin</a><a href="#services">Movers & home setup</a></div></div><nav aria-label="Footer navigation"><a href="#home">Home</a><a href="#home" data-section="r-about">About</a><a href="#homes">Properties</a><a href="#services">Services</a><a href="#owner">For sellers</a><a href="#account">My account</a></nav><div class="r-footer-bottom"><span>© ${new Date().getFullYear()} SevaDera</span><span>Independent platform · No government or Armed Forces affiliation</span></div></footer>`;
function mount(){context?.revert();events?.abort();events=new AbortController();const signal=events.signal;const site=document.querySelector('.r-site');document.body.classList.toggle('r-home',!!site);if(!site)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.querySelector('.r-menu').addEventListener('click',e=>{const b=e.currentTarget;const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?'Close navigation':'Open navigation');document.querySelector('.r-nav').classList.toggle('is-open',open)},{signal});
 site.addEventListener('click',e=>{const anchor=e.target.closest('[data-section]');if(anchor){e.preventDefault();document.getElementById(anchor.dataset.section)?.scrollIntoView({behavior:reduced?'instant':'smooth'});document.querySelector('.r-nav').classList.remove('is-open');document.querySelector('.r-menu').setAttribute('aria-expanded','false');}const control=e.target.closest('[data-slide]');if(control){slide=(slide+Number(control.dataset.slide)+needs.length)%needs.length;document.querySelector('.r-slide').innerHTML=slideHTML();if(!reduced)gsap.from('.r-slide',{opacity:0,x:15,duration:.4,clearProps:'all'});}},{signal});
 document.querySelector('#r-start').addEventListener('submit',e=>{e.preventDefault();const email=document.querySelector('#r-email').value;location.hash='account';setTimeout(()=>{const field=document.querySelector('#auth-form [name=email]');if(field)field.value=email;},0);},{signal});
 const video=document.querySelector('video');const toggle=document.querySelector('.r-video-toggle');toggle.addEventListener('click',async()=>{if(video.paused){try{await video.play();toggle.textContent='Pause film';toggle.setAttribute('aria-label','Pause neighbourhood film');}catch{toggle.textContent='Try playing again';}}else{video.pause();toggle.textContent='Play film';toggle.setAttribute('aria-label','Play neighbourhood film');}},{signal});
 context=gsap.context(()=>{if(reduced)return;
 const hero = site.querySelector('.r-hero');
 gsap.to(hero, {
   y: () => hero.offsetHeight * .8,
   ease: 'none',
   scrollTrigger: {
     trigger: site, start: 'top top',
     end: () => '+=' + hero.offsetHeight,
     scrub: true, invalidateOnRefresh: true
   }
 });
 gsap.from('.r-hero-copy, .r-hero-bottom', {
   x: -28, opacity: 0, duration: .85, stagger: .12,
   ease: 'power2.out', clearProps: 'transform,opacity'
 });
 const sections = site.querySelectorAll(
   '.r-section, .r-process, .r-media, .r-signup, .r-footer'
 );
 sections.forEach((section, index) => {
   // Animate the content rather than moving the section's background or sticky cards.
   const content = [...section.children].filter(child =>
     !child.matches('.r-process-cards')
   );
   gsap.from(content, {
     x: () => matchMedia('(max-width: 600px)').matches ? 0 : index % 2 === 0 ? -24 : 24,
     y: () => matchMedia('(max-width: 600px)').matches ? 16 : 28,
     opacity: .5,
     duration: .8,
     stagger: .08,
     ease: 'power2.out',
     clearProps: 'transform,opacity',
     scrollTrigger: { trigger: section, start: 'top 85%', once: true }
   });
 });
 for (const heading of site.querySelectorAll('.r-reveal,.r-blur')) {
   heading.innerHTML = heading.innerHTML.split(/(<br\s*\/?>|\s+)/)
     .map(word => word.trim() && !word.startsWith('<') ? `<span class="r-word">${word}</span>` : word).join('');
   const linked = heading.classList.contains('r-blur');
   gsap.from(heading.querySelectorAll('.r-word'), {
     opacity: .25, filter: 'blur(5px)', y: linked ? 0 : 12,
     stagger: .045, duration: .7, ease: 'none',
     scrollTrigger: linked
       ? {trigger: heading, start: 'top bottom', end: 'top 40%', scrub: true}
       : {trigger: heading, start: 'top 88%', once: true}
   });
 }
 gsap.utils.toArray('.r-image-card').forEach(el=>gsap.from(el,{y:45,opacity:0,duration:.85,clearProps:'all',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
 gsap.utils.toArray('.r-process-cards article').forEach((el,i)=>{gsap.to(el,{scale:1-i*.012,scrollTrigger:{trigger:el,start:'top 140px',end:'bottom top',scrub:true}});});
 ScrollTrigger.create({start:80,onUpdate:self=>document.querySelector('.r-nav')?.classList.toggle('is-scrolled',self.scroll()>80)});
 if(matchMedia('(pointer:fine)').matches){const dot=document.querySelector('.r-cursor');const x=gsap.quickTo(dot,'x',{duration:.22});const y=gsap.quickTo(dot,'y',{duration:.22});site.addEventListener('pointermove',e=>{dot.style.opacity='1';x(e.clientX);y(e.clientY);},{signal});site.addEventListener('pointerleave',()=>dot.style.opacity='0',{signal});}
 });ScrollTrigger.refresh();
}
const originalRender=window.render;window.render=function(){originalRender();mount()};window.render();
