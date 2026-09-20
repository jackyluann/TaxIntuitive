-- TaxIntuitive: content tables.
--
-- These hold the editable content (lessons, quizzes, videos, FAQs, workshops, simulator).
-- The app ships with the same content bundled so it works offline on first launch; these
-- tables let Jacky edit content later without shipping a new app build.
--
-- Read access: public (content is not secret).
-- Write access: service role / admins only.

create extension if not exists "pgcrypto";

-- Who is allowed to edit content. Add a row for an authenticated user to make them an editor.
create table if not exists public.content_editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_content_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.content_editors e where e.user_id = auth.uid());
$$;

create table if not exists public.content_categories (
  id text primary key,
  title text not null,
  blurb text not null,
  emoji text not null,
  track text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_lessons (
  id text primary key,
  slug text not null unique,
  title text not null,
  category_id text not null references public.content_categories (id) on delete cascade,
  kind text not null default 'lesson' check (kind in ('lesson', 'guide')),
  summary text not null,
  reading_minutes int not null default 3,
  -- Array of ContentBlock objects; see mobile/src/content/types.ts
  body jsonb not null default '[]'::jsonb,
  key_takeaways jsonb not null default '[]'::jsonb,
  official_sources jsonb not null default '[]'::jsonb,
  last_reviewed date not null default current_date,
  -- True when the lesson states time-sensitive facts that must be re-checked against canada.ca.
  needs_verification boolean not null default false,
  related_video_id text,
  related_quiz_id text,
  xp int not null default 10,
  sort_order int not null default 0,
  featured boolean not null default false,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists content_lessons_category_idx on public.content_lessons (category_id, sort_order);

create table if not exists public.content_quizzes (
  id text primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  emoji text not null default '🧠',
  kind text not null default 'topic' check (kind in ('topic', 'weekly', 'challenge')),
  category_id text references public.content_categories (id) on delete set null,
  -- Explicit question ids, or null to mean "all questions in category_id".
  question_ids jsonb,
  featured_from date,
  xp_per_correct int not null default 4,
  sort_order int not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_questions (
  id text primary key,
  category_id text not null references public.content_categories (id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  answer_index int not null,
  explanation text not null,
  teaches_lesson_id text references public.content_lessons (id) on delete set null,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists content_questions_category_idx on public.content_questions (category_id);

create table if not exists public.content_videos (
  id text primary key,
  title text not null,
  question text not null,
  description text not null,
  category text not null,
  -- Empty string = episode planned but not filmed; the app shows a "coming soon" state.
  youtube_id text not null default '',
  duration_seconds int,
  transcript text,
  captions_available boolean not null default false,
  related_lesson_id text references public.content_lessons (id) on delete set null,
  related_quiz_id text references public.content_quizzes (id) on delete set null,
  featured boolean not null default false,
  xp int not null default 10,
  sort_order int not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_glossary (
  term text primary key,
  definition text not null,
  category_id text references public.content_categories (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_faqs (
  id text primary key,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location_name text,
  address text,
  online boolean not null default false,
  registration_url text,
  status text not null default 'upcoming' check (status in ('upcoming', 'past', 'cancelled')),
  audience text,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists content_workshops_starts_idx on public.content_workshops (starts_at);

create table if not exists public.content_simulator_scenarios (
  id text primary key,
  month_label text not null,
  prompt text not null,
  category_id text references public.content_categories (id) on delete set null,
  -- Array of SimulatorOption objects.
  options jsonb not null,
  sort_order int not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_achievements (
  id text primary key,
  title text not null,
  description text not null,
  emoji text not null,
  tier text not null check (tier in ('bronze', 'silver', 'gold')),
  rule jsonb not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- RLS: public read
alter table public.content_editors enable row level security;
alter table public.content_categories enable row level security;
alter table public.content_lessons enable row level security;
alter table public.content_quizzes enable row level security;
alter table public.content_questions enable row level security;
alter table public.content_videos enable row level security;
alter table public.content_glossary enable row level security;
alter table public.content_faqs enable row level security;
alter table public.content_workshops enable row level security;
alter table public.content_simulator_scenarios enable row level security;
alter table public.content_achievements enable row level security;

-- Explicit policies (deliberately verbose: one statement per table, easy to audit).

drop policy if exists content_categories_public_read on public.content_categories;
create policy content_categories_public_read on public.content_categories
  for select using (true);

drop policy if exists content_categories_editor_write on public.content_categories;
create policy content_categories_editor_write on public.content_categories
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists content_lessons_public_read on public.content_lessons;
create policy content_lessons_public_read on public.content_lessons
  for select using (true);

drop policy if exists content_lessons_editor_write on public.content_lessons;
create policy content_lessons_editor_write on public.content_lessons
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists content_quizzes_public_read on public.content_quizzes;
create policy content_quizzes_public_read on public.content_quizzes
  for select using (true);

drop policy if exists content_quizzes_editor_write on public.content_quizzes;
create policy content_quizzes_editor_write on public.content_quizzes
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists content_questions_public_read on public.content_questions;
create policy content_questions_public_read on public.content_questions
  for select using (true);

drop policy if exists content_questions_editor_write on public.content_questions;
create policy content_questions_editor_write on public.content_questions
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists content_videos_public_read on public.content_videos;
create policy content_videos_public_read on public.content_videos
  for select using (true);

drop policy if exists content_videos_editor_write on public.content_videos;
create policy content_videos_editor_write on public.content_videos
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists content_glossary_public_read on public.content_glossary;
create policy content_glossary_public_read on public.content_glossary
  for select using (true);

drop policy if exists content_glossary_editor_write on public.content_glossary;
create policy content_glossary_editor_write on public.content_glossary
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists content_faqs_public_read on public.content_faqs;
create policy content_faqs_public_read on public.content_faqs
  for select using (true);

drop policy if exists content_faqs_editor_write on public.content_faqs;
create policy content_faqs_editor_write on public.content_faqs
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists content_workshops_public_read on public.content_workshops;
create policy content_workshops_public_read on public.content_workshops
  for select using (true);

drop policy if exists content_workshops_editor_write on public.content_workshops;
create policy content_workshops_editor_write on public.content_workshops
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists content_simulator_scenarios_public_read on public.content_simulator_scenarios;
create policy content_simulator_scenarios_public_read on public.content_simulator_scenarios
  for select using (true);

drop policy if exists content_simulator_scenarios_editor_write on public.content_simulator_scenarios;
create policy content_simulator_scenarios_editor_write on public.content_simulator_scenarios
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists content_achievements_public_read on public.content_achievements;
create policy content_achievements_public_read on public.content_achievements
  for select using (true);

drop policy if exists content_achievements_editor_write on public.content_achievements;
create policy content_achievements_editor_write on public.content_achievements
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

-- Editors can see who the editors are; nobody else can.
drop policy if exists content_editors_read on public.content_editors;
create policy content_editors_read on public.content_editors
  for select to authenticated using (public.is_content_editor());
