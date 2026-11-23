-- Adds a quick daily sleep/mood/energy check-in to the existing
-- one-row-per-user-per-day daily_metrics table (same pattern as
-- water_glasses) rather than a new table.
alter table public.daily_metrics
  add column if not exists sleep_hours numeric,
  add column if not exists mood smallint check (mood between 1 and 5),
  add column if not exists energy smallint check (energy between 1 and 5);
