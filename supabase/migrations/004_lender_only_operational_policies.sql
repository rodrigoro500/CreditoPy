drop policy if exists "Users can manage their clients" on public.clients;
drop policy if exists "Users can manage their credits" on public.credits;
drop policy if exists "Users can manage their payments" on public.payments;
drop policy if exists "Users can manage their installments" on public.installments;

create or replace function public.is_approved_lender()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'lender'
      and approval_status = 'approved'
  );
$$;

create policy "Approved lenders can manage their clients"
on public.clients
for all
using (auth.uid() = user_id and public.is_approved_lender())
with check (auth.uid() = user_id and public.is_approved_lender());

create policy "Approved lenders can manage their credits"
on public.credits
for all
using (auth.uid() = user_id and public.is_approved_lender())
with check (auth.uid() = user_id and public.is_approved_lender());

create policy "Approved lenders can manage their payments"
on public.payments
for all
using (auth.uid() = user_id and public.is_approved_lender())
with check (auth.uid() = user_id and public.is_approved_lender());

create policy "Approved lenders can manage their installments"
on public.installments
for all
using (auth.uid() = user_id and public.is_approved_lender())
with check (auth.uid() = user_id and public.is_approved_lender());
