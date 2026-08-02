# MyDay — the constitution

This app is meant to last thirty years. That single fact decides almost everything
below. Where a rule seems fussy, it is usually because something went wrong once
and this is the note that stops it going wrong again.

Written August 2026.

---

## 1. What the app is

A personal life-tracking app for one person, used daily, intended to outlive every
framework fashionable at the time of writing.

**Five rooms:**

| Room | File | Holds |
|---|---|---|
| Hub | `index.html` | the way in |
| My Day | `daily.html` | the daily log, spending, almanac |
| My Why | `why.html` | pillars, circle, priority, mantras, bucket list, explore list |
| My Favourites | `favourites.html` | bookmarks |
| My Wisdom | `wisdom.html` | quotes and passages worth keeping |
| My Inner Life | `introspection.html` | private entries |
| Restore | `restore.html` | reading a backup back in |

Plus `note-editor.js`, shared by every room, and `DESIGN.md` — this file.

**Stack:** pure HTML, CSS and JavaScript. Supabase for data, Vercel for hosting.
No build step, no framework, no package manager.

**Why no framework.** A framework is a bet that someone else will keep maintaining
it for thirty years. Nobody will. A single HTML file with inline styles and vanilla
JS will open in a browser in 2056; a 2026 build toolchain will not. This is the
most important decision in the project and it should not be revisited without a
very good reason.

---

## 2. Rules that exist because something broke

### 2.1 Every new CSS class carries a prefix

`bk-` bucket, `pl-` places, `mt-` mantra, `pr-` priority, `p-` person page,
`rm-` roadmap, `rmx-` roadmap matrix, `mo-` moments.

**Why.** Six collisions have happened in this file: `.pin`, `.sticky`, `#cardFav`,
`.lib-count`, `.c-ic svg`, and `.rule`. The last one is the clearest lesson —
`.rule` already meant *the gold rule under the roadmap number*, and reusing it for
a divider would have silently restyled it. Nobody would have noticed for weeks.

Assume every short, obvious class name is already taken somewhere in a 5,000-line
file. It usually is.

### 2.2 Scope every search to the thing you mean

When editing, never match on a bare string that could appear in both CSS and
markup. `data-sec="priority"` matched a CSS rule before it matched the nav strip,
and sliced the wrong region of the file.

Anchor to the containing block first, then search within it.

### 2.3 Assert exact counts before replacing

Build edits use a helper that refuses to run unless the anchor appears exactly the
expected number of times:

```python
def rep(h, old, new, n=1):
    assert h.count(old) == n, ('COUNT', h.count(old), old[:70])
    return h.replace(old, new)
```

**Why.** This has caught: a `.rule` collision, an anchor that appeared three times
when one was assumed, an anchor changed by an earlier edit, and several one-character
mismatches (`gap:11px` versus `gap:12px`). Every one of those would have been a
silent bug. **An edit that fails loudly is worth ten that succeed quietly.**

### 2.4 Verify before shipping

Every build run ends with:

- `node --check` on the extracted `<script>` contents
- `<div>` / `</div>` balance
- `<section>` / `</section>` balance
- no dangling `el('id')` references to elements that do not exist
- the specific assertions for whatever was just built

Then copy to `/mnt/user-data/outputs/` and present.

### 2.5 Measure contrast, never judge it by eye

**Floor: 4.5:1** for any text, including 8px eyebrows and chips.

Failures caught this way, every one of which looked fine on screen:

- terracotta mantra chip, selected: **4.28**
- white on the pillar rainbow mid-tones: yellow **2.16**, orange 3.33, green 3.83
- Q3 amber on its own 12% tint: **4.04**
- Active Circle accent on its own wash: **3.96**
- softened Q3 on the cream page: **4.36**

When a colour fails, derive the fix by search rather than guessing a hex:

```python
k = 1.0
while ratio(candidate, ground) < 4.6 and k > 0.3:
    k -= 0.02
    candidate = darken(colour, k)
```

### 2.6 Colours must be spaced in hue, not only in contrast

The six My Why chips sit at hues 42, 65, 175, 211, 257, 345 — closest pair 23°
apart. Two colours can both pass contrast and still be indistinguishable from each
other. Check the gap to every existing colour, not just to the background.

---

## 3. How work gets done

**Mock first, always.** Static HTML with labelled options at real phone width,
before any code. Rahul picks by code — "B5", "N1 with moments first", "S3". Nothing
is built from a description alone; the mock is the specification.

**Show the honest case in mocks.** If a section is usually empty, mock it empty.
The person-page matrix looks fine with four full quadrants and wrong with one — so
the mock keeps Q4 empty. **A mock that flatters the design is worse than no mock.**

**Show it twice.** Rich and sparse. Desktop and phone. The sparse state is what
most pages will look like for most of thirty years.

**Reverting is normal.** F2 typography, the pin board, the sticky notes, the fading
quadrants — all built, all reverted after seeing them in practice. That is the
process working, not failing.

**Say when a change is wrong.** A matrix on a person's page asks you to sort your
mother into "not thinking, for now". Flag it, mock the alternatives, then build
whatever is chosen.

---

## 4. Design decisions already made

### 4.1 Type

| Face | Used for |
|---|---|
| Fraunces | headings and serif display in most rooms |
| Newsreader | the person page — names and long writing |
| IBM Plex Sans | body text and UI |
| IBM Plex Mono | eyebrows, labels, dates, counts |
| Caveat | handwriting accents |

**All font sizes are in `rem`** in all seven files, with `html { font-size:100% }` anchoring the scale.
This means the reader's own text-size setting is honoured. Borders, radii, padding
and shadows stay in `px` — they are physical measurements, not text, and should not
scale.

### 4.2 Colour

**My Why chips** — Pillars `#8a6f2f` · Circle `#98455a` · Priority `#5b4a86` ·
Mantra `#63682f` · Bucket `#2F6F6A` · Explore `#2c5f96`.

**The rainbow** (pillar medallions) carries a light tone, a deep tone, an ink and a
`solid` shade. The `solid` exists because the mid-tones cannot carry white text —
use it for anything filled.

**My Circle bands** — Close `#35786f` · Confidants `#3a5b9c` · Active Circle
`#8a6f43` · Community `#6d5474` · Wider World `#5f6b85`. Two of these cannot carry
their own accent on their own wash, so the chip ink is set per band.

**The person page has its own palette** — sage and cream, `#EFEEE9` ground,
`#2F4B3F` deep. This is deliberate: a person is not a ledger entry. It is the one
place the app breaks its own visual language.

### 4.3 The three matrices

Same grid, three vocabularies, and they must not be merged:

| Room | Axes | Q1 · Q2 · Q3 · Q4 |
|---|---|---|
| My Priority | urgent / important | Do · Decide · Delegate · Delete |
| Roadmap | sooner / active | Current priority · Building toward · Long game · Not thinking, for now |
| Person page | sooner / active | Current priority · Next in line · Long game · Not thinking, for now |

**Why they differ.** My Priority sorts tasks by urgency. The roadmap sorts targets
by horizon. A person's page sorts intentions. Same shape, different questions.

### 4.4 Closing something, everywhere

Four doors: **✓ Done · → Delegated · × Cancelled · 🗑 Remove**.

Remove deletes outright with a warning; the other three keep a dated record with a
reason. The archive folds by year, current year open.

**Why four.** A task you decided against is not the same as a task you finished,
and in ten years the difference is the interesting part. Remove exists for mistakes
only.

### 4.5 Emptiness

**An empty section shows its heading and its button. Nothing else.**

No "nothing recorded yet", no reassurance, no placeholder rows. The heading says
the section exists; the button says how to fill it. Anything more is a line you
will read a thousand times.

The header uses **an em dash** for no data — the convention printed tables have used
for centuries. Silent, never wrong, never dated.

**Exception:** the long note keeps its placeholder, because a blank writing surface
gives no clue what to write.

---

## 5. Things that will grow without limit

Most sections have a natural ceiling — four quadrants, five bands, a handful of
moments. Three do not:

**The long note.** Could be forty paragraphs by 2056. It gets full width at a
**660px measure** (about 70 characters) and lives below the structured sections so
it can grow without touching the layout.

**Recent conversation.** A weekly call is 52 records a year, 1,500 over thirty
years. Currently a plain list, which is fine while entries are selective. When it
starts feeling heavy, the answer is **not** paging: keep recent entries in full and
collapse older years into counts. A line reading "Sunday, as always" from 2029 is
worth nothing alone and a great deal in aggregate.

**Never prune the data, whatever the display shows.** The aggregate view only works
if nothing was thrown away.

---

## 6. Backup — the part that actually matters

Two lists must contain **exactly the same table names**:

- `EXPORT_TABLES` in `note-editor.js`
- `TABLES` in `restore.html`

Currently thirteen: `entries`, `user_prefs`, `bookmarks`, `iw_entries`, `wip_notes`,
`why_pillars`, `why_mantras`, `why_circle`, `why_priority`, `bucket_items`,
`why_places`, `wisdom`, `note_versions`.

**Adding a table without adding it to both lists means that data sits outside every
backup ever taken, silently.** This happened: `bucket_items`, `why_places` and
`why_priority` were missing from both for weeks. Nothing warned about it.

**When adding a table, in order:**

1. Write the migration in `migrate_catchup.sql` — `if not exists`, RLS enabled, own-rows policy
2. Add it to `EXPORT_TABLES`
3. Add it to `TABLES` in `restore.html`
4. Take a backup and confirm the new table appears in it

**Test a restore occasionally.** A backup you have never restored is a hope, not a
backup.

### 6.1 Four ways a backup has silently failed

All four were found on one evening in August 2026, by checking rather than trusting.
Every one produced a backup that looked perfectly healthy.

**1 · Tables missing from the lists.** `bucket_items`, `why_places` and
`why_priority` were in neither list for weeks. Nothing warned. See the procedure
above.

**2 · Supabase caps a plain `select()` at 1000 rows.** The database held 2,761
daily entries; the backup contained exactly 1,000 and said nothing. A round number
in a row count is a warning sign, not a coincidence.

The export now pages with `.range(from, from + 999)` until a short block returns.
**This applies to every table**, and will bite again the first time another table
crosses 1,000 rows — `note_versions` is at 109 and grows with every edit.

*How to check:* run `select count(*) from public.<table>;` in Supabase and compare
it against the count `restore.html` reports. They must match.

**3 · Not every table has `created_at`.** Adding `ORDER BY created_at` to the
paging broke `user_prefs` and `note_versions`, exporting **zero rows** from both.
The sort column is now chosen per table, and a rejected sort falls back to an
unsorted fetch rather than losing the table. **Never let a sorting preference cost
you data.**

**4 · A shared script with no `?v=` never updates.** `note-editor.js` was loaded
unversioned by all four pages, so a fixed file could sit on GitHub while every
browser kept running the old one. A fix can look deployed and not be.

**Every `<script src>` for a shared file carries a version parameter.**

**The lesson common to all four:** the backup reported success in each case.
Only counting rows against the database found them.

---

## 7. Migrations

`migrate_catchup.sql` is **idempotent** — safe to run any number of times. Every
statement is `if not exists`, or drops a policy before recreating it.

It ends with a query listing the tables the backup expects. **It should return 13
rows.** A missing row means data is not being backed up.

Never write a migration that cannot be run twice. You will lose track of what has
run, and a migration you are afraid to re-run is a migration you will not run.

---

## 8. Working practices

**Files:** working copies in `/home/claude/myday/`, deliverables copied to
`/mnt/user-data/outputs/` and presented.

**Deployment:** push to `swamoney/myday`, bump `?v=` on changed assets. Without the
bump the browser serves stale CSS and the change appears not to have happened.

**Print is a separate implementation.** The screen and the print output are built
by different code. Changing one does **not** change the other — this has caused
three bugs. When a section is added or renamed, update both.

**Build scripts live in `/tmp/`** and are throwaway. The output is the deliverable,
not the script.

---

## 9. Open questions

- Should My Circle and My Priority become their own hub rooms? They are the most
  used and live in a room designed for reflection. Advice: use it for a month, then
  decide from experience.
- Should the roadmap and My Priority adopt the person page's softened palette, or
  stay full-strength on their blue-white ground?
- Recent conversation will need the aggregate view eventually. Not yet.
- `restore.html` writes with upsert on id, so a restore adds and updates but never
  deletes. Verify that still holds if the restore logic is ever rewritten.

---

## 10. The test for any future change

> Will this still make sense to me in 2056, when I have forgotten why I built it?

If the answer needs a paragraph of explanation, the design is wrong. If it needs a
framework, a build step or a third-party service, it will not survive. If it makes
an empty page feel like a reproach, it is unkind, and this app is meant to be lived
with rather than obeyed.
