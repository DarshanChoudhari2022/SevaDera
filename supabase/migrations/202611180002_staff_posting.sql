begin;

-- Preserve existing listings and authenticated reads. Only staff may create,
-- edit, or remove listings and their private details or photos.
create policy staff_property_insert on public.properties as restrictive for insert to authenticated with check(public.is_staff());
create policy staff_property_update on public.properties as restrictive for update to authenticated using(public.is_staff()) with check(public.is_staff());
create policy staff_property_delete on public.properties as restrictive for delete to authenticated using(public.is_staff());
create policy staff_private_insert on public.property_private as restrictive for insert to authenticated with check(public.is_staff());
create policy staff_private_update on public.property_private as restrictive for update to authenticated using(public.is_staff()) with check(public.is_staff());
create policy staff_private_delete on public.property_private as restrictive for delete to authenticated using(public.is_staff());
create policy staff_photo_insert on public.property_photos as restrictive for insert to authenticated with check(public.is_staff());
create policy staff_photo_delete on public.property_photos as restrictive for delete to authenticated using(public.is_staff());
create policy staff_listing_upload on storage.objects as restrictive for insert to authenticated
  with check(bucket_id <> 'property-photos' or public.is_staff());
create policy staff_listing_storage_delete on storage.objects as restrictive for delete to authenticated
  using(bucket_id <> 'property-photos' or public.is_staff());

revoke execute on function public.ensure_profile(text,text) from authenticated;
revoke execute on function public.request_marketplace_contact(uuid) from authenticated;

create or replace function public.marketplace_contact_allowed(listing uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select public.is_staff();
$$;

alter table public.early_access_leads drop constraint early_access_leads_kind_check;
alter table public.early_access_leads add constraint early_access_leads_kind_check
  check (kind in ('relocation','owner','partner','listing'));
alter table public.early_access_leads add column handled_at timestamptz;
create index early_access_listing_idx on public.early_access_leads ((details->>'listingId')) where kind='listing';

create or replace function public.marketplace_stats()
returns table(id uuid, public_slug text, title text, listing_kind text, status text,
  visits_today bigint, visits_30d bigint, contact_requests bigint)
language sql stable security definer set search_path='' as $$
  select p.id,p.id::text,p.title,p.listing_kind,p.status,
    (select count(*) from private.marketplace_visits v where v.property_id=p.id and v.visit_day=current_date),
    (select count(*) from private.marketplace_visits v where v.property_id=p.id and v.visit_day>=current_date-29),
    (select count(*) from public.early_access_leads l where l.kind='listing' and l.details->>'listingId'=p.id::text)
  from public.properties p
  where public.is_staff()
  order by p.created_at desc;
$$;

create or replace function public.record_early_access_lead(
  lead_kind text, lead_details jsonb, wants_updates boolean, rate_key text
) returns boolean language plpgsql security definer set search_path='' as $$
begin
  if $1 = 'listing' and not exists (select 1 from public.properties
    where id::text = $2->>'listingId' and status = 'published') then
    raise exception 'Listing unavailable' using errcode='P0002';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended($4, 0));
  if (select count(*) from public.early_access_leads l
      where l.rate_key=$4 and l.contact_consented_at > now() - interval '15 minutes') >= 5 then
    return false;
  end if;
  insert into public.early_access_leads(kind,details,wants_updates,rate_key) values ($1,$2,$3,$4);
  return true;
end; $$;

create function public.staff_support_inbox()
returns table(id text,kind text,details jsonb,received_at timestamptz,handled_at timestamptz,listing_title text)
language sql stable security definer set search_path='' as $$
  select l.id::text,l.kind,l.details,l.contact_consented_at,l.handled_at,p.title
  from public.early_access_leads l
  left join public.properties p on p.id::text=l.details->>'listingId'
  where public.is_staff()
  order by l.handled_at nulls first,l.contact_consented_at desc
  limit 100;
$$;

create function public.staff_close_support_request(request_id text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.is_staff() then raise exception 'Staff access required' using errcode='42501'; end if;
  update public.early_access_leads set handled_at=now()
  where id::text=$1 and handled_at is null;
end; $$;
revoke all on function public.staff_support_inbox(), public.staff_close_support_request(text)
  from public, anon, authenticated;
grant execute on function public.staff_support_inbox(), public.staff_close_support_request(text) to authenticated;
notify pgrst,'reload schema';
commit;
