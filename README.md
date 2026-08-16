# MyDay — one life, tracked well

A private life-tracking app built for thirty years of daily use. Self-hosted,
no cost, pure HTML/CSS/JS in the browser — no framework, no build step — with
all data in your own Supabase database. Design decisions and hard-won lessons
live in `DESIGN.md`, the project's constitution.

## The rooms

| File | Room |
|---|---|
| `index.html` | The Hub — the way in (installable via `hub.webmanifest`) |
| `daily.html` | My Day — daily log, spending, almanac |
| `why.html` | My Why — pillars & journey pages, circle, priority, mantras, bucket list |
| `wealth.html` | My Wealth — investments, snapshots, Before-I-spend |
| `favourites.html` | My Library — music, podcasts, books, wisdom & more |
| `introspection.html` | My Inner Life — private entries |
| `restore.html` | Restore — reading a backup back in |

Shared machinery: `note-editor.js` (rich text, backup/export for all rooms),
`config.js` (your Supabase credentials), `icon-180.png` (iOS home-screen icon),
and the `sql/` folder — every migration ever run, the schema's own history.

## Setup

1. Create a free Supabase project; run the migrations in `sql/` in order.
2. Put your project URL and anon key in `config.js`.
3. Host the repo anywhere static (Vercel works well) — or open locally.
4. Sign in with your Supabase email + password. Add the hub to your phone's
   home screen for the full-app feel.

## Backups

Every room can export, and the full-app backup (from any room's backup button)
zips all 18 tables. `restore.html` reads a backup back in, table by table.
Rule of the house: any new table joins the backup and restore lists the same
day it is born.

## Credentials safety

The values in `config.js` are anon/public credentials, designed for browser
code and safe to commit. Your data is protected by Supabase row-level
security, not by hiding these values.

Never put the `service_role` key in this file or anywhere in the repository —
that key bypasses security.
