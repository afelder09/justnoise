-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

create table if not exists public.groups (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  creator_id   uuid not null references public.profiles(id) on delete cascade,
  invite_code  text unique not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.group_members (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  unique(group_id, user_id)
);

create table if not exists public.rounds (
  id                  uuid primary key default gen_random_uuid(),
  group_id            uuid not null references public.groups(id) on delete cascade,
  created_by          uuid not null references public.profiles(id) on delete cascade,
  theme               text not null,
  start_date          timestamptz not null,
  submission_deadline timestamptz not null,
  voting_deadline     timestamptz not null,
  created_at          timestamptz not null default now(),
  constraint valid_dates check (
    start_date < submission_deadline and
    submission_deadline < voting_deadline
  )
);

create table if not exists public.submissions (
  id                   uuid primary key default gen_random_uuid(),
  round_id             uuid not null references public.rounds(id) on delete cascade,
  user_id              uuid not null references public.profiles(id) on delete cascade,
  spotify_track_id     text not null,
  track_name           text not null,
  artist_name          text not null,
  album_name           text,
  album_art_url        text,
  preview_url          text,
  spotify_external_url text,
  submitted_at         timestamptz not null default now(),
  unique(round_id, user_id)
);

create table if not exists public.votes (
  id            uuid primary key default gen_random_uuid(),
  round_id      uuid not null references public.rounds(id) on delete cascade,
  voter_id      uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  voted_at      timestamptz not null default now(),
  unique(round_id, voter_id)
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-add group creator as a member on group creation
create or replace function public.handle_new_group()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.group_members (group_id, user_id)
  values (new.id, new.creator_id);
  return new;
end;
$$;

create or replace trigger on_group_created
  after insert on public.groups
  for each row execute procedure public.handle_new_group();

-- Prevent self-voting on insert and update
create or replace function public.prevent_self_vote()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  submitter_id uuid;
begin
  select user_id into submitter_id
  from public.submissions
  where id = new.submission_id;

  if submitter_id = new.voter_id then
    raise exception 'You cannot vote for your own submission';
  end if;

  return new;
end;
$$;

create or replace trigger check_self_vote
  before insert or update on public.votes
  for each row execute procedure public.prevent_self_vote();

-- Helper to check group membership without triggering recursive RLS
create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  )
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.rounds enable row level security;
alter table public.submissions enable row level security;
alter table public.votes enable row level security;

-- Profiles
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Groups
drop policy if exists "groups_select" on public.groups;
drop policy if exists "groups_insert" on public.groups;
drop policy if exists "groups_update" on public.groups;
drop policy if exists "groups_delete" on public.groups;
create policy "groups_select" on public.groups for select
  using (auth.uid() = creator_id or public.is_group_member(id));
create policy "groups_insert" on public.groups for insert
  with check (auth.uid() = creator_id);
create policy "groups_update" on public.groups for update
  using (auth.uid() = creator_id);
create policy "groups_delete" on public.groups for delete
  using (auth.uid() = creator_id);

-- Group members
drop policy if exists "group_members_select" on public.group_members;
drop policy if exists "group_members_insert" on public.group_members;
drop policy if exists "group_members_delete" on public.group_members;
create policy "group_members_select" on public.group_members for select
  using (public.is_group_member(group_id));
create policy "group_members_insert" on public.group_members for insert
  with check (auth.uid() = user_id);
create policy "group_members_delete" on public.group_members for delete
  using (auth.uid() = user_id);

-- Rounds
drop policy if exists "rounds_select" on public.rounds;
drop policy if exists "rounds_insert" on public.rounds;
create policy "rounds_select" on public.rounds for select
  using (public.is_group_member(group_id));
create policy "rounds_insert" on public.rounds for insert
  with check (
    auth.uid() = created_by and
    exists (
      select 1 from public.groups
      where id = rounds.group_id and creator_id = auth.uid()
    )
  );

-- Submissions
drop policy if exists "submissions_select" on public.submissions;
drop policy if exists "submissions_insert" on public.submissions;
drop policy if exists "submissions_update" on public.submissions;
create policy "submissions_select" on public.submissions for select
  using (
    exists (
      select 1 from public.rounds r
      where r.id = submissions.round_id and public.is_group_member(r.group_id)
    )
  );
create policy "submissions_insert" on public.submissions for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.rounds r
      where r.id = round_id and public.is_group_member(r.group_id)
    )
  );
create policy "submissions_update" on public.submissions for update
  using (auth.uid() = user_id);

-- Votes
drop policy if exists "votes_select" on public.votes;
drop policy if exists "votes_insert" on public.votes;
drop policy if exists "votes_update" on public.votes;
create policy "votes_select" on public.votes for select
  using (
    exists (
      select 1 from public.rounds r
      where r.id = votes.round_id and public.is_group_member(r.group_id)
    )
  );
create policy "votes_insert" on public.votes for insert
  with check (auth.uid() = voter_id);
create policy "votes_update" on public.votes for update
  using (auth.uid() = voter_id)
  with check (auth.uid() = voter_id);

-- ============================================================
-- LEADERBOARD VIEW
-- Points: 1st place = 3, 2nd = 2, 3rd = 1 per complete round
-- A round is complete when now() >= voting_deadline
-- ============================================================
create or replace view public.group_leaderboard as
with vote_counts as (
  select
    s.round_id,
    rnd.group_id,
    s.id as submission_id,
    s.user_id,
    count(v.id) as vote_count
  from public.submissions s
  left join public.votes v on v.submission_id = s.id
  join public.rounds rnd on rnd.id = s.round_id
  where rnd.voting_deadline <= now()
  group by s.round_id, rnd.group_id, s.id, s.user_id
),
ranked as (
  select
    vc.*,
    rank() over (partition by vc.round_id order by vc.vote_count desc) as rank
  from vote_counts vc
),
points_per_round as (
  select
    r.group_id,
    r.user_id,
    case
      when r.rank = 1 then 3
      when r.rank = 2 then 2
      when r.rank = 3 then 1
      else 0
    end as points,
    case when r.rank = 1 then 1 else 0 end as is_win
  from ranked r
)
select
  p.group_id,
  p.user_id,
  pr.username,
  pr.display_name,
  pr.avatar_url,
  coalesce(sum(p.points), 0) as total_points,
  coalesce(sum(p.is_win), 0) as wins
from points_per_round p
join public.profiles pr on pr.id = p.user_id
group by p.group_id, p.user_id, pr.username, pr.display_name, pr.avatar_url
order by total_points desc;
