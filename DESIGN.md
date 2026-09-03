# MyDay — the constitution

This app is meant to last thirty years. That single fact decides almost everything
below. Where a rule seems fussy, it is usually because something went wrong once
and this is the note that stops it going wrong again.

Written August 2026.

---

## 1. What the app is

A personal life-tracking app for one person, used daily, intended to outlive every
framework fashionable at the time of writing.

**The rooms:**

| Room | File | Holds |
|---|---|---|
| Hub | `index.html` | the way in |
| My Day | `daily.html` | the daily log, spending, almanac |
| My Why | `why.html` | pillars & journey pages, circle, priority, mantras, bucket list, explore list |
| My Wealth | `wealth.html` | investments, snapshots, the Before-I-spend chamber |
| My Library | `favourites.html` | seven sections — music, podcasts, books, wisdom & more |
| My Inner Life | `introspection.html` | private entries |
| Restore | `restore.html` | reading a backup back in |

Plus `note-editor.js` (shared by every room), `hub.webmanifest` + `icon-180.png`
(what makes the hub installable on a phone), the `sql/` folder (every migration,
the schema's own history), and `DESIGN.md` — this file.

**Dead-code purge, Aug 2026.** A three-part audit (unreferenced functions,
CSS classes unused outside comments, dangling id refs) removed ~95KB / 10.8%
of daily.html: six superseded Trends faces, the old chart system, the classic
Today progress ring (a guarded zombie — its markup left long ago, the
renderer no-opped on every save), five orphaned helpers, and ~330 CSS rules
of removed features (hotel list, week grid, outflow-breakdown variants,
total-card era, and the dead functions' own private styles — CSS cascades:
removing a function kills the classes only it rendered). Plus slugify
(favourites), _grab (note-editor), ic-fav/shade-fav (hub). Rules learned:
comments must not vote in liveness detection (a stale comment kept
.today-progress "alive"); dynamically-created ids (exp-footer-redemption)
defeat dangling-id scans — grep for `.id =` before declaring one dead; and a
class family sharing a prefix is not one feature (outflow-bd-tape was dead,
outflow-bd-card is load-bearing). When a feature is retired, its functions,
calls, markup, AND CSS leave the same day — half-removed features become
zombies that every future audit must re-litigate.

**The month's envelopes** (POS-2, Aug 2026): My Day's Month view gained
a budget ledger seated between the stat tiles and the heatmap - POS-2
after three mock rounds and a full-scroll rehearsal. Seven envelopes
under one mapping contract, recorded verbatim in the engine's comment:
p1 food+dmart; p2 recurring home+subscriptions; p3 uber+travel; p4
entertainment + otherLog Books & Magazines/Salon/Ironing; p5 shopping;
official = recurring office + recurring named 'chatgpt' (a name
exception layered on top of recurringGroupForName, which stays untouched
for every other organ) + otherLog AI Usage/Software/Printing &
Stationery; misc = taxes + hotelStay + remaining otherLog. Excluded by
contract: GST both directions, credit card (tracking-only), investments.
Bars warn amber at 75 percent, red past the line; rows tap open to show
every source with its origin tag - the trust mechanism. Budgets live in
day_budgets (ym, section, amount, unique per user-month-section), set in
a modal with copy-last-month; loaded at boot beside user prefs. The
table joined backup, audit, and restore in the same commit; cache
version bumped on the four pages that load note-editor.js.

**IL-2 REDESIGN (introspection.html + migrate_inner_v2.sql)** (Aug
2026): My Inner Life remade as four rooms, each with its own furniture
and its own door; the one crowded New modal retired from creation
(kept only for meta-edit). ROOM 1 Musings & Learnings: dense serif
INDEX, timeless (no dates anywhere), Enter quick-add input (no popup),
pencil marker on lines carrying a note, TODAY'S REMINDER surfacing one
line per day (dayN % count - deterministic, no storage). ROOM 2 Life
Timeline: chapter SPINE in the Why-pillars grammar studied from
source - rainbow coin (RB_HUES 7-arc wrapping, roman numeral in the
coin's own ink), YEARS ON THEIR OWN ROW (mono amber), huge serif name,
italic stands-line (essence), AGE pill computed from birth year
(localStorage myday_birth_year, set/change link); the vertical is
DELIBERATELY KIN NOT TWIN to the whys' golden thread: a dashed green
RULED line with a tick at every coin and rounded end-stops - an
instrument that measures. Chapters sort by years_from (new int columns
years_from/years_to via migrate_inner_v2.sql; single year = one label,
open chapter = 'YYYY-'). Door: name + years + optional italic ->
quickInsert -> straight into the editor. ROOM 3 Diary: plain stream -
gratitude is NO LONGER A KIND; chips are the user's own vocabulary
stored in the existing tags column (chipHtml hashes a hue per name;
'gratitude' wears a heart). Tonight's page = find-or-create today's
diary entry (title = the long date phrase) and open the editor. Chip
lens filters the stream; ON THIS DAY resurfaces the same MM-DD from
earlier years. The reader page wears the chips (add via prompt,
tap-to-remove with confirm). Pre-migration gratitude rows read as
diary via displayKind and wear a virtual gratitude chip - byte-safe
until the SQL runs. ROOM 4 My Writings (ES-2): shelf cards with serif
title, italic lead (essence), #tags (tap = search), live word count +
~min at 230wpm + last-touched; door = title prompt -> editor. Legacy
kinds essay/post/thread/note JOIN the room via displayKind (S1: keys
untouched). Reader eyebrows speak per room: MUSING & LEARNING (no
date) / LIFE CHAPTER + years + age / MY DIARY + day / MY WRITING +
length; the chapter's lead line speaks in Caveat hand.
migrate_inner_v2.sql: ALTER years columns + UPDATE gratitude->diary
appending "gratitude" into the text-JSON tags (idempotent, plain
ASCII, verification SELECT at the end).

**DP-2: the date picker works everywhere** (26 Aug 2026): 'unable
to change date on any page' - ROOT CAUSE: .rd-datepick was an
off-screen input (position:fixed; left:-9999px) and the tap door
called showPicker(); Chrome/Safari THROW showPicker on invisible
inputs, and iOS ignores click() on them - so no platform opened the
picker. FIX: the input now lives INSIDE the rd-wr span, absolutely
covering the date text at opacity 0 - a native tap target that
works on every platform; value prefilled at render; the change
handler became a delegate on readerDates (input re-created per
render); showPicker retired to zero refs. Harness: input inside
span, prefilled, change -> created_at update, zero errors (the
harness's 'retitled false' is an env artifact - jsdom's en-US
datePhrase_ differs from the fixture's en-GB-style title; the
retitle guard compares datePhrase_(oldYmd) in the SAME env at
runtime, so real devices retitle correctly). LESSON: hidden-input
date pickers must OVERLAY their trigger, never sit off-screen.

**TH-1: the heading edits in place** (27 Aug 2026): 'unable to
update page heading' - ROOT CAUSE: openModal (the card-era editor
that renamed entries) survives with ZERO callers; DX-3's card
retirement removed its last caller, silently orphaning title editing
- a retirement-law breach caught late (retire to zero refs INCLUDING
the capability, not just the code). FIX: the reader's Edit mode now
makes the H1 itself editable (contenteditable=true via attribute -
Firefox rejects plaintext-only; commit reads textContent so pasted
formatting flattens; Enter blurs); Done commits via _rdTitleCommit
(trimmed, empty keeps old name, unchanged skips the write), updates
the row cache, toasts, and repaints through openReader(id, true) so
chapter sweeps return. RECURSION GUARD: openReader resets edit
state on every open, so setRdEditing(false) commits ONLY when
wasEditing (first harness run recursed to stack overflow; caught,
guarded, re-proven). Harness: Edit -> type -> Done sends
{title:'New Heading'}, zero errors. openModal remains orphaned -
flagged for retirement or reuse next session.

**BK-4: one Arrange, at the foot** (26 Aug 2026): the header
Arrange retired to zero refs (markup, wiring, css); the end-actions
foot button before Edit is the only trigger. Section-leave disarm
kept.

**IN-3: centre / left / right - the writing wraps** (3 Sep 2026):
Rahul asked for alignment; opinion given and taken: left/right
mean the TEXT WRAPS (float, magazine shape), never a cosmetic
shift with blank space. Token keeps data-al (l | r; absent =
centre) - sanitize keeps it ONLY with a data-w below 100 (a
full-width photo has nothing to align to; applyW_ drops data-al
when width returns to full). Edit tools: a moss CENTRE -> LEFT ->
RIGHT chip beside size, hidden at full width. Classes al-l /
al-r float the figure with 18px gutters; every editor's read +
edit roots clear floats after the last figure (::after clear);
phone mercy under 480px: floats fall back to centred blocks
(display only). Print floats the figure the same way. Harness:
chip cycles, FULL hides chip + drops data-al, 3/4 brings it
back, sanitize keeps data-w + data-al, saved body carries it,
read shows the float, print carries float:right + width:75%.

**IN-2: a photo's size lives in its token** (3 Sep 2026, R1+R2,
centred, snapping): the figure token may keep ONE more attribute,
data-w (whole percent 10..99; absent = full) - sanitize keeps it
and nothing else; no columns, no table, bytes stay 1600px. Edit
tools grow a sea size CHIP (cycles FULL -> 3/4 -> 1/2 -> 1/3) and
a round corner HANDLE (mouse + touch; a centred figure widens
both ways so width = 2 x distance from centre; release snaps to
25/33/50/66/75/100). Both call setW_ -> data-w + inline width +
'input' dispatched so the page saves. Read and print honour it
(print figure gets width:N% + margin auto); .md keeps its line.
Phone mercy: below 480px, 25/33 DISPLAY at 50% (CSS only, token
untouched, print honours the true size) - Rahul was told and may
drop it. Videos stay full width. Harness: read width applied,
chip reads 1/2, taps 33 then FULL (attr removed), drag to 520/600
snaps 75, sanitize keeps data-w="75" only, Done saves it, print
carries width:75%. All green.

**IN-1: the body is the album** (3 Sep 2026, Rahul's redesign):
the strip and its boxes retire; photos and videos live IN the
writing at the cursor as blog figures. LAW: the body stores only a
NAKED token <figure data-at="id"></figure> - never a URL (links
rot; tokens don't); bytes/caption/quiet stay in attachments +
private storage and are dressed fresh at render. note-editor.js:
FIGURE allowed; sanitize strips every dressed innard/attribute
but data-at (so signed URLs never reach the database); toolbar =
two doors, camera (act 'photos' -> 'myday-photo') and video
(ICONS.video, 'myday-video'); the old boxes/strip UI gone.
attachments.js v2: mount({host, room, entryId, watch:[readRoot,
editRoot]}) + MutationObserver on the watch roots = any repaint
re-dresses figures (zero per-page hydrate calls); dressFig_
(photo img + figcaption / YouTube nocookie iframe IN THE FLOW /
album dashed door), edit mode adds on-figure tools (caption
input, QUIET, x = row + files gone + 'input' dispatched so the
page saves); figures are contenteditable=false blocks (backspace
removes whole); read-mode tap: quiet reveals, photo opens the
viewer (photos only). Insert: grabRange_ captures the cursor on
the tap, insertFigure_ lands the figure as a block after the
cursor's paragraph (+ an empty <p> to keep writing), dispatches
'input'. Photo = ONE per tap. Legacy rows not referenced by any
token render in the old host strip until placed. FOUR PATHS:
NoteEditor.toMarkdown patched (tokens -> '[photo: caption]',
'[video: caption - url]', '[album...]' from the cache, so .md AND
zip carry them everywhere); NoteEditor.openPrint patched (window
opens ON the tap for pop-up rules, then the page arrives dressed:
signed <img> + caption, video/album as dashed lines with URL;
never a naked token). All nine editors (introspection reader,
library reader, why: bucket/roadmap/circle/mantra/decision/
journey) mount with their read+edit roots. THE Done race (found
by harness): introspection's Done repainted from readerEntry.body
BEFORE the debounced save -> a just-placed figure vanished from
view; readerEdit now saves first, then leaves edit mode.
Harness: read dress + caption, legacy strip only for unplaced,
edit tools + contenteditable=false, video lands after the
cursor's paragraph (P, FIG, P, FIG, P), player dressed, caption
saved, remove deletes both files + figure, sanitize keeps the
naked token and no iframe, Done-then-read shows the player, print
dressed (signed img, caption, VIDEO line, no token), md lines,
bucket + library dress + tools + no old boxes. All green.

**PH-1f: the boxes wait for the camera** (3 Sep 2026): Rahul -
ADD/LINK tiles crowded every editor by default. Now edit mode
shows only KEPT tiles (photos/links already on the page); the
dashed ADD + LINK boxes and the meter stay folded until the
toolbar camera is tapped (tap 1 summons the boxes + scrolls to
them, tap 2 opens the camera roll); Done folds them away again
(showAdd resets in setEditing(false)). Empty page + boxes
unsummoned = the strip takes no room at all. scrollIntoView
guarded for jsdom. Harness: photo tile shows in edit without
boxes, tap 1 summons, tap 2 opens roll, Done+Edit starts folded.

**PH-1e: the law fulfilled - every editor gets its album** (3 Sep
2026): Rahul's law restated ('wherever the editor stands') exposed
that why.html carries SEVEN editors, only bucket wired. Enumerated
every NoteEditor.mount in the app (introspection 1, favourites 1,
why 7; index/audit/daily/wealth mount none - no camera there).
Wired the six missing why.html contexts: ROADMAP (rm, room
'roadmap', per pillar id, host above rmToolbar), CIRCLE person (p,
room 'circle', host above pEssayRO), MANTRA (mt, room 'mantra',
host above mtMeanRO), DECISION (dc, room 'decision', host above
dcStoryBar), JOURNEY pillar-story pages (pp, room 'journey', host
above ppPageBody; writer open flips editing on). Each: mount at
open, setEditing in its toggle fn, orphan-law deleteAll at every
delete site (circle/mantra/decision/roadmap + all three
why_journeys shapes). Also PH-1 polish: .at-strip tiles cap at
110-150px on desktop (were quarter-screen giants), 3-across on
phones. Harness: all four openable contexts mount + show ADD in
edit, zero errors. Root cause of 'works only in library':
introspection.html + why.html on the SERVER were stale - only
favourites had been re-uploaded.

**PH-1d: the camera that answered with silence** (3 Sep 2026):
Rahul: camera button present, tap does nothing. Three silent
paths, all given voices: (1) attachments.js missing -> the camera
now says so in an alert instead of dispatching into the void; (2)
tapped in READ mode -> a guiding toast ('Tap Edit on the page
first'); (3) iOS refuses .click() on display:none file inputs ->
the picker input now hides off-screen (absolute, -9999px, opacity
0), never display:none. Harness: read-mode tap toasts, edit-mode
tap opens the picker, input carries the off-screen style.

**PH-1c: the old image tool retires; the camera takes its seat**
(3 Sep 2026): Rahul saw only the OLD 'Insert image by link'
(Pexels/Wikimedia) in the editor toolbar - two cameras is a
thirty-year confusion and the old one stored rot-prone hotlinks.
Retired to zero refs in note-editor.js: dialog markup, dlg img
fields, imgOk handler, openImg, resolveImageUrl, toolbar button,
ICONS.img. KEPT: rendering of existing inline images in old notes
+ the floating 'Remove image' button (dlg.imgDel serves old
content). In its seat: a camera button (ICONS.photo, act
'photos') that dispatches window event 'myday-photos';
attachments.js listens and opens the file picker of whichever
mounted strip is editing (scrolls to it if none). Harness:
isolated toolbar (photos btn present, img btn gone, dispatch
fires, img dialog gone, link dialog kept) + full introspection
journey (camera in #rdToolbar opens #rdAlbum's picker, no
errors). NOTE for Rahul's sighting: if attachments.js is missing
from the server the strip silently self-disables - upload it +
migrate_photos.sql, hard refresh / incognito for the PWA cache.

**PH-1b: the kit spreads - bucket + library** (1 Sep 2026): the
rollout is only mounting, never rebuilding - each file gains four
touches: the attachments.js script tag, a host div (.rd-album)
above the page body (#bkAlbum before bkWhyRO; #frAlbum before
frBody), MyAlbum.init at session, mount on page open + setEditing
in the edit toggle, deleteAll at every delete site (orphan law),
and the shared at-* CSS block copied into the head style. Rooms:
'bucket' (why.html dream pages), 'library' (favourites.html
readers, incl. doc pages via forcePage pencil). Harness both:
strip mounts with caption, edit tiles + add/link/meter appear, no
errors. REMAINING rooms for later rounds: trips day-level strips,
daily.html, wealth.html, circle, decisions pages; then backup-page
gauges + album zip + monthly reminder; print/md/zip media.

**PH-1a: the album kit lands in the Inner Life reader** (1 Sep
2026): attachments.js born - the editor's companion, built ONCE
(MyAlbum: init/mount/setEditing/unmount/deleteAll). Photos shrink
on the phone (canvas -> webp, 1600px keep + 320px thumb, ~200-300KB
pair), upload to private bucket 'myday-album' under
user/room/entry/, one attachments row each (kind photo | youtube |
album; caption, quiet, sort_order, bytes). Strip renders thumbs via
batch signed URLs (1h); read mode = tiles + viewer (swipe, YouTube
plays as nocookie iframe, quiet unblurs only here); edit mode =
tiles with move/remove/on-tile caption/QUIET + ADD (multi file) +
LINK (YouTube -> inline player, Google Photos -> album door chip;
anything else refused) + the whisper meter (sum of bytes, amber
70% ember 90%). The orphan law: both iw_entries delete sites call
MyAlbum.deleteAll (storage files first, rows after).
migrate_photos.sql: attachments table + RLS (own-rows only) +
bucket + storage policies keyed to auth.uid() folder - plain
ASCII, safe re-run. PENDING Rahul runs it once. Mounted in the
Inner Life reader (#rdAlbum between lead and day book) = five
rooms lit at once (Diary/Musings/Timeline/Trips/Writings).
Harness (stubbed storage): strip mounts, 3 tiles + quiet + yt +
album door, thumbs signed, viewer opens with caption '1 of 3',
third item is the yt iframe, edit shows 4 tiles + add/link/meter,
caption + quiet toggle saved, reorder writes all four sort_orders,
pasted yt link kept, remove deletes BOTH storage paths. All green.
NEXT (PH-1b+): day-level strips for trips, the other files
(why/favourites/daily/wealth/circle), backup-page gauges + album
zip + monthly reminder, print/md/zip carrying media.

**PH-0: photos/video - the standing principles (brainstorm, NOT
built)** (1 Sep 2026): direction discussed and mocked
(mock-photos-shape-v1.html), nothing locked. (1) MyDay is the ALBUM,
not the vault: curated compressed copies live in Supabase Storage
under the user's own auth; the heap and long videos stay in Google
Photos as an optional link attachment - a lost link is a lost
shortcut, never a lost memory. (2) Rahul's scope ruling: media
attaches ANYWHERE the note editor stands - every page in every
room (diary, musings, writings, whiteboard, timeline, trips,
bucket dreams, library notes, circle, decisions...), NOT a trips
feature. Architectural consequence: the photo strip must be built
ONCE as a NoteEditor-level companion (shared module, one
attachments table keyed user/room/entry/day_index) so every
present and FUTURE room gets it for free - never per-room strips.
(3) One quiet flag (blur until tap) for personal items; client-side
compression ~1600px webp; short clips uploaded, long video linked;
thumbnails client-made; export carries a media manifest +
download-all path. Phasing when locked: P1 photos everywhere +
viewer + quiet; P2 short clips; P3 links/paste.

**TR-6: the trip's company (C1)** (1 Sep 2026): one 'company'
column (business | solo | family | friends, names fixed for thirty
years) with four true inks - FAMILY moss #5F7355, FRIENDS
terracotta #A4553F, SOLO gold #B08A3E, BUSINESS slate #44546A - all
apart from the room's sea so the tag reads before the words. The
chip rides the index dates line (stands alone when dates are
blank), the page eyebrow (after age, before TOLD AS), the print
crest, the section-print row and the .md header; zip carries the
column. Choosing: the edit-mode meta row grows the four chips -
tap to choose (ring + full ink), tap the chosen one again to CLEAR
(null - a trip may carry no tag). migrate_trips.sql gains the
column (safe re-run whether or not the first run happened).
Harness: eyebrow chip, picker ring, switch saved, clear writes
null + chip leaves the eyebrow, print chip present.

**TR-5: no stones row, one sea** (1 Sep 2026): the trips index
drops the top row of stones (pins + year rail lead the way);
TRIP_SHADES retired for a single TRIP_SEA (#2F6B8A) on every pin,
the page mark/sweep and the print crest - numbers alone count the
journeys. Ordering stays by date: harness showed a Goa trip dated
Mar 2026 slotting between Dec 2025 and Jun 2026 (Rahul's 'add in
between' is answered by dates, not by hand - no Arrange in a
timeline room).

**TR-4: where + the italic line edit as inputs** (1 Sep 2026): the
where line's tap-to-prompt was unreachable on the page and the
italic line (essence) had NO edit path at all once a trip or
chapter existed (readerLead hid itself when empty). Now edit mode
shows a META ROW under the heading - a mono 'Where' input (trips)
and a serif-italic 'One italic line' input (trips AND chapters) -
saving on change/Enter; read mode shows the where line and the
lead as before. Harness: both inputs present, both saved, read
mode shows both; chapter page gets the italic input only.

**TR-3: the day book that actually holds** (1 Sep 2026): Rahul's
'unable to add, doesn't show, no button to finish' - THE FAULT: the
ledger edited a book object living in tripRenderDays_'s closure,
while Done re-parsed r.days (still the OLD book until the debounced
write returned) and SAVED THE OLD BOOK OVER THE NEW one, then
rendered it - entries vanished. Fix: tripSaveBook_ assigns r.days =
book synchronously (one LIVE book; Done and every repaint read it).
Also: the auto 'blank line' that re-rendered on the first keystroke
(focus loss on phones) retired - lines are explicit ('+ ADD A LINE'
per day, x to remove, nothing pruned under a typing hand), a new
day opens with one line ready, and a sea DONE button closes the
ledger from the bottom (readerEdit's twin). 'DATES NOT SET' retired
from the index (a blank stays blank); the door's button wears the
chapter door's clothes (mono, full width, the sea: CREATE -> OPENS
THE TRIP). Harness (the user's journey): door -> DAY 1 -> type title
/ line / cost with NO re-render -> add a line (focused) -> kind cycle
-> DONE -> read mode shows 2 lines, title, total 9,000 -> saved
book correct -> reopen still shows.

**TR-1 + TR-2: My Trips - a new room in My Inner Life** (1 Sep
2026): kind 'trip' in iw_entries, tab between My Life Timeline and
My Writings, the sea's ink (#2F6B8A, TRIP_SHADES five sea steps).
INDEX = the Timeline's grammar with a PIN mark (P1, arabic numbers -
roman gets long past forty trips), dates where years were
('14-24 JUN 2026 - 11 DAYS', tripDatesLabel handles same-month /
cross-month / cross-year / day trip), a mono where line, the italic
line, the gold age pill (tripAgeLabel from birth year); a YEAR RAIL
divides the spine; the stones row shows only up to forty trips.
Door: name, from-to date inputs (blank to = a day trip), where, sig
-> quickInsert -> page opens editing. PAGE = the chapter page's twin
full width: eyebrow TRIP + tappable dates pill (opens an INLINE
two-date row with Save - no chained prompts) + age pill + TOLD AS
pill (one tap cycles essay -> days -> both, saved as 'telling',
default 'both'); the pin mark + sweep + sig bar; the where line
tappable (one ask). DAY BOOK (TR-2, C: above the essay): one JSON
document per trip in 'days' {currency, days:[{title, lines:[{k,t,c}]}]};
five fixed kinds (sights/food/stay/travel/other) each in its ink;
day dates computed from trip_from; day totals + trip total add
themselves (en-IN grouping); read = cards; edit = ledger (kind chip
cycles on tap, text, cost, remove; a blank line always waits; days
add with one tap and take the next date; debounced save 700ms,
immediate on Done/add/remove). EMPTY BOOK in BOTH: no header, no
totals - only the quiet '+ DAY 1 - <date>' door (Rahul's question).
The essay hides when told as DAY BOOK; the book hides when ESSAY;
data always kept. FOUR PATHS: entry print (pin crest, TRIP - dates
- days - age, where, day-book tables page-break-safe, essay per
telling), section print ('My Trips', life order, dates/days/age/
where per row), .md (header, where, day book as tables with day
totals), zip (now carries years_from/to, trip_*, place, telling,
days - the zip had silently omitted the chapter years before: a
pre-existing gap closed). Search reaches the where line + day book
text. migrate_trips.sql adds the five columns (plain ASCII, safe
re-run) - PENDING Rahul runs it once. Harness (jsdom): tab, spine
(order, dates, days, where, age, year rail, pins), eyebrow, where,
pin mark, day book read (total 9,000; lines; door DAY 2), book above
essay, told-as cycle + surface classes, ledger + blank line +
cost -> saved (4 lines, total 9,500), where one-ask saved, empty
book door-only, print crest/age/table/where, md (isolated: header,
where, day-book table, day total), door insert. All green.

**BK-8: the making stands three lines tall; AHEAD keeps only its
date (T1 + D1)** (1 Sep 2026): the countdown clipped on phones. A
wip row is now a three-line block on EVERY screen - .l1 name, .l2
mark + countdown (flex-wrap), the existing .edge runway as line
three (padding-bottom 16px makes room) - in a faint teal wash
(#F1F7F6 / #D6E7E4, teal left rule). AHEAD's word retires from the
INDEX: an AHEAD dream shows its name and, if planned, the plain
date as a solid ember chip (bk-mark not_yet reused); no date, name
alone. .bk-when retired to zero refs. Dream page + print still say
AHEAD in full. Harness: wip l1/l2/runway + chips; ahead date chip
only / name only, no runway; the word AHEAD absent from the index.

**BK-7: AHEAD is a hope, IN THE MAKING is a clock (H2)**
(1 Sep 2026): the clock - countdown chip + runway hairline (.edge) -
belongs to wip alone. AHEAD sheds both and only WHISPERS its date:
ember mark + quiet grey mono '- 20 SEP 2026' (.bk-when, no chip);
no 'time left', no PASSED, ever (a hope is not late). Dream page:
AHEAD's PLANNED FOR shows the plain date, never the over state;
print: countdown only under In the making, Ahead prints 'planned
for <date>'. Harness: wip row chip+runway; ahead rows whisper/none,
no runway; ahead page plain + no over; print bands correct.

**BK-6: time-bound beside the name (W2 + B)** (1 Sep 2026): every
waiting row now carries its mark AND its plan's countdown inside the
title span - IN THE MAKING / AHEAD, then a gold chip 'N MONTHS LEFT -
date' (weeks under two months, days under two weeks, TODAY on the
day), rose 'PASSED - date' after; the corner plan chip and the deck
marks for waiting rows retired (DONE keeps stars + mark in the
deck). One voice across the four paths: bkLeftText_ feeds the index
chip, the dream page's PLANNED FOR value, and the section print
(bands renamed to the app's words: In the making / Ahead / Done).
The existing runway hairline under the row is untouched. Harness:
sitar '15 MONTHS LEFT', family book 'PASSED', Konkan '3 WEEKS LEFT',
done row deck-only; print bands + countdown present.

**BK-5: a plan may let go of its date** (1 Sep 2026): bkSaveDate
threw away every empty value (`if (!value) return`), so a PLANNED FOR
date could be set but never removed - and phone date pickers rarely
offer 'clear'. Now an emptied PLANNED FOR (or WRITTEN) saves as null
('no specific date'); DONE keeps its day required. A small ember
'x no date' button rides beside PLANNED FOR in edit mode, shown only
while a date exists; it empties the input and saves null. The index
plan chip and the runway bar both vanish with it. Harness: chip
present -> clear -> null written -> input empty -> button hides ->
chip gone.

**BK-4: one Arrange, in the family's clothes** (26 Aug 2026): the
header Arrange retired to zero refs (markup, css, wiring); the foot
button is the only door, standing before Edit in the end-actions
pill, wearing the family anatomy - a two-arrow up/down svg + mono
uppercase word (bkArrangeWord flips Arrange <-> Done), gold ink
while arranging. Section-leave disarm kept.

**BK-3: Arrange stands before Edit** (26 Aug 2026): a second
Arrange trigger joins the end-actions box, BEFORE the pencil Edit -
the thumb's own corner. Both Arrange buttons (index header + foot)
share one painter and one state (bk-arranging); the foot one shows
only on the bucket section, and LEAVING the section disarms
arranging (mirroring 'Edit belongs to the section you are in').

**BK-2: the mark hugs the name; Arrange lives on the index**
(26 Aug 2026): two faults Rahul caught on device. (1) AHEAD drifted
to the right corner - .stamp .st has flex:1, so a SIBLING mark rides
the far edge; the mark now lives INSIDE the title span, hugging the
name's last word (margin-left 9px, vertical-align 2px). (2) the
arrows never showed - p-editing only toggles from PAGES (bkEdit is
the dream page's edit; the index has no edit mode), so the gate
never opened. The index now has its own ARRANGE button beside the
count (bk-hd flex; Arrange <-> Done, gold when armed) toggling
body.bk-arranging, which gates the arrows + the plan-chip yield;
arranging survives repaints. Harness: mark inside title span,
Arrange->Done, nudge reorders + writes, arranging persists.

**BK-1 + S1: AHEAD in ember, the order of hopes (why.html)**
(26 Aug 2026): LOCKED B+F2 built - the waiting mark says AHEAD in
deep ember #7A2F38/#fff (the rose whisper retired), standing BESIDE
the dream's name (row: ring, name, mark; done and in-the-making keep
deck marks; the plan-suppression rule retired - mark and gold plan
date coexist). The dream page + ro say AHEAD too (four-output-paths;
'NOT YET LIVED/FINALIZED' in the Decisions room untouched - not
bucket voice). S1: within waiting ranks the user's sequence rules -
sort_order asc (unset sinks), then age; edit mode (p-editing) grows
quiet arrows per waiting row (bk-ud, corner plan chip yields while
editing); a nudge reorders the WAITING list and writes positions for
changed rows only. migrate_bucket_order.sql adds sort_order to
bucket_items (plain ASCII, safe re-run) - PENDING Rahul runs it once.
Harness: AHEAD x2, row order [ring, name, mark, arrows], nudge wrote
[b2:0, b1:1], list reordered, done row unmoved.

**TL-6: prints wear the app's own names; the diary keeps its dates**
(26 Aug 2026): section print h1s now match the tabs exactly -
My Diary / My Musings & Learnings / My Life Timeline / My Writings
(the 'Introspection - Writing Desk' fallback that mislabelled the
musings print retired; the 'Introspection -' prefix dropped
everywhere; whiteboard already printed as My Whiteboard). Diary
print rows carry each page's date in the meta line ('a diary lives
by its dates'). Isolated test: both h1s, date on row, zero
'Writing Desk'/prefix refs in output.

**TL-5: the printed timeline speaks its name, in life order**
(26 Aug 2026): section print heading 'Life Experiences' -> 'My Life
Timeline' (label only), and the timeline print now sorts by
chapterSort - from the first chapter of life onward, overriding
favFirst/newest ordering (print-only; the on-screen spine already
lived in life order). Isolated composition test: title renamed, old
name zero refs in output, School Years < College < Recent Chapter.

**TL-4: the print button was printing the WRONG THING**
(26 Aug 2026): the true fault behind 'print shows only Life Chapter
+ heading': the toolbar Print button ALWAYS called printIntro_ (the
section-view print) even with a chapter page open - and the section
rows carried no period/age. Fixes: (1) printBtn now routes an OPEN
page to exportEntryPrint (full chapter grammar with diamond, period,
age); the section view still prints via printIntro_. (2) The
section print's rows now carry period + age in the meta line
('Life Chapter - 2006-2014 - AGE 8-16'; isolated composition test on
the real fn source: all green). (3) SLOW print fixed: all three
print tails replace the fixed 400/500ms + remote-font wait with a
document.fonts.ready race capped at 900ms - prints fire as soon as
fonts land, never hang on the network. (Two jsdom boot-race false
alarms during verification were proven harness flakiness by the
isolated test - the wrong-test-vs-real-bug distinction held.)

**TL-3: one ask for the period; every output speaks it**
(26 Aug 2026): (1) 'only from can be edited' - phones swallow a
SECOND prompt() (dialog-spam suppression), so the end year never
took. The period now edits in ONE ask: '2006-2014' or '2006-' for
ongoing (regex takes -, en/em dash, 'to'; validated). NEW LAW:
never chain two prompts on one gesture - phones may suppress the
second. (2) Print verified by harness to carry BOTH the amber
period and the gold AGE pill once the data exists (2006-2014 +
AGE 8-16 found in composed print html) - the earlier 'missing' was
the missing data itself. The .md export now carries period + age
too (four-output-paths law honoured).

**TL-2: the period edits on the page; print speaks it**
(26 Aug 2026): (1) chapter pages could never edit their years after
creation. Now the eyebrow's period is TAPPABLE (rk-tap dotted
underline): 'set the years' when unset, '2006-2014' when set; tap ->
two prompts (from; to blank = ongoing; validated, end >= start) ->
_editChapterYears updates years_from/years_to, repaints the page and
re-renders the spine (chapterSort reorders). The age pill is
tappable too (change birth year), and when years exist but no birth
year, a quiet 'age?' pill offers it (the standing 'birth year never
set' pending item finally has a door on the page itself). Harness:
'set the years' -> commit {2006,2014} -> pill '2006-2014' -> 'age?'
-> birth 1998 -> 'AGE 8-16'. (2) PRINT already carried amber years +
gold age pill (TL-B) - they were EMPTY because his row had no years;
with (1) they fill; unset chapters now print 'years not set' so the
gap is visible on paper too.

**LR-8b: capture breathes between the lines** (26 Aug 2026):
two-line headings captured without a space ('The Artof Living') -
textContent glues <br>-broken and nested pieces together. _docCapture
now walks child nodes (textOf) putting a space between every text
piece and element, then collapses whitespace. Case battery:
br-split -> 'The Art of Living'; nested spans -> 'Deep Work';
newline+mixed -> 'Two Lines' + 'Bold Italic tail'; plain unchanged.

**LR-8: the wisdom door takes the file itself** (26 Aug 2026):
the wisdom shelf door no longer opens any page or asks any question -
its label is 'Upload a saved page (.html)' and tapping it summons
the file picker directly. On pick: read, isDoc-validate, _docCapture
fills title (first h1/h2/h3, falling back to <title>, falling back
to the filename) and the one-line summary (essence), INSERT, toast
'Kept - "<title>"', reload the index. No page opens before, during,
or after; the entry appears on the index already named and
summarised, and tapping it opens the full html (LR-7). Harness:
door label, picker summoned with no text field, auto title
'Meditations' + summary, no page opened - all green.

**LR-7: wisdom = the html itself + self-introducing uploads**
(26 Aug 2026): (1) tapping a wisdom entry opens the FULL saved html
straight away (openReader gains forcePage; wisdom doc rows route to
openDocReader unless forced) - nothing between the tap and the page;
the edit pencil opens the page tools (title/passage/upload/delete)
via forcePage. (2) _docCapture(html): DOMParser reads the page's
first h1/h2/h3 (falls back to <title>) as the TITLE and the first
meaningful text after the heading (falls back to first <p>) as the
one-line SUMMARY (essence, shown on the wisdom index cards which
already render essence); fills ONLY empty fields - your own words
are never overwritten; clipped 120/160 chars; toast 'Uploaded -
heading captured'. Harness: tap=doc-only, pencil=tools, capture
title 'The Daily Stoic' + summary line - all green.

**LR-6: wisdom shows its pages; the upload returns**
(26 Aug 2026): correction from Rahul - the earlier Wisdom Library
DISPLAYED the saved html as the page (not behind a door) and had an
upload. Both restored: doc rows render the saved page INLINE in an
iframe (sandbox allow-same-origin allow-popups, srcdoc - same
posture as the doc overlay) with a small 'Full screen' button
opening the old reader; the attachment-door design retired to zero
refs. UPLOAD: wisdom pages in edit mode show a dashed 'Upload the
saved page (.html)' door (frFile) - reads text, isDoc-validates,
confirms before replacing an existing page or written note, updates
note, repaints the page inline. saveFrCore_/setFrEditing doc guards
unchanged. Harness: inline frame + full-screen + upload-only-in-
edit-on-wisdom + upload commit + repaint all green.

**LR-5: the popup is DEAD; wisdom gets its pages back**
(26 Aug 2026): (1) FULL RETIREMENT - modal markup block, openModal,
closeModal, saveBookmark, deleteBookmark, shapeModalForSection,
renderTypeChips, pendingDoc/fFile upload, all binds and the Esc
handler: ZERO refs (window-cuts with content asserts; editingId
retired). New-page uploads are gone WITH it - flagged to Rahul.
(2) Pencils rehomed: notes pencil -> straight onto the page in edit
mode; links/music pencils -> _rowInlineEdit (row swaps to title +
link + SAVE + U+2298 delete in place; Esc restores). Delete now
lives on every page (frDel) and every row. (3) WISDOM PAGES
RESTORED: openReader no longer routes doc rows to the doc viewer -
every entry opens a PAGE; the passage (essence) stands above the
note as a serif quotation (editable in place, _frPassageCommit);
the old saved-page upload waits as a dashed 'Open the saved page'
attachment door; the doc body is guarded at open, save
(saveFrCore_ early-return), and close (setFrEditing rewrite skip -
found by harness when the attachment door vanished on open).
Harnesses: doc-row page + passage + door + commit + never-overwrite,
plain-wisdom editable body, inline row editor + row delete all green.

**LR-4: the door IS the form - no popup** (26 Aug 2026): studied
the Inner Life's add flows as asked - Musings' Enter door (one
field, straight in) and the diary's WRITE (a tap, then the page).
Ported both: tapping a shelf door now expands INLINE (no modal).
Notes shelves (books/podcasts/marathi/movies/wisdom): ONE field with
its own hint ('which book?', 'what did you watch?', Marathi
'shirshak...', wisdom 'whose words / where from?'), button reads
OPEN THE PAGE - Enter/tap creates the row and walks straight onto
the reader in edit mode to write. Links + Music: name + link inline,
ADD. Esc collapses back to the door. Minimal record (title, section,
url for links/music; everything else empty, enrichable later from
the page/modal). Harness: books door -> insert -> page open editing;
links door -> two fields -> url normalized. The old modal remains
for edit-pencil flows only.

**LR-3: one chip ink + a door per shelf** (26 Aug 2026): (1) CHIPS -
the seven-ink round retires; every chip wears the Links chip's exact
clothes: one rule (.fav-seg > span { --t-acc:#2f5187 }), sleeping =
blue names on the tray, chosen = solid Library blue + white (MC-3
kept). (2) DOORS - the toolbar's single 'New' RETIRED to zero refs
(markup, listener, CSS); each shelf's index now ENDS with its own
dashed door (SHELF_DOORS): Keep a link / Add a song / New book note /
New podcast note / (Marathi) navin nond / New watch note / Keep a
passage - _appendShelfDoor called from all four render branches +
the empty state (whose copy now says 'The door below adds your
first.'); each door opens the entry window already standing in its
shelf (openModal(null) presets fSection = activeSection, verified).
Harness: all seven doors carry their own words; wisdom door opens
the modal preset to wisdom. Search + Edit remain in the toolbar.

**LR-2: crest hero + one box wash + in-place headings**
(26 Aug 2026): (1) HERO - corrected to be IDENTICAL to My Why and
My Inner Life (LR-1's light hero was my invention; the true family
crest is the navy gradient): linear-gradient(155deg,#203a72,#0f1f42),
Caveat gold eyebrow 'The things worth coming back to', 2.5rem white
serif title, italic subline (kept: 'Music, podcasts, books & more -
kept for good.'), gold count badge, ghost hub-back. (2) ONE BOX
COLOUR - SEC_THEMES collapsed to a single LIB_THEME = the wisdom
blue (w1 #f2f6fd, w2 #dfe9f8, acc #2f5187), now the Library's own
signature wash on every shelf's index boxes; shelves tell apart by
MC-3 chip ink + eyebrow. (3) HEADINGS EDIT IN PLACE - frH1 goes
contenteditable in edit mode (dashed affordance + iOS text-select
insurance, Enter commits), Done commits bookmarks.title with
revert-on-failure; harness verified: title update + body save both
fire, h1 repaints. The LR-1 record below stands for the delete fix,
the rename (A), chips, and grounds.

**LR-1 + A: My Library joins the manuscript house (favourites.html)**
(26 Aug 2026): (1) HERO - the navy poster gradient RETIRED; light
paper hero in the house voice: eyebrow 'the shelves', serif title,
subline 'Music, podcasts, books & more - kept for good.', count
badge in gold-on-cream. (2) CHIPS - MC-3 (sleeping = ink text on
transparent tray, chosen = solid ink + white) with SEVEN shelf inks:
Links indigo #3E5C76, Music aubergine #6D4E66, Books moss #5F7355,
Podcasts ochre #B08A3E, Marathi madder #A4553F, Movies sepia
#6B5B45, Wisdom gold #8a6d1f (wisdom had NO tint rule before - one
added). (3) NAME A - 'All-Time' -> lbl 'My Favourite Links' (room
headings, modal select, print); the chip shows one word 'Links';
the 'all-time' KEY is law, unchanged. A comment-swallowed-comma
syntax slip was caught by node --check and healed (comment moved to
its own line). (4) ONE GROUND - the six per-section reader paper
tints retired; every open page sits on #fbfcfe like My Why/Inner
Life; sections speak through eyebrow ink. (5) DELETE LIVES ON THE
PAGE - frDel (ember trash) in the notes-reader bar: confirm ->
delete -> closeReader -> reload (harness-verified; first attempt
called a nonexistent closeNoteReader - the page's closer is
closeReader). The foot editToggle gained a discoverable TWIN at the
toolbar (editToggleTop, Edit<->Done, shared _libToggleEditing) so
row pencils + modal Delete are reachable for links/music rows.
Harness: all 7 shelf chips click clean, reader delete fires, edit
mode toggles. Data untouched: same bookmarks table, same keys.

**DP-3: heading edit verified + phone insurance** (26 Aug 2026):
'page heading unable to update' - a jsdom harness ran the REAL flow
(Edit -> contenteditable H1 -> type -> Done): update {title} sent,
h1 repainted, zero errors - the mechanism is SOUND. _rdTitleCommit
confirmed async (an earlier print truncated the 'async' keyword -
checked bytes before alarming). Added iOS insurance on .rd-h1-edit:
-webkit-user-select:text + tap-highlight + min-height + cursor:text
(WebKit contenteditable focus can fail without selectable text).
The flow, for the record: Edit -> the heading grows a dashed box ->
tap IT -> type -> Done (or Enter). Prime suspect remains a stale
deployment; awaiting confirmation on the fresh file.

**DP-2: the date control made phone-proof** (26 Aug 2026): 'unable
to change date on any page' - a jsdom harness proved the mechanism
sound on desktop (input renders, change commits created_at), so the
fault is mobile interaction: styled <input type=date> taps don't
reliably open the calendar on phones, and sub-16px fonts invite iOS
focus-zoom flakiness. Fix: a click inside readerDates calls
pick.showPicker() explicitly (guarded try - gesture rules vary);
BOTH 'change' and 'input' commit through one _rdDateCommit with a
_rdDateApplied once-guard (reset per openReader); phones get the
control at 1rem with a larger pad. Note: two rep() attempts died
safely on a guessed openReader signature (it is (id, keepNav)) -
count-asserts held, no partial writes.

**HB-2: the room door matches** (26 Aug 2026): introspection.html's
lib-subline restored to 'Reflections gathered, gratitude kept.' -
the 18-Aug-era line, now identical on the hub card and the room
hero. Transcript archaeology confirmed the 18-Aug room structure:
H1 'My Inner Life' with per-section headings 'Introspection - <view>'
(no eyebrow, no feature-list subline); the feature-list line was
IL-2's addition. Title and 'the inner rooms' eyebrow kept as-is
(offered to drop the eyebrow for full 18-Aug fidelity; Rahul's call).

**HB-1: the hub line restored** (26 Aug 2026): the Inner Life card's
desc returned to its 18 Aug original - 'Reflections gathered,
gratitude kept.' - found in the transcripts (born with the D4 'My
Inner Life' rename). The IL-2-era 'Learnings indexed, chapters kept,
pages written.' read like a feature list; the original has the
music, and 'gratitude kept' remains true - gratitude lives as chips
in the diary. LESSON: microcopy history lives in /mnt/transcripts;
check it before rewriting a line the user once loved.

**RB AUDIT (full)** (26 Aug 2026): requested proactive audit of the
whole recurring/reminder system before long-term reliance. METHOD:
(1) boot-order race analysis - loadUserPrefs RESETS _userPrefs, so
any pre-load write would be lost; verified loadAndStart AWAITS
loadUserPrefs before the first paint (renderEntry), and offline
fallback mirrors reminderBills via _writePrefsToLocalStorage - no
race exists. (2) 12-case behavioural sim on the REAL fn source:
day-31 clamping (Sep 30, Feb 28), lapse guard cycles (ask once ->
keep -> resume -> fresh ask on new stoppage), hide beats everything,
month-skip, paid-later clears earlier views, asks today-anchor-only.
One sim case initially failed and was proven a WRONG TEST, not a
bug: a blessed bill silent 6 months must lapse-ask, not nag - the
guard correctly intercepted; recorded as B2 (six silent months ->
ask, never a silent nag). (3) 21-anchor full regression battery
across RB-1..8 - ALL GREEN. Known intentional behaviours: keep:1
persists until the next stoppage; hide is permanent unless prefs
edited; skip is calendar-month scoped; asks never appear on past
days; the amber tag is today-only.

**RB-8: missed bills stay visible all month** (26 Aug 2026):
computeDueBills(anchorIso) - the engine anchors to any day (today by
default); asks (new/lapse) speak only when the anchor IS today.
The strip now lives on PAST days of the current month too: head
'STILL UNPAID - <day>' with note 'logs to this day', and BOTH log
paths (last-amount chip + typed) write to stripDate = the viewed
day via _adConfirm(dateIso,...) - one date, one truth per screen
preserved because the card SAYS where it writes. A bill paid later
in the month stops nagging on earlier views (paidThisMonth is
month-scoped). Future days + other months stay hidden; the amber
tag remains today-only. Sim: due@5 visible on the 12th, absent on
the 3rd, asks today-only, paid-on-20th clears the 12th's view.

**RB-7: one date, one truth per screen** (26 Aug 2026): logging a
missed payment from a past day landed on TODAY - the due strip's
LOG writes to isoToday() by design (it is today's furniture), but
the strip stayed visible while browsing history and misled the tap.
Fix: renderRecDueStrip hides strip + tag whenever currentDate !==
isoToday(), and the date-change flow (selectDate) now repaints the
strip so it leaves on navigation and returns on today. Past-day
logging flows through the room's own input, which already writes to
currentDate (verified). LAW REINFORCED: today-only furniture must
HIDE on other days, not merely behave differently.

**RB-6: fresh starts + removable names** (26 Aug 2026):
(1) Restarted bills no longer wear the old obituary: switching ON and
every yes path write note:'' (fresh start), and the sheet's meta
speaks the note only while ans !== 'yes' (display guard, belt +
braces). (2) A name can now LEAVE the sheet: off rows wear a small x
that sets {ans:'no', hide:1}; hidden names vanish from the sheet
list, the detection engine, the asks, the manual loop, the pending
amount, and the usually-paid hint - the answer for retired
duplicates like 'mngl gas' beside 'flat mngl gas'. History untouched;
reversible only by paying the bill again under that exact name (a
fresh 2-month pattern would still stay hidden - hide is permanent
until edited in prefs), which suits a dead duplicate.

**RB-5: the day rides the yes** (26 Aug 2026): tapping 'Yes, remind'
on any ask opens the day window in the same breath, prefilled with
the history guess (data-rb-dom); a number 1-31 saves as the picked
day, while CANCEL or empty keeps the history guess - the yes itself
is never lost either way.

**RB-4: three answers together + the sheet's stop symbol**
(26 Aug 2026): every ask card (new-pattern AND lapse) now stands all
three answers side by side - moss 'Yes, remind' / plain 'No, never' /
ember 'It stopped' - one glance, one tap; the yes handler unified
(keep doubles as plain yes; lapseFor/keep ride only when a lapse ym
exists), the separate data-rb-yes wiring retired to zero refs;
'It stopped' notes 'stopped YYYY-MM'. The reminder sheet: every row
ends with an ember circle-slash (U+2298) - one tap declares a bill
stopped from the popup itself (ans no + stoppage note), switch
flips off on repaint.

**RB-3: irregular days + deletable preset chips** (26 Aug 2026):
(1) 'Unable to save date in irregular recurring' - two faults: the
sheet's day label ignored a.day for irregular rows (showed
'irregular' even after picking - looked unsaved), and the engine's
hand-made loop required a.manual, so an irregular name + your day
fired nothing. Now: hand-made reminders fire for ans yes AND
(manual OR day set); irregular rows read 'irregular - set a day'
until picked, then 'day N'; history's casing/amount reused when any
payment exists. Sim: one-month Water Tanker + day 15 -> due@15/900.
(2) 'MNGL Gas' preset chip undeletable - preset chips are baked in
markup and 'edit chips' armed X only on .chip-custom. Now presets
wear the X in edit mode too; deleting HIDES via
_userPrefs.hiddenPresetChips[kind] (device-proof), applied at every
paint + boot. Duplicate garden entries ('mngl gas' vs 'flat mngl
gas') die by one X each.

**RB-2 post-ship** (26 Aug 2026): 'day picker not there' report -
a jsdom sheet harness ran the REAL openReminderSheet source: 2 rows,
2 day pills ('day 5 - from history' / 'day 28'), add row, switches
all render; bell markup + wiring verified in bytes. Code sound -
stale deployment/cache suspected; told Rahul the sheet lives behind
the bell by RECURRING. AND the cancelled-bill leak he sniffed out
was REAL: renderRecPending's 'to pay' total and refreshRecHint's
'usually paid - not yet' names both counted stopped bills; both now
skip rb ans 'no'. History keeps the record; the debt stops
pretending.

**RB-2: the day is his, not history's (daily.html)** (26 Aug 2026):
rb entries gain day (1-31) and manual {name, amt}. Engine: a
hand-picked day BEATS the history modal (pick = a.day || modal,
clamped to month length); manual bills fire with ZERO history (due
when dom >= day, last-logged amount once any exists, else the
approx), and graduate into detection once 2+ months are logged.
Sheet: every row wears a gold DAY PILL ('day 5 - from history' vs
'day 28' when hand-set; tap -> prompt 1-31, empty resets to the
history guess) + an add-by-hand row (name / day / approx amount via
evalExpr) so a brand-new bill needs no waiting. Fixture sim on the
real fn source: 28th-not-yet / 20th-due / manual-Rent-due all green.

**RB-1: reminders in the user's hand (daily.html)** (26 Aug 2026):
AD-1's guess-everything strip became an OWNED WHITELIST. Storage:
_userPrefs.reminderBills = { nameLower: {ans, at, note?, lapseFor?,
keep?} } and reminderMonthSkips = { ym: [names] } - both ride
user_prefs (Supabase, device-proof); the localStorage skip list folds
in once then retires. Engine (computeDueBills -> {due, asks}):
undecided detected patterns (>=2 months; irregulars never suggested)
ask ONCE as 'new' candidates (the day-one jury - stopped bills die at
first answer); ans 'no' = silence forever; ans 'yes' bills fire due
cards, EXCEPT the LAPSE GUARD: >=3 silent calendar months -> one
'lapse' ask per stoppage (lapseFor = lastYm marks asked; keep:1
resumes reminders despite silence; 'It stopped' -> ans no + note;
a resumed-then-lapsed bill earns one fresh ask because lastYm moves).
FACE: due cards gain a quiet ember 'stopped' beside skip-month
(one-tap retirement, noted 'stopped YYYY-MM'); asks are dashed
rd-ask strips with moss Yes / plain No; the strip head is a manage
tap; a bell by RECURRING opens the body-level rb sheet - every
detected name, one switch each, meta (~dom, last amount, notes).
Tag counts real dues only. Fixture sim ran the REAL fn source:
jury/lapse/keep/stopped paths all green.

**MC-3 + Write + hub order** (26 Aug 2026): the main chips wear
MC-3 - sleeping rooms are ink-coloured text on the transparent tray
(opacity .85), the chosen room goes SOLID INK with a white label
(background var(--t-acc), the DX inkwell; whiteboard keeps its gold
tint vars). Tonight's WRITE cleaned: mono caps -> sans 0.75rem 600
sentence-case 'Write'. index.html hub: My Inner Life card moved
BEFORE My Wealth (window-swap with content asserts per the new
window-cut law - both blocks verified to carry only their own card).

**TL_SHADES regression + NEW LAW** (26 Aug 2026): the Timeline tab
died after the DX round - jsdom harness caught it in one click:
ReferenceError TL_SHADES at renderTimeline. A window-cut in the DX
build silently swallowed the const (the cut asserted only distance,
not content). Restored beside chShade. NEW STANDING LAW - WINDOW-CUT
CONTENT ASSERTS: any find/slice removal must assert what the removed
window CONTAINS (e.g., no 'const ', 'function ', or 'let ' tokens
beyond the intended component), and the post-build battery must
RE-RUN the anchors of prior rounds (a later cut can un-ship an
earlier green check). The all-tabs click harness now exists
(harness2.js pattern: click every seg tab, assert zero errors).

**IL-2 round 7: the DX coherence stroke** (26 Aug 2026): MB - on
phones the reader bar DROPS the path title entirely (display:none,
back pinned left, actions right): the H1 sits one line below, so the
bar title is desktop-only wayfinding; truncating it was noise.
DX-1 ONE INKWELL: room accents re-derived from the manuscript inks -
Diary sepia #6B5B45, Musings indigo #3E5C76, Timeline moss #5F7355,
Writings aubergine #6D4E66 (Whiteboard gold) - across seg tints
(writing tint rule added; it had none), reader --r-acc, tonight's
WRITE, ix-more fleuron, chapter-ask button, shelf borders/wtag; the
chapter page eyebrow drinks ITS OWN chapter's ink (style.color = sh,
cleared for other kinds). DX-2 chips: CHIP_HUES retuned to the six
inks (aubergine/ochre/indigo/moss/madder/sepia soft triples); hash
untouched so every word keeps its colour forever. DX-3 search: rows
for finding - .sfind (ink kicker naming the room + serif title +
fav star); THE CARD ERA ENDED: cardHTML, its binds, and the CARDS css
block retired to zero refs (the shared edit-mode rule survives for
the whiteboard's .sticky.add; a healed cut - the binds removal left
a dangling '});' + addCard line, caught by node --check). DX-4:
Today's Reminder is an heirloom - cream #FDFCF7/#EAE4D2, gold-sepia
sans caption, the line in 1.125rem Fraunces italic opened by the
fleuron. DX-5: diary tab FIRST and the page now LANDS on the diary
(activeView default 'diary' - flagged completion of the mock's
'evenings open on the right room'). DX-6 (Year in the Inner Life
printable) remains a noted future ritual.

**IL-2 round 6: EY-2 / DR-1 / TS-1 + hero mark** (26 Aug 2026): the
page eyebrow leaves mono for the page sans (0.6875rem 600, 0.06em,
uppercase, accent) with QUIET SUFFIXES in .rk-quiet (sans 400
#a8b1c2, no uppercase): diary '· 27 Aug 2026' (weekday + commas
dropped), writing '· N words · ~M min'; the diary STREAM's row dates
(weekday short mono) are list furniture and stay. DR-1: the date-row
pill retired ('tap to change' gone); 'Written <date>' in the dates
line IS the control - .rd-wr dotted underline, delegated click on
readerDates, picker primed at paint, offscreen fixed input. TS-1:
TL_SHADES -> manuscript inks #3E5C76 indigo / #A4553F madder /
#5F7355 moss / #B08A3E ochre / #6D4E66 aubergine. Rider: the
chapter's diamond joins its page in the why-seal posture -
.rd-sticky.ch grid (52px mark column, all children col 2, mark rows
1-3), #rdMark painted with the chapter's ink + roman numeral, cleared
for every other kind; the PRINT header wears the same diamond via a
padded relative header (54px left, absolute rotated square) closed
after the h1.

**IL-2 round 5: mobile + page grammar** (25 Aug 2026): six fixes.
(1) Mobile reader bar: the title yields (min-width:0 + ellipsis) so
Back/star/Delete/Edit always fit; <=560px bar compacts (gap 7,
buttons 6x9 @ 0.719rem). LESSON: in a flex bar, text flex items need
min-width:0 or their min-content pushes buttons off small screens.
(2) The timeline vertical line + ticks retired same-day to zero refs
(markup emits + CSS; battery gotcha recorded: substring checks for
'tline' false-match 'outline' - grep the CLASSED form '.tline').
(3) .reader-inner max-width 680 -> 1000, matching why's .rm-inner.
(4) The rd-sticky heading freeze removed (position/top/z/bg dropped;
padding-bottom + divider kept). (5) Chapter page meta wears the index
grammar exactly: eyebrow 'LIFE CHAPTER' + .rk-years (mono 0.5938
amber #a5702f) + .rk-age gold pill (#8A5711/#FBF3E2/#E4D2AC).
(6) tdots strip breathes: margin 10px above / 20px below.

**IL-2 round 4: one ground + the true axis** (25 Aug 2026): every
Inner Life individual page now stands on the SAME paper as the My Why
individual pages - #fbfcfe (read from why.html's .rmw), set once on
.reader-overlay; the per-kind rules keep only their accent voices
(--r-acc), and the dead gratitude palette rule retired. The timeline
vertical rectified by geometry, not eye: diamond centre = 2px node
padding + 26px half-mark = 28px, so the 2px line sits at left:27
(stroke 27-29, centre 28), ticks left:21 width:14 (21-35, centre 28),
end-stop dots left:-2 (centre 28). The leftover greens from the
retired coin era (#B9CCB4 line, #9DB897 dots/ticks) replaced with
warm stone #C6C0B0 / #B3AC99 to sit with the heritage shades.

**IL-2 round 3: TL-B** (25 Aug 2026): five settlements in one stroke.
(1) The '+ a past day' door retired to zero refs (button, picker,
wiring, .tn-past clothes) - its power lives on in every page's DP-1
date row: write tonight, re-date the page. (2) 'Work in Progress' ->
'My Whiteboard' (seg label, whiteboard print h1 + title; 'wip' view
keys untouched, S1). (3) The age pill wears the house gold: #8A5711
on #FBF3E2 with #E4D2AC hairline. (4) TL-B: RB_HUES rainbow coins
RETIRED for TL_SHADES = terracotta #9C6B5A, brass #A98A4B, olive
#6E7F5A, slate-blue #5A7086, plum #7A5A74 (5-cycle via chShade);
marks are DIAMONDS (rotated rounded squares, white roman numeral,
absolute .diam behind a centred b) at index and in the tdots strip
(4px-radius rotated squares); the chapter page sweep ('4d' = 0.30)
and sig bar ride the same shade by chapterSort index. (5) Chapter
PRINT view now carries the full index grammar - amber LIFE CHAPTER
eyebrow with years, gold age pill, name sweep in the shade, sig bar -
built inline in exportEntryPrint for experience kind only; every
other kind prints plain as before.

**IL-2 round 2: fixes + MI-3/DP-1/RH-3** (25 Aug 2026): five fixes -
(1) Delete lives on every note page (rdDel in the reader bar wired to
readerEntry.id; the modal-era deleteEntry required editingId and had
become unreachable - LESSON: when a component retires, every capability
that lived ONLY inside it must be rehomed the same day). (2) Tonight's
WRITE verified sound by a jsdom harness that boots the real page with
a stubbed supabase and clicks the button (harness law: simulations
import the real structure); hardened anyway - failures now toast, and
today's page matches by LOCAL date (UTC slicing misfiled early-morning
IST pages under yesterday). (3) Writings wear the readerChips tag row.
(4) Age pill: whisper fill #5a70500d + hairline border. (5) Musings
quick-add seated at the END of the index. Then the three locks:
MI-3 - the fleuron (U+2767) is the note marker, icon only.
DP-1 - every page wears a date row (mono pill under the dates line)
that edits created_at via a hidden input+showPicker; dates written as
ymd+T12:00:00Z (midday UTC keeps the local day stable across
timezones); a diary page titled by its old date phrase is retitled to
the new phrase; the diary gains the '+ a past day' door (date FIRST,
then the page opens) for backfilling. Flagged deviation from the mock:
'undated until picked' is not real - created_at always exists (DB
stamps the row's birth), so the row shows the true date from birth.
RH-3 - the chapter page wears the roadmap hero's grammar in ITS OWN
COIN'S hue: title sweep = coin deep at 0.30 alpha ('4d'), 56%->96%
band with box-decoration-break:clone for wrapped lines; sig bar 88x6
r3 in the coin deep; hue index = position in chapterSort order, the
same index the spine uses. Non-chapters keep the plain serif title.
The screenshot's white-on-blue block was text SELECTION, not design -
decoded against the why source before matching.

**IL-2 migration ran** (25 Aug 2026): iw_entries now diary 3 /
experience 1 / introspection 9 - zero gratitude rows; the moved
entries wear the "gratitude" chip in jsonb tags. First attempt failed
with btrim(jsonb): the tags column is JSONB, not text-JSON as the app
serialization suggested. NEW STANDING LAW: column types are read from
the database's own error or schema, never assumed from app-side
serialization; migrations speak the column's native dialect
(jsonb_typeof guard, @> containment for idempotence, || append).

**CL-1 (introspection.html)** (Aug 2026): four cleanups. (1) The
hashtag filter row retired from every subsection - markup, renderTags,
activeTag state, wip toggle, and .tags-row/.tag CSS all to zero refs;
#tags survive on cards (.ctag) and inside search. (2) SEARCH CROSSES
THE WHOLE INNER LIFE: with text in the box, filteredRows searches all
rows regardless of tab (kind kickers identify each result's room);
cleared, the tab's view returns. (3) Note pages open in the Circle
page's grammar: the reader eyebrow became mono 0.5313rem / 0.18em
tracking / weight 600 in the section accent (var(--r-acc)), now
carrying KIND + DATE uppercase; the Fraunces 600 title stands beneath
as before. (4) The diary lens + composer heart shed the tiny tracked
mono for the page's own sans a step larger; count quieted to 'N this
year'; 'Gratitude only' -> 'Gratitude'.

**IN-7 + GD-1 + HD (introspection.html)** (Aug 2026): the Inner Life
renamed and remade. 'My Introspection' -> 'MY MUSINGS & LEARNINGS'
(IN-7, Rahul's word 'musings' + the word that dignifies incident-
lessons and feedback); 'My Life Experiences' -> 'MY LIFE TIMELINE'.
Kind KEYS untouched everywhere (S1: records never change for display
words) - only lbl clothes renamed. GD-1: the Gratitude tab retired
(five tabs -> four, dead seg CSS removed); the diary is the single
nightly door holding kind in (diary, gratitude), with the plum
gratitude palette/kicker distinguishing rows natively; a diary-only
lens (All / heart-Gratitude-only + 'N gratitudes this year' count);
and a one-tap heart in the composer that MIRRORS the Type select
(select stays the single source of truth; the chip only flips
diary<->gratitude, painted via change events + a MutationObserver on
the modal). Reversible forever: the old tab returns by one display
change with every entry intact. HD: each room opens with an eyebrow
(section name, section colour) + a serif roadmap heading - the four
title strings in VIEW_HEADINGS are PLACEHOLDERS awaiting Rahul's
roadmap note wording (his note lives in his DB; he must paste the
headings; swap is title-strings-only). Post-ship: Rahul dropped the
HD heading block entirely - viewHead markup, VIEW_HEADINGS,
renderViewHead, and clothes all retired same-day to zero refs; the
rooms open straight into their lens and stream.

**TG-1 post-ship** (Aug 2026): the pill was rendering centered - a
leftover rule from the retired Home button ('.home-banner.home
.home-banner-status { justify-content:center; width:100% }') was
still winning in the tagged state. Retired it plus the whole dead
home-banner-home-btn CSS family (refs audited to zero). Lesson filed
under the retirement law: when a component dies, grep its STATE
overrides too, not just its base class.

**TG-1 - the bare tag** (Aug 2026): the Property banner box retired;
only the tag remains, left-seated and floating free 5px under the
field, which keeps its full rounded shape in every state (the :has()
corner-squaring and its has-banner JS fallback retired to zero refs).
The PILL IS THE BUTTON: tap the kind pill to open the bare chip
chooser (same era machinery beneath); an untagged place idles as one
quiet dashed '+ tag this place' ghost - tap to choose, ignore for
travel. The Night Stay field column returns to the same visual weight
as every other field: one input, one small line of metadata.

**NT-A amendment - away means away from MY HOME only** (Aug 2026):
Rahul's rule for the counters: Month/Year/Trends 'nights away' count
every night not in your own bed - family home and sister's place ARE
away there (while the Today/PDF tags still name them in their own
colours; only true travel wears amber). _isAwayFromHome became
date-aware: (normValue, modalKey, dateIso), not-away only when
placeKindOn(value, date) === 'home' - era-correct, so a retired home's
old nights stay not-away and its post-retirement nights count away.
All seven call sites thread their date. isHomeAddress retired to zero
refs (its any-tag semantics lasted one prompt). Sim: family night
away; 2020 my-home not away; retired-home 2026 away; modal stay not
away.

**NT-A - places have kinds, tags have eras** (Aug 2026): the binary
home/away verdict grew into a fixed three-word vocabulary - MY HOME
(moss, silent on the day), FAMILY HOME (deep blue #1E5A8A), SISTER'S
PLACE (plum #6B3FA0) - with amber AWAY reserved for true travel.
Chosen NT-A (fixed trio) over NT-B (open shelf) after argued
trade-offs: fixed-small-meaning wins the thirty years (envelopes stay
seven, gold=room/navy=reveal); NT-A grows into NT-B by one amendment
if life adds a kind. DATA: tags are {value, kind, from?, to?} in the
same homeAddresses prefs key - pre-NT-A tags migrate BY INTERPRETATION
(kind missing = home, era open) with nothing rewritten. Every date is
judged by the tag ACTIVE ON THAT DATE (placeKindOn), which answers
'which was home in 2020' forever: old homes are RETIRED (era closed),
never deleted; same-day from-today tags may vanish as mistakes.
Meaning changes ask the era question - FROM TODAY (closes old era,
opens new: the 2030 move-into-family-home case) or ALWAYS WAS
(corrects in place). FACE: the Property banner = kind pill + change /
one-tap kind chips when untagged ('or leave as travel' - hotels never
asked twice) / era chooser; the Today tag and PDF band chip speak the
kind in its colour with SAME-KIND era-correct streaks; the manage
sheet lists kind pill + era ('since 2019', '2018-2028') + nights +
Retire, and adds by kind. Old addHomeAddress/removeHomeAddress retired
to zero refs; isHomeAddress survives ONLY as the records heuristic's
any-tag-any-era predicate (family/sister nights are not travel).
Colours measured: 6.27-6.39:1 on app paper and PDF band. Engine sim
from real source: legacy reads home; era split exact (yesterday
family, today home); retire preserves past; predicate spans eras.

**AD-1 - due-today confirmations, learned from the log** (Aug 2026):
recurring bills that auto-debit (or simply recur) now greet their day
with a confirmation instead of a typing task. ENGINE (computeDueBills,
pure history, zero setup, zero new schema): a bill is due when today's
DOM >= its usual logging day - the modal FIRST-logging DOM across 2+
past months, clamped to short months - and it isn't logged this month.
Unpaid past its day it LINGERS as 'due since the Nth' (dashed card)
until logged or skipped; logging any way, card or normal field, on any
day, dissolves it (the record keeps the truth of when money moved).
FACE: amber 'N due today' tag on the door (only such mornings); DUE
TODAY strip atop the room; each card = name + grp + skip-this-month +
LAST-AMOUNT CHIP (one tap = logged at that figure) + free amount input
(evalExpr maths) + LOG. New typed figures become next month's chip
automatically since the chip reads the log. Writes go ONLY through
addRecurringPayment; repaints ride renderRecurringLog. Skip is a
device-local month-scoped note (localStorage, pruned monthly) - the
record itself is never touched by a skip. Fixture sim from the real
engine source: due-on-day, lingering, 1-month exclusion, paid
exclusion, sort - all exact.

**Ledger date cells speak the date alone** (Aug 2026): both organ
ledgers' date cells dropped the ' - today' suffix (screenshot showed
'Aug 25 - today Salon' crowding the name column; the date already says
it, and the ledger is month-scoped). The two orphaned todayIso
declarations retired same-day; the third, still-used one elsewhere
kept.

**DC-1 - the confirm sheet (DC-2N tried and retired same day)**
(Aug 2026): Rahul tried the armed-pill guard and preferred the sheet;
DC-2N's machinery (armedDelete/_disarmDel, is-armed/del-armed clothes)
retired same-day - audited to zero refs. DC-1: a singleton house
overlay (JS-built, body-level per the overlay law) serving BOTH organ
ledgers; every \u00d7 now awaits confirmDelete(label, dateIso), which
names the exact item AND date - 'Delete Salon Rs 600 from 24 Aug?' -
with Cancel / ember Delete. Cancel paths: Cancel button, backdrop tap,
Escape. The data-del-label attributes written for DC-2N survive as the
sheet's text source; both delete bodies run unchanged after consent.

**DC-2N - the armed delete names its victim** (Aug 2026): both organ
ledgers' \u00d7 buttons (Other month ledger + Recurring log share the
.rec-log-del class) now pass through armedDelete(): first tap turns
the \u00d7 into an ember pill reading '<name> <amt> - DELETE?' (label
carried on data-del-label, written at render) and blushes the row;
the second tap on the pill within 4s performs the existing delete
body unchanged; any tap elsewhere (capture-phase doc listener) or the
timer disarms and restores the \u00d7. Only one button can be armed at a
time. Chosen over DC-1's confirm sheet after argued trade-offs: the
sheet taxes every correct delete with a modal and breeds reflex-
confirm; the armed pill stops the accidental brush at near-zero cost
AND names the victim, catching wrong-row arms before harm. One
pattern, both organs, and every future ledger. Sim: arm->confirm
deletes; stray tap re-arms new row, prior stays safe.

**HP-2 + phone trim - loud when closed, calm when open** (Aug 2026):
the navy pill became state-aware, reviving the pill's own original
grammar (the old gold Toggle B was loud-closed/calm-open for the same
reason): CLOSED = solid accent-soft, 4px navy left-stripe, filled navy
+7 badge, semibold - 'fields are folded here, don't forget' while
entering; OPEN = the MP-2 whisper - nothing left to miss. Pure CSS on
the existing aria-expanded flag. Vocabulary deepens, not breaks:
gold = room, navy = reveal, LOUD navy = still folded. Phone: the
Recurring door also drops '- 6 paid' (rec-summary-cta hidden <=480px) -
the glance keeps amount, amber due, and OPEN; the count lives on
desktop and inside the room.

**MP-2 + MB-1 - navy reveals; the phone door keeps one line**
(Aug 2026): the fold-pill takes the ACCENT WHISPER - #F3F6FB ground,
accent-soft solid border, accent-ink text, accent chevron - the one
family the stretch didn't use. The vocabulary gains a fourth stable
word: gold opens rooms, NAVY reveals fields. This also healed the
mixed-clothes leak (the label's old gold-brown text had outranked the
grey costume; .exp-more-label now pinned at the same importance).
MB-1: on <=480px the doors hold ONE line by construction - paddings
tighten, the meta ellipsizes before any wrap, the 'this month - add
more' tail hides (the door's existence implies it), and the owed chip
speaks the short word: 'to pay'/'due' rendered as twin spans, desktop/
mobile each showing its own. Desktop wording byte-identical. Setters
write both twins; CSS chooses - zero behavioural JS change.

**SP-1 - doors above the fold; spine amended and RE-FROZEN**
(Aug 2026): Other + Recurring lifted OUT of the '+more' fold and
seated between P4 and the fold-pill. The reason is stronger than
convenience: the Recurring door carries live pending intelligence
(the amber 'to pay' chip), and intelligence behind a fold must be
remembered to be seen - above the fold it catches the eye daily until
it turns moss. Other earns the seat on frequency; since OD-3 each door
costs one compact row. The pill now tells the new truth: +7, 'more -
lifestyle, hotel, taxes & tracking' (no organ named that is not
inside). Doors stay CLOSED BY DEFAULT in every state - audited: the
only is-expanded adds target section containers (hub focus), never the
organ doors; both organs already re-collapse on every date change.
THE SPINE, AMENDED ONCE DELIBERATELY, IS RE-FROZEN AS: P0-P4 fields ->
OTHER door -> RECURRING door -> fold(P5 Lifestyle, P6 Hotel, Taxes,
Tracking). Future reorders require the same deliberate amendment.

**OD-3 - the label enters the door** (Aug 2026): the crowded stretch
between Transport and Lifestyle (Rahul's screenshot: gold fold-pill +
grey band + gold door + grey band + gold door + three dashed seams)
diagnosed as three golds competing, two visual units per organ, and an
ambiguous tap target. Cure: the organ BANDS retired; each organ is now
ONE tappable gold row with its name INSIDE the door (.door-lbl, mono
0.5938rem gold-brown - the P-heading grammar); the chevron circle
became an explicit OPEN/CLOSE verb that flips via CSS on the existing
is-expanded flag (both words rendered, visibility swapped - zero JS
churn); the fold-pill shed its gold for paper-soft + dashed border, so
gold on this stretch means exactly one thing: a room you can open.
RC-A's settled state moved from the circle to the verb
(.door-open.settled = moss; the JS hooks ride the same element ids).
Dead chev CSS (rotations, brown circles) retired same-day - css refs
audited to zero. The amber owe chip and both summary texts untouched.

**D2 - the band speaks one phrase** (Aug 2026): the day band's three-
voice cluster retired for a single serif sentence - 'Friday, 14 August
2026', the numeral one step larger (14pt inside 12pt) - drawn
piecewise with each piece positioned by its OWN measured width per the
measurement law. The mono month leaves the band (it survives on
continuation headers); the amber away chip now owns the entire right
corner, so long city names can never crowd the date again.

**PDL-3 - the book breathes, the hours align, the day may continue**
(Aug 2026): four refinements on PDL-2 B. Band month seated fully on
its fill - jsPDF's align:'right' measures UNSPACED text so tracking
pushed the tail past the tint (the pct bug's drawing-side twin, now a
paired lesson: measure at the font that draws, and position by the
width that INCLUDES tracking); position computed by hand from the
spaced width, tracking eased to 0.35. Rail-blocks gain ~40% air
(gap 2.5->4mm). The Hours: fixed 14mm mono time column with compact
labels (12-3 AM form) - alignment by construction - and a fine dotted
rule (dash 0.5/0.9, 0.12 width) between consecutive slots, none after
the last. SPILL RULE: ensure(need) guards every row/line/block-start
against FLOOR; when a day cannot fit, the current rail closes at the
floor, the page footers honestly, and the day CONTINUES on a marked
page ('14 Friday - continued - PAGE 2') where the rail resumes in its
colour; the fn returns pagesUsed and the caller advances runningPage
by it, so every next date opens on its own fresh page and page numbers
stay true. Spill sim: guards fire exactly at the floor, final cursor
always above it. Post-ship: the slot TIME column (6.8pt muted) was the
one voice left outside the one-content-voice law - unified to 8.5pt
ink, identical to its own entry text; the compact 12-3 AM labels still
clear the 14mm column at the larger size (measured ~11.5mm). Second
pass: raggedness persisted because single- and double-digit hours gave
labels different widths against a left-aligned fixed column. Cure by
measurement law: the column is now sized from the WIDEST label at the
draw font, times right-align to one shared edge, values start at one
shared x - alignment survives any future font change by construction.

**PDL-2 B (+B2+B3+B4) - the printed day joins the Budget book**
(Aug 2026): the day page's Roman-heading skeleton retired for the
app's own anatomy - every section a rail-block (0.7mm family-colour
rail drawn to the section's true content height, 6.5pt mono head):
Invested and Spent carry their totals ON the head line (separate
total rows retired - one line saved, same truth); recurring folds
into Spent; CC rides muted 'not in total'. B3: every spent rupee
carries its envelope inline in 5.5pt muted mono - fields via a static
P-map (food/dmart P2, transport P4, shopping/entertainment P5,
hotel/travel P6, taxes TAX), other items via their OE-1 env mark
('P3 - other', bare 'other' when unmarked), recurring 'P0/P1 -
recurring'. B2: a four-stat vitals strip (OUTFLOW - INVESTED - WALK -
DAY%) under the band in year-summary voice - the scan line for a
printed decade. B4: the amber away chip (same verdict + streak walk
as the app, NS-B city included) rides the date band, seated left of
MONTH YEAR by measured width. The band's ground bleeds 3mm past both
margins while its text stays AT the margin - the numeral flush with
every rail below (Rahul's alignment catch). One content voice: labels
and values identical 8.5pt ink 400 everywhere (the screenshot's grey/
black split retired); colour appears only where it IS meaning (rails,
heads, away amber). Hide-empties + italic footnotes retained; empty
sections vanish whole; satisfaction keeps bold; footer verbatim. B5
(the rotating quote) deliberately held - the only non-data ink;
machinery stays dormant for any future season.

**PDL - the day page slims inside its own skin** (Aug 2026): the
original single-column design kept - same sections I-VI, same order,
same footer - every recovery made from within. Header: the hero stack
is one baseline (serif 16pt numeral + italic day name, MONTH YEAR
right-aligned), NO rule beneath - the first section heading's hairline
tail is the page's first line (~22mm back). Money: the statement box
retired (no border/padding/row underlines); open ledger at 8.5pt/4.6mm
with coloured group heads; amounts normal weight; totals BACK by
Rahul's call in the exact row voice - no bold, no rule above, a 3mm
breath marks the close. Field rows 8.8pt/4.4mm; wrapped lines 3.7mm;
section headings +=5. Hide-empties returns via the fn's own dormant
helpers (isBlank/isBlankText/blankNote/fieldLineTwoColSmart - built in
an earlier season, re-employed): blank slots/meals/health fields
vanish behind small italic footnotes ('3 slots blank'); Walk+Heart and
Stayed-at+with pair on one line; NS-B City prints when present.
Satisfaction keeps its bold (a verdict, not a total). Net: ~80mm
recovered on a loaded day; the overlap that motivated PDF-FIT is
solved inside the design instead.

**PDF-FIT REVERTED; PDF-ENV pct fix** (Aug 2026, same day): Rahul saw
the two-column day page and preferred the original single-column
statement layout - the ENTIRE original pdfDrawDailyEntry was restored
verbatim (reconstructed from this session's full-function read; parses
clean, caller back to one-page-per-day). PDF-FIT entry below stands as
history; its measure/spill engine is retired. The envelope outflow
pages (PDF-ENV) are KEPT - with the percentage overlap fixed: the pct
x-position had been measured at the pct font (7pt) instead of the
label's own font (bold 9 + 0.4 charSpace), landing the pct on the
label; the label is now measured in its own voice before the font
switches. Lesson recorded: measure text at the font that DREW it.

**PDF-ENV + PDF-FIT - the PDF learns envelopes and fits the page**
(Aug 2026): PDF-ENV retired the category trio (pdfComputeOutflow /
pdfDrawBreakdownSection / pdfDrawOutflowBreakdown) same-day; monthly
and yearly outflow pages now print the envelope book via
pdfDrawEnvelopeOutflow - the SAME monthEnvelopes_ engine as the app
(wrappers built from bare entries; the engine ignores date), family
rails as small colour ticks (PDF_ENV_RAIL, rgb of the app's OFE
colours), each envelope printing share %, total, and top-2 items +
'+N more' (print has no taps), heavy rule + TOTAL OUTFLOW. PDF-FIT
rewrote pdfDrawDailyEntry as measure-before-draw: every block
computes h(width) BEFORE drawing; a y-cursor with hard FLOOR packs two
columns (money left with Day-outflow rule line, invested, health,
night; life right with meals, hours, takeaway, verdict+introspection in
measured serif); whatever cannot fit flows to a clearly-marked
'continued - page N' full-width page - overlap impossible by
construction (the old fn had ZERO guards, verified). Recurring rows
print their (P0)/(P1) group; header gains the NS-B away tag
(AWAY - CITY - NTH NIGHT, same verdict + streak walk as the app);
footer voice kept verbatim on every page. The fn returns pagesUsed and
the caller advances runningPage by it, so page numbers stay honest
across spills. Geometry sim: fabricated heavy day packs both columns
to the floor, overflows exactly the one block that cannot fit, floor
never crossed.

**NS-B - Night Stay in three rows, with memory** (Aug 2026): the
section split into City (NEW night_city column - migrate_night_city.sql,
plain-ASCII, verification counts) / Property (the DIRECT HEIR of
night_stay: same column, same values, so every home tag keeps matching
verbatim and isHomeAddress/away/trips machinery moves ZERO lines - the
banner simply rides under Property now) / Stayed with. nightCity joined
all four registries (FIELD_TO_COL, FIELDS, TEXT_FIELDS, day-sections
spec) + CSV order; backup is select('*') so it rides free; restore
needs no alias (new column, old ZIPs just lack it). Memory chips grown
from history, presets none: top cities; properties SCOPED to the typed
city with most-used fallback; usual companions - tap fills + fires
input so the home banner answers live. Amber 'AWAY - Nth night' tag on
the section head reads the SAME verdict as the counters (filled
property not tagged home) and walks backward for the streak (sim: 3
prior away nights -> 4th). City deliberately plays no part in the
home/away verdict - one truth, displayed twice.

**TR - the all-time envelope book** (Aug 2026): Trends' 'All-time
spending' category card retired for the same closed envelope book,
spanning every logged year: one line per envelope (family rail, share
%, all-time total) with a sub-line carrying avg/mo and DRIFT - this
year's monthly pace vs last year's ('steady' under 5%); open -> per-
year rows with proportional bars + the envelope's biggest all-time
resident from the detail map. History heals backwards: the engine
re-reads old years through today's rules, so new envelopes (P3) have
an all-time story from birth. envYear computed per year + envAll once;
labels read from s.lbl (data-anchor law applied); rails shared with
MO-2's OFE_RAIL; the old attRevealBtn wiring retired same-day; open
toggles re-render Trends (open bodies built fresh). Fixture sim built
FROM the live BUDGET_SECTIONS source per the new sim law.

**MO-2 KEEP-OTHER - Outflow speaks envelopes** (Aug 2026): the Month
and Year Outflow Breakdown's category list retired; the card now
renders the closed envelope book - one line per envelope in Budget-
card anatomy (2px family rail, mono sticker, share %, amount), largest
first, tap-to-open item rows read from monthEnvelopes_ detail (the
engine is span-agnostic: month gets the month's wrappers, year the
year's). Outflow therefore agrees with the Month Budget to the rupee
forever - one arithmetic, two views. Open-state lives in
_outflowEnvOpen keyed containerId|env so month and year remember their
own open envelopes across re-renders. Meta line (daily - recurring
split) and the trailing-6-month / prior-year comparison lines kept
verbatim. Rahul's call: the Other-breakdown cards KEEP one more season
(their shared .outflow-bd-plain-* CSS therefore also stays - checked
before retiring: the Other card wears those classes too). Fixture sim:
home>official>food>taxes, top 59%, P0 rows recurring 17,921 + AI 1,950.
Post-ship fix: headers rendered UNDEFINED - the renderer read s.sticker
but BUDGET_SECTIONS' true property is s.lbl; the fixture sim had
baked in the same wrong name, so it green-lit the bug it should have
caught. Anchor law extended to DATA: property names are read from the
file, never assumed - and a simulation must import the REAL structure
it exercises, not a hand-typed replica (the second sim now builds its
fixture from the live BUDGET_SECTIONS source).

**T-1 + F-1a - Taxes unbands; the footer takes sides** (Aug 2026):
Taxes' organ band retired (the band marked organs; the doors now mark
Other/Recurring, and Taxes is a single envelope field - kin to Food,
not to rooms); plain underlined heading, hd states untouched; Tracking
keeps its band, its outside-the-envelopes specialness being real.
Footer: the grey shell and divider retired; the two tiles took sides -
Spent on the whisper blush #FBF4F2/#EAD6D2 (Redemption's money-out
ground) with ember label+figure (8.4:1), Invested on its exact green
twin #F4F9F5/#D5E4D9 (same distance from white, so neither side
outranks the other) with green-ink (10:1). Direction-of-money grammar
now complete: blush = out, whisper green = to your future self.
Redemption sub-note and all live updates untouched - colour only.

**RD-1 - redemption whispers** (Aug 2026): the redemption family moved
to the whisper blush (#FBF4F2 ground, #EAD6D2 edge, ember rail/symbol)
across idle, focus, filled, and calc states. The faint-total bug Rahul
caught (scoped light-red button outranking .sum-on's navy, keeping the
pale ground while borrowing WHITE text) fixed at the root: redemption's
sum state now lives in the red house at the same winning specificity -
button deepens to #F6E7E4/#D9AFA9 with EMBER figures (7.6:1 measured);
sum-err alone fills ember with white '!'. Navy FILL untouched
everywhere else. Rule affirmed: a state class must be restyled at the
same specificity as the scoped identity it rides on, or it inherits a
half-costume.

**C-2b FILL + S3 revert** (Aug 2026): the duplicate calc row retired
everywhere (JS silences legacy #_calc nodes; CSS closes the class with
display:none !important). The running sum now lives INSIDE each + 
button: while a '+' exists in the field the button fills navy
(white 13.5:1) with the total beneath the glyph in en-IN grouping;
plain amounts leave the button ordinary (no duplication by
construction); invalid sums fill ember with '!'. Buttons self-build
their glyph+total spans on first update (listeners survive innerHTML).
S3 (right-aligned numerals) REVERTED at Rahul's call after the ledger
logic was explained - one CSS block removed, exactly as promised;
numbers sit left as before. State sim: 594->off, 45+45+326+178->on
'594', 45+ ->err, 1.5+2.5->on '4'.

**INV-W + S1 + S2 + S3 - small strokes** (Aug 2026): Regular
Investment and Top-Up whitened to match every field (thin accent
record-stripe kept as identity); Redemption moved moss->quiet red
(--ember-soft ground, ember rail/symbol/plus/calc/focus/filled, ink
text 12.2:1) - deliberate double duty recorded: ember here means
direction-of-money (leaving your future self), elsewhere over-budget.
S1: the section header whispers today's live spend (mono muted,
written by updateExpenseFooter, hidden at zero). S2: hairline dashed
seams above every group header (.subhead.first exempt) - the Budget
card's own rhythm. S3: money inputs read RIGHT in mono tabular
figures via :placeholder-shown flip (empty = sans left placeholder,
typed = ledger column); applies to currency-wrap fields, other amount,
and rec amount; totals machinery untouched - S3 is typography only.

**G-A - one ground everywhere** (Aug 2026): the Investments & Expenses
section's rose ground (#FDF7F6 / #E0CFCC, the maroon era's last
tenant) retired; the section now falls back to the base .section card
- paper on rule with the house shadow, the Month Budget card's exact
ground - and its --section-accent joined var(--accent). Swept with it:
the cream inputs (#FAEFEC) and the entire lavender investment era
(#ECE6F5/#C7BCE0/#534AB7 + green #ECF5EA) - which, notably, had been
silently OUTRANKING the TH accent-soft tints all along
(.section.s-expenses #id beats a bare #id on specificity); the TH
voices were rewritten AT the winning specificity with native focus
states (accent family for Regular/Top-Up, moss family for Redemption).
Lesson: when overriding scoped legacy rules, match or exceed their
specificity - appending later only wins ties. Second sweep closed the
stragglers: Option-5 cream expense fields (white on rule, accent
record-stripe replacing ember), other-entry creams and peach chips,
amt-wrap filled state, the more-toggle's collapsed rose (now gold at
source incl. the 4px rail + count bead), legacy other-summary border,
and the shadowed dead .subhead.invest pill paint. Out of scope and
deliberately untouched: s-night's lavender, the future-banner, and
historical comments. Expense fields' filled-state stripe language
moved ember->accent: ember now means only 'over budget', never
'recorded'. Tracking heading
trimmed to 'Tracking only' in the same turn.

**IX-A - the fold reordered by frequency, then frozen** (Aug 2026):
inside the more-fold the two golden doors now stand first, together -
Other Expenses, Recurring Payments - then Lifestyle, Hotel + Travel,
Taxes, and Tracking-only last; ordered by actual visit frequency (the
doors are the most-visited rooms below the fold; Hotel sees three
months a year). Six blocks extracted by balanced scans and re-spliced;
no field moved between groups, no data touched. Tracking-only joined
the organ bands (paper-soft fill) - its rule-grey underline that never
turns moss/ember remains the honest tell that no envelope watches it.
STANDING DECISION: the spine is now FROZEN - muscle memory compounds
over 30 years and outweighs future micro-optimisation; reorders from
here need a reason stronger than taste.

**OE-R + PL - Other gets the door; the ledgers go plain** (Aug 2026):
Other Expenses now wears the recurring architecture end to end: inner
duplicate label retired, the white summary pill became the golden door
(MONTH total - N items - amber circle; the old renderer was
today-scoped, now month-scoped), the room whitened inside the golden
frame, and the always-visible today-strip + hidden legacy stubs merged
into ONE in-room flat month ledger (date - name - envelope tag -
amount - x, date-aware delete). The envelope tag CYCLES on tap:
P0->P1->P3->P5->MISC (OE_CYCLE), writing the permanent env mark via
the parcel - the recurring flip's five-stop cousin; each tag wears its
envelope's soft family. PL: one voice for every ledger cell in BOTH
organs - 0.6875rem, weight 400, ink, dates same size as names, no bold
anywhere including the total row (the 2px rule alone closes the book);
mono survives only for column alignment. Kept per Claude's argued vote:
Other's ledger stays (tags need rows to live on; Other is where months
leak; read-model only). Cycle simulated round-trip from lifestyle.

**RC-A + OP-2 - the golden door, the white room** (Aug 2026): the
recurring organ's three stacked layers (heading + dated-tag, amber
pending strip, plum summary pill) merged into ONE golden door on a
clean heading. Door anatomy: paid total ('52,408 - 5 paid') + owed in
amber ('3,821 to pay') + filled amber chevron circle - the unambiguous
press-here; on settled months the owe reads 'all settled' in green-ink
and the circle turns moss. Open, the door's bottom corners square off
and the WHITE room continues inside the same golden frame (OP-2):
owed names greet first ('Waiting: Workspace Gmail ~1,227 ...') on a
dashed gold rule, then chips, ONE entry stack (name - amount - group -
accent Log button), then the flat ledger closing on its firm total.
Retired: the pending strip element (renderRecPending now dresses door
+ owed line), the plum summary skin and has-items stripe, the 'What
did you pay today?' question-subhead, and the heading's dated-tag
(now the ledger caption's tooltip). Amber-on-gold text is the
measured 5.42 pair; the door speaks gold/ink/amber, the room
white/ink/accent, and the two read as one object.

**Clean organ heads, golden fold, and the strip in the wrong room**
(Aug 2026): Other Expenses and Recurring Payments headings cleaned of
their deal-tags (bands + underline only); the more-fold went golden
(#F8F1E4 fill, #D9BD8E border, #8A5711 text - 5.5:1 measured). And the
missing pending reminder was found in the wrong room entirely: its
markup insertion had anchored on find('rec-merged-head'), which
matched the CSS RULE first, and the following find('</div>') landed
inside the boot overlay - the strip rendered forever inside the
spinner, invisible. Freed and seated under the real recurring head
(anchored on the full markup string). Lesson joining the anchor law:
a bare class name matches its stylesheet before its markup - anchor on
markup-shaped strings ('<div class=...'), never on a class name alone.

**U + LG - underlined headings, the flat ledger** (Aug 2026): the
section headings grew to 0.75rem mono and the left rail retired for
Rahul's better idea - a 2px UNDERLINE carrying identity and state in
one stroke: accent under Investments (label inked accent), moss under
an envelope with money left, ember when over (hd-ok/hd-ov painted by
paintFormHeadroom as before), rule-grey for plain organs; headroom
values grew to match their headings. LG: the recurring log's grouped
staircase (date headers, indents, 'migrated' annotation) retired for a
flat ledger - date - name - flip-tag - amount - delete, one line per
bill, newest first, ellipsis names, month-named total row on a firm
2px top rule ('August - 5 payments - 52,408'); today rides the date
cell; tap-to-flip and delete unchanged (same data attributes, same
delegated/rewired listeners); orphaned todayMonthPrefix retired with
its only consumer. Splice note: the grouped block was replaced
positionally between stable anchors after a whitespace-mismatched rep
- long blocks splice by anchors, short ones rep exactly.

**TH - the form wears the card's clothes** (Aug 2026): the maroon-and-
cream era of Investments & Expenses retired; the section now speaks the
Month Budget card's exact language via one appended, scoped CSS block
(cascade-final, legacy rules undisturbed elsewhere). Mapping: subhead
pills became the card's header anatomy - transparent, 2px left rail,
mono uppercase micro-label in var(--muted) (the card's own micro-ink;
the first draft's #68789a measured 4.23 and FAILED the 4.5 floor -
measured, caught, corrected); envelope rails follow headroom state
(hd-ok moss / hd-ov ember, painted by paintFormHeadroom on the parent
subhead); headroom values in green-ink 10.15 / ember 8.76. Investment
inputs wear accent-soft with an accent rail (the Total-budget 'plan'
voice), Redemption wears moss-soft (money coming home); section inputs
whitened onto --rule borders; more-toggle calmed to paper-soft +
accent; preset chips re-inked to rule/muted; pending strip's amber
kept. One language, defined once, worn twice - form and budget read as
one book, and any future theme change moves both together.

**CHIP + PEND - the garden grows, the organ remembers** (Aug 2026):
CHIP: both chip gardens (Other, Recurring) end in a dashed '+ chip...'
that opens an inline add row; user chips store as two string arrays in
user_prefs (Supabase-synced, backup-riding, no new table), render after
the preset residents, behave exactly like presets (name-fill +
dispatched input event so pre-lights fire), and an 'edit chips' link
toggles a pruning x on user chips only. All garden interaction is
DELEGATED on the container because custom chips re-render. PEND: an
amber-railed strip at the top of the Recurring organ - 'Still to pay:
X - N bills' with names and ~last-paid amounts (the same lastByName
memory the suggest pill uses), sorted largest first; moss 'All bills
paid - X this month' when settled; hidden when history knows nothing.
Gate: only the CURRENT real month nags - browsing past months shows no
reminder, because a closed month owes nothing. Reuses
getRecurringHistory's usuallyPaid (2-of-last-3-months) untouched.
Simulation: 4 owed bills summing 5,192, largest first.

**RG - two groups, and the tag is the edit** (Aug 2026): the
subscriptions group retired on Rahul's order - the keyword rules now
answer only home or office (chatgpt joined the office words; netflix,
audible, prime, spotify simply fall home), the engine's separate
ChatGPT exception retired with it (the rule now says plainly what the
exception whispered), old 'subscriptions' marks alias home in the
resolver forever, the RE-1 picker slimmed to two chips, and every
three-way breakdown (month cards, year cards, PDF, hub sums, accordion
state keys, orphaned palette row) slimmed to two in the same commit.
Envelope history unmoved: subscriptions already lived in P1 and
ChatGPT already reached P0. New editing gesture, enabled BY the
simplification: every ledger row wears its group as a small tappable
tag (HOME steel-blue / OFFICE warm-brown, both 9+:1) - one tap flips
the payment's mark home<->office, persists via the parcel, repaints,
toasts. With two groups the edit IS the toggle; the ledger items
builder now carries p.grp through (it was rebuilding {date,name,amt,
idx} and would have shown keyword defaults over real marks - the
parser-strips-marks bug's little brother, caught by the same eye).

**THE GREAT REGROUPING - R-B + OE-1 + RE-1 + Books->P0 + H-3**
(Aug 2026): the largest single build, shipped after a written audit
with five flags and Rahul's CONFIRM. What shipped: (1) H-3 - new
'health' envelope at P3 (key free under S1, no SQL anywhere in the
set); stickers renumbered P4 Daily Transport, P5 Lifestyle, P6
Hotel+Travel; modal follows; Medicine chip deals to health. (2)
Books & Magazines moved to P0 - past months' envelope views shift
retroactively (flagged and accepted); standing rule: NAME-LISTS MOVE
HISTORY; MARKS MOVE ONLY THE FUTURE. (3) OE-1 - Other items carry an
optional env mark in their parcel; picker chips (P0/P1/P3/P5/MISC)
pre-lit by shared name-lists (dashed ring = auto, solid = chosen);
engine reads mark first, lists second, misc last. (4) RE-1 - recurring
payments carry an optional grp mark; three group chips; resolver
(mark -> keywords -> home) routed through ALL byGroup consumers,
including the ChatGPT name exception which now yields to an explicit
mark. CRITICAL AUDIT CATCH: both parsers REBUILT parcels as {name,amt}
and would have silently dropped every mark on read - the audit's
existence is justified by this line alone; parsers now carry env/grp
through. (5) R-B - the form regrouped by pure subhead surgery: ZERO
field blocks moved (the existing order already matched the envelope
spine); old INVESTMENTS/Daily/Discretionary badges became envelope
stickers with live headroom spans (green 8.12:1 / red 7.02:1 on the
ember pill, measured); Other and Recurring organs stay whole wearing
deal-tags; Tracking-only badge for CC+GST; fold label rewritten.
Headroom painter reads monthEnvelopes_+budgetsForYm_ for the BROWSED
month; hooks: boot, every upsertEntry, date change; absent budget =
empty chip, never zeros. Post-ship fix: the headroom painter passed bare entry objects where
monthEnvelopes_ destructures {date, entry} wrappers - e became
undefined and e['food'] threw at boot ('Failed to start'). Callers
must match a function's parameter SHAPE, not just its name; the
painter now passes the wrappers untouched. Build lessons: a phantom count in a staged
edit traced to a wrong-guessed class name ('subhead rec' vs the true
'subhead recu rec-merged-head') - anchors are read from the file, never
assumed; and mid-script assertion deaths between staged writes are why
every stage re-runs its own battery.

**N-A, the mobile fold, and handles not inventories** (Aug 2026):
BIS notes moved inline - right-aligned in the row's leftover space
after the amounts, ellipsis when long (full text behind the edit
door); the below-row div and its negative margin retired, making the
touching-line bug structurally impossible. On phones the note was
invisible: no leftover space, flex share shrank to zero width - fixed
by the M1 lesson (mobile folds, never squeezes): under 640px the row
wraps and the note takes its own full-width line. Envelope stickers
became handles (L-A): 'P2 - Food', 'P4 - Lifestyle' - the deciding
argument was staleness, not width: an inventory-label rots (Spa joined
P4 and the sticker didn't know) while a handle never needs re-editing;
the tap-open detail recites live contents on demand. Rule: a good
envelope name is a handle, not an inventory. Keys and budgets unmoved;
modal followed in the same commit.

**BIS-E - edit, the honest close, and the kept promise** (Aug 2026):
three pieces. E-A: every row's name is a dotted-underline edit door
opening a native modal (name, cost, category, status, delete) - even
the answer you gave can change; status edits preserve existing dates
(review_on survives, decided_on backfills only when absent). E-B: the
Bought action asks 'what did it finally cost?' prefilled with the plan;
paid lives in its own new column (migrate_bis_paid.sql, add column if
not exists) while cost keeps the plan, so bought rows show 'paid X'
plus an under/over-plan delta in green/ember forever; old bought rows
without paid show cost, no delta, no breakage. E-C (Claude's piece):
the 30-day promise surfaces - past-due parked items wear an amber
REVIEW DUE badge and sort to the top (due-first, then by date, proven
by simulation); not-yet-due show their quiet review date. Build note:
a mid-script assertion death left three pieces unwritten while a later
script landed wiring that referenced them - node --check cannot catch
markup-less wiring; the id-existence check in the battery now does.

**BIS-X - Before I Spend comes home** (Aug 2026): the purchase-decision
organ moved from My Wealth to the Budget room, below the Month Budget
card - the envelopes say what remains, this card asks should it leave.
Wording BIS-X won by Rahul's phrase 'the deciding argument is your own
data': every money_decisions row speaks the category language (Need /
Comfort / Meaningful / Desire with their four written verdicts,
verbatim), so history stayed readable on day one; the new-checklist
variant would have orphaned it. New power: the verdict gains the
envelope's side - a second line reading the month's left-to-spend from
the budget card (mbLast). DEVIATION FROM MOCK, flagged: the mock showed
per-envelope maths (P4 has X left); shipped is month-total left,
because the app cannot know which envelope a purchase would hit without
asking - a per-envelope selector is a possible follow-up. Month
behaviour per the three-cursor mock: Parked and Planned pinned every
month; Let go and Bought ride decided_on with a 'Resisted this month'
moss line. Build pattern: skeleton built once (dataset.built) so typed
inputs survive renderMonth's frequent re-renders, lists re-render into
their own host, all wiring delegated on the wrap (the trapped-modal
era's lesson applied in advance). Wealth excision: markup, edit modal,
CSS, 14k-char JS block, print/export call sites, and the fetch - the
export object's closing brace was swallowed by the cut and repaired
(excisions that cross an object literal must re-close it). One organ,
one home; money_decisions itself unchanged and already in
backup/audit/restore.

**The trapped modal** (Aug 2026): Set budgets seemed to need many
clicks and 'opened very late' - the diagnosis was geometry, not timing.
The N1 DOOR build wrapped the summary organs into #monthRoomSummary,
and the Set-budgets modal markup was sitting among them; in the budget
room the summary wrapper is display:none, and a fixed overlay inside a
hidden ancestor renders nothing. Every click DID open the modal - it
was open, invisibly, and appeared only when the user wandered back
through the door to the summary room ('opens after clicking somewhere
else'). Fixed by moving the modal outside the summary wrapper, beside
the budget wrap, still above the scripts (the boot-order law). Position
proof: summary-close < budget wrap < modal < first script. Rule
learned: overlays live at the section's top level, never inside a
sibling room - a door that hides a room hides everything it swallowed.

**The hub subtitle's three bugs** (Aug 2026): the Today card under
Investments & Expenses was sometimes wrong and sometimes said 'no
entries yet' over a full day. computeHubPreview had three independent
faults: (1) money fields hold typed expressions ('120+80') and the
function read them with Number(), which NaNs an expression to zero - a
day logged entirely in expressions summed to nothing and the preview
hid itself; fixed with evalExpr, the app's one money reader. (2)
recurring items were read as r.amount when the writer stores {name,
amt} - the SAME writer-not-comments bug fixed in the envelope engine
lives wherever recurringLog is read by hand; fixed with parseRecurring.
(3) entertainment and taxes were missing from the spend list, so those
rupees never reached the 'out' total. Six-figure simulation proves the
repaired sum. Standing rule extended: entry money is read ONLY through
evalExpr, recurringLog ONLY through parseRecurring - any hand-rolled
reader of either is a bug waiting for its day.

**Spa, the word-boundary guard, and P0** (Aug 2026): new Other
Expenses chip Spa beside Salon, dealt to P4 by name. Adding a 3-letter
name exposed a matcher flaw proven by simulation: plain includes()
would file 'spare parts' into P4. The matcher now splits by length -
names over 3 chars match by inclusion as before; short names match as
whole words (exact or \b-bounded), so 'spa', 'spa day', and 'day spa'
reach P4 while 'spare parts' and 'spatula' never do (six-case node
simulation in the transcript). And the Official envelope took the
sticker P0 - Office, completing the P-series on Rahul's theme call;
the key 'official' never moved, per law.

**OPT-2 - the last brand leaves storage** (Aug 2026): Rahul asked to
rename Uber to Daily Transport; the check-first pass found the name at
three depths - screen (form label 'Uber / Petrol / Metro / Parking'),
code (62 lowercase sites incl 7 note-fields, plus 5 capital-label
sites), and the entries table's own column 'uber' (whose note column
was already transport_note - the amount column was the last brand in
the database). OPT-2 chosen over label-only OPT-1 by Rahul's 2050 test,
and rightly: by S1's own law inside names must name contents, and
'uber' names a vendor. Shipped as one commit: guarded migration
(migrate_daily_transport.sql renames the column, idempotent, with
before/after counts), full code sweep to dailyTransport (FIELD_TO_COL
value hand-set to snake_case daily_transport - the sweep would have
camelCased a DATABASE name; mapping values are column names, not JS
fields), labels to 'Daily Transport (Cab / Petrol / Metro / Parking)'
incl the CSV/PDF export header, and the forever-alias in restore.html:
entries rows arriving with an 'uber' key file into daily_transport, so
every backup ZIP ever downloaded stays restorable. audit and
note-editor confirmed column-generic (select *), untouched. Sequence:
SQL first, then upload daily.html + restore.html together.

**O1 + Taxes + the travel remap** (Aug 2026): the verdict pair became
one railed line under the filled accounts row - 'Left to spend X / Y
per day - N to go', moss rail, green and deep-amber numerals, reading
as the tiles' younger sibling (chosen over centered and soft-strip
variants: left-aligned like everything in My Day, no third fill). Over:
ember rail, 'X over / hold the line'; past months drop the per-day
half and the slash. Sections: Taxes became its own envelope above
Miscellaneous (new key 'taxes', no migration - new keys are free),
taking the Taxes & Bills day field out of misc; Travel moved from
transport to the hotel envelope, whose sticker became 'P5 - Hotel +
Travel' (key 'hotel' unmoved - contents grew, the name still holds);
P3's sticker became 'Daily Transport' now that only Uber feeds it.
Modal gained the Taxes field above Misc and both relabels in the same
commit. Probe note: a first-occurrence order check compared the CSS
rule's position, not the renderer's - order probes must scope to the
function that paints, not the whole file.

**The brand leaves the book** (Aug 2026): Swamoney removed from every
file on Rahul's order - the envelope label became 'Official - Office'
(card and modal), the engine's mapping comment followed, and the mocks
were swept. Two sites keep the word deliberately, on
Rahul's ruling: the backup-ZIP recovery README (note-editor.js) and this
file's deployment line point at github.com/swamoney/myday because that
IS the repo - the name there is infrastructure, not branding, and
recovery instructions must state true addresses. Rule: user-facing
labels carry no brand; addresses stay true.

**F2 + L2 - voices and the reading order** (Aug 2026): the two account
tiles gained fills in their own voices - Total budget on accent-soft
(the plan, 14.6) with an accent rail, Total spent on ember-soft (the
event, 6.84) - both from My Day's existing tokens; the verdict pair
stays bare so the two kinds of fact read differently. The lineup became
Rahul's reading order - Official, Home, Food, Transport, P4, Hotel,
Misc - with stickers renumbered to match (L2 over L1: P-numbers read as
positions in this app, and a P2 above a P1 would itch monthly). S1 paid
its first dividend exactly as designed: the reorder + renumber touched
only the labels array and modal markup - keys and saved budgets never
moved, no migration. The modal reordered and relabelled in the same
commit (labels move with their card, always).

**S-A - the room comes home** (Aug 2026): Rahul rejected the built K5-R
hero - 'odd compared to overall My Day, not in that theme, more crowded,
more coloured' - and he was right about the root cause: the hero was
designed in why.html's language (serif, dark gradients, mono chips)
while My Day speaks paper cards on the dotted ground, dashed rules,
2px-rail stat tiles, and SANS tabular numerals. Lesson recorded at
constitution level: A ROOM IS DESIGNED IN ITS HOUSE'S LANGUAGE - read
the host page's tokens before drawing, not another page's habits.
S-A rebuilt the card as literally the Month Summary's grammar: native
card head (title + month + underlined Set-budgets link), four stat
tiles in the six-tile grid's exact anatomy (Left/moss, Per-day/amber
rail with deepened #8A5711 text since My Day's #BA7517 fails as text at
3.56, Budget/plain ink, Spent/ember), dashed divider, envelope rows in
sans with dashed separators and 4px moss/amber/ember bars, details on
paper-soft. Over: Left tile turns ember, per-day says 'hold the line'.
The mb-card base style folded into the coat (one card, one truth).
K5-R's journey (V1, D1, K5, the two refinements) remains recorded below
as the path that taught the lesson.

**K5-R - the split-card hero** (Aug 2026): the Month Budget room's card
grew a proper headline after Rahul called the flat ledger 'off'. Chosen
through four mock rounds: V1 hero-led ledger (over envelope-wall and
ring), then V1-D split verdict (LEFT TO SPEND beside PER DAY - the
number you can carry into a shop tonight; gold because a daily allowance
is a small deadline), then D1 two decks (verdict big, Total budget /
Total spent as a proper second deck - hierarchy follows usefulness:
verdict, guidance, accounts), then coat K5 (ink verdict head flowing
into ivory account body - material says what size says, and the card
ends in white against the white rows), then Rahul's two refinements:
the tricolour composed bar deleted entirely (the envelope rows below
carry all the health colour) and serif numerals replaced with clean
Plex Mono - the face every rupee in My Day already wears; borrowed
grandeur retired for the app's honest money voice. Set budgets moved
into the ink head (the hero owns the numbers, so it owns the door to
change them); the card's title badge retired (the room's door already
names the room). Per-day shows only for the current month (left /
days-remaining incl today); over budget the left cell goes rose and
per-day reads HOLD THE LINE; the no-budget state is the invitation
inside the same ink head. Mock arithmetic drifted across generations
and the audit caught the hero disagreeing with its own rows - the build
computes hero and rows from one totals pass so agreement is structural.

**Two rooms for the month** (N1 DOOR, Aug 2026): the Show-envelopes
toggle retired for the bucket/explore door grammar - the Month section
is now two rooms, Month Summary and Month Budget (name N1, chosen over
My Budget Book / Spending Plan / Money Envelopes / Budget Ledger for
sibling symmetry with Month Summary), swapped by one door chip top-right
under the month arrows that names the OTHER room and wears the
destination's colour (ink #22334f to the budget, ember #B4542A - the
app's money voice - back to the summary; 12.69 and 4.95). The arrows
serve both rooms; the heatmap toggle stayed inside the summary room
where its content lives. Structural lesson that made the door better
than the toggle: a room that is entered needs no switch - the open/
closed state machine evaporated (mbOpen deleted, mbRoom remains).
paintMonthRoom_ runs at the head of every render, before its gates, so
the door always has words. Law restated for My Day: one place, one
purpose, a door between.

**S1 - keys name contents, never positions** (Aug 2026): Rahul flagged
the p6-wearing-P5 mismatch as future confusion and asked for solutions
first, decision second. Three were laid out (S1 semantic keys + one
migration; S2 renumber keys each shuffle; S3 live with it documented);
he chose S1 after a plain-words boxes-and-stickers mock. Stored keys
became food/home/transport/lifestyle/hotel (official and misc already
true); migrate_budget_keys.sql rewrites saved rows idempotently, deletes
dead p5 shopping rows, and carries before/after check queries; the
engine, dealing lines, and modal ids (mbm_<key>) renamed to match;
stickers (P1..P5 labels) untouched. The key-vs-label law is now
structural, not disciplinary: no sticker can contradict an inside name,
because contents are not positions. Supersedes rev 3's 'keys never
move' rule - keys moved exactly once, to names that never need to.

**Envelopes rev 3** (Aug 2026): the two toggles joined one row -
envelopes first, heatmap second - inside the heatmap's own controls
block (.mtoggle-row flex line; the metric row keeps its own line below),
with the card rendering under the buttons. Re-dealing: Ironing moved
from P4 to P2; the P5 Shopping envelope was cancelled and the shopping
field now deals into P4, whose label became Rahul's own words 'P4 -
Books, Entertainment, Shopping, etc.'; Hotel Stay inherited the P5 name.
Storage note recorded deliberately: the hotel envelope KEEPS its stored
key 'p6' while wearing the 'P5' label - the key is storage, the label is
presentation, and re-keying would have orphaned any saved p6 budget row.
Old p5 (shopping) budget rows simply stop rendering; harmless. A future
section shuffle must follow the same rule: labels move freely, keys
never move once budgets exist under them.

**Envelopes rev 2** (Aug 2026): four changes on Rahul's first live use.
(1) BUG: recurring rupees scored zero everywhere - the engine read
r.amount but recurring items are {name, amt}; daily.html even owns a
canonical parseRecurring reader. Fixed by using it. Lesson, kin to the
manifest one: two comments in the same file described two shapes; the
WRITER (setRecurring) is the only truth - read the writer, not the
comments. (2) The card moved from POS-2-always-on to the section's very
start as a Show/Hide envelopes toggle in the heatmap's exact manner
(same .heatmap-toggle clothes, aria-pressed, closed by default,
renders nothing while closed). (3) Hotel Stay left misc for its own
envelope - Rahul asked for 'a separate P5' but P5 was already Shopping
by his own earlier ruling, so it shipped as P6 - Hotel Stay; flagged
aloud for renaming if he wants the numbers shuffled. (4) New Other
Expenses chip Home Cleaning, dealt to P2 Home by name (P2_OTHER list).

**Boot-order lesson** (same day): the envelope modal was first inserted
before </body> - which in daily.html sits AFTER the script blocks, and
init() runs synchronously at parse, so getElementById('mbCancel')
returned null and the whole page failed to start. Fixed by seating the
modal markup beside its card in the month view, far above any script.
Rule: markup that init() wires must exist above the scripts; '</body>'
is not a safe anchor in a page whose scripts live at the body's end.

**Restore manifest lesson**: audit's table list is strings, restore's is
objects - a blind phrase-rep on restore corrupted an object literal and
node caught it. Rule: before repping a shared name across sister files,
read each file's shape at the site; manifest entries are added in the
file's own grammar, never by string adjacency.

**The third verdict** (Aug 2026): Cancelled joined the seal - 'the
question no longer needs an answer; walking away is also a decision'.
Rewired at every site the W1 rule names: seal dialog (with the date
relabelled Decision finalized on, per Rahul), edit modal, the verdict
helpers (dcVerdict_/dcVerdictLong_/dcCanx_ - six wording sites now flow
through one helper, so a fourth verdict someday is a one-function
change), index trail row, page meta, print, export, delete confirm.
Cancelled wears slate - Q4's set-aside colour, a verdict not an alarm -
with an X disc where the tick sits and the same optional stars (some
walk-aways deserve five). The Happened field sleeps when Cancelled is
picked: nothing happens to a cancelled question. And the section chip
traded the old weighing scales for CHIP-A's bare tick - Rahul chose the
mark of resolution over my clipboard counsel; the door now promises what
the room delivers: questions ended.

**One gold grammar for every deadline** (G1, Aug 2026): the bucket
index's two-deck PLANNED FOR chip flattened to the checklist's own BY
form - 'BY DEC 2026' gold, 'PASSED - MAR 2026' dark red when overdue
(9.16) - so a dream's plan and a decision's target are now the same chip
learned once, and the shortest wording serves the phone fold. The stacked
pk/pv anatomy retired from the index chip and its CSS; the dream PAGE's
bkDatesRO keeps its labelled stacked chip on purpose (pages state things
in full - same rule as NOT YET). Probe note, third of its kind: a grep
for 'PLANNED FOR' cried failure at the page's own legitimate words -
probes must scope to the organ they test, not the phrase they fear.

**The rows learn to fold** (M1, Aug 2026): the Decision Pending box
plus the gold chip broke phone-width rows (and the bucket's new rows with
them) - the title was being crushed between chips. M1 chosen from three
folds mocked in 360px frames: the chip cluster of every row (checklist
desk and trail, all bucket statuses) now rides in a .rowdeck span that is
display:contents on desktop - zero layout change above 640px - and
becomes its own full-width second line under 640px, indented per symbol
(47px past the donut, 28px past the trail disc, 24px past the bucket
marks) so chips sit under the text, not under the mark. Principle: the
title is the row's soul; it is never squeezed or truncated - name first,
facts below, the way a thumb scrolls. M3's abbreviations were declined
because 'Pending' without 'Decision' spends the clarity the red box was
added for. The bucket's delete cross and progress edge stay outside the
deck (absolute-positioned organs do not fold).

**The pending debt, and the wing on the line** (Aug 2026): every desk
row now carries a solid-crimson Decision Pending box (#a8323f, white,
6.58) - P2 chosen over the rose whisper deliberately: the bucket's NOT
YET stays soft because a dream can wait sweetly, but a pending decision
is a debt, and it is the one waiting state allowed to interrupt. The
explore wing's rows, chips, count, and add button stepped from the boxed
era's 14px onto the 38px line the bucket rows stand on, with the 20px
mobile step (inline style beat by the media rule via !important - noted
as a wart to clean if the inline pad ever moves to a class).

**The trail's empty throne** (Aug 2026): Rahul's screenshot caught the
build drifting from the C13 mock - the mock's trail was chip-led with no
circle, but the build had carried C3's 34px tick-ring over, an unflagged
deviation. The re-mock named the flaw: the big ring earns 34px on the
desk where the arc shows progress; on the trail nothing fills, so the
circle was an empty throne. T3 chosen: the trail now wears the bucket's
exact 15px ticked disc - a sealed decision and a lived dream carry one
mark - and the row's weight moves to the stars and the date. Lesson
recorded at full strength: a deviation from a chosen mock must be said
out loud in the ship note, even when the builder thinks it an
improvement; the mock is the contract, and silent amendments to a
contract are how trust erodes.

**C13 after all** (Aug 2026): a day with C3's bare docket and Rahul
reversed to the hybrid - the donut rows put C1's rails back on (petrol
desk rail, deep-sea trail rail over the faint wash), keeping the stars.
Two-line change because the C3 build had kept everything else of C13's
anatomy. The rail earns its place: it is what tells desk from trail
before the eye reads a single word.

**The donut docket, and the door crosses the room** (Aug 2026): the
checklist index took C3-with-stars after a C13-hybrid mock round - desk
rows open with a progress donut (r15 arc; the number is the answered
count, the arc is the progress, an empty ring at zero) followed by the
question and a gold BY chip; trail rows open with an ink tick-donut, the
question, the gold satisfaction stars Rahul asked for, and the plum
check-date chip. The donut absorbed three organs (ring, count line,
progress bar) and their CSS retired with them, including the dc-notyet
ring the donut replaced. Index simplification: HAPPENED/NOT-YET-LIVED
pills now live on the page only - the index lists, the page records. The
bucket door moved to the right side above the add buttons in a doorrow
(flex-end, 38px padding, 20px at 640px) - and the Make-a-dream button's
stale 14px inset from the boxed era was set to the 38px line the rows
stand on, with its own mobile step. Process note: the div census caught
an unclosed trail card before ship - the count assertions and the census
are earning their keep weekly.

**The door on the line; NOT YET in rose** (Aug 2026): Rahul's eye
caught the door chip floating off the 38px line that the chip row and
every dream row stand on - aligned with margin-left 38px, stepping to
20px in the 640px media block where the book's own padding steps (the
stack-measurement lesson: an alignment fix that ignores the breakpoints
is only half an alignment). The NOT YET pill took F1: the rose wash
#fbeeef with deep rose ink #8a3540 (6.97), no border - deliberately the
old stamp tiles' rose ground, a memory of the passport kept in the
ledger. F4 solid was declined on principle: solids are how DONE and IN
THE MAKING speak; the waiting state should be the quietest voice in the
book. Ring stays slate: symbol says begun-or-not, pill says waiting.

**The door, the default, and the quiet pill** (Aug 2026): the bucket's
two tab-chips became one door chip, top-left - it always names the OTHER
room and wears that room's colour (ocean 'My Explore List' from the
bucket; teal 'My Bucket List' from among the places), keeping the
chip-wears-the-door rule with a twist: it wears the DESTINATION's door.
Dreams & Doings is the default room and its chip retired entirely - a
room needs no name when you are standing in it. Places was renamed My
Explore List at the door (the count line inside still says PLACES - it
counts things, not the room). And a waiting dream with a planned_on date
drops its NOT YET pill in the index: the hollow ring says 'not begun',
the gold chip says 'but it is coming' - two pills saying one thing was
noise. The dream's own page still states NOT YET in full; print and
export unchanged (words carry status on paper).

**The passport becomes a ledger** (R2, Aug 2026): the whole Dreams &
Doings book converted to rows - the mock stated the trade honestly (the
stamp grid's charm vs a working list's clarity) and Rahul chose the list.
One base .stamp row (white, slate rail) with two variants: wip recolours
the rail teal, done (R2) recolours it ink over a faint ink wash - the
whisper of the old inked stamp's pride. The symbol triad completes:
hollow ring (not yet) -> pulse (in the making) -> ticked disc (lived),
the same promise-language as the checklist desk. Pills follow: outlined
slate / solid teal / solid ink. Rotation retired from the book entirely;
the grid, tile paddings, and per-status tile backgrounds retired with it;
stars, plan chip (overdue red), progress edge, and delete cross all
survive inline. Builder collapsed to one path - symbol, name, stars,
pill, plan - no more wip-only wrapper. Two rep() misses on stale anchors
were caught by count assertions before any write; the file was never
half-changed.

**The pulse and the ring** (L1+N1, Aug 2026): two status marks chosen
against the thirty-year test - drawn, not emoji (emoji render differently
per device and age like slang). WIP rows open with the on-air pulse: a
10px teal dot breathing a soft ring every 2s, stilled under
prefers-reduced-motion (and inherently on paper). Desk decisions open
with the unticked ring: 13px hollow petrol circle - deliberately the
visual question that the trail's existing check-mark chip answers; the
desk promises, the trail fulfils. Both marks are aria-hidden (decorative;
status is already stated in text beside them). Print and export
deliberately carry the WORD not the symbol - same fact, medium-
appropriate encoding; a pulse cannot pulse on paper and a printed word
outlives any glyph. Placement verified single-site each: the pulse only
on wip rows, the ring only on desk cards, never in the trail.

**WIP becomes a ledger row; the room renamed My Checklist** (Aug 2026):
the Dreams & Doings work-in-progress card - solid teal banner, -2deg
lean, 1.44rem serif line, rotated mark - was spending four devices on one
sentence ('this one is alive'). W1 replaces it with the app's own active-
thing grammar: full-width white row, 4px teal rail, title left, solid
teal IN THE MAKING pill, gold plan chip (overdue red kept), progress edge
kept. The banner element retired from builder AND css in one pass (zero
bk-hd2 orphans). The lean now belongs only to DONE stamps, where rotation
celebrates; on a working item it just looked tilted. Principle: active
items everywhere live in ledger rows - desk decisions, person next-steps,
dreams in the making. Separately the section renamed again: My Big
Decisions -> My Checklist (Rahul's call, closing the loop to his original
checklist instinct), all six user-facing sites in one rep.

**The alphabet takes four of five bands** (Aug 2026): a day after the
big bands went alphabetical, Rahul extended it to My Confidants and My
Active Circle - his reasoning: tags already carry any grouping he needs,
so hand-order earns nothing there either. Only Close (five people) keeps
the hand: at that size position is a statement. One-line change because
the arrows and comparator both read ALPHA_BANDS - retiring a band's
arrows and re-sorting it are the same switch. Simulation re-proven across
all bands. The durable shape: order by meaning where order IS meaning;
order by alphabet where finding is the job; group by tags everywhere.

**Directories go alphabetical** (Aug 2026, fixed same day): first ship
defined the comparator but nothing called it on load - sortCircle_() ran
only inside the arrow-mover, which the alphabetical bands no longer have,
so the list still rendered in DB order. Rahul caught it in one look. Fix:
loadCircle now calls sortCircle_() after fetch. Verified by simulation:
mixed-case names across three bands produce A-close,B-close (hand order)
then amit,Zara / Arjun,Meera (alphabetical, case-insensitive). Lesson for
the constitution: wiring a comparator is two changes - define it AND call
it on every path that paints; the mover was the only caller because the
mover used to be the only re-orderer. My Community (51-150) and
The Wider World (150+) now sort by name inside their bands; Close,
Confidants, and Active Circle keep the hand-set order. The reasoning,
argued and agreed: hand-ordering ~250 acquaintances with one-step arrows
is busywork without meaning - the big bands are directories, not
rankings, and directories want the alphabet; in the inner bands position
IS meaning, so the hand stays. localeCompare with sensitivity:base
handles Devanagari and Latin names together; created_at breaks ties. The
reorder arrows retired from alphabetical rows in the same pass - a
control that lies (move someone, the alphabet snaps them back) is worse
than no control. sort_order values in those bands sit ignored, kept
harmless for if a band ever returns to hand order.

**The hero opens, the page locks** (Aug 2026): two asks in one pass.
First, the person's circle/band, rhythm, tag, and note became editable
from the page itself - an 'Edit details' door in the hero (dashed sage
pill, visible only in edit mode) opens the existing circle modal with
that person loaded; no second edit surface was built, the one form kept
its single home. Saving the modal now also repaints the open page's hero
(capture editingPerson BEFORE closeCircleModal nulls it, flush in-page
edits with savePerson_(true), then openPerson re-reads). Second, read
mode became truly read-only: the intent matrix taps, moment date-opens,
moment text inputs (pointer-events:none), the three Add buttons, the talk
delete crosses, and the tap-hint all sleep until Edit - joining the
already-gated essay, moment crosses, and rating box. The rule: a page in
read mode can change nothing; every mutating organ wakes together behind
one Edit button.

**The veil lifts** (Aug 2026): the person page's PERSON_SOFT table -
which muted Priority's quadrant colours for the old tinted grid cells -
retired whole. The softening was tuned to keep full accents from fighting
pastel washes; on the S2 white ledger rows with H3 solid pills it read as
faded, not gentle. Now PERSON_Q's exact Priority accents colour
everything: pill, rail, tick-circle, code, and the closed-archive chips
(which also drew from the soft table and followed in the same pass).
Measured as pill fills: Q1 6.51, Q2 6.79, Q3 4.57 (the closest call),
Q4 5.35. One quadrant, one colour, both rooms.

**The label leaves, the pills return** (Aug 2026): Rahul removed 'What
is next' over my counsel to keep it (I argued it anchors one of four
parallel sections; he judged the four Q-pills beneath make the zone
self-evident - and with H3 landing at the same moment, he is right: four
solid colour pills ARE a heading). The label's toggle button and chevron
retired with it; the count and Add button keep the header row; the other
three section pills stay; print keeps 'What is next' since paper lacks
the pills' context at a glance. H3: quadrant names became solid pills in
each quadrant's accent with white text (6.5-6.8:1) - restoring the old
grid's own .pr-qv voice inside the stacked rows, and completing the pill
grammar: sage for zones, quadrant colours for quadrants, at decreasing
size down the page.

**What-is-next unstacks** (S2, Aug 2026): the person page's 2x2
intentions grid became a single column of slim ledger rows - white cards
with a 4px rail in each quadrant's accent, Q-code + label + count on one
header line, Q1 to Q4 in reading order. The SOONER/LATER and ACTIVE axes
retired with the grid (each box's own words already say what the axes
said); the tinted quadrant washes retired with the cells. Interactions
untouched: tap the circle to close, tap the words to edit; the archive
below unchanged. Scoping mattered: .pr-q and the axis classes are SHARED
with My Priority's matrix, so the stack got its own person-only classes
(p-stack/p-qr) and Priority keeps its 2x2 with URGENT/NOT URGENT axes.
Verification note: my first check greped for SOONER to prove Priority
intact - but Priority's axes say URGENT, so the probe cried failure at
its own wrong assumption. Probes must assert what the OTHER thing
actually contains, not what the changed thing used to.

**One heading grammar** (Aug 2026): the roadmap's hero treatment -
highlighter sweep in the room's wash, solid 88x6 signature bar, then the
facts - extended to the Circle person page and the Big Decisions page,
mocked before-and-after first. Person: the Newsreader name swept in the
sage wash (--pc-wash) with the deep-sage bar signing beneath the name
row. Decision: the Fraunces title swept in the K1 petrol tint (#cfe2e8),
and the old faded ::after underline retired for a real .dc-sig element in
solid petrol - the roadmap's exact bar, signed with conviction. Both
names became inline spans so the sweep hugs the text's own width and
wraps line-by-line like a real marker stroke. The app's three most
important page types - a why, a person, a decision - now open the same
way, each in its room's voice.

**Person pages join the common ground** (Aug 2026): Rahul unified the
app's page backgrounds - the Circle person page's deliberate stone-cream
ground (the old comment read 'a person is not a ledger entry') gave way
to the ivory-blue every other overlay page already stands on (#fbfcfe bg,
white cards, #e2e8f2 borders). Preserved on purpose: the room's sage
voice (deep/wash/ink accents) and Newsreader hand, so the page keeps its
personality while sharing the app's climate. The swap surfaced a
pre-existing contrast debt: --pc-faint measured 3.44 on the new white
(and was already 3.1 on the old cream) - both muted tokens darkened
(mut #63645c 5.6, faint #75766f 4.7) so the unification settled an old
debt instead of inheriting it. One theme, one floor.

**One divider, deeper chip, places step in** (Aug 2026): 'On the desk'
retired - Rahul's call, agreed on sight: the add button and living cards
ARE the desk, so the label narrated what the layout already said; The
trail is now the room's one divider (its CSS left with it; the Edit-the-
checklist button kept its row; print/export keep the 'On the desk'
heading because paper has no interactive cues). The section chip deepened
to K1 (--t-bg #cfe2e8, --t-acc #1d5666, 6.1:1) - darkest tinted chip in
the row while still speaking its siblings' tinted language. And the
places wing gained the 14px inset the dreams book always had (padding on
bkRoomPlaces; the door's own padding retired the same moment to avoid a
double inset) so prow cards no longer touch the section's line - the
third appearance of the same lesson: content never touches the walls.

**B2 ground + the true name** (Aug 2026): the boxed panel's fill became
the bucket's ground one breath deeper (165deg #f4f7fb to #e2e8f2, border
#dfe5ee) - same family as the page so the room shares the app's climate,
deep enough that the walls stay visible. And the section found its final
name: My Big Decisions (M5, over My Decision Checklist/Book/Desk/Trail) -
renamed at all six user-facing sites (chip, page bar, section print h1,
single-decision print eyebrow, export h2, print title) while code
comments keep the historical N3 name. The name says what the checklist
only implies: this room was never for small choices.

**Decisions unboxed, then re-boxed** (Aug 2026): asking for 'the
bucket's background' uncovered that the bucket has no panel at all, so
the box was retired for consistency - and Rahul reversed it on sight:
the boxed panel returned exactly as it was (ivory-blue gradient, hairline
border, 14px wall insets), restored with its insets in one pass so
nothing half-returned. Decisions is now deliberately the one boxed
section in My Why: seeing both on the page beat the consistency argument.
Note kept for honesty: consistency is a reason, not a verdict - the eye
outranks it.

**D1: decisions turn petrol** (Aug 2026): the rust accent family retired
for petrol #23677a with deep-sea #144552 as its evening shade - chosen
from four fresh-coat mocks (petrol / indigo ink / wine / graphite) judged
against the sibling chips in the actual row. The sweep repainted the
section chip family (--t-faint #f0f6f8, --t-bg #dcebf0, --t-acc #23677a),
On-the-desk shelf (petrol) and The-trail shelf (deep-sea - the pair
belongs together where rust/bronze were two unrelated warms), the New
decision and seal buttons, card left rules (desk petrol, trail deep-sea),
the two-tone progress gradient, number circles, the P24 name sweep, the
story shelf, checklist-manager chrome, and the answered-card border.
Kept deliberately: the GOLD ratebox family (#8a6d1a label, gold stars,
amber history line) because satisfaction is the app-wide gold voice, and
the locked plum/green chips. Contrast audit five pairings all clear
(desk 6.38, trail 10.49). Note: a too-broad hex sweep-check flagged the
gold label as 'surviving rust' - reading the actual context showed it was
the ratebox's own gold, a reminder that colour audits check FAMILIES, not
raw hex survival.

**P1: the parchment gives way** (Aug 2026): Rahul liked everything about
the warm redesign except the parchment itself - 'yellowish'. Four palettes
mocked live (app ivory-blue, terracotta blush, sage stone, cool slate
mist); P1 chosen. The sweep replaced every parchment-derived value in the
decisions room - page gradient, panel gradient, cards, hairlines, warm
text tones - with the app's own ivory-blue family, while every SEMANTIC
warm accent stayed: rust rules, rust number circles, the P24 sweep, the
plum and green chips, the gold ratebox. Result: the room matches the
app's climate and the chips pop harder against neutral. Twelve-pair
contrast audit all clear (worst 4.81). Same commit, bucket request: the
Dreams & Doings chip's active state changed from gold to the teal of its
own Add-a-dream door (#2F6F6A, 5.83) - each room's chip now matches each
room's door, completing the identification logic Places started.

**My Decisions warmed, chips merged** (Aug 2026, from a screenshot):
Rahul's screenshot showed verdict and finalized-date wearing the same pale
rust side by side - two chips saying halves of one fact - and named the
room dull. One pass, mocked working first, shipped: the merged verdict
chip (check-mark + 'FINALIZED WITH CARE / FINALIZED WITH MY GUT' + date,
solid plum #5b4a86 white, 7.59), the sparkle happened chip (U+2726 +
'IT HAPPENED' + date, solid green #2f6a4a white, 6.4), a warm-grey NOT
YET LIVED, and chips STACKED one per row - a ledger read top to bottom
(desk pages show NOT YET FINALIZED in the same slot). Wording is Rahul's:
'Finalized with...' makes both verdict halves answer the same question,
where weighed/went answered different ones; swapped at all sites incl.
seal dialog, edit modal, print, md, export, delete confirm; dc-made badge
retired with the old card layout. The page moved onto the bucket page's
bones: sticky top bar, 1000px column (was 600), parchment gradient
replacing the grey-blue, the name at 2rem/700 wearing the P24 signature
sweep in rust, questions in a TWO-COLUMN grid (the width's whole point;
folds to one at 640px) with rust circle number badges, story at a 72ch
measure, warm gold ratebox, warm footer pill. The section warmed to
ivory-cream gradient, desk cards with a 4px rust rule and two-tone
progress, trail cards parchment-gold wearing the chip stack on the card.
Contrast: first mock measurement caught the rust eyebrow at 4.1 and card
meta at 3.5 - darkened to #8a5a1c (5.66) and #75604a (5.86) before build;
final audit of 14 pairings all clear the floor.

**Two dates per decision** (D2, Aug 2026): what began as a wording
question ('When was it decided?') turned out to be a model question -
Rahul meant TWO moments: the day the call was made and the day the
decided thing came true. Built from a working mock: 'Finalized on'
(decided_on, required at sealing, defaults today, amber history line for
the past) and 'Happened on' (new nullable happened_on column via
migrate_decision_happened.sql) - optional at sealing because some
decisions are still waiting to be lived, fillable later through Edit
details. Trail cards and the page's meta row wear the pair: rust for the
call, green for the lived, and a grey NOT YET LIVED pill while the world
catches up - which also quietly explains why satisfaction stars may still
be empty: you rate a decision after it has happened, not before. All four
output paths carry both dates ('finalized X, happened Y' or 'not yet
lived'); 'Opened on' was removed entirely the same day (field, prefill,
save, and the re-sort that existed only for it). Lesson: when a label
feels wrong, ask whether the MODEL is wrong - the bad name was hiding a
missing column.

**Decision pages: read first, pen in the footer** (Aug 2026): the Edit
button moved into the footer pill as its first verb (Edit - Copy -
Download .md - Print/PDF) and became a MODE, not a modal-opener. Every
page opens reading: answers readonly, story rendered without toolbar
(shelf hidden too when the story is empty), stars quiet (unrated box
hidden entirely), and decide/delete/catch-up banner all absent. Edit (to
Done) brings out everything: editable answers on desk pages, the
NoteEditor with toolbar, the golden ratebox, the seal button, deletion,
catch-up, and an 'Edit details' pill that opens the frame modal (name,
dates, verdict). Leaving edit mode flushes the story save and records the
version. Seal-date label reworded to Rahul's 'When did it happen?' in
both the seal dialog and the details modal. 'Opened on' was trimmed from
the new-decision popup (daily door stays minimal) but KEPT in Edit
details - the compromise: everyday capture is two fields, historical
backfill remains one Edit away.

**Decision pages gain Edit** (Aug 2026): a quiet Edit pill beside the
back button opens a frame-editing modal - name, target date, opened-on
(rewrites created_at, then re-sorts the shelves), and on sealed decisions
also the decided-on date and the W1 verdict choice. The modal touches only
the FRAME: answers and the story keep their own doors (textareas on the
desk, the NoteEditor below, the frozen-pairs rule on the trail), so
correcting a typo in a title can never disturb what was written at the
time. The page repaints from openDecision after save.

**My Decisions completes** (Aug 2026): historical entry, honest words,
and the story. The seal dialog gained 'When was it decided?' - a calendar
defaulting to today but free to travel back, with an amber 'Writing
history: sealed N days ago' line when it does - and the new-decision popup
gained an optional 'Opened on' that writes created_at, so an old decision
carries its true beginning and sorts into its true place. Verdict wording
is W1 (chosen over Deliberate/Instinct and Slept on it/In the moment):
'Weighed with care - I sat with it, walked the points, let it settle' vs
'Went with my gut - I knew fast, the heart moved first' - both halves
dignified, because gut calls are often the best ones; data values stay
thoughtful/quick, display strings updated at all five sites (card, page
pill, print, export, delete confirm). The story: a NoteEditor mounted
below the checklist on every decision page, desk and trail alike (answers
freeze at sealing; the story stays alive for later reflection). Decided
against a box: long-form writing gets OPEN PROSE - shelf label, hairline,
breathing room - not a border. Debounced autosave, sanitised, version
history via note_versions source 'decision-note' recorded on page close;
note_html column via migrate_decision_note.sql, carried by select(*).
Each decision page also gained a footer pill - Copy, Download .md,
Print/PDF - built from one shared dcMd_ builder so all three verbs tell
the same story; section print and .md export carry the story too.

**My Decisions, hardened** (Aug 2026, from first use): Rahul found the
missing delete verb and asked how the checklist could grow without ever
mismapping answers. The mapping fear was already structurally impossible
(answers live as frozen {q,a} pairs, never by position) but the tooling
around it was unsafe, so: the replace-all textarea retired for a ROW
MANAGER (rename inline, reorder arrows, remove with confirm, append) whose
every operation shapes future decisions only; open desk decisions get a
CATCH-UP banner counting master points they lack (computed by question
TEXT, never index) and 'Bring them in' APPENDS them as glowing NEW cards -
append is the only operation permitted to touch an open decision, with a
local rollback if the save fails; the trail is never offered catch-up.
Deletion lives on the decision's PAGE only (never the cards): one light
confirm on the desk, and on the trail a stern confirm that names exactly
what is being erased - the sealed answers, the verdict, the stars. Rule
distilled: history may be deleted deliberately, but never edited
accidentally.

**My Decisions** (N3, Aug 2026): a new My Why section - the checklist
before the leap - chosen by name (N3 over Crossroads/Compass/Calls/Forks/
Weighing Room/Turning Points) and by shape from a working mock that went
through one revision: no inner chips, one flowing page with On the desk
first and The trail beneath. Rust hue family (#8a4a22) - distinct from
priority's amethyst and every other chip - with a weighing-scales icon.
The model: the master checklist (why_decision_points, default 11 points
shipped, edited one-per-line via a dashed control visible only in the
room's edit mode) shapes NEW decisions only; each decision freezes its own
{q, a} pairs at creation, so editing the checklist never rewrites history.
A decision opens via a small popup (title + target date) onto its own
overlay page: numbered question cards with debounced-autosave answers and
a progress bar on the desk card. 'I have decided' asks the journaling
question - Thought through or Decided quickly - then seals: status trail,
decided_on stamped, answers frozen, textareas readonly ('(unanswered at
the time)' where blank). Satisfaction (1-5, same-star-clears, its own
caption ladder from 'wrong turn' to 'one of the best calls') is rated only
on the sealed decision's page - the bucket's lesson applied from birth.
Infrastructure grew in the same commit per the standing rule: two new
tables with RLS + range checks (migrate_why_decisions.sql, 19-row check),
EXPORT_TABLES 17 to 19, audit.html manifest + labels to 19, restore.html
+2 rows, note-editor version bumped to 20260818a on all four pages, print
and .md export both carry desk + trail with answered Q&A. Run the audit
after the first backup: the column check proves the new tables arrived.

**The bucket refined by use** (Aug 2026, second pass, mocked working
first): three revisions from Rahul actually using the first build. The add
buttons moved back to the right corner in both rooms - his call, and the
right one: that is where the door lived before the merge, so returning
muscle memory reaches for it (my centring lost to a better argument).
Add-a-dream became a popup in the app's own modal grammar - the dream,
status chips, dreamed-on (prefilled today), optional planned-for, with
Done revealing the lived-on date - and Save inserts then opens the dream's
own page via openDream(newId); the inline dashed card retired with its
handler the same day. The split is deliberate: the popup asks for facts,
the page asks for meaning (the note stays on the page). Stars were half-
built (stamps had them, the page did not - my miss) and the interaction
was wrong: now the stamp's small stars are read-only (hollow and faded
when unrated) so a stamp tap does exactly one thing, and rating lives
ONLY in the golden box on the done dream's page, on its own line beneath
the DONE mark, with a whispered caption per rating (1 'well, it happened'
to 5 'worth every day of the dreaming'), same-star-clears, and the grid
repainting on return so stamp and page always agree. Living dreams carry
no rating box. Print, export, backup, and the rating migration are
unchanged from the first pass.

**The bucket's doors and stars** (Aug 2026): three small builds in one
pass, mocked working first. The Add-a-place button had no stretching CSS
bug - the flaw was placement (justify-content:flex-end stranded the lone
button at the room's far edge after the U2 merge), so it is now centred
under the gold chips. Dreams got the twin: an Add-a-dream button (same
pl-addbtn geometry, teal #2F6F6A vs ocean) that opens a dashed new-dream
card at the head of the grid with Save/Cancel + Enter/Esc; the old
'+ New dream' grid tile retired with its handler the same day - one door
per room, same handle, each room's own hue. Done stamps (and only done -
living dreams never wear stars) carry a lacquered 1-to-5 star box under
the DONE mark; tap to rate, tap the same star to clear (rating -> null).
Data: bucket_items gained a nullable rating column via
migrate_bucket_rating.sql (plain ASCII, idempotent, range-checked 1-5);
select(*) carries it into backups automatically and the audit's
column-completeness check proves it. All four output paths updated
together: screen stars, section print, and the .md export both append
filled/hollow stars after the Done date.

**Explore moves into the Bucket List** (U2, Aug 2026): My Explore List is
no longer a top-level section of My Why - it is the second room of My
Bucket List, behind a gold inner chip pair (Dreams & Doings | Places).
Decided from a WORKING mock built from the app's own harvested CSS and
builders (bkCard, renderPlaces, plHue - which turned out to read the city
list, so scoping it per instance was mandatory), so the choice was made by
feel, not by picture. The merge is UI-only: bucket_items and why_places
stay separate tables - backup, restore, and the audit unchanged. Both
existing UIs survive byte-for-byte inside their rooms (city chips, hue
system, add flows). Print of the bucket section now appends the geography
chapter (grouped by city) after the dreams, because paper has no tabs; the
orphaned places print branch retired the same day. U1 (one long page) lost
to scroll depth; U3 (places as stamps) lost because it demolishes a
working room for a prettier sentence.

**The backup audit** (Aug 2026): a full audit of Backup everything, in two
halves. Static: the app touches exactly 17 tables (grep of every .from()),
EXPORT_TABLES lists the same 17, restore.html restores all 17; _fetchAll
pages at 1000 with a per-table sort map (entries by entry_date,
note_versions by saved_at, wealth_snapshots by on_date, why_journeys by
updated_at, user_prefs/wealth_meta unsorted single-page), retries unsorted
on sort errors, and surfaces failures via alert + export_warnings in the
json; zero localStorage writes exist, so no data lives outside Supabase;
the three files are json (verbatim vault), md (readable book), README.
Live: audit.html is a read-only harness deployed beside the app - it
counts all 17 tables in the live db, then compares a chosen backup json:
per-table row counts, newest-row presence by id, and column completeness
on that newest row, with a PASS / FAIL verdict, daily-log date-range
summary, and drift detection for unknown tables. Its manifest and sort map
are asserted (in the build) to mirror note-editor.js exactly - if
EXPORT_TABLES ever grows, audit.html must grow in the same commit.
Step 0, the security probe (added same week): the harness also knocks on
all 17 tables as a stranger - raw REST with only the public anon key, no
session, deliberately bypassing the signed-in client - and verdicts each
table PROTECTED or EXPOSED. Empty tables prove little, so the probe
cross-references the census when available ("N rows exist, stranger sees
none" is the strongest proof). Privacy stance, recorded: the anon key is
safe to publish only because RLS scopes every table to user_id; audit.html
holds no secrets and uploads nothing (the backup json is read locally);
backup files themselves are the whole life in plaintext and must never be
committed to the repo. Standing sequence: census, probe, backup, verify.
Lesson from the harness's own first run: it shipped against invented
config globals instead of the app's real MYDAY_CONFIG and died on load -
the audit tool failed its own first audit. Even diagnostic pages recon the
bootstrap they join; assumptions are verified against source, never typed
from memory. Standing rule: audit after every backup that matters, and
after any schema change.

**The year-progress block rebalanced** (O2, Aug 2026): Rahul spotted that
after the second polish the 63% stack (13px grid + 1.25rem number + caption,
~90px) outgrew the date column (~80px) beside it. Fix: geometry, not
retreat — the grid and the number now stand side by side (.feat-sym is a
row; pct + caption in .feat-sym-col), dropping the block to ~47px, inside
the row's rhythm, with both arm's-length legibility wins untouched. A 6x2
grid was rejected as calendar-false; shrinking the % was rejected as
giving back a won argument. Lesson: two individually-right growths can
still be jointly wrong — measure the stack, not just the parts.

**The hub's second polish** (Aug 2026, from a Claude Design review): the
review mostly rediscovered what the hub already had (the navy band, gold
remain pill, month grid, and % lived all predate it), so only true deltas
were taken, each argued through an A/B mock: the band deepened to near-ink
(#232f52 to #141d38 — the page's one dark object should anchor like one;
white 16.6:1); the month grid grew to 13px cells and the % to 1.25rem
because the year-spent figure must survive an arm's-length glance; room
cards grew to 200px min-height at 22px radius with larger chips — but the
title stays beside its chip (the bottom-settled title opens a dead zone
with one-line descriptions); the creed left its frosted box (a benediction,
not a widget — rooms are boxes because they are doors); and One Life took
the P24 signature rule, 88x6 centred, in the full rainbow — the biggest
name in the app signed the way every Why is signed. The creed's contrast debt
was settled the same day (F3): Rahul's eye caught the footer reading
wrong; the diagnosis was an inverted hierarchy (the creed at 1.0625rem
introducing its 1.3125rem elaboration) plus the old gradient's washed-out
midsection. Now the creed leads at 1.375rem in deep ink (10.9:1) and the
rainbow line answers at 1rem, rebuilt from the seven pillar solids (worst
stop 3.97 vs the 3.0 large-text floor) - the sentence about the soul's
colours written in the soul's actual colours, rhyming with the dots below.

**The mark on the hub** (M2a→E2, Aug 2026): the prism stands left of the
masthead — tile-free, 58px (46 small screens) — but as a SATELLITE:
absolutely positioned off the text block (right:100%), so the words own
the true page centre. Rahul's eye caught the flaw in plain M2a: centring
icon+gap+text as one unit pushed One Life 36px off the page spine that the
band, creed, dots, and pill all hang from. Below 370px the mark tucks
above the title, centred. Lesson: when a mark joins a centred composition,
the composition's centre must not move. Inlined from
icon.svg with the tile rect stripped at build time; regenerate from the
master, never redraw. The footers (hub and rooms) stay markless by choice.

**The mark** (Aug 2026): a prism — one ink beam enters, seven colours
leave. The theme as physics: living well is what splits one life into all
its colours. Master is `icon.svg` (512 grid, cream tile, ink #16264d, the
seven room hues); everything fits inside r=205 of centre so Android's
circular mask never clips it. Renders: `icon-180.png` (iOS home screen,
repo root) and 192/512 PNGs embedded base64 inside `hub.webmanifest` — the
manifest stays self-contained, zero icon-file dependencies. The hub favicon
is the same SVG inline. Regenerate all three from icon.svg; never edit a
PNG. Noted honestly: the prism-and-spectrum echoes a famous 1973 album
cover; ours is Newton's 1666 diagram — outline triangle, cream ground,
seven named hues — which predates and outlives any album.

Retired Aug 2026: `wisdom.html` and `hub.html` (Wisdom became a native My
Library section; the old hub became `index.html`). The `wisdom` TABLE was
dropped Aug 16 2026 after a four-check verification: equal counts, no missing
titles, byte-identical passages, and live copies newer and larger than the
originals (growth, not loss). A fresh full backup was taken FIRST — the
originals live verbatim in that zip forever. Standard set for any future
table retirement: verify content (not just counts — equal totals can hide a
loss plus a duplicate), compare timestamps to learn which side is truth,
back up while the exporter still knows the table, and only then drop — the
same-day rule (§6) run in reverse. Files are UI, tables are memory, and
backups are memory's memory.

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
circle at a time. **Completing always asks for the month** — things are
often finished before they are marked, and a trail that silently stamps
“now” lies a little every time.

**Journey pages** (Aug 2026): every trail entry can open into its own page,
laid out at the shared room width (§2.8) as a card on the room's blue
ground. The header is the pillar's **soft tint with ink text** and a thin
solid rule — the same clothing the pillar pages wear; never a loud
gradient. The body is rich text written with the app's own **NoteEditor**
(the pillar-essay editor: one toolbar, one sanitiser, one language for all
writing), stored as sanitised HTML in why_journeys; legacy plain-text bodies
render fine because toHtml converts them. Tapping a row opens the page; the
entry popup moved one tap deeper (the ✎ in the page header, which also
deletes — the page goes with the entry, and the confirm says so). Storied
rows wear a quiet ¶ in the trail and in print, md, and export; the room
zip echoes each story via xRich_ and files it standalone as .md through
NoteEditor.toMarkdown.

**The trail runs flat** (Aug 2026): newest first, no year folding — at 4–5
entries a year, furniture would outweigh content. The folding can return in
an afternoon if a year ever grows heavy; entries carry full dates either
way. Dates wear mono #5A6478 at weight 600 (5.95:1) — subtle but present.
Empty Now/Lineups are omitted on screen AND in print, md, and the room
export: paper never claims a heading the screen doesn't show (an agreed
exception to §4.5's honest-empty dashes — in the passbook, absence IS the
honest state, and the one door keeps both places reachable).

**Optional date ranges** (R2): an entry may carry an end month, `m2`, beside
its start `m`. The "+ until…" link in the completion popup and the Add
Journey / edit popup reveals the field; backwards ranges are refused at
save. Singles keep full month names; ranges compress to one line ("Mar 2025
– Aug 2026", ppShort_). A ranged entry sorts by its END (ppKey_ = m2||m):
it joins the story where it concluded. ppFrom_'s log normaliser must carry
m2 through explicitly — the norm() trap repeats at every level: any field
not named in a rebuild map is silently deleted on the next reload.

**The signature** (P24, Aug 2026): a marked name in the pillar's own colour
is the mark of My Why. The pillar page's name (rm-num, weight 700) wears a
highlighter sweep — the pillar's solid at 30% behind the lower half of the
letters — with an 88x6 rule in the same solid beneath: highlight says the
name is alive, the rule anchors it like a signature line. The journey page's
story title wears the same sweep on its tinted header. The sweep is pure
decoration behind ink text (never colour-as-text): worst measured pairs
across all seven hues are 12.04 (name on page) and 6.45 (title on tint),
gated in the build before writing. Sweeps use box-decoration-break:clone so
wrapped lines each carry their mark; hues wire per pillar via --rm-sw /
--rm-sol / --pgsw from hueA_(solid, 0.30).

**Items have identities from birth** (Aug 2026): pp.now / pp.toward hold
{id, t} objects, never bare strings — the normaliser converts legacy strings
on load and flags one save so ids persist (_migrated, deleted before save).
Completion carries the id across into the trail, so **a story page follows
its item through life**: written as a Now, still attached as a ✓. Tapping
any row — Now, Lineups, or trail — opens its page; the chip wears the
pillar's NAME (p.num) and the item's status; the ✎ routes to the item or
entry popup by kind; deleting an item deletes its page and says so.

**How a room signs off** (X3, Aug 2026): every room except My Day ends the
same way — a compact hairline pill of that room's own verbs (icon + word at
caption size; rooms without a verb simply have no segment for it), then the
soul dots (16px, live pillars via the shared fetch pattern, each a ?rm= door
to its roadmap; My Why renders them from its local pillars and opens the
roadmap directly), then the colophon line. The hub keeps its own ending —
it already closes with the soul line and full-size dots, and a signature
repeated too often becomes wallpaper. Sign out always leans red on hover.

**The spine reaches the hub** (H1, Aug 2026): under the footer's soul line,
index.html fetches the real pillars (ids and names only) and draws the
rainbow in the user's true order, hues, and count — RAINBOW and hueFor are
copied verbatim from why.html at build time, never re-invented. Tapping a
dot opens why.html?rm=<id>; why.html reads the parameter after pillars load
and opens that roadmap on arrival. The ?rm= deep link now exists for any
future pointer (bookmarks, other rooms). Under the line that says each
colour completes your soul sit the actual colours, not a stock rainbow.

**The spine rides everywhere** (W1, Aug 2026): the rainbow dot-row lives
directly under the section chips on the main page (one fixed home, every
section — a landmark that moves is half a landmark), and under the bar inside
every pillar page. Journey/entry pages carry no spine (removed Aug 2026): a
page for reading and writing one thing is a destination, not a crossroads —
the named back button already says where you are. One builder
(whyDots_) renders all three from the live pillars in order; the Why you are
standing on wears a ring (.pchip.here). Jumps are guarded: rmDirty asks
before leaving an edited roadmap, an open story writer is guarded by the page's own back button.

**Free movement** (Aug 2026): the item popup carries Where chips (Now /
Lineups / The trail ✓, wearing renamed headings, current place selected);
Save moves the item, id and story intact. Choosing the trail routes through
the month-ask — nothing enters the record undated — and the old Complete
button retired into that chip. The entry popup carries the same chips as the
road BACK: a trail entry can return to the living lists, its month retiring,
its id and page remaining. An open page's chip follows every crossing.
Reordering: ▲▼ per row, visible only in the roadmap's Edit mode (the
rename-pencil pattern), with the wealth room's at-the-edge toasts. The trail
itself never reorders — its order is time's.

**The passbook's colour grammar**: Now/Lineups headings are full-fill
seal-gold pills (#f4c430 / #4a3410, 7.14) — gold marks the living lists;
every row's text wears the pillar's sweep at 30% (worst 7.47 across all
hues and grounds) — the pillar's hue marks every line of this Why; and the
heavyweight swept names (pillar + story titles) rank above both. Row sweeps
live on inner spans (.pp-itxt / .pp-wt) inside the flex shells so the mark
hugs the words, not the row.

**Each page carries its own three output paths** (copy / download .md /
print, as header icons beside the ✎) so a story can be handed over
without handing over the app. **Writing happens on the page itself, never
in a box** (Aug 2026): Edit keeps the story in place with reading
typography (the writer wears .pp-rd), the toolbar sits above a hairline,
and the only cues are the toolbar and a caret in the pillar's solid — the
pillar-essay feeling. Hue vars (--pgt/--pgs/--pgi) are set on the page ROOT
so header and caret both inherit. The why-name eyebrow is a **chip: white on the
pillar's solid** — solid carrying white is what solid exists for. It first
shipped as solid-coloured text on the tint (≈4.1), the exact
decoration-as-text trap this very section warns about; the rule catches its
own author too.

**Full-screen layers in why.html have a stacking ladder**: rmw 500, person
window 520, journey page 560, modal overlays 900. A new layer must take a
rung on this ladder, not a guessed number — the journey page first shipped
at 260 and opened invisibly underneath the roadmap window it was tapped
from; no verification suite catches a layer hidden below the floor.

**Journey storage rule**: bodies live in their own table, `why_journeys`
(one row per page, unique on user_id + entry_id), and NEVER in the roadmap
JSON — that blob is rewritten on every circle-tap, and thirty years of
essays inside it would make each tap slower and riskier every year. Page ids
load per pillar (one light query on open); a body loads only when its page
does. `why_journeys` joined `EXPORT_TABLES` (18) and the restore list on the
day it was born (§6). The room's zip export is the complete archive: each
story is echoed under its trail line in the book AND written as a standalone
.md in `why-journeys/` (the wisdom-library pattern); the quick per-pillar
print/copy stay lines-only with the ¶ — the page is the story's home.

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

**Deployment:** push to `swamoney/myday` (the GitHub repo; the name is infrastructure, not branding), bump `?v=` on changed assets. Without the
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
