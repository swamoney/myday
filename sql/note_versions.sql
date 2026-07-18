-- Version history for all notes (Favourites, Inner Life, Roadmap, Circle).
-- One shared table; the app keeps the newest 20 versions per note and prunes
-- the rest automatically. Run once in the Supabase SQL editor. Idempotent.

create table if not exists public.note_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source text not null,          -- 'bookmark' | 'inner' | 'roadmap' | 'circle'
  source_id text not null,       -- id of the note/entry/pillar/person
  content text not null default '',
  saved_at timestamptz not null default now()
);

create index if not exists note_versions_lookup
  on public.note_versions (user_id, source, source_id, saved_at desc);

alter table public.note_versions enable row level security;

drop policy if exists "note_versions own rows" on public.note_versions;
create policy "note_versions own rows" on public.note_versions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
