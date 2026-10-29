-- Allow a user's progress to be saved even when the optional public names catalogue
-- has not been seeded in Supabase yet. The canonical 99-name content also ships locally.
alter table public.user_progress
  drop constraint if exists user_progress_name_id_fkey;

alter table public.user_progress
  drop constraint if exists user_progress_name_id_check;

alter table public.user_progress
  add constraint user_progress_name_id_check check (name_id between 1 and 99);
