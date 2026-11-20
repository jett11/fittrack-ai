-- Lets users set a weekly workout target on their profile, so Workout
-- Analytics can show progress against a real goal instead of a fixed "/7".
alter table public.profiles add column if not exists weekly_workout_target smallint;
