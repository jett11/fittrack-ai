-- GPS cardio tracking: reuse workout_sessions (workout_id stays null for
-- cardio) instead of a new table, since a session is already "one row per
-- time a user does something".
alter table public.workout_sessions
  add column if not exists session_type text not null default 'strength' check (session_type in ('strength', 'cardio')),
  add column if not exists cardio_type text check (cardio_type in ('run', 'walk', 'cycle')),
  add column if not exists distance_km numeric,
  add column if not exists avg_pace_sec_per_km numeric,
  add column if not exists route_points jsonb;
