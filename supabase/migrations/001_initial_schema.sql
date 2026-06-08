create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'operator', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  region text,
  province text,
  ea_code text,
  address text,
  referent_name text,
  referent_email text,
  referent_phone text,
  pec text,
  vat_number text,
  active boolean not null default true,
  notes text,
  needs_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auditors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  color text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.standards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  audit_number text,
  client_id uuid references public.clients(id) on delete set null,
  consultant text,
  referrer text,
  region text,
  province text,
  ea_code text,
  cert_expiry date,
  audit_type text,
  planned_days numeric,
  planned_days_raw text,
  amount numeric,
  amount_raw text,
  already_invoiced boolean not null default false,
  status text not null default 'da_pianificare' check (
    status in (
      'da_pianificare',
      'pianificato',
      'confermato',
      'svolto',
      'da_chiudere',
      'chiuso',
      'annullato'
    )
  ),
  notes text,
  import_month text,
  import_row integer,
  needs_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_standards (
  audit_id uuid not null references public.audits(id) on delete cascade,
  standard_id uuid not null references public.standards(id) on delete cascade,
  primary key (audit_id, standard_id)
);

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  filename text,
  source_type text,
  status text not null default 'draft',
  rows_total integer not null default 0,
  rows_valid integer not null default 0,
  rows_error integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.imported_rows (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid references public.import_batches(id) on delete cascade,
  row_number integer,
  raw_data jsonb,
  normalized_data jsonb,
  status text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.audits(id) on delete set null,
  auditor_id uuid references public.auditors(id) on delete set null,
  start_datetime timestamptz not null,
  end_datetime timestamptz,
  all_day boolean not null default true,
  activity_type text,
  location_type text,
  title text not null,
  status text not null default 'pianificato' check (
    status in (
      'bozza',
      'pianificato',
      'confermato',
      'effettuato',
      'annullato',
      'da_riprogrammare'
    )
  ),
  performed_status text not null default 'unknown' check (performed_status in ('yes', 'no', 'unknown')),
  notes text,
  source text,
  external_reference text,
  raw_cell_value text,
  import_batch_id uuid references public.import_batches(id) on delete set null,
  needs_review boolean not null default false,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_auditors_updated_at on public.auditors;
create trigger set_auditors_updated_at
before update on public.auditors
for each row execute function public.set_updated_at();

drop trigger if exists set_standards_updated_at on public.standards;
create trigger set_standards_updated_at
before update on public.standards
for each row execute function public.set_updated_at();

drop trigger if exists set_audits_updated_at on public.audits;
create trigger set_audits_updated_at
before update on public.audits
for each row execute function public.set_updated_at();

drop trigger if exists set_import_batches_updated_at on public.import_batches;
create trigger set_import_batches_updated_at
before update on public.import_batches
for each row execute function public.set_updated_at();

drop trigger if exists set_calendar_events_updated_at on public.calendar_events;
create trigger set_calendar_events_updated_at
before update on public.calendar_events
for each row execute function public.set_updated_at();

create index if not exists clients_company_name_idx on public.clients(company_name);
create index if not exists clients_active_idx on public.clients(active);
create index if not exists clients_needs_review_idx on public.clients(needs_review);
create index if not exists auditors_active_name_idx on public.auditors(active, name);
create index if not exists standards_code_idx on public.standards(code);
create index if not exists audits_client_id_idx on public.audits(client_id);
create index if not exists audits_status_idx on public.audits(status);
create index if not exists audits_cert_expiry_idx on public.audits(cert_expiry);
create index if not exists audits_audit_number_idx on public.audits(audit_number);
create index if not exists audit_standards_audit_id_idx on public.audit_standards(audit_id);
create index if not exists audit_standards_standard_id_idx on public.audit_standards(standard_id);
create index if not exists calendar_events_start_datetime_idx on public.calendar_events(start_datetime);
create index if not exists calendar_events_auditor_start_idx on public.calendar_events(auditor_id, start_datetime);
create index if not exists calendar_events_audit_id_idx on public.calendar_events(audit_id);
create index if not exists calendar_events_status_idx on public.calendar_events(status);
create index if not exists calendar_events_performed_status_idx on public.calendar_events(performed_status);
create index if not exists calendar_events_import_batch_id_idx on public.calendar_events(import_batch_id);
create index if not exists imported_rows_batch_row_idx on public.imported_rows(import_batch_id, row_number);

create or replace view public.events_full as
select
  ce.*,
  au.name as auditor_name,
  au.color as auditor_color,
  a.audit_number,
  a.audit_type,
  a.status as audit_status,
  a.client_id,
  c.company_name as client_name,
  c.region as client_region,
  c.province as client_province,
  coalesce(std.standards, '[]'::jsonb) as standards,
  coalesce(std.standards_codes, array[]::text[]) as standards_codes
from public.calendar_events ce
left join public.auditors au on au.id = ce.auditor_id
left join public.audits a on a.id = ce.audit_id
left join public.clients c on c.id = a.client_id
left join lateral (
  select
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'code', s.code,
        'name', s.name
      )
      order by s.code
    ) as standards,
    array_agg(s.code order by s.code) as standards_codes
  from public.audit_standards ast
  join public.standards s on s.id = ast.standard_id
  where ast.audit_id = a.id
) std on true;

create or replace view public.audits_full as
select
  a.*,
  c.company_name as client_name,
  c.region as client_region,
  c.province as client_province,
  coalesce(std.standards, '[]'::jsonb) as standards,
  coalesce(std.standards_codes, array[]::text[]) as standards_codes,
  coalesce(ev.events_count, 0) as events_count,
  ev.next_event_datetime
from public.audits a
left join public.clients c on c.id = a.client_id
left join lateral (
  select
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'code', s.code,
        'name', s.name
      )
      order by s.code
    ) as standards,
    array_agg(s.code order by s.code) as standards_codes
  from public.audit_standards ast
  join public.standards s on s.id = ast.standard_id
  where ast.audit_id = a.id
) std on true
left join lateral (
  select
    count(*)::integer as events_count,
    min(ce.start_datetime) filter (where ce.start_datetime >= now()) as next_event_datetime
  from public.calendar_events ce
  where ce.audit_id = a.id
) ev on true;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.auditors enable row level security;
alter table public.standards enable row level security;
alter table public.audits enable row level security;
alter table public.audit_standards enable row level security;
alter table public.import_batches enable row level security;
alter table public.imported_rows enable row level security;
alter table public.calendar_events enable row level security;

-- MVP/dev policies: intentionally permissive for authenticated users.
-- Restrict these with public.profiles.role before production or real customer data.
drop policy if exists "authenticated read profiles" on public.profiles;
create policy "authenticated read profiles" on public.profiles
for select to authenticated using (true);

drop policy if exists "authenticated write profiles" on public.profiles;
create policy "authenticated write profiles" on public.profiles
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read clients" on public.clients;
create policy "authenticated read clients" on public.clients
for select to authenticated using (true);

drop policy if exists "authenticated write clients" on public.clients;
create policy "authenticated write clients" on public.clients
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read auditors" on public.auditors;
create policy "authenticated read auditors" on public.auditors
for select to authenticated using (true);

drop policy if exists "authenticated write auditors" on public.auditors;
create policy "authenticated write auditors" on public.auditors
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read standards" on public.standards;
create policy "authenticated read standards" on public.standards
for select to authenticated using (true);

drop policy if exists "authenticated write standards" on public.standards;
create policy "authenticated write standards" on public.standards
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read audits" on public.audits;
create policy "authenticated read audits" on public.audits
for select to authenticated using (true);

drop policy if exists "authenticated write audits" on public.audits;
create policy "authenticated write audits" on public.audits
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read audit_standards" on public.audit_standards;
create policy "authenticated read audit_standards" on public.audit_standards
for select to authenticated using (true);

drop policy if exists "authenticated write audit_standards" on public.audit_standards;
create policy "authenticated write audit_standards" on public.audit_standards
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read import_batches" on public.import_batches;
create policy "authenticated read import_batches" on public.import_batches
for select to authenticated using (true);

drop policy if exists "authenticated write import_batches" on public.import_batches;
create policy "authenticated write import_batches" on public.import_batches
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read imported_rows" on public.imported_rows;
create policy "authenticated read imported_rows" on public.imported_rows
for select to authenticated using (true);

drop policy if exists "authenticated write imported_rows" on public.imported_rows;
create policy "authenticated write imported_rows" on public.imported_rows
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read calendar_events" on public.calendar_events;
create policy "authenticated read calendar_events" on public.calendar_events
for select to authenticated using (true);

drop policy if exists "authenticated write calendar_events" on public.calendar_events;
create policy "authenticated write calendar_events" on public.calendar_events
for all to authenticated using (true) with check (true);
