-- My Favourites — six sections + notes.
-- Run once in the Supabase SQL editor. Idempotent, non-destructive:
-- existing bookmarks default to 'all-time', so nothing is lost or moved.

-- Which section a favourite belongs to (B2: exactly one home each).
--   all-time | books | podcasts | marathi | movies | music
alter table public.bookmarks
  add column if not exists section text not null default 'all-time';

-- 'note' already exists for most installs; add if missing (your highlight / takeaway).
alter table public.bookmarks
  add column if not exists note text default '';

-- 'source_url' — for Marathi (required in-app) and the optional source link on
-- Books/Podcasts/Movies notes. The existing 'url' stays as the play/open link
-- (used by All-Time and Music).
alter table public.bookmarks
  add column if not exists source_url text default '';

-- Star an entry as an all-time favourite from within any section (optional flag).
alter table public.bookmarks
  add column if not exists favourite boolean not null default false;

create index if not exists bookmarks_user_section_idx
  on public.bookmarks (user_id, section, created_at desc);
