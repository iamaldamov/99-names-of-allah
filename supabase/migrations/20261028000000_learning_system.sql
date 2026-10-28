-- Learning system foundation for Asma Ul Husna
-- Apply this migration in Supabase SQL Editor after the existing schema.
-- Content remains unpublished until reviewed against reliable Islamic sources.

create table if not exists public.learning_lessons (
  id uuid primary key default gen_random_uuid(),
  name_id smallint not null unique references public.names(id) on delete cascade,
  title text not null,
  objectives text[] not null default '{}',
  sections jsonb not null default '[]'::jsonb,
  source_references jsonb not null default '[]'::jsonb,
  content_status text not null default 'draft'
    check (content_status in ('draft','reviewed','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  question_type text not null default 'single_choice'
    check (question_type in ('single_choice','multiple_choice','translation','arabic_recognition')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb not null,
  explanation text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.learning_lessons(id) on delete set null,
  total_questions integer not null default 0 check (total_questions >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  answers jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  daily_reminder_time time not null default '19:00',
  timezone text not null default 'Europe/Prague',
  review_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learning_lessons enable row level security;
alter table public.lesson_quiz_questions enable row level security;
alter table public.user_quiz_attempts enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "Published lessons are public" on public.learning_lessons;
create policy "Published lessons are public"
  on public.learning_lessons for select
  using (content_status = 'published');

drop policy if exists "Questions for published lessons are public" on public.lesson_quiz_questions;
create policy "Questions for published lessons are public"
  on public.lesson_quiz_questions for select
  using (exists (
    select 1 from public.learning_lessons l
    where l.id = lesson_id and l.content_status = 'published'
  ));

drop policy if exists "Users read their own quiz attempts" on public.user_quiz_attempts;
create policy "Users read their own quiz attempts"
  on public.user_quiz_attempts for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users create their own quiz attempts" on public.user_quiz_attempts;
create policy "Users create their own quiz attempts"
  on public.user_quiz_attempts for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users read their own notification preferences" on public.notification_preferences;
create policy "Users read their own notification preferences"
  on public.notification_preferences for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users create their own notification preferences" on public.notification_preferences;
create policy "Users create their own notification preferences"
  on public.notification_preferences for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update their own notification preferences" on public.notification_preferences;
create policy "Users update their own notification preferences"
  on public.notification_preferences for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own push subscriptions" on public.push_subscriptions;
create policy "Users manage their own push subscriptions"
  on public.push_subscriptions for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists learning_lessons_status_idx
  on public.learning_lessons (content_status, name_id);

create index if not exists quiz_questions_lesson_order_idx
  on public.lesson_quiz_questions (lesson_id, sort_order);

create index if not exists quiz_attempts_user_completed_idx
  on public.user_quiz_attempts (user_id, completed_at desc);
