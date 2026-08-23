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
