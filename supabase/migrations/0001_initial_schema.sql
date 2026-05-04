create extension if not exists pgcrypto;

create type run_status as enum ('active', 'won', 'dead_continuable', 'ended');
create type terrain_type as enum ('unknown', 'forest', 'mountains', 'grasslands', 'desert', 'swamp', 'impassable');
create type icon_type as enum ('village', 'enemy', 'quest', 'treasure', 'impassable');
create type action_type as enum ('start_run', 'next_day', 'move', 'roll', 'resolve_event', 'combat_action', 'camp', 'journal', 'end_run');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(80),
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(120) not null default 'Miru Run',
  rules_version varchar(40) not null default 'miru1v2e',
  status run_status not null default 'active',
  current_day integer not null default 1 check (current_day >= 1),
  current_tile_id uuid,
  hp integer not null default 10 check (hp >= 0 and hp <= 20),
  ep integer not null default 10 check (ep >= 0 and ep <= 20),
  base_atk integer not null default 1,
  base_def integer not null default 1,
  bitliths integer not null default 0 check (bitliths >= 0),
  starvation_count integer not null default 0 check (starvation_count >= 0),
  sleep_deprivation_count integer not null default 0 check (sleep_deprivation_count >= 0),
  minor_injury_count integer not null default 0 check (minor_injury_count >= 0),
  active_enemy jsonb,
  active_effects jsonb not null default '[]'::jsonb,
  pending_prompt jsonb,
  last_journal_entry text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table run_tiles (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  row_number integer not null check (row_number between 1 and 12),
  column_letter char(1) not null check (column_letter between 'A' and 'I'),
  terrain terrain_type not null default 'unknown',
  visited boolean not null default false,
  icons icon_type[] not null default '{}',
  event_history jsonb not null default '[]'::jsonb,
  repeatability_state jsonb not null default '{}'::jsonb,
  enemy_state jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, row_number, column_letter)
);

alter table runs
  add constraint runs_current_tile_fk
  foreign key (current_tile_id) references run_tiles(id);

create table run_inventory (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key varchar(120) not null,
  item_name varchar(160) not null,
  category varchar(80) not null,
  quantity integer not null default 1 check (quantity >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, item_key)
);

create table tech_skills (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_key varchar(120) not null,
  skill_name varchar(160) not null,
  unlocked boolean not null default false,
  training_level integer not null default 0 check (training_level between 0 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, skill_key)
);

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null check (day_number >= 1),
  tile_id uuid references run_tiles(id) on delete set null,
  body text not null check (char_length(body) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table action_log (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type action_type not null,
  day_number integer not null,
  tile_id uuid references run_tiles(id) on delete set null,
  input jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  dice_rolls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table content_versions (
  id uuid primary key default gen_random_uuid(),
  key varchar(80) not null unique,
  source_name varchar(160) not null,
  status varchar(40) not null default 'draft',
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index runs_user_status_idx on runs (user_id, status, updated_at desc);
create index run_tiles_run_coordinate_idx on run_tiles (run_id, row_number, column_letter);
create index run_inventory_run_category_idx on run_inventory (run_id, category);
create index journal_entries_run_day_idx on journal_entries (run_id, day_number);
create index action_log_run_created_idx on action_log (run_id, created_at);
create index action_log_run_day_idx on action_log (run_id, day_number);
