create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'lender' check (role in ('admin', 'lender')),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null default 'plus' check (plan_code in ('plus', 'premium', 'elite')),
  plan_name text not null default 'Plus',
  plan_price numeric(14, 0) not null default 50000,
  client_limit integer,
  included_collectors integer not null default 0,
  collector_count integer not null default 0,
  extra_collector_count integer not null default 0,
  extra_collector_price numeric(14, 0) not null default 0,
  monthly_total numeric(14, 0) not null default 50000,
  starts_at date not null default current_date,
  expires_at date not null default (current_date + 30),
  paid_at date,
  status text not null default 'active' check (status in ('active', 'due_soon', 'expired')),
  created_at timestamptz not null default now()
);

create table public.internal_users (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  role text not null default 'collector' check (role in ('admin', 'collector')),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  is_extra_collector boolean not null default false,
  extra_monthly_price numeric(14, 0) not null default 0,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  document_number text,
  phone text not null,
  address text,
  city text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  type text not null default 'loan_with_interest' check (type in ('loan_with_interest', 'fixed_price_sale')),
  product_name text,
  product_reference text,
  product_description text,
  amount numeric(14, 0) not null check (amount > 0),
  interest_percent numeric(5, 2) not null default 0,
  interest_amount numeric(14, 0) not null default 0,
  total_amount numeric(14, 0) not null check (total_amount > 0),
  installments integer not null check (installments > 0),
  installment_value numeric(14, 0) not null check (installment_value > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  collection_day text check (collection_day in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_date date not null,
  due_date date not null,
  status text not null default 'active' check (status in ('active', 'late', 'paid')),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credit_id uuid not null references public.credits(id) on delete cascade,
  installment_id uuid,
  amount numeric(14, 0) not null check (amount > 0),
  method text not null check (method in ('cash', 'transfer')),
  type text not null default 'installment' check (type in ('installment', 'extension_interest')),
  paid_at date not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credit_id uuid not null references public.credits(id) on delete cascade,
  number integer not null check (number > 0),
  amount numeric(14, 0) not null check (amount > 0),
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'late')),
  created_at timestamptz not null default now(),
  unique (credit_id, number)
);

alter table public.clients enable row level security;
alter table public.credits enable row level security;
alter table public.payments enable row level security;
alter table public.installments enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.internal_users enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Admins can manage profiles"
on public.profiles
for all
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.approval_status = 'approved'
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.approval_status = 'approved'
  )
);

create policy "Users can read their own subscription"
on public.subscriptions
for select
using (auth.uid() = user_id);

create policy "Admins can manage subscriptions"
on public.subscriptions
for all
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.approval_status = 'approved'
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.approval_status = 'approved'
  )
);

create policy "Owners can read their internal users"
on public.internal_users
for select
using (auth.uid() = owner_user_id);

create policy "Platform admins can manage internal users"
on public.internal_users
for all
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.approval_status = 'approved'
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.approval_status = 'approved'
  )
);

create policy "Users can manage their clients"
on public.clients
for all
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
);

create policy "Users can manage their credits"
on public.credits
for all
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
);

create policy "Users can manage their payments"
on public.payments
for all
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
);

create policy "Users can manage their installments"
on public.installments
for all
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
);

create index profiles_approval_status_idx on public.profiles(approval_status);
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_expires_at_idx on public.subscriptions(expires_at);
create index internal_users_owner_user_id_idx on public.internal_users(owner_user_id);
create index internal_users_approval_status_idx on public.internal_users(approval_status);
create index clients_user_id_idx on public.clients(user_id);
create index credits_user_id_idx on public.credits(user_id);
create index credits_client_id_idx on public.credits(client_id);
create index credits_type_idx on public.credits(type);
create index credits_collection_day_idx on public.credits(collection_day);
create index payments_user_id_idx on public.payments(user_id);
create index payments_credit_id_idx on public.payments(credit_id);
create index payments_installment_id_idx on public.payments(installment_id);
create index payments_paid_at_idx on public.payments(paid_at);
create index installments_user_id_idx on public.installments(user_id);
create index installments_credit_id_idx on public.installments(credit_id);
create index installments_due_date_idx on public.installments(due_date);
