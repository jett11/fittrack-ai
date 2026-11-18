-- Integrity hardening: a progress_photos row's storage_path must live
-- under that same user's own storage folder. Without this, a row's
-- user_id and storage_path could be set to mismatched users (the
-- storage RLS policy already blocks reading another user's actual file,
-- but the row itself shouldn't be allowed to claim it in the first place).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'progress_photos_path_matches_user'
  ) then
    alter table public.progress_photos
      add constraint progress_photos_path_matches_user
        check (storage_path like user_id::text || '/%');
  end if;
end $$;
