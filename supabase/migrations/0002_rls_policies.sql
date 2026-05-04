alter table profiles enable row level security;
alter table runs enable row level security;
alter table run_tiles enable row level security;
alter table run_inventory enable row level security;
alter table tech_skills enable row level security;
alter table journal_entries enable row level security;
alter table action_log enable row level security;
alter table content_versions enable row level security;

create policy "Users manage own profile" on profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users manage own runs" on runs
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage own run tiles" on run_tiles
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage own inventory" on run_inventory
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage own tech skills" on tech_skills
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage own journals" on journal_entries
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users read own action log" on action_log
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Server writes action log" on action_log
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Keep content_versions server-only during Phase 0 by enabling RLS with no policies.
