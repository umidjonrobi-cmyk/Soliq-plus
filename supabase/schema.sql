-- ============================================================================
-- UZBalance — Supabase schema (run once in: Supabase → SQL Editor → New query)
-- Real per-user auth data with Row Level Security.
-- ============================================================================

-- ── profiles ────────────────────────────────────────────────────────────────
-- One row per authenticated user. `seeded` tracks whether demo data was inserted.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  company_name text,
  phone       text,
  seeded      boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are self-readable" on public.profiles;
create policy "profiles are self-readable"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles are self-insertable" on public.profiles;
create policy "profiles are self-insertable"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles are self-updatable" on public.profiles;
create policy "profiles are self-updatable"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'company_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── companies ────────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  inn          text default '',
  oked         text default '',
  director     text default '',
  accountant   text default '',
  address      text default '',
  tax_mode     text not null default 'general',
  bank_account text default '',
  bank_name    text default '',
  mfo          text default '',
  created_at   timestamptz not null default now()
);

alter table public.companies enable row level security;

drop policy if exists "companies are owner-scoped" on public.companies;
create policy "companies are owner-scoped"
  on public.companies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists companies_user_idx on public.companies (user_id);

-- ── entries (journal / double-entry) ─────────────────────────────────────────
create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company_id  uuid references public.companies (id) on delete set null,
  no          text default '',
  date        date not null default current_date,
  debit       text not null,
  credit      text not null,
  amount      numeric(18, 2) not null check (amount >= 0),
  memo        text default '',
  status      text not null default 'posted',
  doc         text default '',
  created_at  timestamptz not null default now()
);

alter table public.entries enable row level security;

drop policy if exists "entries are owner-scoped" on public.entries;
create policy "entries are owner-scoped"
  on public.entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists entries_user_idx on public.entries (user_id);
create index if not exists entries_date_idx on public.entries (user_id, date desc);
