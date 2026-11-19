-- Adds a premium flag to profiles, protected so a signed-in user cannot
-- grant it to themselves through the client (the same class of hole fixed
-- in 0009 for is_template) — only you, running SQL directly in the
-- dashboard, can flip it. Also adds a lightweight log of who has asked
-- to upgrade, so you know whose UPI payment to check for for.

alter table public.profiles add column if not exists is_premium boolean not null default false;

create or replace function public.protect_premium_flag()
returns trigger as $$
begin
  if new.is_premium is distinct from old.is_premium and current_user = 'authenticated' then
    new.is_premium := old.is_premium;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_protect_premium_flag on public.profiles;
create trigger trg_protect_premium_flag before update on public.profiles
  for each row execute function public.protect_premium_flag();

create table if not exists public.upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_upgrade_requests_user_id on public.upgrade_requests(user_id);

alter table public.upgrade_requests enable row level security;

drop policy if exists "upgrade_requests_insert_own" on public.upgrade_requests;
create policy "upgrade_requests_insert_own" on public.upgrade_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "upgrade_requests_select_own" on public.upgrade_requests;
create policy "upgrade_requests_select_own" on public.upgrade_requests for select
  using (auth.uid() = user_id);

-- Deliberately no update/delete policy for authenticated users — only you,
-- via the SQL editor (a different Postgres role), can approve a request.

grant select, insert on public.upgrade_requests to authenticated;
