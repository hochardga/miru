# Phase 2 Standard Rules Coverage Design

## Context

Phase 2 should make the standard Miru 1 v2e solo play loop source-verified and playable from setup through win, death, villages, quests, rewards, story days, and ending. The roadmap tasks remain the public progress ledger, but the work should be implemented in smaller reviewable sub-phases instead of one large rules pass.

The design follows the Phase 2 roadmap references: PRD FR-011 through FR-013, the PRD data model and API specification, product vision risks and MoSCoW priorities, and the standard-rules sections in `docs/miru-rules-requirements.md`. The roadmap phase text names `docs/miru-rules-requirements.md` as the source reference for Phase 2, so that document is the rules source for this design.

## Approved Approach

Use a source-first foundation, then complete rules families in reviewable sub-phases. This gives each later implementation slice an explicit source coverage contract and keeps ambiguity visible while the playable loop expands.

The sub-phases are:

1. **2A: Source Verification Foundation** - Build the source verification tracker, typed source metadata, and coverage fixture. Every heading in `docs/miru-rules-requirements.md` should have an explicit status: implemented, verified, ambiguous, deferred, or blocked.
2. **2B: Items, Rewards, and Combat** - Add item catalog data, inventory behavior, reward pools, stash logic, enemy cards, combat variants, escape behavior, status effects, and tech skill use.
3. **2C: Terrain, Events, and Special Locations** - Encode terrain event tables, ruins, encounters, repeatability, impassable handling, Cave of Shinda, and Impasse Garden.
4. **2D: Villages, Shops, Quests, Maps, Calendar, and End States** - Add village services, shop progression, fight clubs, quest discovery, treasure maps, story days, Radio Tower, Power Supply, death continuation, win, and ending.
5. **2E: Rule Lookup and Full-Run Verification** - Add metadata-only rule lookup, integrate the complete standard rules into the turn machine, and prove deterministic full-run paths.

Each sub-phase should update roadmap checkboxes only when the corresponding original task is genuinely complete.

## Architecture

Keep the current server-authoritative boundary intact. The UI calls `POST /api/runs/:runId/actions`; the route authenticates and validates the request; the server loads a `RunSnapshot`; pure TypeScript game services resolve the action; persistence writes the updated snapshot and action log; the API returns the refreshed state.

Rules should stay out of React components. Components render prompts, legal actions, summaries, dice, inventory, and map state, but they do not compute authoritative transitions.

Data modules under `src/data/miru1v2e` should hold source-derived rules:

- `items.ts` for item definitions, effects, prices, duplicate behavior, and source metadata.
- `rewards.ts` for reward bands, General Stash, Limited Stash, and special rewards.
- `enemies.ts` for event-specific enemy cards and verification metadata.
- `events.ts` for terrain event tables, ruins, encounters, and special-location summaries.
- `villages.ts` for shop progression, quest definitions, and treasure map definitions.
- `calendar.ts` for story day rules and ending triggers.
- `manifest.ts` for version-level coverage and source verification summary.

Game modules under `src/lib/game` should remain pure and focused:

- `inventory.ts`, `rewards.ts`, `combat.ts`, `events.ts`, `villages.ts`, `quests.ts`, `calendar.ts`, `specialLocations.ts`, and `endStates.ts` own their rules families.
- `turnMachine.ts` orchestrates routing between these services rather than becoming the home for all rules.
- Shared types should make prompt payloads, source statuses, and JSON state pockets explicit.

Avoid large schema churn unless a rule cannot be represented safely in current storage. The default persistence model should use the existing `pending_prompt`, `active_enemy`, `event_history`, `repeatability_state`, `enemy_state`, inventory metadata, and action log JSON fields, backed by typed mappers and tests.

## State And Data Flow

The core transition contract stays:

```text
snapshot + action + dice -> resolver -> next snapshot + action summary + dice rolls
```

Phase 2 should expand the prompt and action model beyond `next_day`, `camp`, and `journal`. It should cover movement or event routing, story choices, combat choices, reward selection, stash selection, escape outcomes, village services, shop buy and sell, tavern meal and sleep, fight club training, quest discovery, treasure map placement, special-location turns, death continuation, win, ending, and return to journal or next-day readiness.

Persisted state should use named TypeScript shapes even when stored in JSON:

- `run_tiles.event_history` records resolved event keys and repeat visits.
- `run_tiles.repeatability_state` records one-shot ruins, obelisks, special locations, clues, forced movement, and other tile-scoped rules state.
- `run_tiles.enemy_state` records persistent enemies waiting on a tile.
- `runs.pending_prompt` records the active choice, combat, reward, village, death, or ending prompt.
- `runs.active_enemy` records active combat state.
- Inventory metadata records item-specific charges, use limits, or crafting state when needed.
- Action log result records concise audit summaries for tester review.

JSON flexibility should not become unstructured state. Any reused state pocket needs a named type, a mapper or validator, and fixture coverage near the service that owns it.

## Errors And Source Ambiguity

Runtime invalid state should fail closed. Illegal or stale player actions should keep returning `409 INVALID_ACTION_FOR_STATE` with refreshed legal actions. If a resolver cannot continue because required state is missing or contradictory, it should raise a controlled engine error that the route maps to a readable API error.

Source ambiguity should be tracked explicitly. The source tracker should use these statuses:

- `implemented`: encoded and covered by tests.
- `verified`: visually checked against source or trusted requirement text.
- `ambiguous`: known source conflict or extraction issue.
- `deferred`: explicitly outside Phase 2 or not needed for the standard solo loop.
- `blocked`: required for the loop but not safe to implement from available sources.

Ambiguous rules may use conservative documented behavior only when the standard loop needs to proceed. The tracker and tests must name the assumption. Known ambiguous areas include enemy black skill-dot counts, special "Nothing or Cave of Shinda" and "Impassable or Impasse Garden" conditions, Power Supply attempt resolution, shop buy and sell prices, and some story-choice branch mappings.

## Testing And Review Gates

Each sub-phase should leave focused unit tests plus integration-style fixtures that prove the new rules cooperate with the engine.

2A review gate:

- The tracker fixture lists every relevant heading from `docs/miru-rules-requirements.md`.
- The manifest exposes coverage statuses.
- Tests fail if a heading is missing from the tracker.

2B review gate:

- Inventory fixtures cover duplicate behavior, food, equipment, tech unlock items, and item effects.
- Reward fixtures cover all reward bands, General Stash, Limited Stash, special rewards, and selected dice combinations.
- Combat fixtures cover attack bands, escape parity, persistence, Burn, Stun, Tech Skills, and reward handoff.

2C review gate:

- Terrain fixtures cover all standard terrain event totals, ruins, encounters, impassable results, repeatability, and open issues.
- Special-location fixtures cover local turn progression and persistent outcomes.

2D review gate:

- Village fixtures cover shop progression, buy and sell, tavern services, fight clubs, and quest discovery.
- Quest and map fixtures cover relative placement and priority compass fallback.
- Calendar fixtures cover Day 03, Day 15, Day 25, Day 40, Day 50, after Day 50, and ending triggers.
- End-state fixtures cover starvation, sleep deprivation, combat death, dead-but-continuable reset, and win.

2E review gate:

- Rules lookup API tests prove metadata-only responses.
- Turn-machine tests prove routing from prompts to service modules.
- Full-run simulations cover survival, combat death, village recovery, story progression, and win.

## Roadmap Mapping

The original roadmap tasks map to the reviewable sub-phases as follows:

- 2A: TASK-027.
- 2B: TASK-028, TASK-029, and TASK-030.
- 2C: TASK-031, TASK-032, and TASK-036.
- 2D: TASK-033, TASK-034, TASK-035, and TASK-037.
- 2E: TASK-038, TASK-039, and TASK-040.

This mapping keeps the roadmap useful without forcing a single oversized implementation branch.

## Scope Notes

Phase 2 should focus on the standard Miru 1 v2e solo loop. Challenge mode variants, public source text exposure, public launch readiness, heavy UI polish, advanced accessibility preferences, exportable journals, and rights-holder launch materials remain outside this design.

The outcome is complete when standard solo runs can deterministically reach survival recovery, combat death, village recovery, story progression, dead-but-continuable reset, win, and ending states, with source coverage visible for every standard requirement.
