# MyDay — personal daily tracker

A private daily-life tracker. Self-hosted, no cost, runs entirely in the browser, data stored in your own Supabase database.

## Files

- `myday.html` — the app itself. Open this in a browser.
- `config.js` — your Supabase credentials. Edit before first use.
- `README.md` — this file.

## Setup

See the conversation that produced this project for the full step-by-step Phases 1–8.

## How it works

1. The app loads in any modern browser
2. Supabase JS client connects to your private database using the anon key in `config.js`
3. You sign in with your email + password
4. All entries read/write directly to your Supabase database
5. Row-level security ensures only you can see your own data

## Credentials safety

The values in `config.js` are anon/public credentials. They're designed for browser code and are safe to commit publicly. Your data is protected by Supabase row-level security, not by hiding these values.

Never put the `service_role` key in this file or anywhere in the repository — that key bypasses security.
