-- FitTrack AI — initial schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).
-- Safe to re-run: every statement uses IF NOT EXISTS / OR REPLACE where possible.

create extension if not exists "pgcrypto";

-- =========================================================
-- 1. profiles — one row per user, created automatically on signup
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age int,
  height_cm numeric,
  current_weight_kg numeric,
  target_weight_kg numeric,
  fitness_goal text check (fitness_goal in ('muscle_gain', 'fat_loss', 'general_fitness')),
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  activity_level text check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active')),
  workout_location text check (workout_location in ('home', 'gym', 'both')),
  equipment text[] default '{}',
  dietary_preference text check (dietary_preference in ('vegetarian', 'non_vegetarian', 'vegan')),
  daily_food_budget numeric,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 2. user_preferences — app settings, one row per user
-- =========================================================
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 3. exercises — shared public exercise library
-- =========================================================
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null,
  instructions text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  default_sets int,
  default_reps text,
  rest_seconds int,
  equipment text,
  location text check (location in ('home', 'gym', 'both')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 4. workouts — templates (user_id null) or a user's own routines
-- =========================================================
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  goal text check (goal in ('muscle_gain', 'fat_loss', 'general_fitness')),
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  location text check (location in ('home', 'gym', 'both')),
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- join table: which exercises belong to a workout, in what order, with target sets/reps
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  position int not null default 0,
  target_sets int,
  target_reps text,
  rest_seconds int,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 5. workout_sessions — one row per time a user starts a workout
-- =========================================================
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete set null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 6. workout_logs — actual sets/reps/weight performed within a session
-- =========================================================
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  set_number int not null default 1,
  reps_completed int,
  weight_kg numeric,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 7. foods — shared public nutrition database (Indian foods seeded)
-- =========================================================
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  calories numeric not null,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  serving_size text not null,
  is_veg boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 8. meal_logs — a user's food diary
-- =========================================================
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid references public.foods(id) on delete set null,
  custom_food_name text,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  quantity numeric not null default 1,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  logged_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 9. body_measurements
-- =========================================================
create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at date not null default current_date,
  weight_kg numeric,
  waist_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,
  notes text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 10. progress_photos — metadata only; files live in Supabase Storage
-- =========================================================
create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  taken_at date not null default current_date,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 11. challenges — shared catalog of daily/weekly challenges
-- =========================================================
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text check (category in ('water', 'steps', 'workout', 'habit')),
  target_value numeric,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 12. challenge_completions
-- =========================================================
create table if not exists public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  completed_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, challenge_id, completed_date)
);

-- =========================================================
-- Indexes
-- =========================================================
create index if not exists idx_workouts_user_id on public.workouts(user_id);
create index if not exists idx_workout_exercises_workout_id on public.workout_exercises(workout_id);
create index if not exists idx_workout_sessions_user_id on public.workout_sessions(user_id);
create index if not exists idx_workout_logs_session_id on public.workout_logs(session_id);
create index if not exists idx_meal_logs_user_id_date on public.meal_logs(user_id, logged_date);
create index if not exists idx_body_measurements_user_id_date on public.body_measurements(user_id, measured_at);
create index if not exists idx_progress_photos_user_id on public.progress_photos(user_id);
create index if not exists idx_challenge_completions_user_id on public.challenge_completions(user_id, completed_date);

-- =========================================================
-- updated_at auto-touch trigger
-- =========================================================
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at before update on public.user_preferences
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_workouts_updated_at on public.workouts;
create trigger trg_workouts_updated_at before update on public.workouts
  for each row execute function public.touch_updated_at();

-- =========================================================
-- Auto-create profile + preferences row when a new user signs up
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.user_preferences (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_logs enable row level security;
alter table public.foods enable row level security;
alter table public.meal_logs enable row level security;
alter table public.body_measurements enable row level security;
alter table public.progress_photos enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_completions enable row level security;

-- profiles: a user can only see/edit their own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- user_preferences: own row only
drop policy if exists "prefs_all_own" on public.user_preferences;
create policy "prefs_all_own" on public.user_preferences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- exercises: public read-only library, anyone signed in can read
drop policy if exists "exercises_read_all" on public.exercises;
create policy "exercises_read_all" on public.exercises for select using (true);

-- workouts: user sees their own routines, plus shared templates
drop policy if exists "workouts_select_own_or_template" on public.workouts;
create policy "workouts_select_own_or_template" on public.workouts for select
  using (auth.uid() = user_id or is_template = true);
drop policy if exists "workouts_insert_own" on public.workouts;
create policy "workouts_insert_own" on public.workouts for insert with check (auth.uid() = user_id);
drop policy if exists "workouts_update_own" on public.workouts;
create policy "workouts_update_own" on public.workouts for update using (auth.uid() = user_id);
drop policy if exists "workouts_delete_own" on public.workouts;
create policy "workouts_delete_own" on public.workouts for delete using (auth.uid() = user_id);

-- workout_exercises: visible if the parent workout is visible to this user
drop policy if exists "workout_exercises_select" on public.workout_exercises;
create policy "workout_exercises_select" on public.workout_exercises for select
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and (w.user_id = auth.uid() or w.is_template = true)
  ));
drop policy if exists "workout_exercises_write" on public.workout_exercises;
create policy "workout_exercises_write" on public.workout_exercises for all
  using (exists (
    select 1 from public.workouts w where w.id = workout_exercises.workout_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workouts w where w.id = workout_exercises.workout_id and w.user_id = auth.uid()
  ));

-- workout_sessions: own rows only
drop policy if exists "sessions_all_own" on public.workout_sessions;
create policy "sessions_all_own" on public.workout_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- workout_logs: visible/writable if the parent session belongs to this user
drop policy if exists "logs_select_own" on public.workout_logs;
create policy "logs_select_own" on public.workout_logs for select
  using (exists (
    select 1 from public.workout_sessions s where s.id = workout_logs.session_id and s.user_id = auth.uid()
  ));
drop policy if exists "logs_write_own" on public.workout_logs;
create policy "logs_write_own" on public.workout_logs for all
  using (exists (
    select 1 from public.workout_sessions s where s.id = workout_logs.session_id and s.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workout_sessions s where s.id = workout_logs.session_id and s.user_id = auth.uid()
  ));

-- foods: public read-only library
drop policy if exists "foods_read_all" on public.foods;
create policy "foods_read_all" on public.foods for select using (true);

-- meal_logs: own rows only
drop policy if exists "meal_logs_all_own" on public.meal_logs;
create policy "meal_logs_all_own" on public.meal_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- body_measurements: own rows only
drop policy if exists "measurements_all_own" on public.body_measurements;
create policy "measurements_all_own" on public.body_measurements for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- progress_photos: own rows only (storage access is controlled separately below)
drop policy if exists "photos_all_own" on public.progress_photos;
create policy "photos_all_own" on public.progress_photos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- challenges: public read-only catalog
drop policy if exists "challenges_read_all" on public.challenges;
create policy "challenges_read_all" on public.challenges for select using (true);

-- challenge_completions: own rows only
drop policy if exists "completions_all_own" on public.challenge_completions;
create policy "completions_all_own" on public.challenge_completions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Storage: private bucket for progress photos
-- =========================================================
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

drop policy if exists "progress_photos_storage_select_own" on storage.objects;
create policy "progress_photos_storage_select_own" on storage.objects for select
  using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "progress_photos_storage_insert_own" on storage.objects;
create policy "progress_photos_storage_insert_own" on storage.objects for insert
  with check (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "progress_photos_storage_delete_own" on storage.objects;
create policy "progress_photos_storage_delete_own" on storage.objects for delete
  using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);
