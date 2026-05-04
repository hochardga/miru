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

create unique index runs_single_active_per_user_idx
  on runs (user_id)
  where status = 'active';

create or replace function public.bootstrap_run(
  p_user_id uuid,
  p_title text default null,
  p_starting_column text default 'E'
)
returns table (run_id uuid, current_tile_id uuid)
language plpgsql
security invoker
set search_path = public, auth
as $$
declare
  v_active_run runs%rowtype;
  v_has_active_run boolean := false;
  v_starting_tile_id uuid;
  v_title text;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'bootstrap_run user mismatch'
      using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(
    hashtext('miru.bootstrap_run'),
    hashtext(p_user_id::text)
  );

  insert into profiles (id, is_anonymous)
  values (p_user_id, true)
  on conflict (id) do update
    set is_anonymous = excluded.is_anonymous,
        updated_at = now();

  select *
  into v_active_run
  from runs
  where user_id = p_user_id
    and status = 'active'
  order by updated_at desc
  limit 1
  for update;

  v_has_active_run := found;

  if v_has_active_run and v_active_run.current_tile_id is not null then
    run_id := v_active_run.id;
    current_tile_id := v_active_run.current_tile_id;
    return next;
    return;
  end if;

  v_title := nullif(btrim(p_title), '');

  if not v_has_active_run then
    insert into runs (user_id, title)
    values (p_user_id, coalesce(v_title, 'Miru Run'))
    returning * into v_active_run;
  end if;

  select id
  into v_starting_tile_id
  from run_tiles as rt
  where rt.run_id = v_active_run.id
    and rt.row_number = 1
  order by rt.updated_at desc, rt.created_at desc
  limit 1
  for update;

  if v_starting_tile_id is null then
    insert into run_tiles (
      run_id,
      user_id,
      row_number,
      column_letter,
      terrain,
      visited
    )
    values (
      v_active_run.id,
      p_user_id,
      1,
      p_starting_column,
      'unknown',
      true
    )
    returning id into v_starting_tile_id;
  else
    update run_tiles
    set visited = true,
        updated_at = now()
    where id = v_starting_tile_id;
  end if;

  update runs
  set current_tile_id = v_starting_tile_id,
      updated_at = now()
  where id = v_active_run.id;

  insert into run_inventory (
    run_id,
    user_id,
    item_key,
    item_name,
    category,
    quantity
  )
  values (
    v_active_run.id,
    p_user_id,
    'meal-bar',
    'Meal Bar',
    'food',
    3
  )
  on conflict on constraint run_inventory_run_id_item_key_key do update
    set user_id = excluded.user_id,
        item_name = excluded.item_name,
        category = excluded.category,
        quantity = greatest(run_inventory.quantity, excluded.quantity),
        updated_at = now();

  insert into action_log (
    run_id,
    user_id,
    action_type,
    day_number,
    tile_id,
    input,
    result
  )
  select
    v_active_run.id,
    p_user_id,
    'start_run',
    1,
    v_starting_tile_id,
    jsonb_strip_nulls(jsonb_build_object(
      'title', v_title,
      'startingColumn', p_starting_column
    )),
    jsonb_build_object(
      'message', 'Phase 0 placeholder run created.'
    )
  where not exists (
    select 1
    from action_log as al
    where al.run_id = v_active_run.id
      and al.action_type = 'start_run'
  );

  run_id := v_active_run.id;
  current_tile_id := v_starting_tile_id;
  return next;
end;
$$;

revoke all on function public.bootstrap_run(uuid, text, text) from public;
grant execute on function public.bootstrap_run(uuid, text, text) to authenticated;

-- Keep content_versions server-only during Phase 0 by enabling RLS with no policies.
