-- ============================================================
-- My Introspections and Writing — schema
-- Run once in the Supabase SQL editor (project xxcgryckwamzykzwcsrp).
-- Safe to re-run: uses IF NOT EXISTS + idempotent policies.
-- ============================================================

-- 1) The unified library: writing pieces + reflections in one table.
--    kind: 'essay' | 'post' | 'thread' | 'note' | 'reflection'
--    status is only meaningful for writing kinds ('' for reflections).
create table if not exists public.iw_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null default 'essay',
  title       text not null,
  status      text default '',
  essence     text default '',
  body        text default '',
  tags        jsonb default '[]'::jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.iw_entries enable row level security;
drop policy if exists "iw_entries_owner_all" on public.iw_entries;
create policy "iw_entries_owner_all" on public.iw_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index if not exists iw_entries_user_created_idx
  on public.iw_entries (user_id, created_at desc);

-- 2) The Work-in-Progress pinboard (shared sticky notes for this room).
create table if not exists public.wip_notes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  heading      text default '',
  body         text default '',
  color_index  int  default 0,
  sort_order   int  default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table public.wip_notes enable row level security;
drop policy if exists "wip_notes_owner_all" on public.wip_notes;
create policy "wip_notes_owner_all" on public.wip_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index if not exists wip_notes_user_sort_idx
  on public.wip_notes (user_id, sort_order asc, created_at asc);
