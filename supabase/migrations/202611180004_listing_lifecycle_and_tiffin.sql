begin;

alter table public.properties drop constraint properties_status_check;
alter table public.properties add constraint properties_status_check
  check (status in ('draft','pending','published','declined','archived','rented','sold','deleted'));

create table public.tiffin_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 100),
  menu text not null check (char_length(menu) between 3 and 1500),
  delivery_areas text not null check (char_length(delivery_areas) between 3 and 250),
  price_rupees integer not null check (price_rupees between 1 and 100000),
  billing_period text not null check (billing_period in ('meal','week','month')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.tiffin_plans enable row level security;
revoke all on public.tiffin_plans from public,anon,authenticated;
grant select on public.tiffin_plans to anon,authenticated;
grant insert,update on public.tiffin_plans to authenticated;
create policy tiffin_public_read on public.tiffin_plans for select to anon,authenticated using(published);
create policy tiffin_staff_read on public.tiffin_plans for select to authenticated using(public.is_staff());
create policy tiffin_staff_insert on public.tiffin_plans for insert to authenticated with check(public.is_staff());
create policy tiffin_staff_update on public.tiffin_plans for update to authenticated using(public.is_staff()) with check(public.is_staff());

alter table public.early_access_leads drop constraint early_access_leads_kind_check;
alter table public.early_access_leads add constraint early_access_leads_kind_check
  check (kind in ('relocation','owner','partner','listing','tiffin'));

create or replace function public.record_early_access_lead(
  lead_kind text, lead_details jsonb, wants_updates boolean, rate_key text
) returns boolean language plpgsql security definer set search_path='' as $$
begin
  if $1 = 'listing' and not exists (select 1 from public.properties
    where id::text = $2->>'listingId' and status = 'published') then
    raise exception 'Listing unavailable' using errcode='P0002';
  end if;
  if $1 = 'tiffin' and $2 ? 'planId' and not exists (select 1 from public.tiffin_plans
    where id::text = $2->>'planId' and published) then
    raise exception 'Tiffin plan unavailable' using errcode='P0002';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended($4, 0));
  if (select count(*) from public.early_access_leads l
      where l.rate_key=$4 and l.contact_consented_at > now() - interval '15 minutes') >= 5 then
    return false;
  end if;
  insert into public.early_access_leads(kind,details,wants_updates,rate_key) values ($1,$2,$3,$4);
  return true;
end; $$;

create or replace function public.staff_support_inbox()
returns table(id text,kind text,details jsonb,received_at timestamptz,handled_at timestamptz,listing_title text)
language sql stable security definer set search_path='' as $$
  select l.id::text,l.kind,l.details,l.contact_consented_at,l.handled_at,coalesce(p.title,t.title)
  from public.early_access_leads l
  left join public.properties p on p.id::text=l.details->>'listingId'
  left join public.tiffin_plans t on t.id::text=l.details->>'planId'
  where public.is_staff()
  order by l.handled_at nulls first,l.contact_consented_at desc
  limit 100;
$$;
notify pgrst,'reload schema';
commit;
