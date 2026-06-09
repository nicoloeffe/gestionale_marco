-- Security baseline for R1:
-- - tenant column (`ente`) on company data tables;
-- - profile tenant and cross-company read flag;
-- - non-permissive RLS policies for INV-1 / INV-2 / INV-3.

alter table public.profiles add column if not exists ente text;
alter table public.profiles add column if not exists sees_all boolean not null default false;

alter table public.clients add column if not exists ente text;
alter table public.auditors add column if not exists ente text;
alter table public.audits add column if not exists ente text;
alter table public.calendar_events add column if not exists ente text;

update public.profiles set ente = 'ENTE_DEFAULT' where ente is null;
update public.clients set ente = 'ENTE_DEFAULT' where ente is null;
update public.auditors set ente = 'ENTE_DEFAULT' where ente is null;
update public.audits set ente = 'ENTE_DEFAULT' where ente is null;
update public.calendar_events set ente = 'ENTE_DEFAULT' where ente is null;

alter table public.profiles alter column ente set not null;
alter table public.clients alter column ente set not null;
alter table public.auditors alter column ente set not null;
alter table public.audits alter column ente set not null;
alter table public.calendar_events alter column ente set not null;

alter table public.profiles alter column ente set default 'ENTE_DEFAULT';
alter table public.clients alter column ente set default 'ENTE_DEFAULT';
alter table public.auditors alter column ente set default 'ENTE_DEFAULT';
alter table public.audits alter column ente set default 'ENTE_DEFAULT';
alter table public.calendar_events alter column ente set default 'ENTE_DEFAULT';

update public.profiles set role = 'operator' where role = 'operatore';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'operator', 'viewer'));

update public.calendar_events
set performed_status = case performed_status
  when 'si' then 'yes'
  when 'sì' then 'yes'
  when 'no' then 'no'
  when 'sconosciuto' then 'unknown'
  else performed_status
end;
alter table public.calendar_events drop constraint if exists calendar_events_performed_status_check;
alter table public.calendar_events
  add constraint calendar_events_performed_status_check check (performed_status in ('yes', 'no', 'unknown'));

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_ente_idx on public.profiles(ente);
create index if not exists clients_ente_idx on public.clients(ente);
create index if not exists auditors_ente_idx on public.auditors(ente);
create index if not exists audits_ente_idx on public.audits(ente);
create index if not exists calendar_events_ente_idx on public.calendar_events(ente);

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_profile_ente()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.ente
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_profile_sees_all()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(p.sees_all, false)
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'admin', false)
$$;

create or replace function public.can_mutate_data()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() in ('admin', 'operator'), false)
$$;

create or replace function public.can_read_ente(row_ente text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (
      coalesce(public.current_profile_sees_all(), false)
      or public.current_profile_ente() = row_ente
    )
$$;

create or replace function public.can_write_ente(row_ente text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and public.can_mutate_data()
    and public.current_profile_ente() = row_ente
$$;

revoke all on function public.current_profile_role() from public;
revoke all on function public.current_profile_ente() from public;
revoke all on function public.current_profile_sees_all() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.can_mutate_data() from public;
revoke all on function public.can_read_ente(text) from public;
revoke all on function public.can_write_ente(text) from public;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_ente() to authenticated;
grant execute on function public.current_profile_sees_all() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_mutate_data() to authenticated;
grant execute on function public.can_read_ente(text) to authenticated;
grant execute on function public.can_write_ente(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.auditors enable row level security;
alter table public.standards enable row level security;
alter table public.audits enable row level security;
alter table public.audit_standards enable row level security;
alter table public.import_batches enable row level security;
alter table public.imported_rows enable row level security;
alter table public.calendar_events enable row level security;

drop policy if exists "authenticated read profiles" on public.profiles;
drop policy if exists "authenticated write profiles" on public.profiles;
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
drop policy if exists "profiles_delete_admin" on public.profiles;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "profiles_insert_admin"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_delete_admin"
on public.profiles
for delete
to authenticated
using (public.is_admin());

drop policy if exists "authenticated read clients" on public.clients;
drop policy if exists "authenticated write clients" on public.clients;
drop policy if exists "clients_select_by_ente" on public.clients;
drop policy if exists "clients_insert_by_role_and_ente" on public.clients;
drop policy if exists "clients_update_by_role_and_ente" on public.clients;
drop policy if exists "clients_delete_by_role_and_ente" on public.clients;

create policy "clients_select_by_ente"
on public.clients
for select
to authenticated
using (public.can_read_ente(ente));

create policy "clients_insert_by_role_and_ente"
on public.clients
for insert
to authenticated
with check (public.can_write_ente(ente));

create policy "clients_update_by_role_and_ente"
on public.clients
for update
to authenticated
using (public.can_write_ente(ente))
with check (public.can_write_ente(ente));

create policy "clients_delete_by_role_and_ente"
on public.clients
for delete
to authenticated
using (public.can_write_ente(ente));

drop policy if exists "authenticated read auditors" on public.auditors;
drop policy if exists "authenticated write auditors" on public.auditors;
drop policy if exists "auditors_select_by_ente" on public.auditors;
drop policy if exists "auditors_insert_by_role_and_ente" on public.auditors;
drop policy if exists "auditors_update_by_role_and_ente" on public.auditors;
drop policy if exists "auditors_delete_by_role_and_ente" on public.auditors;

create policy "auditors_select_by_ente"
on public.auditors
for select
to authenticated
using (public.can_read_ente(ente));

create policy "auditors_insert_by_role_and_ente"
on public.auditors
for insert
to authenticated
with check (public.can_write_ente(ente));

create policy "auditors_update_by_role_and_ente"
on public.auditors
for update
to authenticated
using (public.can_write_ente(ente))
with check (public.can_write_ente(ente));

create policy "auditors_delete_by_role_and_ente"
on public.auditors
for delete
to authenticated
using (public.can_write_ente(ente));

drop policy if exists "authenticated read audits" on public.audits;
drop policy if exists "authenticated write audits" on public.audits;
drop policy if exists "audits_select_by_ente" on public.audits;
drop policy if exists "audits_insert_by_role_and_ente" on public.audits;
drop policy if exists "audits_update_by_role_and_ente" on public.audits;
drop policy if exists "audits_delete_by_role_and_ente" on public.audits;

create policy "audits_select_by_ente"
on public.audits
for select
to authenticated
using (public.can_read_ente(ente));

create policy "audits_insert_by_role_and_ente"
on public.audits
for insert
to authenticated
with check (public.can_write_ente(ente));

create policy "audits_update_by_role_and_ente"
on public.audits
for update
to authenticated
using (public.can_write_ente(ente))
with check (public.can_write_ente(ente));

create policy "audits_delete_by_role_and_ente"
on public.audits
for delete
to authenticated
using (public.can_write_ente(ente));

drop policy if exists "authenticated read calendar_events" on public.calendar_events;
drop policy if exists "authenticated write calendar_events" on public.calendar_events;
drop policy if exists "calendar_events_select_by_ente" on public.calendar_events;
drop policy if exists "calendar_events_insert_by_role_and_ente" on public.calendar_events;
drop policy if exists "calendar_events_update_by_role_and_ente" on public.calendar_events;
drop policy if exists "calendar_events_delete_by_role_and_ente" on public.calendar_events;

create policy "calendar_events_select_by_ente"
on public.calendar_events
for select
to authenticated
using (public.can_read_ente(ente));

create policy "calendar_events_insert_by_role_and_ente"
on public.calendar_events
for insert
to authenticated
with check (public.can_write_ente(ente));

create policy "calendar_events_update_by_role_and_ente"
on public.calendar_events
for update
to authenticated
using (public.can_write_ente(ente))
with check (public.can_write_ente(ente));

create policy "calendar_events_delete_by_role_and_ente"
on public.calendar_events
for delete
to authenticated
using (public.can_write_ente(ente));

drop policy if exists "authenticated read audit_standards" on public.audit_standards;
drop policy if exists "authenticated write audit_standards" on public.audit_standards;
drop policy if exists "audit_standards_select_by_audit_ente" on public.audit_standards;
drop policy if exists "audit_standards_insert_by_audit_ente" on public.audit_standards;
drop policy if exists "audit_standards_delete_by_audit_ente" on public.audit_standards;

create policy "audit_standards_select_by_audit_ente"
on public.audit_standards
for select
to authenticated
using (
  exists (
    select 1 from public.audits a
    where a.id = audit_id and public.can_read_ente(a.ente)
  )
);

create policy "audit_standards_insert_by_audit_ente"
on public.audit_standards
for insert
to authenticated
with check (
  exists (
    select 1 from public.audits a
    where a.id = audit_id and public.can_write_ente(a.ente)
  )
);

create policy "audit_standards_delete_by_audit_ente"
on public.audit_standards
for delete
to authenticated
using (
  exists (
    select 1 from public.audits a
    where a.id = audit_id and public.can_write_ente(a.ente)
  )
);

drop policy if exists "authenticated read standards" on public.standards;
drop policy if exists "authenticated write standards" on public.standards;
drop policy if exists "standards_select_authenticated" on public.standards;
drop policy if exists "standards_insert_admin" on public.standards;
drop policy if exists "standards_update_admin" on public.standards;
drop policy if exists "standards_delete_admin" on public.standards;

create policy "standards_select_authenticated"
on public.standards
for select
to authenticated
using (true);

create policy "standards_insert_admin"
on public.standards
for insert
to authenticated
with check (public.is_admin());

create policy "standards_update_admin"
on public.standards
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "standards_delete_admin"
on public.standards
for delete
to authenticated
using (public.is_admin());

drop policy if exists "authenticated read import_batches" on public.import_batches;
drop policy if exists "authenticated write import_batches" on public.import_batches;
drop policy if exists "import_batches_select_operator_or_admin" on public.import_batches;
drop policy if exists "import_batches_insert_operator_or_admin" on public.import_batches;
drop policy if exists "import_batches_update_operator_or_admin" on public.import_batches;

create policy "import_batches_select_operator_or_admin"
on public.import_batches
for select
to authenticated
using (public.can_mutate_data());

create policy "import_batches_insert_operator_or_admin"
on public.import_batches
for insert
to authenticated
with check (public.can_mutate_data());

create policy "import_batches_update_operator_or_admin"
on public.import_batches
for update
to authenticated
using (public.can_mutate_data())
with check (public.can_mutate_data());

drop policy if exists "authenticated read imported_rows" on public.imported_rows;
drop policy if exists "authenticated write imported_rows" on public.imported_rows;
drop policy if exists "imported_rows_select_operator_or_admin" on public.imported_rows;
drop policy if exists "imported_rows_insert_operator_or_admin" on public.imported_rows;
drop policy if exists "imported_rows_update_operator_or_admin" on public.imported_rows;

create policy "imported_rows_select_operator_or_admin"
on public.imported_rows
for select
to authenticated
using (public.can_mutate_data());

create policy "imported_rows_insert_operator_or_admin"
on public.imported_rows
for insert
to authenticated
with check (public.can_mutate_data());

create policy "imported_rows_update_operator_or_admin"
on public.imported_rows
for update
to authenticated
using (public.can_mutate_data())
with check (public.can_mutate_data());

alter view public.events_full set (security_invoker = true);
alter view public.audits_full set (security_invoker = true);
