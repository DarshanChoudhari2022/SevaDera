begin;

alter table public.properties
  add column if not exists listing_kind text not null default 'home' check (listing_kind in ('home','item'));

create or replace function public.save_listing(listing_id uuid, listing_data jsonb, private_data jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Sign in to create a listing'; end if;
  insert into public.properties
    (id,owner_id,title,area,bedrooms,rent,deposit,maintenance,brokerage,furnishing,description,size_sqft,listing_kind,status)
  values (listing_id,auth.uid(),listing_data->>'title',listing_data->>'area',(listing_data->>'bedrooms')::int,
    (listing_data->>'rent')::int,coalesce((listing_data->>'deposit')::int,0),
    coalesce((listing_data->>'maintenance')::int,0),coalesce((listing_data->>'brokerage')::int,0),
    listing_data->>'furnishing',coalesce(listing_data->>'description',''),
    nullif((listing_data->>'size_sqft')::int,0),coalesce(listing_data->>'listing_kind','home'),'draft')
  on conflict(id) do update set title=excluded.title,area=excluded.area,bedrooms=excluded.bedrooms,
  rent=excluded.rent,deposit=excluded.deposit,maintenance=excluded.maintenance,
  brokerage=excluded.brokerage,furnishing=excluded.furnishing,description=excluded.description,
    size_sqft=excluded.size_sqft,listing_kind=excluded.listing_kind,status='draft';
  insert into public.property_private(property_id,exact_address,contact_phone)
  values(listing_id,private_data->>'exact_address',private_data->>'contact_phone')
  on conflict(property_id) do update set exact_address=excluded.exact_address,contact_phone=excluded.contact_phone;
  return listing_id;
end; $$;

-- Public results intentionally omit seller-written text, exact location and contact information.
revoke execute on function public.public_property_by_slug(text) from public, anon, authenticated;
drop policy properties_select on public.properties;
create policy properties_select on public.properties for select to authenticated
  using(owner_id=auth.uid() or public.is_staff());

create function public.marketplace_listings(kind text, slug text default null)
returns table(id uuid, public_slug text, area text, listing_kind text, photos jsonb)
language sql stable security definer set search_path='' as $$
  select p.id,p.id::text,p.area,p.listing_kind,
    coalesce((select jsonb_agg(ph.storage_path order by ph.position,ph.id)
      from public.property_photos ph where ph.property_id=p.id),'[]'::jsonb)
  from public.properties p
  where p.status='published' and ($1 is null or p.listing_kind=$1)
    and ($2 is null or p.id::text=$2 or (p.public_slug=$2 and p.public_slug ~ '^home-[0-9a-f]{8}$'))
  order by p.reviewed_at desc nulls last,p.id
  limit 60;
$$;

update storage.buckets set public=false where id='property-photos';
create or replace function public.can_read_photo(object_path text)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.property_photos ph join public.properties p on p.id=ph.property_id
  where ph.storage_path=$1 and (p.status='published' or p.owner_id=auth.uid()
    or (auth.uid() is not null and public.is_staff())));
$$;

drop policy enquiries_insert on public.enquiries;
revoke insert on public.enquiries from authenticated;
create function public.request_marketplace_contact(listing uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.properties p
    where p.id=$1 and p.status='published' and p.owner_id<>auth.uid()) then
    raise exception 'Sign in as a buyer to request this listing';
  end if;
  insert into public.enquiries(property_id,requester_id,preferred_date)
  values($1,auth.uid(),current_date)
  on conflict(property_id,requester_id) do nothing;
end;
$$;

-- Protect approved contact details if the listing is withdrawn.
drop policy private_select on public.property_private;
create function public.marketplace_contact_allowed(listing uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(select 1 from public.properties p
  where p.id=$1 and (p.owner_id=auth.uid() or public.is_staff() or
    (p.status='published' and exists(select 1 from public.enquiries e
      where e.property_id=p.id and e.requester_id=auth.uid() and e.status='approved'))));
$$;
create policy private_select on public.property_private for select to authenticated
  using(public.marketplace_contact_allowed(property_id));

create table private.marketplace_visits (
  property_id uuid not null references public.properties(id) on delete cascade,
  browser_id uuid not null,
  visit_day date not null default current_date,
  primary key(property_id,visit_day,browser_id)
);
alter table private.marketplace_visits enable row level security;

create function public.record_marketplace_visit(slug text, visitor uuid)
returns void language sql security definer set search_path='' as $$
  insert into private.marketplace_visits(property_id,browser_id)
  select p.id,$2 from public.properties p
  where p.id::text=$1 and p.status='published' and $2 is not null
    and p.owner_id is distinct from auth.uid() and not public.is_staff()
  on conflict do nothing;
$$;

create function public.marketplace_stats()
returns table(id uuid, public_slug text, title text, listing_kind text, status text,
  visits_today bigint, visits_30d bigint, contact_requests bigint)
language sql stable security definer set search_path='' as $$
  select p.id,p.id::text,p.title,p.listing_kind,p.status,
    (select count(*) from private.marketplace_visits v where v.property_id=p.id and v.visit_day=current_date),
    (select count(*) from private.marketplace_visits v where v.property_id=p.id and v.visit_day>=current_date-29),
    (select count(*) from public.enquiries e where e.property_id=p.id)
  from public.properties p
  where auth.uid() is not null and (p.owner_id=auth.uid() or public.is_staff())
  order by p.created_at desc;
$$;

revoke all on function public.marketplace_listings(text,text),public.record_marketplace_visit(text,uuid),
  public.request_marketplace_contact(uuid),public.marketplace_contact_allowed(uuid),public.marketplace_stats()
  from public, anon, authenticated;
grant execute on function public.marketplace_listings(text,text),public.record_marketplace_visit(text,uuid) to anon,authenticated;
grant execute on function public.request_marketplace_contact(uuid),public.marketplace_contact_allowed(uuid),public.marketplace_stats() to authenticated;
notify pgrst,'reload schema';
commit;
