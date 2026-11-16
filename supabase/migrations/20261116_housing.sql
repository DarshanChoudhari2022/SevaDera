begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Member' check (char_length(display_name) between 1 and 80),
 created_at timestamptz not null default now()
);
create table private.staff_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create function public.is_staff() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.staff_members where user_id = (select auth.uid()));
$$;
revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

create table public.properties (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 title text not null check (char_length(title) between 3 and 100),
 area text not null check (area in ('Wanwadi','Wanowrie','Fatima Nagar','Salunke Vihar')),
 bedrooms integer not null check (bedrooms between 1 and 10),
 rent integer not null check (rent between 1 and 1000000),
 deposit integer not null default 0 check (deposit >= 0),
 maintenance integer not null default 0 check (maintenance >= 0),
 brokerage integer not null default 0 check (brokerage >= 0),
 furnishing text not null check (furnishing in ('Unfurnished','Semi-furnished','Furnished')),
 size_sqft integer check (size_sqft between 1 and 100000),
 description text not null default '' check (char_length(description) <= 3000),
 status text not null default 'draft' check (status in ('draft','pending','published','declined','archived')),
 available_from date,
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index properties_owner on public.properties(owner_id);
create index properties_search on public.properties(status,area,rent);
create table public.property_private (
 property_id uuid primary key references public.properties(id) on delete cascade,
 exact_address text not null check (char_length(exact_address) between 5 and 500),
 contact_phone text not null check (char_length(contact_phone) between 7 and 25)
);
create table public.property_photos (
 id uuid primary key default gen_random_uuid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 storage_path text not null unique,
 position integer not null default 0 check(position >= 0),
 created_at timestamptz not null default now()
);
create index property_photos_property on public.property_photos(property_id);
create table public.property_shares (
 id uuid primary key default gen_random_uuid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 token uuid not null unique default gen_random_uuid(),
 expires_at timestamptz not null default now() + interval '7 days',
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
create index shares_property on public.property_shares(property_id);
create table public.saved_properties (
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,property_id)
);
create table public.enquiries (
 id uuid primary key default gen_random_uuid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 requester_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 preferred_date date not null,
 message text not null default '' check (char_length(message) <= 2000),
 status text not null default 'pending' check (status in ('pending','approved','declined','cancelled')),
 created_at timestamptz not null default now(),
 unique(property_id,requester_id)
);
create index enquiries_requester on public.enquiries(requester_id);
create table public.service_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 service text not null check (service in ('Home viewings','Packers & movers','A fresh start','Everyday essentials')),
 preferred_date date not null,
 notes text not null default '' check (char_length(notes) <= 2000),
 status text not null default 'requested' check (status in ('requested','contacted','completed','cancelled')),
 created_at timestamptz not null default now()
);
create index service_requests_user on public.service_requests(user_id);
create table public.move_tasks (
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 task_key integer not null check (task_key between 0 and 3),
 completed boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key(user_id,task_key)
);
create table private.moderation_events (
 id bigint generated always as identity primary key,
 property_id uuid not null,
 actor_id uuid,
 previous_status text,
 next_status text not null,
 created_at timestamptz not null default now()
);

create function private.guard_property() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if current_user is null then raise exception 'Invalid caller'; end if;
 if auth.uid() is not null and not public.is_staff() then
   if new.owner_id <> auth.uid() then raise exception 'Owner mismatch'; end if;
   if tg_op='INSERT' and (new.status not in ('draft','pending') or new.reviewed_at is not null) then raise exception 'Review required'; end if;
   if tg_op='UPDATE' then
     if new.id <> old.id or new.owner_id <> old.owner_id or new.created_at <> old.created_at then raise exception 'Immutable field'; end if;
     if new.reviewed_at is distinct from old.reviewed_at then raise exception 'Review is staff managed'; end if;
     if new.status in ('published','declined') and new.status is distinct from old.status then raise exception 'Review required'; end if;
     if old.status='published' and new.status='published' then new.status='pending'; new.reviewed_at=null; end if;
   end if;
 end if;
 if new.status='published' and (tg_op='INSERT' or old.status is distinct from new.status) then
   if not exists(select 1 from public.property_photos where property_id=new.id) then raise exception 'Add a photo before publication'; end if;
   if not exists(select 1 from public.property_private where property_id=new.id) then raise exception 'Complete private address and contact first'; end if;
   new.reviewed_at=now();
 end if;
 new.updated_at=now();
 return new;
end; $$;
create trigger guard_property before insert or update on public.properties for each row execute function private.guard_property();
create function private.audit_property() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status is distinct from old.status then
   insert into private.moderation_events(property_id,actor_id,previous_status,next_status) values(new.id,auth.uid(),old.status,new.status);
 end if;
 return new;
end; $$;
create trigger audit_property after update on public.properties for each row execute function private.audit_property();
create function private.guard_enquiry() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then return new; end if;
 if tg_op='INSERT' then
   if new.requester_id <> auth.uid() or new.status <> 'pending' then raise exception 'Invalid enquiry'; end if;
 elsif new.property_id <> old.property_id or new.requester_id <> old.requester_id or new.id <> old.id or new.created_at <> old.created_at then
   raise exception 'Immutable enquiry';
 elsif not public.is_staff() then
   if auth.uid()=old.requester_id then
     if new.status not in ('pending','cancelled') then raise exception 'Owner approval required'; end if;
   elsif exists(select 1 from public.properties where id=old.property_id and owner_id=auth.uid()) then
     if new.message <> old.message or new.preferred_date <> old.preferred_date or new.status not in ('approved','declined') then raise exception 'Owner can approve or decline'; end if;
   else raise exception 'Access denied'; end if;
 end if;
 return new;
end; $$;
create trigger guard_enquiry before insert or update on public.enquiries for each row execute function private.guard_enquiry();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_private enable row level security;
alter table public.property_photos enable row level security;
alter table public.property_shares enable row level security;
alter table public.saved_properties enable row level security;
alter table public.enquiries enable row level security;
alter table public.service_requests enable row level security;
alter table public.move_tasks enable row level security;
alter table private.staff_members enable row level security;
alter table private.moderation_events enable row level security;
revoke all on all tables in schema public from anon, authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select,insert,update,delete on public.properties,public.property_private,public.property_photos,public.property_shares,public.saved_properties,public.move_tasks to authenticated;
grant select,insert,update on public.enquiries,public.service_requests to authenticated;
create policy profiles_select on public.profiles for select to authenticated using(id=auth.uid());
create policy profiles_insert on public.profiles for insert to authenticated with check(id=auth.uid());
create policy profiles_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy properties_select on public.properties for select to authenticated using(status='published' or owner_id=auth.uid() or public.is_staff());
create policy properties_insert on public.properties for insert to authenticated with check(owner_id=auth.uid() and status in ('draft','pending'));
create policy properties_update on public.properties for update to authenticated using(owner_id=auth.uid() or public.is_staff()) with check(owner_id=auth.uid() or public.is_staff());
create policy properties_delete on public.properties for delete to authenticated using(owner_id=auth.uid() or public.is_staff());
create policy private_select on public.property_private for select to authenticated using(
 exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()) or public.is_staff()
 or exists(select 1 from public.enquiries e where e.property_id=property_private.property_id and e.requester_id=auth.uid() and e.status='approved'));
create policy private_insert on public.property_private for insert to authenticated with check(exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()));
create policy private_update on public.property_private for update to authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid())) with check(exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()));
create policy private_delete on public.property_private for delete to authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()));
create policy photos_select on public.property_photos for select to authenticated using(exists(select 1 from public.properties p where p.id=property_id));
create policy photos_insert on public.property_photos for insert to authenticated with check(exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()) and storage_path like auth.uid()::text || '/' || property_id::text || '/%');
create policy photos_delete on public.property_photos for delete to authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()));
create policy shares_select on public.property_shares for select to authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()));
create policy shares_insert on public.property_shares for insert to authenticated with check(expires_at>now() and expires_at<=now()+interval '30 days' and exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid() and p.status='published'));
create policy shares_update on public.property_shares for update to authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid())) with check(expires_at<=now()+interval '30 days' and exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()));
create policy shares_delete on public.property_shares for delete to authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()));
create policy saved_select on public.saved_properties for select to authenticated using(user_id=auth.uid());
create policy saved_insert on public.saved_properties for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.properties p where p.id=property_id and p.status='published'));
create policy saved_delete on public.saved_properties for delete to authenticated using(user_id=auth.uid());
create policy enquiries_select on public.enquiries for select to authenticated using(requester_id=auth.uid() or public.is_staff() or exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()));
create policy enquiries_insert on public.enquiries for insert to authenticated with check(requester_id=auth.uid() and status='pending' and exists(select 1 from public.properties p where p.id=property_id and p.status='published' and p.owner_id<>auth.uid()));
create policy enquiries_update on public.enquiries for update to authenticated using(requester_id=auth.uid() or public.is_staff() or exists(select 1 from public.properties p where p.id=property_id and p.owner_id=auth.uid()));
create policy service_select on public.service_requests for select to authenticated using(user_id=auth.uid() or public.is_staff());
create policy service_insert on public.service_requests for insert to authenticated with check(user_id=auth.uid() and status='requested');
create policy service_update on public.service_requests for update to authenticated using(public.is_staff()) with check(public.is_staff());
create policy tasks_select on public.move_tasks for select to authenticated using(user_id=auth.uid());
create policy tasks_insert on public.move_tasks for insert to authenticated with check(user_id=auth.uid());
create policy tasks_update on public.move_tasks for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy tasks_delete on public.move_tasks for delete to authenticated using(user_id=auth.uid());

-- Anonymous visitors can retrieve only photograph paths through an unexpired owner link.
create function public.shared_photos(share_token uuid) returns table(storage_path text,sort_order integer)
language sql stable security definer set search_path='' as $$
 select ph.storage_path,ph.position from public.property_photos ph
 join public.properties p on p.id=ph.property_id
 join public.property_shares s on s.property_id=p.id
 where s.token=share_token and s.revoked_at is null and s.expires_at>now() and p.status='published'
 order by ph.position;
$$;
revoke all on function public.shared_photos(uuid) from public;
grant execute on function public.shared_photos(uuid) to anon,authenticated;
create function public.can_read_photo(object_path text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.property_photos ph join public.properties p on p.id=ph.property_id
 where ph.storage_path=object_path and (
 p.owner_id=auth.uid() or (auth.uid() is not null and (p.status='published' or public.is_staff()))
 or (p.status='published' and exists(select 1 from public.property_shares s where s.property_id=p.id and s.revoked_at is null and s.expires_at>now()))));
$$;
revoke all on function public.can_read_photo(text) from public;
grant execute on function public.can_read_photo(text) to anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('property-photos','property-photos',false,8388608,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy sevad_upload on storage.objects for insert to authenticated with check(bucket_id='property-photos' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.properties p where p.id::text=(storage.foldername(name))[2] and p.owner_id=auth.uid()));
create policy sevad_read on storage.objects for select to anon,authenticated using(bucket_id='property-photos' and (public.can_read_photo(name) or (auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text)));
create policy sevad_delete on storage.objects for delete to authenticated using(bucket_id='property-photos' and (storage.foldername(name))[1]=auth.uid()::text);
revoke all on all functions in schema private from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
