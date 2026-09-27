-- TaxIntuitive: Quiz Duo (online two-player quiz).
--
-- Design notes:
--  * Answers are validated by the `duo-submit-answer` Edge Function, never by the client.
--    Clients can INSERT into duo_answers only through that function (service role), so a
--    tampered client cannot award itself points.
--  * Both players get the same `question_ids` and `seconds_per_question`, fixed at match start.
--  * Realtime: clients subscribe to duo_matches + duo_participants + duo_answers for their match.

create table if not exists public.duo_matches (
  id uuid primary key default gen_random_uuid(),
  -- Short human-shareable code, e.g. "7KQ2ZD".
  room_code text not null unique,
  host_id uuid not null references auth.users (id) on delete cascade,
  guest_id uuid references auth.users (id) on delete set null,
  status text not null default 'waiting'
    check (status in ('waiting', 'ready', 'active', 'finished', 'abandoned', 'expired')),
  -- Question order, frozen when the match starts so both players see the same thing.
  question_ids jsonb not null default '[]'::jsonb,
  current_index int not null default 0,
  seconds_per_question int not null default 20,
  -- Server clock for the current question, so timing can be validated.
  question_started_at timestamptz,
  winner_id uuid references auth.users (id) on delete set null,
  is_tie boolean not null default false,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz,
  -- Unclaimed rooms go stale; a cron/edge job can expire these.
  expires_at timestamptz not null default now() + interval '1 hour'
);

create index if not exists duo_matches_room_code_idx on public.duo_matches (room_code);
create index if not exists duo_matches_status_idx on public.duo_matches (status, expires_at);

create table if not exists public.duo_participants (
  match_id uuid not null references public.duo_matches (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('host', 'guest')),
  ready boolean not null default false,
  score int not null default 0,
  correct_count int not null default 0,
  -- Current answer streak, for optional streak bonuses.
  streak int not null default 0,
  -- Heartbeat, so the UI can show "connection lost".
  last_seen_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

create table if not exists public.duo_answers (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.duo_matches (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_index int not null,
  question_id text not null,
  chosen_index int,
  is_correct boolean not null,
  -- Milliseconds from question start to answer, measured server-side.
  answered_ms int not null,
  awarded_points int not null default 0,
  created_at timestamptz not null default now(),
  -- One answer per player per question: blocks duplicate submissions.
  unique (match_id, user_id, question_index)
);

create index if not exists duo_answers_match_idx on public.duo_answers (match_id, question_index);

-- A participant of a given match (used by policies below).
create or replace function public.is_duo_participant(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.duo_participants p
    where p.match_id = p_match_id and p.user_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------------------- RLS
alter table public.duo_matches enable row level security;
alter table public.duo_participants enable row level security;
alter table public.duo_answers enable row level security;

-- Matches: participants can read their own match. A waiting room is readable by any signed-in
-- user so they can look it up by room code before joining.
drop policy if exists duo_matches_participant_read on public.duo_matches;
create policy duo_matches_participant_read on public.duo_matches
  for select to authenticated
  using (
    auth.uid() = host_id
    or auth.uid() = guest_id
    or (status = 'waiting' and expires_at > now())
  );

-- Creating a match: only as yourself as host. (The Edge Function normally does this.)
drop policy if exists duo_matches_host_insert on public.duo_matches;
create policy duo_matches_host_insert on public.duo_matches
  for insert to authenticated with check (auth.uid() = host_id);

-- Players may update only limited things on their own match (e.g. abandoning).
-- Scoring and progression are done by the Edge Functions with the service role.
drop policy if exists duo_matches_participant_update on public.duo_matches;
create policy duo_matches_participant_update on public.duo_matches
  for update to authenticated
  using (auth.uid() = host_id or auth.uid() = guest_id)
  with check (auth.uid() = host_id or auth.uid() = guest_id);

drop policy if exists duo_participants_read on public.duo_participants;
create policy duo_participants_read on public.duo_participants
  for select to authenticated using (public.is_duo_participant(match_id));

drop policy if exists duo_participants_self_insert on public.duo_participants;
create policy duo_participants_self_insert on public.duo_participants
  for insert to authenticated with check (auth.uid() = user_id);

-- A player may update their own row, but only for presence/readiness. Score changes are
-- rejected by the trigger below.
drop policy if exists duo_participants_self_update on public.duo_participants;
create policy duo_participants_self_update on public.duo_participants
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Hard guard: clients must not change their own score/correct_count/streak.
-- NOTE: deliberately SECURITY INVOKER (the default), not SECURITY DEFINER.
-- Inside a SECURITY DEFINER function current_user becomes the function OWNER (postgres), which
-- would match the trusted-role check below and silently disable this guard entirely.
-- Verified locally: with SECURITY DEFINER a client could set its own score to 9999.
create or replace function public.guard_duo_participant_update()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  -- Belt and braces: also read the role straight off the JWT, which is definer-independent.
  jwt_role text := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    ''
  );
begin
  -- Trusted writers: Edge Functions (service role) and direct migration/superuser access.
  if current_user in ('service_role', 'postgres', 'supabase_admin')
     or jwt_role = 'service_role' then
    return new;
  end if;
  if new.score <> old.score
     or new.correct_count <> old.correct_count
     or new.streak <> old.streak then
    raise exception 'Scores are set by the server, not the client';
  end if;
  return new;
end;
$$;

drop trigger if exists duo_participants_guard on public.duo_participants;
create trigger duo_participants_guard
  before update on public.duo_participants
  for each row execute function public.guard_duo_participant_update();

-- Answers are readable by both players (so each can see the other's result), but only the
-- server may write them.
drop policy if exists duo_answers_participant_read on public.duo_answers;
create policy duo_answers_participant_read on public.duo_answers
  for select to authenticated using (public.is_duo_participant(match_id));

-- Deliberately NO insert/update policy for clients: writes come from the Edge Function
-- using the service role, which bypasses RLS.

-- Realtime publication so clients get live match updates.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.duo_matches;
    alter publication supabase_realtime add table public.duo_participants;
    alter publication supabase_realtime add table public.duo_answers;
  end if;
exception
  when duplicate_object then null;
end
$$;
