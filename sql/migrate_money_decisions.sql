-- money_decisions: the matrix that runs before money moves.
-- Idempotent. Safe to run any number of times.
-- Append this to migrate_catchup.sql, replacing its final check query
-- with the one at the bottom of this file (17 rows now, not 13).

create table if not exists public.money_decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cost numeric default 0,
  category text,
  status text default 'reviewing',
  review_on date,
  target_label text,
  decided_on date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.money_decisions enable row level security;

drop policy if exists "own rows" on public.money_decisions;
create policy "own rows" on public.money_decisions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists money_decisions_user_idx
  on public.money_decisions (user_id, created_at);

-- The backup check. Must return 17 rows. A missing row means data
-- is not being backed up.
select table_name from information_schema.tables
where table_schema = 'public' and table_name in (
  'entries','user_prefs','bookmarks','iw_entries','wip_notes',
  'why_pillars','why_mantras','why_circle','why_priority',
  'bucket_items','why_places','wisdom','note_versions',
  'wealth_holdings','wealth_snapshots','wealth_meta','money_decisions'
) order by table_name;
