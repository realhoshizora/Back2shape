# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS installable as a PWA (iOS "Add to Home Screen"). Sync via the user's existing Supabase project (`public.sessions`: user_id, day, data jsonb, RLS "own rows"). Hosting left undecided by the user ("delegated"): any static HTTPS host works.

## Users

One person (the owner), a beginner (fewer than ~10 strict push-ups), training at home to gain weight and muscle. Uses it on iPhone mid-workout (phone propped on the floor or a chair, hands sweaty, glancing from 1–2 m away) and on a desktop computer to review progress.

## Product Purpose

Tell the owner what to train each day of the week, guide the session set by set, and keep them coming back: calories burned per session, session time, and a streak. Success = three sessions a week, done consistently, with visible progression.

## Positioning

A plan built around exactly the equipment on hand: one pair of 5 kg dumbbells, push-ups, bodyweight; resistance bands added later. Because the load cannot go up, progression comes from reps, slower tempo, single-limb variations and harder push-up rungs, which the app tracks and prompts.

## Operating Context

- Schedule: 3 full-body sessions per week (Mon / Wed / Fri), ~45 minutes each.
- Used daily on iPhone as a home-screen web app; also on desktop.
- Progress must sync across devices (account login).
- Interface language: Vietnamese.

## Capabilities and Constraints

- Weekly view: workout per day, duration, calories, done/not done.
- Guided session: sets, reps logged, rest timer, previous numbers pre-filled.
- Streak of scheduled sessions; calories estimated with MET × body weight × time (Compendium of Physical Activities 2024, code 02054, 3.5 MET).
- Reminders: no push server; calendar (.ics) reminder is the mechanism.
- Bands are optional and not owned yet.

## Evidence on Hand

No photos, exercise media or testimonials exist. Exercise instructions are written text only; do not fabricate before/after results.

## Product Principles

1. The phone on the floor wins: every in-session control readable and tappable from a distance.
2. Show the next thing to do, not a menu.
3. Progression over variety: the same movements getting harder.
4. Never lose a logged set: local first, sync second.

## Accessibility & Inclusion

Large tap targets for sweaty-hand use, reduced-motion respected, sufficient contrast in both light conditions.
