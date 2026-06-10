-- Base event attachments for R1.
-- Files live in a private Storage bucket; event_attachments stores only metadata.

insert into storage.buckets (id, name, public)
values ('event-attachments', 'event-attachments', false)
on conflict (id) do update set public = false;

create table if not exists public.event_attachments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  ente text not null,
  categoria text not null,
  nome_file text not null,
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  constraint event_attachments_categoria_check check (
    categoria in ('rapporto', 'fattura', 'fattura_auditor', 'lettera_audit')
  )
);

create index if not exists event_attachments_event_id_idx on public.event_attachments(event_id);
create index if not exists event_attachments_ente_idx on public.event_attachments(ente);

alter table public.event_attachments enable row level security;

drop policy if exists "event_attachments_select_by_ente" on public.event_attachments;
drop policy if exists "event_attachments_insert_by_event_ente" on public.event_attachments;
drop policy if exists "event_attachments_delete_by_event_ente" on public.event_attachments;

create policy "event_attachments_select_by_ente"
on public.event_attachments
for select
to authenticated
using (public.can_read_ente(ente));

create policy "event_attachments_insert_by_event_ente"
on public.event_attachments
for insert
to authenticated
with check (
  public.can_write_ente(ente)
  and exists (
    select 1
    from public.calendar_events ce
    where ce.id = event_id
      and ce.ente = event_attachments.ente
      and public.can_write_ente(ce.ente)
  )
);

create policy "event_attachments_delete_by_event_ente"
on public.event_attachments
for delete
to authenticated
using (
  public.can_write_ente(ente)
  and exists (
    select 1
    from public.calendar_events ce
    where ce.id = event_id
      and ce.ente = event_attachments.ente
      and public.can_write_ente(ce.ente)
  )
);

drop policy if exists "event_attachments_storage_select" on storage.objects;
drop policy if exists "event_attachments_storage_insert" on storage.objects;
drop policy if exists "event_attachments_storage_delete" on storage.objects;

create policy "event_attachments_storage_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'event-attachments'
  and exists (
    select 1
    from public.event_attachments ea
    where ea.storage_path = storage.objects.name
      and public.can_read_ente(ea.ente)
  )
);

create policy "event_attachments_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'event-attachments'
  and public.can_write_ente(split_part(name, '/', 1))
);

create policy "event_attachments_storage_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'event-attachments'
  and exists (
    select 1
    from public.event_attachments ea
    where ea.storage_path = storage.objects.name
      and public.can_write_ente(ea.ente)
  )
);

