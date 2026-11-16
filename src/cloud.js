import { createClient } from '@supabase/supabase-js';

// A publishable key identifies the project. Database policies authorize every operation.
const config = globalThis.__SEVADERA_CONFIG__ || {};
const client = createClient(config.supabaseUrl || 'https://xqturhxjnwjzakfkypxi.supabase.co', config.supabasePublishableKey || 'sb_publishable_MgT_dGTakqNODIhD30mvwA_AkHz3oti');
window.seva = { client, user: null, staff: false, ready: false };
const state = window.seva;

async function syncSession(session) {
  state.user = session?.user ?? null;
  state.staff = false;
  if (state.user) {
    const result = await client.rpc('is_staff');
    state.staff = result.data === true;
  }
  state.ready = true;
  window.dispatchEvent(new Event('seva-session'));
}
client.auth.getSession().then(({ data }) => syncSession(data.session));
client.auth.onAuthStateChange((event, session) => {
  if (event !== 'INITIAL_SESSION') setTimeout(() => syncSession(session), 0);
});

state.result = async function(promise) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data;
};
state.photoUrl = async function(path) {
  const data = await state.result(client.storage.from('property-photos').createSignedUrl(path, 60));
  return data.signedUrl;
};
state.photoUpload = async function(propertyId, file, position) {
  if (!state.user) throw new Error('Sign in to upload a photo.');
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP image.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Each photo must be smaller than 8 MB.');
  // Re-encode the photograph to remove EXIF location and device metadata.
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error('This photo could not be processed. Try another image.');
  const path = `${state.user.id}/${propertyId}/${crypto.randomUUID()}.jpg`;
  await state.result(client.storage.from('property-photos').upload(path, blob, {contentType:'image/jpeg',upsert:false}));
  try {
    return await state.result(client.from('property_photos').insert({property_id:propertyId,storage_path:path,position}).select().single());
  } catch (error) {
    await client.storage.from('property-photos').remove([path]);
    throw error;
  }
};
