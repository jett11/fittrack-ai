-- FitTrack AI — lightweight per-day tracker for things that don't fit
-- elsewhere (water intake today, daily checklist). One row per user per day.

create table if not exists public.daily_metrics (
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null default current_date,
  water_glasses int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, metric_date)
);

create index if not exists idx_daily_metrics_user_date on public.daily_metrics(user_id, metric_date);

drop trigger if exists trg_daily_metrics_updated_at on public.daily_metrics;
create trigger trg_daily_metrics_updated_at before update on public.daily_metrics
  for each row execute function public.touch_updated_at();

alter table public.daily_metrics enable row level security;

drop policy if exists "daily_metrics_all_own" on public.daily_metrics;
create policy "daily_metrics_all_own" on public.daily_metrics for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.daily_metrics to authenticated;
