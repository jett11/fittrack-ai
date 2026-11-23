-- Opt-in group challenges: a group wraps one existing shared challenge,
-- joined via a short code/link (no friend/follow system exists yet).
create table if not exists public.challenge_groups (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  name text not null,
  join_code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.challenge_group_members (
  group_id uuid not null references public.challenge_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists idx_challenge_group_members_user on public.challenge_group_members(user_id);

alter table public.challenge_groups enable row level security;
alter table public.challenge_group_members enable row level security;

-- Groups carry no sensitive data (name/code/challenge) and must be readable by
-- code before joining, so any signed-in user can read/create them.
drop policy if exists "groups_select_all" on public.challenge_groups;
create policy "groups_select_all" on public.challenge_groups for select
  using (auth.role() = 'authenticated');

drop policy if exists "groups_insert_own" on public.challenge_groups;
create policy "groups_insert_own" on public.challenge_groups for insert
  with check (auth.uid() = created_by);

-- Members can only ever read/write their OWN membership row directly — this
-- avoids a self-referencing RLS policy on the same table (Postgres RLS
-- recursion). The leaderboard (seeing OTHER members' progress) is served by
-- the security-definer function below instead, scoped to groups you're in.
drop policy if exists "members_select_own" on public.challenge_group_members;
create policy "members_select_own" on public.challenge_group_members for select
  using (auth.uid() = user_id);

drop policy if exists "members_insert_own" on public.challenge_group_members;
create policy "members_insert_own" on public.challenge_group_members for insert
  with check (auth.uid() = user_id);

drop policy if exists "members_delete_own" on public.challenge_group_members;
create policy "members_delete_own" on public.challenge_group_members for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.challenge_groups to authenticated;
grant select, insert, delete on public.challenge_group_members to authenticated;

create or replace function public.get_group_leaderboard(p_group_id uuid)
returns table (user_id uuid, full_name text, total_completions bigint, joined_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.challenge_group_members
    where group_id = p_group_id and user_id = auth.uid()
  ) then
    return;
  end if;

  return query
  select
    m.user_id,
    p.full_name,
    count(cc.id) as total_completions,
    m.joined_at
  from public.challenge_group_members m
  join public.challenge_groups g on g.id = m.group_id
  left join public.profiles p on p.id = m.user_id
  left join public.challenge_completions cc
    on cc.user_id = m.user_id and cc.challenge_id = g.challenge_id
  where m.group_id = p_group_id
  group by m.user_id, p.full_name, m.joined_at
  order by total_completions desc;
end;
$$;

grant execute on function public.get_group_leaderboard(uuid) to authenticated;
