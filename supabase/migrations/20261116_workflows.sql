begin;
create function public.save_listing(listing_id uuid, listing_data jsonb, private_data jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in to create a listing'; end if;
 insert into public.properties(id,owner_id,title,area,bedrooms,rent,deposit,maintenance,brokerage,furnishing,description,status)
 values(listing_id,auth.uid(),listing_data->>'title',listing_data->>'area',(listing_data->>'bedrooms')::int,
 (listing_data->>'rent')::int,(listing_data->>'deposit')::int,(listing_data->>'maintenance')::int,
 (listing_data->>'brokerage')::int,listing_data->>'furnishing',coalesce(listing_data->>'description',''),'draft')
 on conflict(id) do update set title=excluded.title,area=excluded.area,bedrooms=excluded.bedrooms,
 rent=excluded.rent,deposit=excluded.deposit,maintenance=excluded.maintenance,brokerage=excluded.brokerage,
 furnishing=excluded.furnishing,description=excluded.description,status='draft';
 insert into public.property_private(property_id,exact_address,contact_phone)
 values(listing_id,private_data->>'exact_address',private_data->>'contact_phone')
 on conflict(property_id) do update set exact_address=excluded.exact_address,contact_phone=excluded.contact_phone;
 return listing_id;
end; $$;
revoke all on function public.save_listing(uuid,jsonb,jsonb) from public;
grant execute on function public.save_listing(uuid,jsonb,jsonb) to authenticated;

create function private.photo_review() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.properties set status='draft' where id=coalesce(new.property_id,old.property_id) and status in ('published','pending');
 return coalesce(new,old);
end; $$;
create trigger photo_review after insert or delete on public.property_photos for each row execute function private.photo_review();

create table private.admin_invitations(email text primary key,created_at timestamptz not null default now());
alter table private.admin_invitations enable row level security;
create function private.activate_admin() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.email_confirmed_at is not null and exists(select 1 from private.admin_invitations where email=lower(new.email)) then
   insert into private.staff_members(user_id) values(new.id) on conflict do nothing;
 end if;
 return new;
end; $$;
create trigger sevad_admin_activation after insert or update of email_confirmed_at on auth.users for each row execute function private.activate_admin();
revoke all on all functions in schema private from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
