"""Check real Supabase API operations with disposable accounts and cleanup."""
import base64
import getpass
import json
import secrets
import urllib.error
import urllib.request
import uuid

config = json.loads(getpass.getpass('API test configuration JSON (hidden): '))
base = 'https://xqturhxjnwjzakfkypxi.supabase.co'
public_key = 'sb_publishable_MgT_dGTakqNODIhD30mvwA_AkHz3oti'
users = []
photo_path = None
checks = []

def request(path, method='GET', body=None, token=None, admin=False, raw=False, expected=(200,201,204)):
    headers = {'apikey': config['secret'] if admin else public_key}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    if body is not None:
        headers['Content-Type'] = 'image/png' if raw else 'application/json'
    data = body if raw else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(base+path, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            status = response.status
            result = response.read()
    except urllib.error.HTTPError as error:
        status = error.code
        result = error.read()
    if status not in expected:
        parsed = json.loads(result or '{}')
        raise RuntimeError(f'{method} {path.split("?")[0]} returned {status}: {parsed.get("msg", parsed.get("message", parsed.get("error", "unexpected response")))}')
    return json.loads(result) if result else None

try:
    tokens = []
    for label in ('owner','tenant'):
        email = f'sevadera-test-{label}-{uuid.uuid4().hex}@example.com'
        password = secrets.token_urlsafe(24)
        user = request('/auth/v1/admin/users','POST',{'email':email,'password':password,'email_confirm':True},admin=True)
        users.append(user['id'])
        session = request('/auth/v1/token?grant_type=password','POST',{'email':email,'password':password})
        tokens.append(session['access_token'])
    checks.append('email/password authentication')
    owner, tenant = tokens
    property_id = str(uuid.uuid4())
    listing = {'title':'Integration test home','area':'Wanwadi','bedrooms':2,'rent':22000,'deposit':44000,'maintenance':1200,'brokerage':0,'furnishing':'Unfurnished','description':'Disposable test listing'}
    request('/rest/v1/rpc/save_listing','POST',{'listing_id':property_id,'listing_data':listing,'private_data':{'exact_address':'Synthetic private address','contact_phone':'0000000000'}},owner)
    assert request(f'/rest/v1/property_private?property_id=eq.{property_id}',token=tenant)==[]
    checks.append('atomic listing creation and private address isolation')
    photo_path=f'{users[0]}/{property_id}/{uuid.uuid4()}.png'
    image=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aG5kAAAAASUVORK5CYII=')
    request('/storage/v1/object/property-photos/'+photo_path,'POST',image,owner,raw=True)
    request('/rest/v1/property_photos','POST',{'property_id':property_id,'storage_path':photo_path},owner)
    request('/rest/v1/properties?id=eq.'+property_id,'PATCH',{'status':'pending'},owner)
    request('/rest/v1/properties?id=eq.'+property_id,'PATCH',{'status':'published'},admin=True)
    checks.append('private photo upload and listing publication')
    request('/rest/v1/saved_properties','POST',{'property_id':property_id},tenant)
    request('/rest/v1/move_tasks','POST',{'task_key':0,'completed':True},tenant)
    request('/rest/v1/service_requests','POST',{'service':'Home viewings','preferred_date':'2026-12-01','notes':'Synthetic test'},tenant)
    assert request('/rest/v1/saved_properties',token=owner)==[]
    checks.append('account-backed saved homes, tasks and service requests')
    request('/rest/v1/enquiries','POST',{'property_id':property_id,'preferred_date':'2026-12-01'},tenant)
    request('/rest/v1/enquiries?property_id=eq.'+property_id,'PATCH',{'status':'approved'},owner)
    assert len(request('/rest/v1/property_private?property_id=eq.'+property_id,token=tenant))==1
    checks.append('owner-approved address access')
    share_token=str(uuid.uuid4())
    request('/rest/v1/property_shares','POST',{'property_id':property_id,'token':share_token},owner)
    rows=request('/rest/v1/rpc/shared_photos','POST',{'share_token':share_token})
    assert len(rows)==1 and set(rows[0])=={'storage_path','sort_order'}
    signed=request('/storage/v1/object/sign/property-photos/'+photo_path,'POST',{'expiresIn':60})
    assert signed.get('signedURL')
    request('/rest/v1/property_shares?token=eq.'+share_token,'PATCH',{'revoked_at':'2026-01-01T00:00:00Z'},owner)
    assert request('/rest/v1/rpc/shared_photos','POST',{'share_token':share_token})==[]
    request('/rest/v1/properties',expected=(401,403))
    checks.append('anonymous photo-only sharing, revocation and metadata denial')
    print(json.dumps({'status':'PASS','checks':checks}))
finally:
    if photo_path:
        request('/storage/v1/object/property-photos','DELETE',{'prefixes':[photo_path]},admin=True)
    for user_id in users:
        request('/auth/v1/admin/users/'+user_id,'DELETE',admin=True)
    print(json.dumps({'cleanup':'Disposable accounts, listing and photograph removed'}))
