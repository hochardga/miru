create or replace function public.persist_journal_entry(
  p_user_id uuid,
  p_run_id uuid,
  p_day_number integer,
  p_tile_id uuid,
  p_body text
)
returns table (
  id uuid,
  run_id uuid,
  day_number integer,
  tile_id uuid,
  body text,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = public, auth
as $$
declare
  v_run runs%rowtype;
  v_prompt_day integer;
  v_prompt_tile_id uuid;
  v_tile_id uuid;
  v_tile_exists uuid;
  v_journal_id uuid;
  v_journal_run_id uuid;
  v_journal_day_number integer;
  v_journal_tile_id uuid;
  v_journal_body text;
  v_journal_updated_at timestamptz;
  v_updated_at timestamptz := now();
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'persist_journal_entry user mismatch'
      using errcode = '42501';
  end if;

  select *
  into v_run
  from runs
  where runs.id = p_run_id
    and runs.user_id = p_user_id
  for update;

  if not found then
    raise exception 'RUN_NOT_FOUND'
      using errcode = 'P0002';
  end if;

  if v_run.pending_prompt is null
    or v_run.pending_prompt->>'type' <> 'journal_available' then
    raise exception 'INVALID_JOURNAL_STATE'
      using errcode = 'P0001';
  end if;

  v_prompt_day := (v_run.pending_prompt->>'dayNumber')::integer;

  if v_prompt_day is null
    or v_prompt_day is distinct from p_day_number then
    raise exception 'INVALID_JOURNAL_STATE'
      using errcode = 'P0001';
  end if;

  v_prompt_tile_id := (v_run.pending_prompt->>'tileId')::uuid;

  if v_prompt_tile_id is null then
    v_prompt_tile_id := v_run.current_tile_id;
  end if;

  v_tile_id := coalesce(p_tile_id, v_prompt_tile_id, v_run.current_tile_id);

  if v_prompt_tile_id is null
    or v_tile_id is distinct from v_prompt_tile_id then
    raise exception 'INVALID_JOURNAL_STATE'
      using errcode = 'P0001';
  end if;

  select run_tiles.id
  into v_tile_exists
  from run_tiles
  where run_tiles.id = v_tile_id
    and run_tiles.run_id = p_run_id
    and run_tiles.user_id = p_user_id;

  if not found then
    raise exception 'RUN_TILE_NOT_FOUND'
      using errcode = 'P0002';
  end if;

  insert into journal_entries (
    run_id,
    user_id,
    day_number,
    tile_id,
    body,
    updated_at
  )
  values (
    p_run_id,
    p_user_id,
    p_day_number,
    v_tile_id,
    p_body,
    v_updated_at
  )
  on conflict (run_id, day_number) do update
    set user_id = excluded.user_id,
        tile_id = excluded.tile_id,
        body = excluded.body,
        updated_at = excluded.updated_at
  returning
    journal_entries.id,
    journal_entries.run_id,
    journal_entries.day_number,
    journal_entries.tile_id,
    journal_entries.body,
    journal_entries.updated_at
  into
    v_journal_id,
    v_journal_run_id,
    v_journal_day_number,
    v_journal_tile_id,
    v_journal_body,
    v_journal_updated_at;

  update runs
  set last_journal_entry = p_body,
      pending_prompt = jsonb_build_object(
        'type', 'day_complete',
        'title', 'Day recorded',
        'body', 'Your notes are saved. You can begin the next day.'
      ),
      updated_at = v_updated_at
  where runs.id = p_run_id
    and runs.user_id = p_user_id;

  id := v_journal_id;
  run_id := v_journal_run_id;
  day_number := v_journal_day_number;
  tile_id := v_journal_tile_id;
  body := v_journal_body;
  updated_at := v_journal_updated_at;
  return next;
end;
$$;

revoke all on function public.persist_journal_entry(
  uuid,
  uuid,
  integer,
  uuid,
  text
) from public;

grant execute on function public.persist_journal_entry(
  uuid,
  uuid,
  integer,
  uuid,
  text
) to authenticated;
