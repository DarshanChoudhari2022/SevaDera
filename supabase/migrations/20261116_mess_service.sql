begin;
alter table public.service_requests drop constraint if exists service_requests_service_check;
alter table public.service_requests add constraint service_requests_service_check check (service in ('Home viewings','Packers & movers','A fresh start','Everyday essentials','Mess & tiffin'));
notify pgrst,'reload schema';
commit;
