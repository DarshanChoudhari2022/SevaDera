-- Synthetic fixtures are rolled back. No real account or listing is changed.
begin;
insert into auth.users(id,email,email_confirmed_at) values
 ('10000000-0000-4000-8000-000000000001','owner@sevad-test.invalid',now()),
 ('10000000-0000-4000-8000-000000000002','tenant@sevad-test.invalid',now()),
 ('10000000-0000-4000-8000-000000000003','other@sevad-test.invalid',now());
create function pg_temp.assert_true(ok boolean, label text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception 'FAILED: %',label; end if; end; $$;

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select public.save_listing('20000000-0000-4000-8000-000000000001',
 '{"title":"Test home","area":"Wanwadi","bedrooms":2,"rent":22000,"deposit":44000,"maintenance":1000,"brokerage":0,"furnishing":"Unfurnished","description":"Test"}',
 '{"exact_address":"Private test address","contact_phone":"0000000000"}');
select pg_temp.assert_true((select count(*)=1 from public.property_private),'owner reads private details');
do $$begin
 begin
  update public.properties set status='published' where id='20000000-0000-4000-8000-000000000001';
  raise exception 'FAILED: owner self-published';
 exception when raise_exception then
  if sqlerrm not like '%Review required%' then raise; end if;
 end;
end $$;
insert into public.property_photos(property_id,storage_path) values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001/20000000-0000-4000-8000-000000000001/test.jpg');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select pg_temp.assert_true((select count(*)=0 from public.properties),'tenant cannot read drafts');
select pg_temp.assert_true((select count(*)=0 from public.property_private),'tenant cannot read private address');
do $$begin
 begin
  insert into public.profiles(id,display_name) values('10000000-0000-4000-8000-000000000001','Attacker');
  raise exception 'FAILED: cross-user profile write';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
update public.properties set status='published' where id='20000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select pg_temp.assert_true((select count(*)=1 from public.properties),'signed-in tenant sees published home');
insert into public.enquiries(id,property_id,preferred_date) values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',current_date+1);
insert into public.saved_properties(property_id) values('20000000-0000-4000-8000-000000000001');
insert into public.move_tasks(task_key,completed) values(0,true);
insert into public.service_requests(service,preferred_date) values('Home viewings',current_date+1);
do $$begin
 begin
  update public.enquiries set status='approved' where id='30000000-0000-4000-8000-000000000001';
  raise exception 'FAILED: tenant self-approved';
 exception when raise_exception then
  if sqlerrm not like '%Owner approval required%' then raise; end if;
 end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select pg_temp.assert_true((select count(*)=0 from public.saved_properties),'saved homes isolated');
select pg_temp.assert_true((select count(*)=0 from public.move_tasks),'move progress isolated');
select pg_temp.assert_true((select count(*)=0 from public.service_requests),'service requests isolated');
select pg_temp.assert_true((select count(*)=0 from public.enquiries),'enquiries isolated');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
update public.enquiries set status='approved' where id='30000000-0000-4000-8000-000000000001';
insert into public.property_shares(property_id,token) values('20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select pg_temp.assert_true((select count(*)=1 from public.property_private),'approved tenant sees address');
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$begin
 begin
  perform * from public.properties;
  raise exception 'FAILED: anonymous listing metadata exposed';
 exception when insufficient_privilege then null;
 end;
 begin
  perform * from public.property_private;
  raise exception 'FAILED: anonymous private data exposed';
 exception when insufficient_privilege then null;
 end;
end $$;
select pg_temp.assert_true((select count(*)=1 from public.shared_photos('40000000-0000-4000-8000-000000000001')),'photo-only link works');
select pg_temp.assert_true((select count(*)=0 from public.shared_photos('40000000-0000-4000-8000-000000000002')),'unknown share returns no data');
reset role;
update public.property_shares set revoked_at=now() where token='40000000-0000-4000-8000-000000000001';
set local role anon;
select pg_temp.assert_true((select count(*)=0 from public.shared_photos('40000000-0000-4000-8000-000000000001')),'revoked share unavailable');
reset role;
select 'PASS: owner permissions, cross-account isolation, private addresses, review gates, enquiries and photo-only shares';
rollback;
