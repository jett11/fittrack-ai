-- service_role bypasses RLS but Postgres still enforces plain table GRANTs
-- independently — and this project's grants (0003) were never extended to
-- service_role since no edge function needed it until the cron-triggered
-- send-inactivity-pushes function, which queries across all users.
grant select, insert, update, delete on public.push_subscriptions to service_role;
grant select on public.workout_sessions to service_role;
grant select on public.meal_logs to service_role;
