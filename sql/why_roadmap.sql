-- My Why — long-term roadmap per pillar.
-- Stores BOTH the essay and the milestones as JSON in one text column:
--   { "essay": "…", "milestones": [ { "t": "step", "y": "2029", "done": false } ] }
-- One column keeps it simple: no extra table, no extra RLS policy, and it
-- travels with the pillar row you already own.
-- Run once in the Supabase SQL editor. Idempotent + safe on existing rows.
alter table public.why_pillars
  add column if not exists roadmap text default '';
