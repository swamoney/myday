-- My Why — add status "state" for the colour-coded pill.
-- Values: '' (not set / neutral), 'good' (on track), 'watch', 'off' (slipping).
-- Run once in the Supabase SQL editor. Idempotent + safe on existing rows.
alter table public.why_pillars
  add column if not exists state text default '';
