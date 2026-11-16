/* Account-backed housing workflows. All permissions are enforced by Supabase RLS. */
const samples = homes.map(home => ({...home, sample:true}));
let liveProperties = [];
let dataError = '';
let loading = false;
let ownerProperties = [];
let requests = [];
let viewingRequests = [];
let refreshVersion = 0;
const baseRender = render;
const currentUser = () => window.seva?.user;
const query = promise => window.seva.result(promise);
const db = () => window.seva.client;
const today = () => new Date().toLocaleDateString('en-CA');
const homeById = id => homes.find(home => home.id === id) || ownerProperties.find(home => home.id === id);

function requireAccount(){
  if(currentUser()) return true;
  location.hash='account';
  toast('Sign in to continue privately.');
  return false;
}
async function perform(button, work){
  if(button) button.disabled=true;
  try {await work();} catch(error){toast(error.message || 'Something went wrong. Please try again.');}
  finally {if(button) button.disabled=false;}
}
async function loadHomes(){
  const version=++refreshVersion;
  loading=true; dataError='';
  try {
    if(!currentUser()) {
      saved=[]; checks=[]; liveProperties=[]; ownerProperties=[]; requests=[]; viewingRequests=[];
    } else {
      const userId=currentUser().id;
      const [properties,favourites,progress,serviceRows,enquiryRows]=await Promise.all([
        query(db().from('properties').select('*,property_photos(*)').order('created_at',{ascending:false})),
        query(db().from('saved_properties').select('property_id').eq('user_id',userId)),
        query(db().from('move_tasks').select('task_key,completed').eq('user_id',userId)),
        query(db().from('service_requests').select('*').order('created_at',{ascending:false})),
        query(db().from('enquiries').select('*').order('created_at',{ascending:false}))
      ]);
      if(version!==refreshVersion)return;
      const mapped=await Promise.all(properties.map(async row=>{
        const photos=[...(row.property_photos||[])].sort((a,b)=>a.position-b.position);
        let imageUrl='';
        if(photos[0]) {try {imageUrl=await window.seva.photoUrl(photos[0].storage_path);}catch{}}
        return {...row,beds:row.bedrooms,size:row.size_sqft,furnish:row.furnishing,imageUrl,photos,sample:false};
      }));
      if(version!==refreshVersion)return;
      liveProperties=mapped.filter(row=>row.status==='published');
      ownerProperties=mapped.filter(row=>row.owner_id===userId);
      saved=favourites.map(row=>row.property_id);
      checks=progress.filter(row=>row.completed).map(row=>row.task_key);
      requests=serviceRows; viewingRequests=enquiryRows;
      window.seva.reviewProperties=mapped;
    }
  }catch(error){dataError=error.message;}
  finally{
    if(version===refreshVersion){
      homes.splice(0,homes.length,...(liveProperties.length?liveProperties:samples));
      loading=false; render();
    }
  }
}

header = function(){return `<header><a class="brand" href="#home"><span class="mark" aria-hidden="true">⌂</span><span>SevaDera<small>HOMES FOR THOSE WHO SERVE</small></span></a><nav><a href="#homes">Find a home</a><a href="#services">Move-in services</a><a href="#move">My move</a><a href="#account">${currentUser()?'My account':'Sign in'}</a><a class="button" href="#owner">List your home ↗</a></nav><button class="mobile-menu" aria-label="Open navigation" onclick="document.querySelector('nav').classList.toggle('open')">☰</button></header>`;};
footer = function(){return `<footer><a class="brand" href="#home"><span class="mark" aria-hidden="true">⌂</span><span>SevaDera<small>HOME, WHERE DUTY TAKES YOU.</small></span></a><p>Starting in Wanwadi, Pune · Free during launch<br>Independent community platform for private housing.</p><div><a href="#privacy">Privacy & trust</a> · <a href="#account">My account ↗</a>${window.seva?.staff?' · <a href="#admin">Manage portal</a>':''}</div></footer>`;};
card = function(home){return `<article class="property"><div class="property-image"><a href="#property/${home.id}">${home.sample||home.imageUrl?`<img src="${escapeHtml(home.sample?photo(home.image):home.imageUrl)}" alt="${home.sample?'Illustrative home':'Property photograph'}" loading="lazy">`:'<div class="photo-empty">Photographs being prepared</div>'}</a><button class="save" aria-label="${saved.includes(home.id)?'Unsave':'Save'} ${escapeHtml(home.title)}" onclick="toggleSave('${home.id}',this)">${saved.includes(home.id)?'♥':'♡'}</button><span class="image-label">${home.sample?'Illustrative home':'Listing reviewed'}</span></div><div class="property-title"><a href="#property/${home.id}"><h3>${escapeHtml(home.title)}</h3></a><strong>${money(home.rent)}<span class="muted"> / mo</span></strong></div><div class="meta">${escapeHtml(home.area)}, Pune · ${home.beds} bedrooms${home.size?' · '+home.size+' sq ft':''}</div><div class="card-bottom"><span>${escapeHtml(home.furnish)}</span><a href="#property/${home.id}">Explore home ↗</a></div></article>`;};
toggleSave = async function(id,button){
  if(!requireAccount())return;
  if(homeById(id)?.sample){toast('Illustrative homes cannot be saved. Live listings will appear here after review.');return;}
  await perform(button,async()=>{
    if(saved.includes(id))await query(db().from('saved_properties').delete().eq('user_id',currentUser().id).eq('property_id',id));
    else await query(db().from('saved_properties').insert({property_id:id}));
    await loadHomes();
  });
};
setCheck = async function(index,value){
  if(!requireAccount())return;
  await perform(null,async()=>{
    await query(db().from('move_tasks').upsert({user_id:currentUser().id,task_key:index,completed:value,updated_at:new Date().toISOString()}));
    checks=value?[...new Set([...checks,index])]:checks.filter(x=>x!==index);
    render();
  });
};

function signInForm(mode='login'){
  const signup=mode==='signup';
  showModal(`<div class="eyebrow">Your private account</div><h2>${signup?'Make yourself at home.':'Welcome back.'}</h2><p>Use your personal email. Your email stays within your account.</p><form class="form" id="auth-form"><label>Email address<input name="email" type="email" autocomplete="email" required></label><label>Password<input name="password" type="password" minlength="12" autocomplete="${signup?'new-password':'current-password'}" required></label><button class="button">${signup?'Create account':'Sign in'} ↗</button><p id="auth-message" role="status" class="muted"></p></form><button class="text-button" onclick="signInForm('${signup?'login':'signup'}')">${signup?'Already have an account? Sign in':'New here? Create an account'}</button>`);
  document.querySelector('#auth-form').onsubmit=event=>{
    event.preventDefault();const form=event.currentTarget;const values=Object.fromEntries(new FormData(form));
    perform(form.querySelector('button'),async()=>{
      const options=signup?{email:values.email,password:values.password,options:{emailRedirectTo:location.origin+'/#account'}}:values;
      const {data,error}=await (signup?db().auth.signUp(options):db().auth.signInWithPassword(options));
      if(error)throw error;
      if(signup&&!data.session){document.querySelector('#auth-message').textContent='Check your email to confirm your account, then return here to sign in.';form.reset();}
      else{modal.close();toast('Signed in.');}
    });
  };
}
async function signOut(){await perform(null,async()=>{await query(db().auth.signOut());toast('Signed out.');});}

requestService = function(service,propertyId=null){
  if(!requireAccount())return;
  if(propertyId&&homeById(propertyId)?.sample){toast('This is an illustrative home. Viewings open when real listings are published.');return;}
  showModal(`<div class="eyebrow">Organise your next step</div><h2>${escapeHtml(service)}</h2><p>${propertyId?'Your enquiry reaches the property owner. They can approve access to the address and contact details.':'Your request goes to the portal team for coordination. A provider and any charges must be agreed before a booking is confirmed.'}</p><form class="form" id="cloud-request"><label>Preferred date<input name="preferred_date" type="date" min="${today()}" required></label><label>How can we help?<textarea name="message" maxlength="2000" placeholder="Share your housing requirements. Keep service IDs, unit details and duty schedules private."></textarea></label><button class="button">Send request ↗</button></form>`);
  document.querySelector('#cloud-request').onsubmit=event=>{
    event.preventDefault();const form=event.currentTarget;const values=Object.fromEntries(new FormData(form));
    perform(form.querySelector('button'),async()=>{
      if(propertyId)await query(db().from('enquiries').insert({property_id:propertyId,...values}));
      else await query(db().from('service_requests').insert({service,preferred_date:values.preferred_date,notes:values.message}));
      modal.close();await loadHomes();toast('Request sent. Track it in My account.');
    });
  };
};

propertyPage = function(id){
  const h=homeById(id);
  if(!h)return `${header()}<section class="section"><h2>${loading?'Loading your home…':'This home is unavailable.'}</h2><p>Sign in to browse published properties.</p><a class="button" href="#account">My account ↗</a></section>${footer()}`;
  const own=currentUser()?.id===h.owner_id;
  const enquiry=viewingRequests.find(row=>row.property_id===id&&row.requester_id===currentUser()?.id);
  return `${header()}<section class="section"><div class="eyebrow">${h.sample?'Illustrative home':escapeHtml(h.status)} · ${escapeHtml(h.area)}, Pune</div><div class="section-head"><h2>${escapeHtml(h.title)}</h2><strong>${money(h.rent)} / month</strong></div>${h.sample||h.imageUrl?`<img class="modal-photo" style="max-height:600px" src="${escapeHtml(h.sample?photo(h.image,2000):h.imageUrl)}" alt="Property interior">`:''}<div id="additional-photos" class="photo-grid"></div><div class="dashboard"><div><h3>${h.beds} bedrooms${h.size?' · '+h.size+' sq ft':''}</h3><p>${escapeHtml(h.furnish)}</p><p class="muted">${h.sample?'Illustrative photography. This home is a design example.':'Listing reviewed '+new Date(h.reviewed_at||h.updated_at).toLocaleDateString('en-IN')}</p></div><div><h2>Space for your next chapter.</h2><p>${escapeHtml(h.description||'A calmer start for you and your family, close to the community you know.')}</p>${h.sample?'<div class="notice">Sample home. Real listings appear after owner submission and review.</div>':`<div class="costs"><div>Monthly rent<strong>${money(h.rent)}</strong></div><div>Monthly maintenance<strong>${money(h.maintenance)}</strong></div><div>Refundable deposit<strong>${money(h.deposit)}</strong></div><div>Brokerage, if any<strong>${money(h.brokerage)}</strong></div><div>Platform fee at launch<strong>₹0</strong></div></div>`}<div class="actions"><button class="button" onclick="requestService('Home viewing','${h.id}')">${enquiry?'View another time in My account':'Request a viewing ↗'}</button>${own?`<button class="button outline" onclick="shareHome('${h.id}')">Share photos</button>`:''}<button class="button outline" onclick="toggleSave('${h.id}',this)">${saved.includes(h.id)?'Saved ♥':'Save home ♡'}</button></div><div id="private-details"></div><p class="muted">Address and owner contact are available after your enquiry is approved. Your profession and identity documents stay outside the listing.</p></div></div></section>${footer()}`;
};
async function loadPrivateDetails(id){
  if(!currentUser()||homeById(id)?.sample)return;
  try{
    const details=await query(db().from('property_private').select('exact_address,contact_phone').eq('property_id',id).maybeSingle());
    const el=document.querySelector('#private-details');
    if(el&&details)el.innerHTML=`<div class="notice"><strong>Private viewing details</strong><p>${escapeHtml(details.exact_address)}<br>${escapeHtml(details.contact_phone)}</p></div>`;
    const h=homeById(id);
    const urls=await Promise.all((h?.photos||[]).slice(1).map(row=>window.seva.photoUrl(row.storage_path)));
    if(location.hash!=='#property/'+id)return;
    const gallery=document.querySelector('#additional-photos');
    if(gallery)gallery.innerHTML=urls.map(url=>`<img src="${escapeHtml(url)}" alt="Additional property photograph">`).join('');
  }catch(error){toast(error.message);}
}

shareHome = async function(id){
  if(!requireAccount())return;
  await perform(null,async()=>{
    const h=homeById(id);
    if(h?.status!=='published')throw new Error('Photo sharing opens after the listing is published.');
    const share=await query(db().from('property_shares').insert({property_id:id}).select().single());
    const url=new URL(location.origin+location.pathname);url.hash='share/'+share.token;
    showModal(`<div class="eyebrow">An invitation to look around</div><h2>Only the photographs.</h2><p>Expires in 7 days. The link reveals photos only. You can revoke it from your listing dashboard.</p><label>Photo preview link<input class="share-input" readonly value="${escapeHtml(url.href)}"></label><div class="actions"><button class="button" id="copy-live">Copy link ↗</button><a class="button outline" href="${escapeHtml(url.href)}" target="_blank" rel="noopener">Open preview</a></div><p class="muted">The site's current private audience also applies to this link. A downloaded photograph can be retained by its recipient.</p>`);
    document.querySelector('#copy-live').onclick=async()=>{try{await navigator.clipboard.writeText(url.href);toast('Photo link copied.');}catch{toast('Select and copy the link above.');}};
  });
};
async function sharedGallery(token){
  app.innerHTML='<div class="empty">Opening photo preview…</div>';
  try{
    const rows=await query(db().rpc('shared_photos',{share_token:token}));
    if(!rows.length)throw new Error('This photo link has expired or is unavailable.');
    const urls=await Promise.all(rows.map(row=>window.seva.photoUrl(row.storage_path)));
    if(location.hash!=='#share/'+token)return;
    app.innerHTML=`<div class="share-gallery">${urls.map(url=>`<img src="${escapeHtml(url)}" alt="Shared property photograph">`).join('')}<div class="share-back">SevaDera · Private photo preview</div></div>`;
  }catch(error){app.innerHTML=`<div class="empty">${escapeHtml(error.message)}</div>`;}
}

ownerPage = function(){
  if(!currentUser())return `${header()}<section class="section"><h2>A home to offer.<br>A new beginning to share.</h2><p>Sign in to create a listing and keep control of your contact details.</p><button class="button" onclick="signInForm()">Sign in to list your home ↗</button></section>${footer()}`;
  return `${header()}<section class="section"><div class="eyebrow">Your homes, your control</div><h2>Welcome someone's next chapter.</h2><div class="dashboard"><div><p>Create a draft, add photographs, then submit it for review. Exact addresses and contact numbers are shared with approved enquiries.</p><div class="notice">₹0 platform fee during launch. State rent, deposit, maintenance and brokerage upfront.</div>${ownerProperties.map(h=>`<div class="listing-row"><div><a href="#property/${h.id}"><strong>${escapeHtml(h.title)}</strong></a><p>${escapeHtml(h.area)} · ${money(h.rent)}<br>${escapeHtml(h.status)} · ${h.photos.length} photos</p><div class="actions"><button class="text-button" onclick="editListing('${h.id}')">Edit details</button><button class="text-button" onclick="uploadPhotos('${h.id}')">Add photos</button>${h.status==='published'?`<button class="text-button" onclick="shareHome('${h.id}')">Share photos</button><button class="text-button" onclick="archiveListing('${h.id}')">Archive</button>`:`<button class="text-button" onclick="submitReview('${h.id}')">Submit for review</button>`}<button class="text-button" onclick="revokeShares('${h.id}')">Revoke photo links</button></div></div></div>`).join('')||'<p class="muted">Your first listing starts here.</p>'}</div><form class="form panel" id="live-listing">${listingFields()}<button class="button">Create private draft ↗</button><p class="muted">Add photos after saving. Keep names, service details and precise locations out of the title and description.</p></form></div></section>${footer()}`;
};
function listingFields(h={},details={}){return `<label>Property title<input name="title" required minlength="3" maxlength="100" value="${escapeHtml(h.title||'')}" placeholder="A bright family home in Wanwadi"></label><label>Neighbourhood<select name="area">${['Wanwadi','Wanowrie','Fatima Nagar','Salunke Vihar'].map(x=>`<option ${h.area===x?'selected':''}>${x}</option>`).join('')}</select></label><div class="form-grid">${[['rent','Monthly rent',1],['deposit','Deposit',0],['maintenance','Monthly maintenance',0],['brokerage','Brokerage',0]].map(([key,label,min])=>`<label>${label} (₹)<input name="${key}" type="number" min="${min}" max="1000000" required value="${h[key]??(key==='rent'?'':0)}"></label>`).join('')}</div><label>Bedrooms<select name="bedrooms">${[1,2,3,4].map(x=>`<option ${h.bedrooms===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Furnishing<select name="furnishing">${['Unfurnished','Semi-furnished','Furnished'].map(x=>`<option ${h.furnishing===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Description<textarea name="description" maxlength="3000">${escapeHtml(h.description||'')}</textarea></label><label>Exact address · private<input name="exact_address" required minlength="5" maxlength="500" value="${escapeHtml(details.exact_address||'')}"></label><label>Contact number · private<input name="contact_phone" type="tel" required minlength="7" maxlength="25" value="${escapeHtml(details.contact_phone||'')}"></label>`;}
async function saveListing(form,id=null){
  const values=Object.fromEntries(new FormData(form));
  const details={exact_address:values.exact_address,contact_phone:values.contact_phone};
  delete values.exact_address;delete values.contact_phone;
  for(const key of ['rent','deposit','maintenance','brokerage','bedrooms'])values[key]=Number(values[key]);
  const propertyId=id||crypto.randomUUID();
  // Both records are committed atomically by the database function.
  await query(db().rpc('save_listing',{listing_id:propertyId,listing_data:values,private_data:details}));
  if(modal.open)modal.close();await loadHomes();toast('Draft saved. Add photos and submit for review.');
}
async function editListing(id){await perform(null,async()=>{
  const details=await query(db().from('property_private').select('*').eq('property_id',id).single());
  showModal(`<h2>Edit your home.</h2><p>Changes return the listing to draft for review.</p><form class="form" id="edit-listing">${listingFields(homeById(id),details)}<button class="button">Save draft</button></form>`);
  document.querySelector('#edit-listing').onsubmit=e=>{e.preventDefault();perform(e.currentTarget.querySelector('button'),()=>saveListing(e.currentTarget,id));};
});}
function uploadPhotos(id){
  showModal(`<h2>Let the space speak.</h2><p>Choose up to 8 property photos, each under 8 MB. Avoid faces, identity documents, number plates and address boards. Location metadata is removed during upload.</p><form class="form" id="photo-form"><input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple required><button class="button">Upload photos</button><p id="upload-status" role="status"></p></form>`);
  document.querySelector('#photo-form').onsubmit=event=>{
    event.preventDefault();const form=event.currentTarget;const files=[...form.elements.photos.files];
    perform(form.querySelector('button'),async()=>{
      if(files.length>8)throw new Error('Choose at most 8 photographs per upload.');
      const start=homeById(id).photos.length;
      if(start+files.length>16)throw new Error('A listing can have up to 16 photographs.');
      let completed=0;
      try{for(const file of files){await window.seva.photoUpload(id,file,start+completed);completed++;document.querySelector('#upload-status').textContent=`${completed} of ${files.length} photos uploaded`;}}
      catch(error){await loadHomes();throw new Error(`${completed} photos saved. ${error.message}`);}
      modal.close();await loadHomes();toast('Photos uploaded. Submit your listing for review.');
    });
  };
}
async function submitReview(id){await perform(null,async()=>{if(!homeById(id)?.photos.length)throw new Error('Add at least one photo first.');await query(db().from('properties').update({status:'pending'}).eq('id',id));await loadHomes();toast('Submitted for review.');});}
async function archiveListing(id){await perform(null,async()=>{await query(db().from('properties').update({status:'archived'}).eq('id',id));await loadHomes();toast('Listing archived. Photo links are now inactive.');});}
async function revokeShares(id){await perform(null,async()=>{await query(db().from('property_shares').update({revoked_at:new Date().toISOString()}).eq('property_id',id));toast('Photo links revoked. Existing signed images expire within 60 seconds.');});}

account = function(){
  if(!currentUser())return `${header()}<section class="section journey"><div><div class="eyebrow">A community with discretion</div><h2>Your next home.<br>Your private space.</h2><p>For Army personnel, military doctors, CRPF families, government employees, CBI officials and veterans.</p><div class="actions"><button class="button" onclick="signInForm()">Sign in ↗</button><button class="button outline" onclick="signInForm('signup')">Create account</button></div></div><div class="panel"><h3>Share what your move needs.</h3><p>Your housing preferences help you find a home. Service IDs, ranks, unit names and posting orders are outside the registration form.</p><p>Your saved homes and move progress belong to your signed-in account.</p><a href="#privacy">How privacy works ↗</a></div></section>${footer()}`;
  return `${header()}<section class="section"><div class="eyebrow">Your private space</div><div class="section-head"><h2>Welcome home.</h2><button class="button outline" onclick="signOut()">Sign out</button></div><p class="muted">Signed in as ${escapeHtml(currentUser().email)}</p><div class="actions"><a class="button" href="#saved">${saved.length} saved homes ↗</a><a class="button outline" href="#move">My move ↗</a><a class="button outline" href="#owner">My listings ↗</a>${window.seva.staff?'<a class="button outline" href="#admin">Manage portal ↗</a>':''}</div><h3 style="margin-top:40px">Viewing enquiries</h3>${viewingRequests.map(r=>`<div class="listing-row"><div><strong>${escapeHtml(homeById(r.property_id)?.title||'Property enquiry')}</strong><p>${escapeHtml(r.preferred_date)} · ${escapeHtml(r.status)}<br>${escapeHtml(r.message)}</p>${r.requester_id===currentUser().id?'<small>Your enquiry</small>':'<small>Member enquiry · contact identity remains private</small>'}</div><div class="actions">${r.requester_id!==currentUser().id&&ownerProperties.some(p=>p.id===r.property_id)?`<button class="button" onclick="respondEnquiry('${r.id}','approved')">Approve details access</button><button class="button outline" onclick="respondEnquiry('${r.id}','declined')">Decline</button>`:`<a href="#property/${r.property_id}">View home ↗</a>${r.status!=='cancelled'?`<button class="text-button" onclick="respondEnquiry('${r.id}','cancelled')">Cancel</button>`:''}`}</div></div>`).join('')||'<p>No viewing enquiries yet.</p>'}<h3 style="margin-top:40px">Move-in service requests</h3>${requests.filter(r=>r.user_id===currentUser().id).map(r=>`<div class="listing-row"><strong>${escapeHtml(r.service)}</strong><span>${escapeHtml(r.preferred_date)} · ${escapeHtml(r.status)}</span></div>`).join('')||'<p>Your service requests will appear here.</p>'}</section>${footer()}`;
};
async function respondEnquiry(id,status){await perform(null,async()=>{await query(db().from('enquiries').update({status}).eq('id',id));await loadHomes();toast('Enquiry updated.');});}
function adminPage(){
 if(!window.seva?.staff)return `${header()}<section class="section"><h2>Team access required.</h2><p>Sign in with an authorised portal administrator account.</p></section>${footer()}`;
 return `${header()}<section class="section"><div class="eyebrow">Portal management</div><h2>Review before welcoming.</h2><p>Check ownership, pricing, photographs and private contact details before publishing. Approval records a listing review.</p>${(window.seva.reviewProperties||[]).filter(p=>p.status==='pending').map(p=>`<div class="listing-row"><div><strong>${escapeHtml(p.title)}</strong><p>${escapeHtml(p.area)} · ${money(p.rent)} · ${p.photos.length} photos</p><button class="text-button" onclick="reviewDetails('${p.id}')">Inspect listing and private details ↗</button></div><div class="actions"><button class="button" onclick="moderate('${p.id}','published')">Publish listing</button><button class="button outline" onclick="moderate('${p.id}','declined')">Decline</button></div></div>`).join('')||'<p>No listings awaiting review.</p>'}<h3>Service coordination</h3>${requests.map(r=>`<div class="listing-row"><div><strong>${escapeHtml(r.service)}</strong><p>${escapeHtml(r.preferred_date)} · ${escapeHtml(r.status)}<br>${escapeHtml(r.notes)}</p></div><select aria-label="Service status" onchange="updateService('${r.id}',this.value)">${['requested','contacted','completed','cancelled'].map(s=>`<option ${r.status===s?'selected':''}>${s}</option>`).join('')}</select></div>`).join('')||'<p>No service requests yet.</p>'}</section>${footer()}`;
}
async function reviewDetails(id){const p=window.seva.reviewProperties.find(p=>p.id===id);if(!p)return;await perform(null,async()=>{const d=await query(db().from('property_private').select('*').eq('property_id',id).single());showModal(`<h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.description)}</p><div class="notice">${escapeHtml(d.exact_address)}<br>${escapeHtml(d.contact_phone)}</div><p>Rent ${money(p.rent)} · Deposit ${money(p.deposit)}<br>Maintenance ${money(p.maintenance)} · Brokerage ${money(p.brokerage)}</p><div class="photo-grid">${(await Promise.all(p.photos.map(ph=>window.seva.photoUrl(ph.storage_path)))).map(url=>`<img src="${escapeHtml(url)}" alt="Property submitted for review">`).join('')}</div>`);});}
async function moderate(id,status){await perform(null,async()=>{await query(db().from('properties').update({status}).eq('id',id));await loadHomes();toast('Review saved.');});}
async function updateService(id,status){await perform(null,async()=>{await query(db().from('service_requests').update({status}).eq('id',id));await loadHomes();toast('Service request updated.');});}
function privacyPage(){return `${header()}<section class="section"><div class="eyebrow">Discretion, by design</div><h2>A home search that respects<br>your private life.</h2><div class="services"><article><h3>Your identity stays yours.</h3><p>Account emails stay private. Registration asks for a personal email and password. Share housing needs without service IDs, unit names, ranks or posting orders.</p></article><article><h3>Control the introduction.</h3><p>Exact addresses and owner phone numbers become available to an enquirer after the owner approves their request. Authorised portal staff can review them.</p></article><article><h3>Share a glimpse.</h3><p>Owners can create photo-only links for published homes. Links expire in 7 days and can be revoked. Images already downloaded can be retained by recipients.</p></article><article><h3>Know the full cost.</h3><p>Rent, deposit, maintenance and brokerage each have their own field. The platform fee is ₹0 during launch. Service bookings require a separately agreed quote.</p></article></div><div class="notice">Independent private housing platform. Listing review covers the submitted property information. Photographs are checked by the portal team, and upload processing removes location metadata.</div></section>${footer()}`;}

render = function(){
  const route=location.hash.slice(1).split('?')[0]||'home';
  if(route.startsWith('share/')){sharedGallery(route.split('/')[1]);return;}
  if(route.startsWith('photos/')){app.innerHTML='<div class="empty">This sample photo link is no longer active.</div>';return;}
  if(route==='privacy')app.innerHTML=privacyPage();
  else if(route==='admin')app.innerHTML=adminPage();
  else{baseRender();}
  if(dataError){const notice=document.createElement('div');notice.className='notice';notice.textContent='Unable to sync your account. '+dataError;app.prepend(notice);}
  const form=document.querySelector('#live-listing');
  if(form)form.onsubmit=event=>{event.preventDefault();perform(form.querySelector('button'),()=>saveListing(form));};
  if(route.startsWith('property/'))loadPrivateDetails(route.split('/')[1]);
};
// Clear obsolete local request drafts from the preview on this device.
for(const key of ['as-requests','as-drafts']){try{localStorage.removeItem(key);}catch{}}
window.addEventListener('seva-session',loadHomes);
if(window.seva?.ready)loadHomes();else render();
