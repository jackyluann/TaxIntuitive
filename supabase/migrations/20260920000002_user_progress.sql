-- TaxIntuitive: per-user progress.
--
-- Guests keep all of this on-device; these tables only come into play once someone signs in
-- (for cloud backup and cross-device sync). Every table is owner-only via RLS.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  -- Opt-in: only shown on leaderboards if the learner allows it.
  leaderboard_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create a profile row automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'learner'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null,
  xp int not null check (xp >= 0),
  track_id text not null,
  ref_id text,
  created_at timestamptz not null default now(),
  -- Keeps an award idempotent: one row per (user, reason, ref).
  unique (user_id, reason, ref_id)
);

create index if not exists xp_events_user_idx on public.xp_events (user_id, created_at desc);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  opened boolean not null default true,
  completed boolean not null default false,
  completed_at timestamptz,
  bookmarked boolean not null default false,
  scroll_progress real not null default 0 check (scroll_progress between 0 and 1),
  last_opened_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_id text not null,
  score int not null check (score >= 0),
  total int not null check (total > 0),
  wrong_question_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint quiz_attempts_score_within_total check (score <= total)
);

create index if not exists quiz_attempts_user_idx on public.quiz_attempts (user_id, created_at desc);

create table if not exists public.video_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null,
  position_seconds int not null default 0 check (position_seconds >= 0),
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table if not exists public.simulator_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  final_cash int not null,
  final_savings int not null default 0,
  final_debt int not null default 0,
  money_smarts int not null,
  max_money_smarts int not null,
  tier text not null check (tier in ('broke', 'bronze', 'silver', 'gold')),
  lessons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements_earned (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- One row per day the learner did something. Drives the streak.
create table if not exists public.active_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);

-- Workshop requests and general contact. A guest can submit these, so user_id is nullable.
create table if not exists public.workshop_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  contact_name text not null,
  contact_email text not null,
  organization text,
  preferred_date date,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  contact_email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.xp_events enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.video_progress enable row level security;
alter table public.simulator_runs enable row level security;
alter table public.achievements_earned enable row level security;
alter table public.active_days enable row level security;
alter table public.workshop_requests enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: you can always read/write your own.
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- Opted-in profiles are readable by other signed-in users so leaderboards can show names.
drop policy if exists profiles_leaderboard_select on public.profiles;
create policy profiles_leaderboard_select on public.profiles
  for select to authenticated using (leaderboard_opt_in = true);

drop policy if exists xp_events_owner on public.xp_events;
create policy xp_events_owner on public.xp_events
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists lesson_progress_owner on public.lesson_progress;
create policy lesson_progress_owner on public.lesson_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists quiz_attempts_owner on public.quiz_attempts;
create policy quiz_attempts_owner on public.quiz_attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists video_progress_owner on public.video_progress;
create policy video_progress_owner on public.video_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists simulator_runs_owner on public.simulator_runs;
create policy simulator_runs_owner on public.simulator_runs
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists achievements_earned_owner on public.achievements_earned;
create policy achievements_earned_owner on public.achievements_earned
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists active_days_owner on public.active_days;
create policy active_days_owner on public.active_days
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Requests: anyone (including anon) may submit; only editors may read them.
drop policy if exists workshop_requests_insert on public.workshop_requests;
create policy workshop_requests_insert on public.workshop_requests
  for insert to anon, authenticated with check (true);

drop policy if exists workshop_requests_editor_read on public.workshop_requests;
create policy workshop_requests_editor_read on public.workshop_requests
  for select to authenticated using (public.is_content_editor());

drop policy if exists contact_messages_insert on public.contact_messages;
create policy contact_messages_insert on public.contact_messages
  for insert to anon, authenticated with check (true);

drop policy if exists contact_messages_editor_read on public.contact_messages;
create policy contact_messages_editor_read on public.contact_messages
  for select to authenticated using (public.is_content_editor());
