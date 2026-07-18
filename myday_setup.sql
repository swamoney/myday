-- ============================================================================
--  MYDAY — COMPLETE DATABASE SETUP  (disaster-recovery edition, Jul 2026)
-- ----------------------------------------------------------------------------
--  Rebuilds the ENTIRE MyDay database from nothing: all 10 tables, security
--  rules, and indexes. Safe to run on an existing database too (idempotent:
--  it only creates what is missing and never touches data).
--
--  RECOVERY USE: new Supabase project -> SQL Editor -> paste ALL of this ->
--  RUN. Then restore data with restore.html + your .json backup.
--
--  VERIFIED: every table below was cross-checked column-by-column against
--  the live database's information_schema on 18 Jul 2026. This file rebuilds
--  the database exactly as it exists.
-- ============================================================================

-- ---------- helper: identical owner-only security on a table ----------
-- (written out per-table below so this file has zero dependencies)

-- ============================= MY DAY =======================================
create table if not exists public.entries (
  -- VERIFIED against the live database (Jul 2026): keyed by user+date, no id.
  user_id                uuid not null references auth.users(id) on delete cascade,
  entry_date             date not null,
  -- money
  regular_investment text default '', top_up text default '', investment_redemption text default '',
  food text default '', food_note text default '',
  dmart text default '', groceries_note text default '',
  uber text default '', transport_note text default '',
  shopping text default '', shopping_note text default '',
  hotel_stay text default '', hotel_stay_note text default '',
  travel text default '', travel_note text default '',
  entertainment text default '', entertainment_note text default '',
  taxes text default '', taxes_note text default '',
  credit_card_bill text default '', credit_card_bill_note text default '',
  -- day
  walk text default '', heart text default '', reading text default '',
  reading_takeaway text default '', overall_satisfaction text default '',
  introspection text default '',
  slot1 text default '', slot2 text default '', slot3 text default '',
  slot4 text default '', slot5 text default '', slot6 text default '',
  breakfast text default '', lunch text default '', dinner text default '',
  night_stay text default '', stayed_with text default '',
  recurring_log text default '', other_log text not null default '[]',
  updated_at             timestamptz default now(),
  primary key (user_id, entry_date)
);
alter table public.entries enable row level security;
drop policy if exists "entries_owner_all" on public.entries;
create policy "entries_owner_all" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists entries_user_date_idx on public.entries (user_id, entry_date desc);

-- ============================ USER PREFS ====================================
create table if not exists public.user_prefs (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  prefs       jsonb default '{}'::jsonb,
  updated_at  timestamptz default now()
);
alter table public.user_prefs enable row level security;
drop policy if exists "user_prefs_owner_all" on public.user_prefs;
create policy "user_prefs_owner_all" on public.user_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ========================== MY FAVOURITES ===================================
create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  url         text not null,
  type        text default '',
  tags        jsonb default '[]'::jsonb,
  note        text default '',
  section     text not null default 'all-time',
  source_url  text default '',
  favourite   boolean not null default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.bookmarks add column if not exists section text not null default 'all-time';
alter table public.bookmarks add column if not exists note text default '';
alter table public.bookmarks add column if not exists source_url text default '';
alter table public.bookmarks add column if not exists favourite boolean not null default false;
alter table public.bookmarks enable row level security;
drop policy if exists "bookmarks_owner_all" on public.bookmarks;
create policy "bookmarks_owner_all" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists bookmarks_user_section_idx on public.bookmarks (user_id, section, created_at desc);

-- ========================== MY INNER LIFE ===================================
create table if not exists public.iw_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null default 'essay',
  title       text not null,
  status      text default '',
  essence     text default '',
  body        text default '',
  tags        jsonb default '[]'::jsonb,
  favourite   boolean not null default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.iw_entries add column if not exists favourite boolean not null default false;
alter table public.iw_entries enable row level security;
drop policy if exists "iw_entries_owner_all" on public.iw_entries;
create policy "iw_entries_owner_all" on public.iw_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists iw_entries_user_created_idx on public.iw_entries (user_id, created_at desc);

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
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists wip_notes_user_sort_idx on public.wip_notes (user_id, sort_order asc, created_at asc);

-- ============================= MY WHY =======================================
create table if not exists public.why_pillars (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  code            text not null default '',
  num             text not null default '',
  brk             text not null default '',
  label           text not null default '',
  current_status  text not null default '',
  state           text default '',
  notes           text not null default '',
  sort_order      integer not null default 0,
  roadmap         text default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.why_pillars add column if not exists state text default '';
alter table public.why_pillars add column if not exists roadmap text default '';
alter table public.why_pillars add column if not exists updated_at timestamptz not null default now();
alter table public.why_pillars enable row level security;
drop policy if exists "why_pillars_owner_all" on public.why_pillars;
create policy "why_pillars_owner_all" on public.why_pillars
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.why_mantras (
  id          bigint generated by default as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  text        text not null,
  meaning     text default '',
  source      text default '',
  favourite   boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.why_mantras enable row level security;
drop policy if exists "own mantras" on public.why_mantras;
create policy "own mantras" on public.why_mantras
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists why_mantras_user_fav_idx
  on public.why_mantras (user_id, favourite desc, created_at desc);

create table if not exists public.why_circle (
  id          bigint generated by default as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  band        text not null default 'close',
  note        text default '',
  page        text default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.why_circle add column if not exists page text default '';
alter table public.why_circle add column if not exists updated_at timestamptz not null default now();
alter table public.why_circle enable row level security;
drop policy if exists "own circle" on public.why_circle;
create policy "own circle" on public.why_circle
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists why_circle_user_band_idx
  on public.why_circle (user_id, band, created_at asc);

-- ============================ MY WISDOM =====================================
create table if not exists public.wisdom (
  -- VERIFIED against the live database (Jul 2026).
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  source_type  text,
  source_name  text,
  essence      text,
  tags         jsonb default '[]'::jsonb,
  content      text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table public.wisdom enable row level security;
drop policy if exists "wisdom_owner_all" on public.wisdom;
create policy "wisdom_owner_all" on public.wisdom
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ========================= VERSION HISTORY ==================================
create table if not exists public.note_versions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  source      text not null,
  source_id   text not null,
  content     text not null default '',
  saved_at    timestamptz not null default now()
);
alter table public.note_versions enable row level security;
drop policy if exists "note_versions own rows" on public.note_versions;
create policy "note_versions own rows" on public.note_versions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists note_versions_lookup
  on public.note_versions (user_id, source, source_id, saved_at desc);

-- ============================== DONE ========================================
-- All 10 tables exist with owner-only security. The app can now sign in;
-- use restore.html with your .json backup to bring the data home.
