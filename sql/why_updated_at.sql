-- Cross-device conflict detection needs a change stamp on the two My Why
-- tables (bookmarks and iw_entries already have one).
-- Run BEFORE deploying the matching why.html. Idempotent.

alter table public.why_pillars
  add column if not exists updated_at timestamptz not null default now();

alter table public.why_circle
  add column if not exists updated_at timestamptz not null default now();
