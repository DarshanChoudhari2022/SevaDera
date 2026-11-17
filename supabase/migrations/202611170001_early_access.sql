create table public.early_access_leads (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('relocation', 'owner', 'partner')),
  details jsonb not null,
  contact_consented_at timestamptz not null default now(),
  wants_updates boolean not null default false,
  rate_key text not null
);

alter table public.early_access_leads enable row level security;
revoke all on public.early_access_leads from public, anon, authenticated;
grant select, delete on public.early_access_leads to service_role;
create index early_access_rate_idx on public.early_access_leads (rate_key, contact_consented_at);

create function public.record_early_access_lead(
  lead_kind text, lead_details jsonb, wants_updates boolean, rate_key text
) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended($4, 0));
  if (select count(*) from public.early_access_leads l
      where l.rate_key = $4 and l.contact_consented_at > now() - interval '15 minutes') >= 5
  then
    return false;
  end if;
  insert into public.early_access_leads(kind, details, wants_updates, rate_key)
    values ($1, $2, $3, $4);
  return true;
end;
$$;

revoke all on function public.record_early_access_lead(text, jsonb, boolean, text) from public, anon, authenticated;
grant execute on function public.record_early_access_lead(text, jsonb, boolean, text) to service_role;
