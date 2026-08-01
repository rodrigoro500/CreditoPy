create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and approval_status = 'approved'
  );
$$;

drop policy if exists "Admins can manage profiles" on public.profiles;
drop policy if exists "Admins can manage subscriptions" on public.subscriptions;
drop policy if exists "Platform admins can manage internal users" on public.internal_users;

create policy "Admins can manage profiles"
on public.profiles
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "Admins can manage subscriptions"
on public.subscriptions
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "Platform admins can manage internal users"
on public.internal_users
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());
