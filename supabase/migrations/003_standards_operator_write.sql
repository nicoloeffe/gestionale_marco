drop policy if exists "standards_insert_admin" on public.standards;
drop policy if exists "standards_update_admin" on public.standards;
drop policy if exists "standards_delete_admin" on public.standards;
drop policy if exists "standards_insert_operator_or_admin" on public.standards;
drop policy if exists "standards_update_operator_or_admin" on public.standards;
drop policy if exists "standards_delete_operator_or_admin" on public.standards;

create policy "standards_insert_operator_or_admin"
on public.standards
for insert
to authenticated
with check (public.can_mutate_data());

create policy "standards_update_operator_or_admin"
on public.standards
for update
to authenticated
using (public.can_mutate_data())
with check (public.can_mutate_data());

create policy "standards_delete_operator_or_admin"
on public.standards
for delete
to authenticated
using (public.can_mutate_data());
