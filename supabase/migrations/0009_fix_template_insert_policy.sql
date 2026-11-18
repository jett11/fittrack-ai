-- Security fix: the original insert policy only checked ownership
-- (auth.uid() = user_id), so any signed-in user could insert their own
-- workout with is_template = true and have it appear in EVERYONE's
-- shared Templates tab (the select policy shows all is_template rows
-- to all users). Templates must only be added via the SQL editor
-- (effectively admin-only), never from the client.

drop policy if exists "workouts_insert_own" on public.workouts;
create policy "workouts_insert_own" on public.workouts for insert
  with check (auth.uid() = user_id and is_template = false);

-- Also close the same hole on update: a user must not be able to flip
-- their own existing routine to is_template = true after the fact.
drop policy if exists "workouts_update_own" on public.workouts;
create policy "workouts_update_own" on public.workouts for update
  using (auth.uid() = user_id and is_template = false)
  with check (auth.uid() = user_id and is_template = false);
