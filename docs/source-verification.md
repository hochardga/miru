# Miru 1 v2e Source Verification

This tracker maps the current `docs/miru-rules-requirements.md` headings to Phase 2 source verification status. It is intentionally concise and does not reproduce large source text.

## Summary

- Total headings: 81
- Implemented: 0
- Verified: 68
- Ambiguous: 9
- Deferred: 4
- Blocked: 0

## Status Definitions

- `implemented`: encoded and covered by tests.
- `verified`: source requirement text is extracted and ready for implementation tracking.
- `ambiguous`: known source conflict or extraction issue.
- `deferred`: outside the Phase 2 standard solo loop.
- `blocked`: required for the loop but not safe to implement from available sources.

## Tracker

| ID | Status | Phase | Heading | Source | Notes |
| --- | --- | --- | --- | --- | --- |
| `requirement-language` | verified | 2E | Requirement Language | docs/miru-rules-requirements.md:9 | Requirement text is extracted and ready for implementation tracking. |
| `core-game-model` | verified | 2E | Core Game Model | docs/miru-rules-requirements.md:16 | Requirement text is extracted and ready for implementation tracking. |
| `core-game-model-game-session` | verified | current | Core Game Model > Game Session | docs/miru-rules-requirements.md:18 | Requirement text is extracted and ready for implementation tracking. |
| `core-game-model-player-character-state` | verified | current | Core Game Model > Player Character State | docs/miru-rules-requirements.md:31 | Requirement text is extracted and ready for implementation tracking. |
| `core-game-model-map-state` | verified | current | Core Game Model > Map State | docs/miru-rules-requirements.md:46 | Requirement text is extracted and ready for implementation tracking. |
| `turn-structure` | verified | 2E | Turn Structure | docs/miru-rules-requirements.md:62 | Requirement text is extracted and ready for implementation tracking. |
| `turn-structure-daily-turn-routing` | verified | 2E | Turn Structure > Daily Turn Routing | docs/miru-rules-requirements.md:64 | Requirement text is extracted and ready for implementation tracking. |
| `turn-structure-terrain-roll` | verified | 2E | Turn Structure > Terrain Roll | docs/miru-rules-requirements.md:77 | Requirement text is extracted and ready for implementation tracking. |
| `turn-structure-event-roll` | verified | 2E | Turn Structure > Event Roll | docs/miru-rules-requirements.md:88 | Requirement text is extracted and ready for implementation tracking. |
| `turn-structure-small-injury` | verified | 2E | Turn Structure > Small Injury | docs/miru-rules-requirements.md:95 | Requirement text is extracted and ready for implementation tracking. |
| `survival-rules` | verified | 2E | Survival Rules | docs/miru-rules-requirements.md:107 | Requirement text is extracted and ready for implementation tracking. |
| `survival-rules-camping` | verified | current | Survival Rules > Camping | docs/miru-rules-requirements.md:109 | Requirement text is extracted and ready for implementation tracking. |
| `survival-rules-food-effects` | verified | current | Survival Rules > Food Effects | docs/miru-rules-requirements.md:119 | Requirement text is extracted and ready for implementation tracking. |
| `survival-rules-sleep-effects` | verified | current | Survival Rules > Sleep Effects | docs/miru-rules-requirements.md:128 | Requirement text is extracted and ready for implementation tracking. |
| `survival-rules-starvation` | verified | current | Survival Rules > Starvation | docs/miru-rules-requirements.md:135 | Requirement text is extracted and ready for implementation tracking. |
| `survival-rules-sleep-deprivation` | verified | current | Survival Rules > Sleep Deprivation | docs/miru-rules-requirements.md:148 | Requirement text is extracted and ready for implementation tracking. |
| `combat-rules` | verified | 2B | Combat Rules | docs/miru-rules-requirements.md:158 | Requirement text is extracted and ready for implementation tracking. |
| `combat-rules-combat-flow` | verified | 2B | Combat Rules > Combat Flow | docs/miru-rules-requirements.md:160 | Requirement text is extracted and ready for implementation tracking. |
| `combat-rules-player-combat-actions` | verified | 2B | Combat Rules > Player Combat Actions | docs/miru-rules-requirements.md:169 | Requirement text is extracted and ready for implementation tracking. |
| `combat-rules-basic-attack` | verified | current | Combat Rules > Basic Attack | docs/miru-rules-requirements.md:176 | Requirement text is extracted and ready for implementation tracking. |
| `combat-rules-tech-skills` | verified | 2B | Combat Rules > Tech Skills | docs/miru-rules-requirements.md:184 | Requirement text is extracted and ready for implementation tracking. |
| `combat-rules-escape` | verified | 2B | Combat Rules > Escape | docs/miru-rules-requirements.md:195 | Requirement text is extracted and ready for implementation tracking. |
| `combat-rules-status-effects` | verified | 2B | Combat Rules > Status Effects | docs/miru-rules-requirements.md:209 | Requirement text is extracted and ready for implementation tracking. |
| `enemy-and-reward-rules` | verified | 2B | Enemy And Reward Rules | docs/miru-rules-requirements.md:218 | Requirement text is extracted and ready for implementation tracking. |
| `enemy-and-reward-rules-enemy-cards` | ambiguous | 2B | Enemy And Reward Rules > Enemy Cards | docs/miru-rules-requirements.md:220 | Enemy black skill-dot counts require visual verification before production data entry. |
| `enemy-and-reward-rules-reward-roll` | ambiguous | 2B | Enemy And Reward Rules > Reward Roll | docs/miru-rules-requirements.md:231 | Reward dice count depends on enemy black skill-dot counts that require visual verification. |
| `enemy-and-reward-rules-reward-pool` | verified | 2B | Enemy And Reward Rules > Reward Pool | docs/miru-rules-requirements.md:240 | Requirement text is extracted and ready for implementation tracking. |
| `enemy-and-reward-rules-general-stash` | verified | 2B | Enemy And Reward Rules > General Stash | docs/miru-rules-requirements.md:253 | Requirement text is extracted and ready for implementation tracking. |
| `enemy-and-reward-rules-limited-stash` | verified | 2B | Enemy And Reward Rules > Limited Stash | docs/miru-rules-requirements.md:263 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements` | verified | 2C | Terrain Event Requirements | docs/miru-rules-requirements.md:272 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-forest-event-table` | ambiguous | 2C | Terrain Event Requirements > Forest Event Table | docs/miru-rules-requirements.md:274 | The Nothing or Cave of Shinda condition requires visual verification. |
| `terrain-event-requirements-forest-event-table-forest-ruins` | verified | 2C | Terrain Event Requirements > Forest Event Table > Forest Ruins | docs/miru-rules-requirements.md:284 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-forest-event-table-forest-encounters` | verified | 2C | Terrain Event Requirements > Forest Event Table > Forest Encounters | docs/miru-rules-requirements.md:293 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-mountains-event-table` | ambiguous | 2C | Terrain Event Requirements > Mountains Event Table | docs/miru-rules-requirements.md:302 | The Impassable or Impasse Garden condition requires visual verification. |
| `terrain-event-requirements-mountains-event-table-mountain-ruins` | verified | 2C | Terrain Event Requirements > Mountains Event Table > Mountain Ruins | docs/miru-rules-requirements.md:311 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-mountains-event-table-mountain-encounters` | verified | 2C | Terrain Event Requirements > Mountains Event Table > Mountain Encounters | docs/miru-rules-requirements.md:321 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-grasslands-event-table` | verified | 2C | Terrain Event Requirements > Grasslands Event Table | docs/miru-rules-requirements.md:331 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-grasslands-event-table-grassland-ruins` | ambiguous | 2C | Terrain Event Requirements > Grasslands Event Table > Grassland Ruins | docs/miru-rules-requirements.md:339 | Grassland R4 optional Bitlith branch lacks a clearly extracted source branch. |
| `terrain-event-requirements-grasslands-event-table-grassland-encounters` | ambiguous | 2C | Terrain Event Requirements > Grasslands Event Table > Grassland Encounters | docs/miru-rules-requirements.md:349 | Grassland E5 and Day 50 conflict on Power Supply terrain placement. |
| `terrain-event-requirements-desert-event-table` | verified | 2C | Terrain Event Requirements > Desert Event Table | docs/miru-rules-requirements.md:360 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-desert-event-table-desert-ruins` | verified | 2C | Terrain Event Requirements > Desert Event Table > Desert Ruins | docs/miru-rules-requirements.md:368 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-desert-event-table-desert-encounters` | verified | 2C | Terrain Event Requirements > Desert Event Table > Desert Encounters | docs/miru-rules-requirements.md:377 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-swamp-event-table` | verified | 2C | Terrain Event Requirements > Swamp Event Table | docs/miru-rules-requirements.md:386 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-swamp-event-table-swamp-ruins` | verified | 2C | Terrain Event Requirements > Swamp Event Table > Swamp Ruins | docs/miru-rules-requirements.md:393 | Requirement text is extracted and ready for implementation tracking. |
| `terrain-event-requirements-swamp-event-table-swamp-encounters` | verified | 2C | Terrain Event Requirements > Swamp Event Table > Swamp Encounters | docs/miru-rules-requirements.md:402 | Requirement text is extracted and ready for implementation tracking. |
| `story-choice-requirements` | verified | 2D | Story Choice Requirements | docs/miru-rules-requirements.md:411 | Requirement text is extracted and ready for implementation tracking. |
| `story-choice-requirements-extracted-branch-effects` | ambiguous | 2D | Story Choice Requirements > Extracted Branch Effects | docs/miru-rules-requirements.md:417 | Story-choice page extraction interleaves columns and needs visual verification before production data entry. |
| `calendar-and-story-event-requirements` | verified | 2D | Calendar And Story Event Requirements | docs/miru-rules-requirements.md:439 | Requirement text is extracted and ready for implementation tracking. |
| `calendar-and-story-event-requirements-calendar` | verified | 2D | Calendar And Story Event Requirements > Calendar | docs/miru-rules-requirements.md:441 | Requirement text is extracted and ready for implementation tracking. |
| `calendar-and-story-event-requirements-day-03` | verified | 2D | Calendar And Story Event Requirements > Day 03 | docs/miru-rules-requirements.md:447 | Requirement text is extracted and ready for implementation tracking. |
| `calendar-and-story-event-requirements-day-15` | verified | 2D | Calendar And Story Event Requirements > Day 15 | docs/miru-rules-requirements.md:453 | Requirement text is extracted and ready for implementation tracking. |
| `calendar-and-story-event-requirements-day-25` | verified | 2D | Calendar And Story Event Requirements > Day 25 | docs/miru-rules-requirements.md:459 | Requirement text is extracted and ready for implementation tracking. |
| `calendar-and-story-event-requirements-day-40-radio-tower` | verified | 2D | Calendar And Story Event Requirements > Day 40 Radio Tower | docs/miru-rules-requirements.md:468 | Requirement text is extracted and ready for implementation tracking. |
| `calendar-and-story-event-requirements-day-50-power-supply` | ambiguous | 2D | Calendar And Story Event Requirements > Day 50 Power Supply | docs/miru-rules-requirements.md:481 | Power Supply attempt resolution is not fully extractable from text. |
| `calendar-and-story-event-requirements-after-day-50` | verified | 2D | Calendar And Story Event Requirements > After Day 50 | docs/miru-rules-requirements.md:494 | Requirement text is extracted and ready for implementation tracking. |
| `calendar-and-story-event-requirements-ending` | verified | 2D | Calendar And Story Event Requirements > Ending | docs/miru-rules-requirements.md:499 | Requirement text is extracted and ready for implementation tracking. |
| `villages-shops-quests` | verified | 2D | Villages, Shops, Quests | docs/miru-rules-requirements.md:504 | Requirement text is extracted and ready for implementation tracking. |
| `villages-shops-quests-villages` | verified | 2D | Villages, Shops, Quests > Villages | docs/miru-rules-requirements.md:506 | Requirement text is extracted and ready for implementation tracking. |
| `villages-shops-quests-shop-progression` | ambiguous | 2D | Villages, Shops, Quests > Shop Progression | docs/miru-rules-requirements.md:515 | Shop buy and sell prices require visual verification against the item catalog. |
| `villages-shops-quests-fight-club` | verified | 2D | Villages, Shops, Quests > Fight Club | docs/miru-rules-requirements.md:529 | Requirement text is extracted and ready for implementation tracking. |
| `villages-shops-quests-quest-discovery` | verified | 2D | Villages, Shops, Quests > Quest Discovery | docs/miru-rules-requirements.md:541 | Requirement text is extracted and ready for implementation tracking. |
| `villages-shops-quests-quests` | verified | 2D | Villages, Shops, Quests > Quests | docs/miru-rules-requirements.md:547 | Requirement text is extracted and ready for implementation tracking. |
| `villages-shops-quests-treasure-maps` | verified | 2D | Villages, Shops, Quests > Treasure Maps | docs/miru-rules-requirements.md:554 | Requirement text is extracted and ready for implementation tracking. |
| `special-location-requirements` | verified | 2C | Special Location Requirements | docs/miru-rules-requirements.md:564 | Requirement text is extracted and ready for implementation tracking. |
| `special-location-requirements-impasse-garden` | verified | 2C | Special Location Requirements > Impasse Garden | docs/miru-rules-requirements.md:566 | Requirement text is extracted and ready for implementation tracking. |
| `special-location-requirements-cave-of-shinda` | verified | 2C | Special Location Requirements > Cave Of Shinda | docs/miru-rules-requirements.md:580 | Requirement text is extracted and ready for implementation tracking. |
| `item-requirements` | verified | 2B | Item Requirements | docs/miru-rules-requirements.md:595 | Requirement text is extracted and ready for implementation tracking. |
| `item-requirements-duplicate-items` | verified | 2B | Item Requirements > Duplicate Items | docs/miru-rules-requirements.md:597 | Requirement text is extracted and ready for implementation tracking. |
| `item-requirements-food` | verified | 2B | Item Requirements > Food | docs/miru-rules-requirements.md:603 | Requirement text is extracted and ready for implementation tracking. |
| `item-requirements-tools` | verified | 2B | Item Requirements > Tools | docs/miru-rules-requirements.md:609 | Requirement text is extracted and ready for implementation tracking. |
| `item-requirements-weapons` | verified | 2B | Item Requirements > Weapons | docs/miru-rules-requirements.md:614 | Requirement text is extracted and ready for implementation tracking. |
| `item-requirements-wearables` | verified | 2B | Item Requirements > Wearables | docs/miru-rules-requirements.md:623 | Requirement text is extracted and ready for implementation tracking. |
| `item-requirements-tech-skills` | verified | 2B | Item Requirements > Tech Skills | docs/miru-rules-requirements.md:632 | Requirement text is extracted and ready for implementation tracking. |
| `item-requirements-maps-scrap-and-treasures` | verified | 2B | Item Requirements > Maps, Scrap, And Treasures | docs/miru-rules-requirements.md:642 | Requirement text is extracted and ready for implementation tracking. |
| `death-requirements` | verified | 2D | Death Requirements | docs/miru-rules-requirements.md:656 | Requirement text is extracted and ready for implementation tracking. |
| `challenge-mode-requirements` | deferred | post-phase-2 | Challenge Mode Requirements | docs/miru-rules-requirements.md:670 | Challenge mode is outside the Phase 2 standard solo loop. |
| `challenge-mode-requirements-weather` | deferred | post-phase-2 | Challenge Mode Requirements > Weather | docs/miru-rules-requirements.md:672 | Challenge mode is outside the Phase 2 standard solo loop. |
| `challenge-mode-requirements-terrain-odds-variant` | deferred | post-phase-2 | Challenge Mode Requirements > Terrain Odds Variant | docs/miru-rules-requirements.md:683 | Challenge mode is outside the Phase 2 standard solo loop. |
| `challenge-mode-requirements-rusty-weapons-variant` | deferred | post-phase-2 | Challenge Mode Requirements > Rusty Weapons Variant | docs/miru-rules-requirements.md:691 | Challenge mode is outside the Phase 2 standard solo loop. |
| `asset-derived-requirements` | verified | 2E | Asset-Derived Requirements | docs/miru-rules-requirements.md:695 | Requirement text is extracted and ready for implementation tracking. |
| `verification-and-data-entry-notes` | verified | 2E | Verification And Data Entry Notes | docs/miru-rules-requirements.md:706 | Requirement text is extracted and ready for implementation tracking. |
