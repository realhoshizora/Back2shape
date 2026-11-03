---
name: Back2shape
description: A home-workout week drawn as a metro line, read from the floor at night.
colors:
  line: "#ff5a1f"
  line-ink: "#10161d"
  line-soft: "rgba(255, 90, 31, .22)"
  miss: "#ff8a7a"
  ok: "#6fd3a0"
  ground: "#10161d"
  panel: "#1b2530"
  panel-2: "#233040"
  track: "#3a4754"
  ink: "#eef2f5"
  ink-soft: "#c3ccd4"
  muted: "#9aa7b3"
  demo-plate: "#ffffff"
typography:
  display:
    fontFamily: "Barlow Condensed, Be Vietnam Pro, sans-serif"
    fontSize: "clamp(120px, 34vw, 168px)"
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: "0.01em"
    fontFeature: "tnum"
  display-streak:
    fontFamily: "Barlow Condensed, Be Vietnam Pro, sans-serif"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: 0.9
    fontFeature: "tnum"
  headline:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  numeral-meta:
    fontFamily: "Barlow Condensed, Be Vietnam Pro, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1
  label-station:
    fontFamily: "Barlow Condensed, Be Vietnam Pro, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.06em"
  label:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  track: "3px"
  field: "12px"
  r: "14px"
  sheet: "22px"
  pill: "99px"
  full: "50%"
spacing:
  gut: "20px"
  stack-sm: "10px"
  stack-md: "14px"
  stack-lg: "22px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.line}"
    textColor: "{colors.line-ink}"
    rounded: "{rounded.r}"
    height: "60px"
    typography: "{typography.title}"
  button-primary-disabled:
    backgroundColor: "{colors.track}"
    textColor: "{colors.muted}"
    rounded: "{rounded.r}"
    height: "60px"
  button-ghost:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    height: "60px"
    padding: "0 18px"
  button-ghost-hover:
    backgroundColor: "{colors.panel-2}"
  button-ghost-in-sheet:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    height: "50px"
  button-step:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "72px"
  button-icon:
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    size: "44px"
  input-field:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "50px"
    padding: "0 14px"
  sheet:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "22px 20px 24px"
---

# Design System: Back2shape

## Overview

**Creative North Star: "The Night Line"**

The week is a metro line on a dark enamel signboard. Training days are stations, the streak is how far the train has run, and each session's exercises are stops along a vertical branch. Everything is read the way wayfinding is read: from a distance, at a glance, by shape before colour. The world is dark only, chosen from the use scene (evening at home, phone propped on the floor 1–2 m away), not as a theme toggle.

Density is low and the scale contrast is extreme: one condensed numeral dominates each screen (the streak, the rep target, the rest countdown) and everything else steps far down to quiet UI text. Surfaces are flat enamel panels; depth comes from tone, not shadow. One line colour, signal orange, marks "you are here" and nothing else.

The system refuses the fitness-app card stack with progress rings: no tile grids of stats, no rings, no eyebrow labels over headings.

**Key Characteristics:**
- Metro-line state grammar: solid ink = done, hollow ring = upcoming, orange = now, small track dot = rest, dashed miss ring = missed.
- One orange, reserved for the current station, current exercise and the primary action.
- Condensed tabular numerals carry every number; a humanist sans carries every word.
- Stats are inline numeral+unit meta rows, never tiles.
- Flat tonal panels on a near-black blue ground; dark only.

## Colors

A cold signage-enamel neutral ramp with a single hot line colour and two quiet status hues.

### Primary
- **Signal Orange** (`line`): the line colour. Fills the current station dot (with a soft halo in `line-soft`), the current stop pin, the current set bar, the current session-track node, the current station's day label, and the pinned primary button. Text on it is `line-ink` (the ground colour). Also the focus ring and selection highlight, as the system's single "attention" signal.

### Tertiary (status only)
- **Missed Coral** (`miss`): dashed ring on a missed station; sync error dot; error messages. Never a fill.
- **Synced Mint** (`ok`): sync-ok dot and success messages only.

### Neutral
- **Enamel Night** (`ground`): page ground, hollow-ring interiors, input wells.
- **Signboard Slate** (`panel`): the top panel (bleeds to the window edges), sheets, ghost buttons, step buttons, the next-up row on rest.
- **Raised Slate** (`panel-2`): hover tone on panel controls; 1px hairline dividers; ghost buttons inside sheets.
- **Rail Grey** (`track`): the unrun line, rest dots, the stops spine, disabled primary, input strokes, dotted underlines.
- **Chalk** (`ink`): text, done stations, the ink run of the line, done pins and bars.
- **Soft Chalk** (`ink-soft`): secondary body text and meta rows. Currently hard-coded in the stylesheet rather than a custom property.
- **Fog** (`muted`): tertiary text, upcoming pin rings, icon-button glyphs, units.
- **Demo Plate** (`demo-plate`): the white plate behind exercise demonstration images only (the source images are on white).

### Named Rules
**The You-Are-Here Rule.** Orange appears only on the current station, the current exercise (pin, set bar, track node) and the primary action. If nothing on screen is "now" or "do this next", nothing is orange.

**The Ink Run Rule.** The ink run on the week line ends at the last done station's centre. It never extends to today or beyond.

**The Shape Before Colour Rule.** Every station state reads without colour: filled, hollow, dashed, small dot. Colour reinforces shape; it never carries state alone.

## Typography

**Display / Numeral Font:** Barlow Condensed (with Be Vietnam Pro, sans-serif), weights 600–700, tabular figures.
**Body Font:** Be Vietnam Pro (with system-ui, sans-serif), weights 400/600/700/800.

**Character:** A tall, narrow wayfinding numeral against a warm, Vietnamese-diacritic-ready humanist sans. Numbers are signage; words are conversation.

### Hierarchy
- **Display** (700, clamp(120px, 34vw, 168px), 0.85): the rep target in session. The rest countdown runs larger (clamp(140px, 44vw, 210px)). One per screen.
- **Display Streak** (700, 64px, 0.9): the streak numeral in the top panel.
- **Headline** (800, 28px, 1.15, -0.01em, balanced wrap): the screen's one h1 (workout name). Exercise name in session uses 800 at 24px.
- **Title** (700, 18px): section headings (h2) with 40px above; sheet titles 800 at 20px.
- **Body** (400, 16px, 1.5): instructions and paragraphs, capped near 46ch on rest-day copy.
- **Numeral Meta** (700, 24px, 1): numerals inside meta rows; 22px in the week summary, 20px for stop minutes and the session clock.
- **Label Station** (600, 13px, 0.06em): day labels under stations.
- **Label** (400, 13–14px): units, sub-lines, formula text, history dates.

### Named Rules
**The Numerals Are Signage Rule.** Every count, duration, kcal and rep is set in Barlow Condensed with tabular figures. Words never are.

**The One Giant Rule.** Each screen has at most one display-scale numeral; everything else is at least 2.5× smaller.

## Layout

Single column, phone-first: max 560px, centred, with a 20px gutter (`gut`). The top panel's colour bleeds to both window edges while its content stays in the column. Desktop is the same column centred on the ground; sheets become centred dialogs from 700px.

The primary action is pinned in a bottom dock (max 520px) over a gradient fade to the ground, with safe-area insets respected; main content reserves 120px of bottom padding for it. Rhythm is loose: 10/14/22px stacks inside groups, 40px before section headings.

The week line is a 7-column grid; stations sit on their column centres and the rail runs from the first centre to the last. History stacks past weeks as identical lines at reduced scale (date | line | count), so weeks compare by eye.

## Elevation & Depth

Flat by default. Depth is tonal: ground → panel → panel-2. Only two shadows exist, and neither is decorative.

### Shadow Vocabulary
- **Station halo** (`box-shadow: 0 0 0 6px var(--line-soft)`; 5px on the session track): a soft orange ring around the current node only.
- **Sheet lift** (`box-shadow: 0 -12px 40px rgba(0, 0, 0, .45)`): bottom sheets over a `rgba(5, 8, 12, .6)` backdrop.

### Named Rules
**The Enamel Rule.** Panels sit flat on the ground. No card shadows, no hard offsets, no glows beyond the current-station halo.

## Shapes

Round-cornered enamel: controls and panels at 14px (`r`), fields at 12px, sheets 22px on their top corners (all corners on desktop). Line geometry is round: 6px rails with 3px caps, circular stations and pins, rounded set bars (28×6px). Step and icon buttons are full circles. The only pill is the image-overlay tag on demonstrations.

## Components

### Buttons
- **Shape:** gently rounded (14px), 60px tall in the dock, 50px inside sheets.
- **Primary:** full-width Signal Orange with night-ink text, 800 weight 18px, leading inline SVG icon. One per screen, pinned in the dock.
- **Hover / Focus / Active:** hover brightens (`filter: brightness(1.08)`), press scales to 0.98, focus shows a 3px orange outline offset 3px. Disabled drops to Rail Grey with Fog text.
- **Ghost:** panel-toned, ink text, 600 weight; hover to panel-2. Inside sheets it starts at panel-2 and hovers to track.
- **Step (±):** 72px panel circles flanking the rep numeral, 30px icons.
- **Icon button:** 44px circle, Fog glyph, ink + panel-2 on hover. The sync button carries a 10px status dot (track / muted / ok / miss).
- **Text links:** Fog, underlined, 14px; ink on hover.

### Inputs / Fields
- **Style:** 50px tall, ground well, 1px track stroke, 12px radius, 16px text; label above in Soft Chalk 14px.
- **Focus:** stroke shifts to Signal Orange.
- **Error:** message text in Missed Coral below.

### Week Line (signature)
Seven stations on a rail. Station dot 22px with 4px ring: done = solid ink, upcoming = hollow ink ring on ground, now = orange fill with 6px halo, missed = dashed coral ring, rest = 10px track dot. Day label under each in Label Station; today's label in ink, the current station's in orange. The ink run overlays the track up to the last done station.

### Stops List (signature)
The session's exercises as a vertical line: a 4px track spine with 14px pins (3px Fog ring upcoming, ink done, orange current). Each row: name (600) with a Fog sub-line, minutes right-aligned in Barlow 20px; 56px minimum row. A hairline total row sums the minutes.

### Session Track
Horizontal miniature of the stops: 4px bars between 14px nodes, ink when done, orange node with 5px halo for current.

### Rep Counter
Display numeral centred between two step buttons, unit below in Fog; set bars above (28×6px, track / ink / orange).

### Meta Row
Inline numeral+unit pairs (Numeral Meta in ink, unit in Soft Chalk), 18px apart, wrapping. The kcal entry is a button with a dotted track underline that reveals its formula.

### Sheet
Bottom sheet dialog on panel, 22px top corners, slides up 40px with the house ease (`cubic-bezier(.16, 1, .3, 1)`, .45s).

### Demonstration
White plate (14px radius, 3:2, max 34dvh) alternating start/end frames every 1.2s; under reduced motion both frames show side by side. A translucent ground pill tag sits bottom-right.

## Do's and Don'ts

### Do:
- **Do** keep orange to the current station, the current exercise and the single primary action.
- **Do** encode state by shape first: solid ink done, hollow ring upcoming, small track dot rest, dashed miss ring missed.
- **Do** end the ink run at the last done station.
- **Do** set every number in Barlow Condensed 700 with tabular figures and pair it with a lowercase unit in the UI face.
- **Do** show stats as inline numeral+unit meta rows.
- **Do** pin the primary action full-width in the bottom dock at 60px tall.
- **Do** keep tap targets at 44px or more (stops 56px, step buttons 72px) for use from the floor.
- **Do** draw icons as inline 24px stroke SVG (2px, round caps) in currentColor.

### Don't:
- **Don't** add a light theme; the ground is dark by choice of use scene.
- **Don't** place eyebrow or kicker labels above headings.
- **Don't** build tile or card grids of stats, or progress rings.
- **Don't** use orange for emphasis, highlights, celebration or decoration.
- **Don't** add card shadows or hard offset shadows; depth is tonal.
- **Don't** let colour alone carry a station or stop state.
