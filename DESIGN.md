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

### 2.7 Reuse a calculation; never write a second one

**When a calculation already exists, call it. Do not write your own version.**
Two implementations of the same idea will always drift, and the newer one is
usually the naive one.

**What this cost.** The Year card counts nights away from home using
`_isAwayFromHome(value, modalKey)`, which normalises the address (trim,
lowercase, truncate to 64) and treats each year's most-frequent address as home
even when it was never registered. Adding the same figure to the Almanac, a
fresh version was written that did neither — so any year lived at a different
address, or with the address typed slightly differently, counted **every night
as travel**. The Year card was right and the Almanac was wrong, on the same data,
in the same file.

The same applies to output paths. `pParse`, `priFmt`, `moShow_`, `clTagKey`,
`PRI_OUT` and `rhythmOf` each exist once and are called from the screen, the
print builder, the `.md` export and the zip export. Where that discipline
slipped, sections went missing silently — see §8.

**Before writing any helper, search the file for one that already does it.**
A shared function that is slightly awkward to call is always better than two
functions that agree today.

### 2.8 Page geometry is shared across rooms

Every room uses the same page frame: body `padding:26px 18px 70px`, content
capped at `920px`, at every screen size. The header's italic line is
`rgba(255,255,255,0.7)` in every room.

**Never add a per-room media query that changes the page padding.** My Wealth
carried `16px 12px 60px` below 520px for weeks — its cards sat visibly wider
and higher than every other room on a phone, and nothing flagged it until the
rooms were compared side by side. Per-room font-size tweaks inside a media
query are fine; the page frame is not the room's to change.

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

**My Wealth** (Aug 2026 warm recolour) — the page ground stays the app-wide
blue (`#eef2f8`, gradient `#fbfcfe → #e9eef6`, same as My Why), so walking
between rooms feels like one building; the warmth lives inside the cards only.
Warm-white cards `#fefdf8`, coffee-dark crown and decisions card
`#2a2519 → #3b3322`, navy header `#22315e → #121d3d`, gold `#ebd590`.
Accents as text: Mutual funds `#6c7641` · UCITS ETFs `#916b37` · Direct
equity `#8f4f40`. Bars keep the brighter decorative tones `#8d9858` /
`#bd9153` / `#b1725f` — decorative only, never as text: the text versions are
darkened to clear the 4.5 floor. Page-level chrome (footer icon buttons, auth,
loading) uses the blue-room greys, matching every other room.

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

### 4.6 Before I spend (the decision matrix in My Wealth)

A standalone section, deliberately not wired to the daily log — the daily
summaries were working and earned the right not to be touched.

**Always open, below the holdings.** It began life behind a header button and
the button was removed: a pause tool you must summon is a pause tool you stop
summoning. The page now reads top to bottom as the money kept, then the money
asking to leave.

**The lifecycle.** An item enters through one honest question (categories live
in `DC_CATS` only — §8) and takes one of three fates: parked for review
(30 days by default — the wait is the mechanism), planned with a date worth
waiting for, or let go. Bought closes the loop. The let-go record is the
point: a green number that grows for thirty years.

**Delete lives in the status dropdown** as “Delete — no record kept”,
this feature's version of §4.4's Remove: for mistakes only, one confirm,
nothing kept. The temptation it must survive is deleting let-go items that
were later bought anyway — the archive is only as honest as what stays in it.

**The archive folds by year** (§4.4): current year open, each past year one
bar with its count and let-go total, rows one tap away, nothing pruned (§5).

**The look.** The dark chamber shares the crown's gradient so the two dark
cards bracket the page. Typing fields are warm-white paper slips with dark
writing — on a dark card a dark field is invisible — and every field label
is a gold pill, the band's own colour carried down through the form and into
the edit popup.

### 4.7 The pillar passbook (My Why, Aug 2026)

Each why's four-quadrant time matrix became a **passbook**: a standing block
and a dated ledger. Not *when will I act* but *where I am heading, and what I
actually did*.

**The standing block** holds two renamable lists — starter names “Now” and
“Lineups”, two-three items each works best — with a “since Month Year” on
the first. **Every why names its own sections** (Parents may speak of rituals
and dreams, Health of habits and milestones); renaming never touches data.
**Items are individual rows**, each with a tap-circle in the pillar's solid.
**Completing is the only bridge to the trail**: tap the circle (or Complete in
the item popup) and the item leaves the list and lands in the trail as ✓,
dated that month, on its own. The item popup's other doors are edit-and-save
and “Delete — no record kept” (§4.4's Remove). Any change to the Now list
— add, complete, delete — refreshes its “since”. **One door for
everything: + Add Journey**, up top in the pillar's solid (solid carries
white), serves all three places — its popup asks where (Now, Lineups, or The
trail, the first two wearing the why's own heading names) and the month field
appears only for the trail. Editing a trail entry never moves it between
places. **Rename pencils show only in the roadmap's existing Edit mode**
(rm-editing) — reading mode is circles, items, and the one button, nothing
else. There is deliberately no
automatic changed-course logging: with explicit doors, a direction that ends
is either completed (recorded) or deleted (not); anything worth narrating goes
into the trail in the person's own words.

**The ledger** is task-first, then Month Year; every new entry is a ✓.
The note kind is retired from the interface — legacy migrated notes
(“Parked:…”, delegations) keep their quiet · read-only, and editing one
never changes its kind. Current year flat, past years folded (§4.4, reusing
pr-yr), counted “N · M ✓”. Nothing pruned (§5). The standing block and
the trail carry no buttons of their own; old records enter through the one
door with their true month, and the present writes itself, one completed
circle at a time.

**Colour**: each why wears its own RAINBOW hue — ink for all text, solid for
decoration only (borders, bullets); solid fails the 4.5 floor as text on the
tints, ink clears 9.4–13.8 on all seven. Tint = lt blended 26% into white.

**Data**: rides `why_pillars.roadmap` JSON as `pp` — no new table, no backup
change. `rmParse.norm()` strips unknown keys, so `pp` is carried through
explicitly; forgetting that would silently drop the passbook on every read.
**The old `targets` array is never rewritten**: `ppFrom_` reads it once when
`pp` is absent (open q1 → now, q2+q3 → toward, open q4 → “Parked” notes,
closed → dated entries), so the migration is fully reversible and the
quadrants remain in every backup. The long-view essay below is untouched.

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

It ends with a query listing the tables the backup expects. **It should return 17
rows.** A missing row means data is not being backed up.

Never write a migration that cannot be run twice. You will lose track of what has
run, and a migration you are afraid to re-run is a migration you will not run.

---

### 7.1 SQL is plain ASCII with sparse comments

**No em dashes, no box-drawing rules, no decorative comment headers.** Write the
statements and little else.

**Why.** A migration written in the prose style of this document failed twice in
one session. A header line reading `-- MY LIBRARY — Wisdom becomes...` lost its
`--` somewhere between here and the SQL editor, so Postgres read `MY LIBRARY` and
went looking for a table called `My`. It also tripped Supabase's RLS linter into
warning about a table of that name. Removing every comment and every non-ASCII
character fixed both at once.

The style that reads well in a document is not the style that survives being
copied into a query editor.

## 8. Working practices

**Files:** working copies in `/home/claude/myday/`, deliverables copied to
`/mnt/user-data/outputs/` and presented.

**Deployment:** push to `swamoney/myday`, bump `?v=` on changed assets. Without the
bump the browser serves stale CSS and the change appears not to have happened.

**A section in My Library is defined in four places** and they must agree: the
chip markup in `favSeg`, the option in the `fSection` dropdown, the entry in
`SECTIONS`, and the colour variables in the chip's own CSS. Adding Wisdom needed
all four; missing the chip made the section unreachable, and missing the dropdown
option made every wisdom-only field invisible. The first two now check themselves
on load and warn in the console when they diverge.

**The decision matrix's categories are defined once**, in `DC_CATS` in
`wealth.html`. The question buttons, the chips, the verdicts, the edit
dropdown, the print body and the `.md` export all read from it. Never restate
a category, its colour or its wording anywhere else.

**There are four output paths, and they are separate code.** The screen, the
print builder, the person `.md` export and the zip export each render the same
data independently. Changing one does **not** change the others.

This has caused four bugs: print missing the matrix and ledger; the roadmap print
missing its targets; the zip export reading `c.why_html`, a field that no longer
existed, so every person exported as a name with nothing under it; and the person
`.md` missing last spoke, the matrix, the ledger, conversations, tag and rhythm.

**When a section is added or renamed, update all four.** They share helpers where
possible (§2.7); where they cannot, they must be changed together in one edit.

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
