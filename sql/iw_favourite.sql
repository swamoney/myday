-- My Inner Life — favourite flag + Life Experiences section.
-- 'favourite' powers the star on each entry (favourites sort to the top).
-- No migration is needed for the new "experience" kind: iw_entries.kind is
-- free text, so it just works.
-- Run once in the Supabase SQL editor. Idempotent + safe on existing rows.
alter table public.iw_entries
  add column if not exists favourite boolean not null default false;

-- Helps the favourites-first ordering stay fast as entries pile up over the years.
create index if not exists iw_entries_user_fav_idx
  on public.iw_entries (user_id, favourite desc, created_at desc);
