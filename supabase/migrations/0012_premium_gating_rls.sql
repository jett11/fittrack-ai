-- Enforce the Premium gate at the database level too, not just in the UI —
-- otherwise a free user could create custom routines or upload progress
-- photos by calling the API directly, bypassing the app's buttons entirely.

drop policy if exists "workouts_insert_own" on public.workouts;
create policy "workouts_insert_own" on public.workouts for insert
  with check (
    auth.uid() = user_id
    and is_template = false
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_premium = true)
  );

drop policy if exists "photos_all_own" on public.progress_photos;
create policy "photos_select_own" on public.progress_photos for select
  using (auth.uid() = user_id);
create policy "photos_insert_own_premium" on public.progress_photos for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_premium = true)
  );
create policy "photos_delete_own" on public.progress_photos for delete
  using (auth.uid() = user_id);
