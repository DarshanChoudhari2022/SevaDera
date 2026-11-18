begin;

alter table public.properties add column public_title text check (char_length(public_title) between 3 and 100);
alter table public.properties add column public_description text check (char_length(public_description) <= 1200);

create or replace function public.save_listing(listing_id uuid, listing_data jsonb, private_data jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare
  public_copy text := concat_ws(' ',listing_data->>'public_title',listing_data->>'public_description');
  private_address text := lower(trim(private_data->>'exact_address'));
  private_phone text := regexp_replace(private_data->>'contact_phone','[^0-9]','','g');
begin
  if not public.is_staff() then raise exception 'Staff access required'; end if;
  if (char_length(private_address) >= 5 and strpos(lower(public_copy),private_address)>0)
     or (char_length(private_phone) >= 7 and strpos(regexp_replace(public_copy,'[^0-9]','','g'),private_phone)>0) then
    raise exception 'Remove the private address or phone number from the public listing text';
  end if;
  insert into public.properties
    (id,owner_id,title,area,bedrooms,rent,deposit,maintenance,brokerage,furnishing,description,size_sqft,listing_kind,public_title,public_description,status)
  values (listing_id,auth.uid(),listing_data->>'title',listing_data->>'area',(listing_data->>'bedrooms')::int,
    (listing_data->>'rent')::int,coalesce((listing_data->>'deposit')::int,0),
    coalesce((listing_data->>'maintenance')::int,0),coalesce((listing_data->>'brokerage')::int,0),
    listing_data->>'furnishing',coalesce(listing_data->>'description',''),
    nullif((listing_data->>'size_sqft')::int,0),coalesce(listing_data->>'listing_kind','home'),
    nullif(trim(listing_data->>'public_title'),''),nullif(trim(listing_data->>'public_description'),''),'draft')
  on conflict(id) do update set title=excluded.title,area=excluded.area,bedrooms=excluded.bedrooms,
    rent=excluded.rent,deposit=excluded.deposit,maintenance=excluded.maintenance,
    brokerage=excluded.brokerage,furnishing=excluded.furnishing,description=excluded.description,
    size_sqft=excluded.size_sqft,listing_kind=excluded.listing_kind,public_title=excluded.public_title,
    public_description=excluded.public_description,status='draft';
  insert into public.property_private(property_id,exact_address,contact_phone)
  values(listing_id,private_data->>'exact_address',private_data->>'contact_phone')
  on conflict(property_id) do update set exact_address=excluded.exact_address,contact_phone=excluded.contact_phone;
  return listing_id;
end; $$;

-- Keep compatibility with clients that still use marketplace_listings.
-- Read only explicitly public copy and structured details.
create function public.marketplace_public_details(kind text, slug text default null)
returns table(id uuid, public_slug text, area text, listing_kind text, photos jsonb,
  public_title text, public_description text, rent integer, bedrooms integer, size_sqft integer, furnishing text)
language sql stable security definer set search_path='' as $$
  select x.id,x.public_slug,x.area,x.listing_kind,x.photos,p.public_title,p.public_description,
    p.rent,case when p.listing_kind='home' then p.bedrooms end,
    case when p.listing_kind='home' then p.size_sqft end,
    case when p.listing_kind='home' then p.furnishing end
  from public.marketplace_listings($1,$2) x
  join public.properties p on p.id=x.id and p.status='published'
  order by p.reviewed_at desc nulls last,p.id;
$$;
revoke all on function public.marketplace_public_details(text,text) from public,anon,authenticated;
grant execute on function public.marketplace_public_details(text,text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
