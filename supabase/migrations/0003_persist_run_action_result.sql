create or replace function public.persist_run_action_result(
  p_user_id uuid,
  p_run_id uuid,
  p_expected_updated_at timestamptz,
  p_current_day integer,
  p_hp integer,
  p_ep integer,
  p_base_atk integer,
  p_base_def integer,
  p_bitliths integer,
  p_starvation_count integer,
  p_sleep_deprivation_count integer,
  p_minor_injury_count integer,
  p_active_enemy jsonb,
  p_pending_prompt jsonb,
  p_current_tile_id uuid,
  p_terrain terrain_type,
  p_visited boolean,
  p_event_history jsonb,
  p_repeatability_state jsonb,
  p_enemy_state jsonb,
  p_notes text,
  p_inventory jsonb,
  p_action_input jsonb,
  p_action_type action_type,
  p_day_number integer,
  p_tile_id uuid,
  p_action_result jsonb,
  p_dice_rolls jsonb
)
returns table (id uuid, created_at timestamptz)
language plpgsql
security invoker
set search_path = public, auth
as $$
declare
  v_run runs%rowtype;
  v_action_id uuid;
  v_action_created_at timestamptz;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'persist_run_action_result user mismatch'
      using errcode = '42501';
  end if;

  select *
  into v_run
  from runs
  where id = p_run_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'RUN_NOT_FOUND'
      using errcode = 'P0002';
  end if;

  if v_run.updated_at is distinct from p_expected_updated_at then
    raise exception 'STALE_RUN_ACTION'
      using errcode = '40001';
  end if;

  update runs
  set current_tile_id = p_current_tile_id,
      current_day = p_current_day,
      hp = p_hp,
      ep = p_ep,
      base_atk = p_base_atk,
      base_def = p_base_def,
      bitliths = p_bitliths,
      starvation_count = p_starvation_count,
      sleep_deprivation_count = p_sleep_deprivation_count,
      minor_injury_count = p_minor_injury_count,
      active_enemy = p_active_enemy,
      pending_prompt = p_pending_prompt,
      updated_at = now()
  where id = p_run_id
    and user_id = p_user_id;

  update run_tiles
  set terrain = p_terrain,
      visited = p_visited,
      event_history = coalesce(p_event_history, '[]'::jsonb),
      repeatability_state = coalesce(p_repeatability_state, '{}'::jsonb),
      enemy_state = p_enemy_state,
      notes = p_notes,
      updated_at = now()
  where id = p_current_tile_id
    and run_id = p_run_id
    and user_id = p_user_id;

  if not found then
    raise exception 'RUN_TILE_NOT_FOUND'
      using errcode = 'P0002';
  end if;

  with inventory_payload as (
    select *
    from jsonb_to_recordset(coalesce(p_inventory, '[]'::jsonb))
      as items(item_key text, quantity integer, metadata jsonb)
  )
  update run_inventory as ri
  set quantity = inventory_payload.quantity,
      metadata = coalesce(inventory_payload.metadata, '{}'::jsonb),
      updated_at = now()
  from inventory_payload
  where ri.run_id = p_run_id
    and ri.user_id = p_user_id
    and ri.item_key = inventory_payload.item_key;

  insert into action_log (
    run_id,
    user_id,
    action_type,
    day_number,
    tile_id,
    input,
    result,
    dice_rolls
  )
  values (
    p_run_id,
    p_user_id,
    p_action_type,
    p_day_number,
    p_tile_id,
    coalesce(p_action_input, '{}'::jsonb),
    coalesce(p_action_result, '{}'::jsonb),
    coalesce(p_dice_rolls, '[]'::jsonb)
  )
  returning action_log.id, action_log.created_at
  into v_action_id, v_action_created_at;

  id := v_action_id;
  created_at := v_action_created_at;
  return next;
end;
$$;

revoke all on function public.persist_run_action_result(
  uuid,
  uuid,
  timestamp with time zone,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  jsonb,
  jsonb,
  uuid,
  terrain_type,
  boolean,
  jsonb,
  jsonb,
  jsonb,
  text,
  jsonb,
  jsonb,
  action_type,
  integer,
  uuid,
  jsonb,
  jsonb
) from public;

grant execute on function public.persist_run_action_result(
  uuid,
  uuid,
  timestamp with time zone,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer,
  jsonb,
  jsonb,
  uuid,
  terrain_type,
  boolean,
  jsonb,
  jsonb,
  jsonb,
  text,
  jsonb,
  jsonb,
  action_type,
  integer,
  uuid,
  jsonb,
  jsonb
) to authenticated;
