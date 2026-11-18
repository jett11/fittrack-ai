-- FitTrack AI — table-level grants for the anon/authenticated API roles.
-- RLS policies (from 0001_init.sql) control WHICH rows a role can see;
-- these GRANTs control whether the role can touch the table at all.
-- Safe to re-run.

grant usage on schema public to anon, authenticated;

-- Public read-only catalogs: readable by anyone, even signed out
grant select on public.exercises to anon, authenticated;
grant select on public.foods to anon, authenticated;
grant select on public.challenges to anon, authenticated;

-- User-owned tables: full access gated by RLS, only for signed-in users
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.workouts to authenticated;
grant select, insert, update, delete on public.workout_exercises to authenticated;
grant select, insert, update, delete on public.workout_sessions to authenticated;
grant select, insert, update, delete on public.workout_logs to authenticated;
grant select, insert, update, delete on public.meal_logs to authenticated;
grant select, insert, update, delete on public.body_measurements to authenticated;
grant select, insert, update, delete on public.progress_photos to authenticated;
grant select, insert, update, delete on public.challenge_completions to authenticated;

grant usage on all sequences in schema public to anon, authenticated;
