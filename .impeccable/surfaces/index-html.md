---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

Scope: the whole app (index.html): week overview, workout preview, guided session, summary, settings/account. Mode: Operate. Phone-first (390 wide), works on desktop.

Job: open, see what to train today, train it set by set with the phone on the floor, finish, see streak/minutes/kcal. Sync across devices via Supabase login.

User additions: exercise demonstrations required (sequential start/end images from free-exercise-db, Unlicense, plus a YouTube search link per exercise).

## Direction contract

THESIS: The week is a metro line; training days are stations, the streak is how far the train has run. Refuses the fitness-app card stack with progress rings.

OWN-WORLD: Signage-enamel dark ground #10161d, panel #1b2530, track #3a4754, ink #eef2f5, muted #9aa7b3; one line colour, orange #ff5a1f, reserved for the current station / current exercise only (raise from orienteering). Done stations solid ink, upcoming hollow rings, rest days small track dots. Be Vietnam Pro for UI, Barlow Condensed for numerals and station labels.

STORY: The visitor sees how far the line has run, which station is today, what stops (exercises) it has and how long each takes; they start, log reps, and watch their station fill in.

FIRST VIEWPORT: Top panel: streak numeral (large condensed) + this week's 7-station line with today lit orange. Below: today's workout name as heading, minutes · kcal · exercises meta, the stops as a vertical line with right-aligned minutes summing to the 45:00 budget (raise from J-card). Primary action "Bắt đầu" pinned bottom, full width, orange. In session: the rep target huge (scale-contrast hierarchy, raise from specimen), the alternating two-frame demo above it; the session's stops as a horizontal line at top. kcal shows its formula on tap (raise from monochrome). History stacks past weeks as identical-scale lines (raise from folio).

FORM: Assigned grounded candidate 7 of 7 (Hanoi metro wayfinding). seed:05bd26c5e719dd4d

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

Hosting target (static HTTPS host) not chosen by the user yet.
