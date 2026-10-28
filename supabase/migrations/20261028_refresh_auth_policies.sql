-- Safe, repeatable policy refresh for the existing Asma Ul Husna project.
-- Run in Supabase SQL Editor after the app update.
alter table public.names enable row level security;
alter table public.user_progress enable row level security;
alter table public.study_sessions enable row level security;

drop policy if exists "Published names are public" on public.names;
create policy "Published names are public" on public.names
  for select using (content_status = 'published');

drop policy if exists "Users read their own progress" on public.user_progress;
create policy "Users read their own progress" on public.user_progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users create their own progress" on public.user_progress;
create policy "Users create their own progress" on public.user_progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users update their own progress" on public.user_progress;
create policy "Users update their own progress" on public.user_progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete their own progress" on public.user_progress;
create policy "Users delete their own progress" on public.user_progress
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users read their own sessions" on public.study_sessions;
create policy "Users read their own sessions" on public.study_sessions
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users create their own sessions" on public.study_sessions;
create policy "Users create their own sessions" on public.study_sessions
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users update their own sessions" on public.study_sessions;
create policy "Users update their own sessions" on public.study_sessions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists user_progress_next_review_idx
  on public.user_progress (user_id, next_review_at);
create index if not exists study_sessions_user_started_idx
  on public.study_sessions (user_id, started_at desc);
