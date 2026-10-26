-- SurTaal database setup. Paste all of this into Supabase → SQL Editor → New
-- query, and press Run. It is safe to run again.
--
-- One row per learner holds their progress (the same data as a progress
-- backup file). Row-level security lets each signed-in learner read and write
-- only their own row; nobody else, and nobody signed out, can see it.

create table if not exists public.progress (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null check (octet_length(data::text) < 2000000),
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "Learners read their own progress" on public.progress;
create policy "Learners read their own progress" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Learners add their own progress" on public.progress;
create policy "Learners add their own progress" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Learners update their own progress" on public.progress;
create policy "Learners update their own progress" on public.progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Learners delete their own progress" on public.progress;
create policy "Learners delete their own progress" on public.progress
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.progress from anon;
grant select, insert, update, delete on public.progress to authenticated;

-- "Delete my account" in the app (Apple requires apps with accounts to offer
-- this). Removes the signed-in learner; their progress row goes with them.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
