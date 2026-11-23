-- Web Push subscriptions, so a user can get a real OS-level notification
-- when they haven't opened the app recently — not just the existing
-- foreground-only reminder, which only fires while a tab is open.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_all_own" on public.push_subscriptions;
create policy "push_subscriptions_all_own" on public.push_subscriptions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- Daily cron: call the send-inactivity-pushes edge function, which checks
-- who's actually gone quiet and sends at most one push each. The function
-- is deployed with --no-verify-jwt (no user session exists for a cron job)
-- and instead checks a shared secret header — keeps this call sites-only,
-- not a public endpoint.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'send-inactivity-pushes-daily',
    '30 14 * * *', -- 14:30 UTC = 20:00 IST
    $$
    select net.http_post(
      url := 'https://yvuwqdgqvnukgaooqujy.supabase.co/functions/v1/send-inactivity-pushes',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'fbf74f0c6a6f0cfec7ebb2282a69500b9da65b1194965a49'),
      body := '{}'::jsonb
    );
    $$
  )
where not exists (select 1 from cron.job where jobname = 'send-inactivity-pushes-daily');
