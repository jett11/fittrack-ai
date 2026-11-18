-- Needed so logging the same set twice (editing reps/weight) updates the
-- existing row instead of creating a duplicate. Safe to re-run.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'workout_logs_session_exercise_set_unique'
  ) then
    alter table public.workout_logs
      add constraint workout_logs_session_exercise_set_unique
        unique (session_id, exercise_id, set_number);
  end if;
end $$;
