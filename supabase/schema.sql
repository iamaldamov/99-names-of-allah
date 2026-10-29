-- Asma Ul Husna: initial database schema
-- Run this file in Supabase SQL Editor. Never put the service_role key in the browser.

create extension if not exists pgcrypto;

create table if not exists public.names (
  id smallint primary key check (id between 1 and 99),
  arabic text not null,
  transliteration text not null,
  translation text not null,
  explanation text not null,
  source_references jsonb not null default '[]'::jsonb,
  content_status text not null default 'draft' check (content_status in ('draft','reviewed','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  name_id smallint not null check (name_id between 1 and 99),
  status text not null default 'new' check (status in ('new','learning','learned','review')),
  confidence smallint not null default 0 check (confidence between 0 and 5),
  times_seen integer not null default 0 check (times_seen >= 0),
  times_correct integer not null default 0 check (times_correct >= 0),
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, name_id)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  correct_answers integer not null default 0,
  total_answers integer not null default 0
);

alter table public.names enable row level security;
alter table public.user_progress enable row level security;
alter table public.study_sessions enable row level security;

-- Published names are readable by everyone; draft/review content stays private to trusted editors.
create policy "Published names are public"
  on public.names for select
  using (content_status = 'published');

create policy "Users read their own progress"
  on public.user_progress for select
  to authenticated using (auth.uid() = user_id);

create policy "Users create their own progress"
  on public.user_progress for insert
  to authenticated with check (auth.uid() = user_id);

create policy "Users update their own progress"
  on public.user_progress for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users delete their own progress"
  on public.user_progress for delete
  to authenticated using (auth.uid() = user_id);

create policy "Users read their own sessions"
  on public.study_sessions for select
  to authenticated using (auth.uid() = user_id);

create policy "Users create their own sessions"
  on public.study_sessions for insert
  to authenticated with check (auth.uid() = user_id);

create policy "Users update their own sessions"
  on public.study_sessions for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists user_progress_next_review_idx
  on public.user_progress (user_id, next_review_at);

create index if not exists study_sessions_user_started_idx
  on public.study_sessions (user_id, started_at desc);