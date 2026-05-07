# Phase 1 Core Engine And Magic Moment Design

## Context

Phase 1 should deliver the first real playable Miru loop: a player can start a run, load the play table, tap Next Day, resolve a representative day flow, camp, write a journal entry, autosave, and resume. The roadmap tasks remain useful as source material, but the implementation order should collapse around this vertical slice instead of following the task list literally.

The design uses a curated but engine-real first day. The server still validates actions, rolls and records dice, applies pure engine transitions, persists state, and returns a fresh snapshot. Combat remains a reachable and tested representative branch, but it is not required on the default first day.

## Approved Approach

Use a vertical-slice state machine centered on the magic moment:

1. Start or restore an anonymous session and create a run.
2. Load a server-built `RunSnapshot` into the play table.
3. Resolve `next_day` through the real engine, with a curated default event path that records dice and produces a camp prompt.
4. Resolve camp through the survival resolver.
5. Save a day and tile tied journal entry.
6. Resume from the latest persisted snapshot and pending prompt.

This approach keeps the PRD's server-authoritative model intact while limiting Phase 1 breadth to the smallest path that proves run creation, rules flow, autosave, and return-to-play.

## Architecture

The game engine should be pure TypeScript and independent of Supabase, Next.js, or React. It owns core types, prompt states, legal actions, dice metadata, survival and camp results, representative event handling, combat fixtures, rewards, and action results.

Next.js route handlers remain the server boundary. They authenticate the user, validate request bodies with `zod`, load the current persisted state, call the engine, persist returned changes, write an action log entry, and return the standard `{ ok, data }` or `{ ok, error }` response shape.

The existing `bootstrap_run` RPC should stay in place for run creation because Phase 0 already proved it with RLS and anonymous auth. Phase 1 should map its output into the same snapshot contract used by run detail and action responses.

Module boundaries:

- `src/lib/game/*`: pure engine types and transition logic, with no Supabase imports.
- `src/data/miru1v2e/*`: typed source-derived data for the representative event, enemy, rewards, and manifest metadata.
- `src/lib/runs/*`: Supabase loaders, mappers, and persistence helpers.
- `src/app/api/runs/*`: auth, validation, HTTP status codes, and response shape.
- `src/components/features/play/*`: snapshot rendering and action submission only.

## Snapshot And Prompts

`RunSnapshot` should be the single contract for play, action responses, and resume. It should include run metadata, current day, current tile, visible map tiles, inventory, tech skills, HP, EP, ATK, DEF, Bitliths, starvation, sleep deprivation, minor injury state, active enemy when present, pending prompt, legal actions, recent action summaries, latest journal entry, and save context needed by the UI.

Prompts should be typed rather than treated as arbitrary JSON. Phase 1 should support at least:

- `ready_for_next_day`: the player can start the next day.
- `camp_required`: survival and camp choices must be resolved before advancing.
- `journal_available`: the day can be recorded in the journal.
- `combat_choice`: a reachable representative combat branch is waiting for player input.
- `day_complete`: the prior day is complete and the next valid action is visible.

The default first-day `next_day` route should create a real dice result and action log, then produce a camp prompt without forcing combat. Deterministic test hooks should be able to route the engine through terrain/event/combat branches.

## UI Design

The play table should stay mobile-first and field-tool-like: compact, readable, calm, and useful under interruption. Components should render the snapshot and legal actions without computing authoritative game transitions.

Primary components:

- `PlayTable`: owns client snapshot state, pending request state, retry/error display, and refresh after successful actions.
- `CurrentPrompt`: displays the active prompt, concise context, recent dice/results, and the reason the action is legal.
- `ActionBar`: renders only current legal actions and disables while a save is pending.
- `CharacterPanel`: shows HP, EP, ATK, DEF, starvation, sleep deprivation, and other survival state.
- `InventoryPanel`: shows Meal Bars, Bitliths, key items, and long item names with safe wrapping.
- `HexMap` and `TileInspector`: show the 12x9 coordinate grid, current tile, visited state, terrain, icons, and mobile-safe inspection.
- `JournalPrompt`: saves a day and tile tied entry with a 1000 character limit.

The first screen of `/play/[runId]` should always make the current prompt and next legal action discoverable without requiring a long scroll on a 375px viewport.

## Persistence, Errors, And Resume

Every successful engine action must persist before the UI advances. The client should not optimistically advance the run snapshot after `next_day`, `camp`, combat, or journal actions. If persistence fails, the old snapshot remains visible with a retry affordance.

The action endpoint should return `409 INVALID_ACTION_FOR_STATE` when the requested action is stale or illegal, including the current valid actions so the UI can recover. Duplicate taps should be prevented client-side by disabling pending controls, and server validation should still treat invalid repeat submissions as stale actions.

The action log should record action type, input, concise result, dice rolls, day number, and tile id. Resume should be built from persisted rows and the same `RunSnapshot` mapper. Refreshing during `camp_required` must restore camp. Refreshing after camp but before journaling must show the journal affordance. After journal save, the run list should show the latest excerpt and resume should land on the next valid prompt.

Owner-safe errors should avoid revealing another user's run. Network failures should keep the loaded snapshot readable and make retry possible.

## Testing

Tests should be added alongside each layer of the vertical slice:

- Unit tests for dice injection, coordinate and movement helpers, survival and camp resolution, the default curated day path, and the representative combat branch.
- API tests for run creation, run detail snapshots, action transitions, stale action `409`, journal save, and RLS or owner-safe behavior.
- Component tests for legal action rendering, pending save state, journal prompt behavior, long inventory text, and resume snapshot rendering.
- One E2E test for home to anonymous start, play table, Next Day, camp, journal save, refresh, and resume.

The E2E test should assert visible state and prompt restoration, not every internal rule detail. Detailed rule coverage belongs in unit and API tests where deterministic fixtures can keep failures precise.

## Scope Notes

Phase 1 should not attempt full Miru rules coverage, dark mode, account upgrade, full rules lookup, challenge modes, complete shop/village/quest systems, or a polished combat UI beyond what the representative branch requires.

The outcome is complete when a tester can finish the first camp without help, refresh or return, and immediately understand the saved state and next action.
