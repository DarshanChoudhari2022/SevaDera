begin;

alter table public.profiles
  add column if not exists seller_category text check (seller_category in ('Army personnel','Army doctor','CRPF / CAPF','Government / CBI','Veteran / Army brat','Other')),
  add column if not exists role text not null default 'member' check (role in ('member','admin'));

alter table public.properties
  add column if not exists public_slug text;

update public.properties
set public_slug = lower(regexp_replace(coalesce(title,'home') || '-' || left(id::text,8), '[^a-zA-Z0-9]+', '-', 'g'))
where public_slug is null;

alter table public.properties alter column public_slug set default lower(regexp_replace('home-' || left(gen_random_uuid()::text,8), '[^a-zA-Z0-9]+', '-', 'g'));
alter table public.properties alter column public_slug set not null;
create unique index if not exists properties_public_slug on public.properties(public_slug);

create or replace function public.public_property_by_slug(slug text)
returns table(
  id uuid,
  public_slug text,
  title text,
  area text,
  bedrooms integer,
  rent integer,
  furnishing text,
  size_sqft integer,
  description text,
  available_from date,
  photos jsonb
)
language sql stable security definer set search_path='' as $$
  select p.id,p.public_slug,p.title,p.area,p.bedrooms,p.rent,p.furnishing,p.size_sqft,p.description,p.available_from,
    coalesce(jsonb_agg(jsonb_build_object('path',ph.storage_path,'position',ph.position) order by ph.position) filter (where ph.id is not null),'[]'::jsonb)
  from public.properties p
  left join public.property_photos ph on ph.property_id=p.id
  where p.public_slug=slug and p.status='published'
  group by p.id;
$$;
revoke all on function public.public_property_by_slug(text) from public;
grant execute on function public.public_property_by_slug(text) to anon, authenticated;

create or replace function public.profile_role()
returns text language sql stable security definer set search_path='' as $$
  select coalesce((select role from public.profiles where id=auth.uid()),'member');
$$;
revoke all on function public.profile_role() from public;
grant execute on function public.profile_role() to authenticated;

create or replace function public.ensure_profile(display_name text, seller_category text)
returns public.profiles language plpgsql security invoker set search_path='' as $$
declare result public.profiles;
begin
  insert into public.profiles(id,display_name,seller_category)
  values(auth.uid(),coalesce(nullif(display_name,''),'Member'),seller_category)
  on conflict(id) do update set display_name=excluded.display_name,seller_category=excluded.seller_category
  returning * into result;
  return result;
end; $$;
revoke all on function public.ensure_profile(text,text) from public;
grant execute on function public.ensure_profile(text,text) to authenticated;

-- Approved photo URLs are intentionally shareable; random owner/property UUID paths
-- prevent indexing while the public share RPC controls which photos are disclosed.
update storage.buckets set public=true where id='property-photos';

notify pgrst,'reload schema';
commit;
