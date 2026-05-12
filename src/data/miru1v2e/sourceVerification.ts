export const SOURCE_VERIFICATION_STATUSES = ["implemented", "verified", "ambiguous", "deferred", "blocked"] as const;

export type SourceVerificationStatus = (typeof SOURCE_VERIFICATION_STATUSES)[number];
export type SourceVerificationPhase = "current" | "2B" | "2C" | "2D" | "2E" | "post-phase-2";

export type SourceVerificationEntry = {
  id: string;
  title: string;
  headingPath: readonly string[];
  level: 2 | 3 | 4;
  sourcePath: "docs/miru-rules-requirements.md";
  sourceLine: number;
  phase: SourceVerificationPhase;
  status: SourceVerificationStatus;
  notes: string;
};

export type SourceVerificationSummary = {
  total: number;
  byStatus: Record<SourceVerificationStatus, number>;
};

export const SOURCE_VERIFICATION_ENTRIES = [
  {
    "id": "requirement-language",
    "title": "Requirement Language",
    "headingPath": [
      "Requirement Language"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 9,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "core-game-model",
    "title": "Core Game Model",
    "headingPath": [
      "Core Game Model"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 16,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "core-game-model-game-session",
    "title": "Game Session",
    "headingPath": [
      "Core Game Model",
      "Game Session"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 18,
    "phase": "current",
    "status": "implemented",
    "notes": "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests."
  },
  {
    "id": "core-game-model-player-character-state",
    "title": "Player Character State",
    "headingPath": [
      "Core Game Model",
      "Player Character State"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 31,
    "phase": "current",
    "status": "implemented",
    "notes": "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests."
  },
  {
    "id": "core-game-model-map-state",
    "title": "Map State",
    "headingPath": [
      "Core Game Model",
      "Map State"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 46,
    "phase": "current",
    "status": "implemented",
    "notes": "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests."
  },
  {
    "id": "turn-structure",
    "title": "Turn Structure",
    "headingPath": [
      "Turn Structure"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 62,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "turn-structure-daily-turn-routing",
    "title": "Daily Turn Routing",
    "headingPath": [
      "Turn Structure",
      "Daily Turn Routing"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 64,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "turn-structure-terrain-roll",
    "title": "Terrain Roll",
    "headingPath": [
      "Turn Structure",
      "Terrain Roll"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 77,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "turn-structure-event-roll",
    "title": "Event Roll",
    "headingPath": [
      "Turn Structure",
      "Event Roll"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 88,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "turn-structure-small-injury",
    "title": "Small Injury",
    "headingPath": [
      "Turn Structure",
      "Small Injury"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 95,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "survival-rules",
    "title": "Survival Rules",
    "headingPath": [
      "Survival Rules"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 107,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "survival-rules-camping",
    "title": "Camping",
    "headingPath": [
      "Survival Rules",
      "Camping"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 109,
    "phase": "current",
    "status": "implemented",
    "notes": "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests."
  },
  {
    "id": "survival-rules-food-effects",
    "title": "Food Effects",
    "headingPath": [
      "Survival Rules",
      "Food Effects"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 119,
    "phase": "current",
    "status": "implemented",
    "notes": "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests."
  },
  {
    "id": "survival-rules-sleep-effects",
    "title": "Sleep Effects",
    "headingPath": [
      "Survival Rules",
      "Sleep Effects"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 128,
    "phase": "current",
    "status": "implemented",
    "notes": "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests."
  },
  {
    "id": "survival-rules-starvation",
    "title": "Starvation",
    "headingPath": [
      "Survival Rules",
      "Starvation"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 135,
    "phase": "current",
    "status": "implemented",
    "notes": "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests."
  },
  {
    "id": "survival-rules-sleep-deprivation",
    "title": "Sleep Deprivation",
    "headingPath": [
      "Survival Rules",
      "Sleep Deprivation"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 148,
    "phase": "current",
    "status": "implemented",
    "notes": "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests."
  },
  {
    "id": "combat-rules",
    "title": "Combat Rules",
    "headingPath": [
      "Combat Rules"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 158,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "combat-rules-combat-flow",
    "title": "Combat Flow",
    "headingPath": [
      "Combat Rules",
      "Combat Flow"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 160,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "combat-rules-player-combat-actions",
    "title": "Player Combat Actions",
    "headingPath": [
      "Combat Rules",
      "Player Combat Actions"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 169,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "combat-rules-basic-attack",
    "title": "Basic Attack",
    "headingPath": [
      "Combat Rules",
      "Basic Attack"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 176,
    "phase": "current",
    "status": "implemented",
    "notes": "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests."
  },
  {
    "id": "combat-rules-tech-skills",
    "title": "Tech Skills",
    "headingPath": [
      "Combat Rules",
      "Tech Skills"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 184,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "combat-rules-escape",
    "title": "Escape",
    "headingPath": [
      "Combat Rules",
      "Escape"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 195,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "combat-rules-status-effects",
    "title": "Status Effects",
    "headingPath": [
      "Combat Rules",
      "Status Effects"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 209,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "enemy-and-reward-rules",
    "title": "Enemy And Reward Rules",
    "headingPath": [
      "Enemy And Reward Rules"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 218,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "enemy-and-reward-rules-enemy-cards",
    "title": "Enemy Cards",
    "headingPath": [
      "Enemy And Reward Rules",
      "Enemy Cards"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 220,
    "phase": "2B",
    "status": "ambiguous",
    "notes": "Enemy black skill-dot counts require visual verification before production data entry."
  },
  {
    "id": "enemy-and-reward-rules-reward-roll",
    "title": "Reward Roll",
    "headingPath": [
      "Enemy And Reward Rules",
      "Reward Roll"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 231,
    "phase": "2B",
    "status": "ambiguous",
    "notes": "Reward dice count depends on enemy black skill-dot counts that require visual verification."
  },
  {
    "id": "enemy-and-reward-rules-reward-pool",
    "title": "Reward Pool",
    "headingPath": [
      "Enemy And Reward Rules",
      "Reward Pool"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 240,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "enemy-and-reward-rules-general-stash",
    "title": "General Stash",
    "headingPath": [
      "Enemy And Reward Rules",
      "General Stash"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 253,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "enemy-and-reward-rules-limited-stash",
    "title": "Limited Stash",
    "headingPath": [
      "Enemy And Reward Rules",
      "Limited Stash"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 263,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements",
    "title": "Terrain Event Requirements",
    "headingPath": [
      "Terrain Event Requirements"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 272,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-forest-event-table",
    "title": "Forest Event Table",
    "headingPath": [
      "Terrain Event Requirements",
      "Forest Event Table"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 274,
    "phase": "2C",
    "status": "ambiguous",
    "notes": "The Nothing or Cave of Shinda condition requires visual verification."
  },
  {
    "id": "terrain-event-requirements-forest-event-table-forest-ruins",
    "title": "Forest Ruins",
    "headingPath": [
      "Terrain Event Requirements",
      "Forest Event Table",
      "Forest Ruins"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 284,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-forest-event-table-forest-encounters",
    "title": "Forest Encounters",
    "headingPath": [
      "Terrain Event Requirements",
      "Forest Event Table",
      "Forest Encounters"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 293,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-mountains-event-table",
    "title": "Mountains Event Table",
    "headingPath": [
      "Terrain Event Requirements",
      "Mountains Event Table"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 302,
    "phase": "2C",
    "status": "ambiguous",
    "notes": "The Impassable or Impasse Garden condition requires visual verification."
  },
  {
    "id": "terrain-event-requirements-mountains-event-table-mountain-ruins",
    "title": "Mountain Ruins",
    "headingPath": [
      "Terrain Event Requirements",
      "Mountains Event Table",
      "Mountain Ruins"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 311,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-mountains-event-table-mountain-encounters",
    "title": "Mountain Encounters",
    "headingPath": [
      "Terrain Event Requirements",
      "Mountains Event Table",
      "Mountain Encounters"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 321,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-grasslands-event-table",
    "title": "Grasslands Event Table",
    "headingPath": [
      "Terrain Event Requirements",
      "Grasslands Event Table"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 331,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-grasslands-event-table-grassland-ruins",
    "title": "Grassland Ruins",
    "headingPath": [
      "Terrain Event Requirements",
      "Grasslands Event Table",
      "Grassland Ruins"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 339,
    "phase": "2C",
    "status": "ambiguous",
    "notes": "Grassland R4 optional Bitlith branch lacks a clearly extracted source branch."
  },
  {
    "id": "terrain-event-requirements-grasslands-event-table-grassland-encounters",
    "title": "Grassland Encounters",
    "headingPath": [
      "Terrain Event Requirements",
      "Grasslands Event Table",
      "Grassland Encounters"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 349,
    "phase": "2C",
    "status": "ambiguous",
    "notes": "Grassland E5 and Day 50 conflict on Power Supply terrain placement."
  },
  {
    "id": "terrain-event-requirements-desert-event-table",
    "title": "Desert Event Table",
    "headingPath": [
      "Terrain Event Requirements",
      "Desert Event Table"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 360,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-desert-event-table-desert-ruins",
    "title": "Desert Ruins",
    "headingPath": [
      "Terrain Event Requirements",
      "Desert Event Table",
      "Desert Ruins"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 368,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-desert-event-table-desert-encounters",
    "title": "Desert Encounters",
    "headingPath": [
      "Terrain Event Requirements",
      "Desert Event Table",
      "Desert Encounters"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 377,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-swamp-event-table",
    "title": "Swamp Event Table",
    "headingPath": [
      "Terrain Event Requirements",
      "Swamp Event Table"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 386,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-swamp-event-table-swamp-ruins",
    "title": "Swamp Ruins",
    "headingPath": [
      "Terrain Event Requirements",
      "Swamp Event Table",
      "Swamp Ruins"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 393,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "terrain-event-requirements-swamp-event-table-swamp-encounters",
    "title": "Swamp Encounters",
    "headingPath": [
      "Terrain Event Requirements",
      "Swamp Event Table",
      "Swamp Encounters"
    ],
    "level": 4,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 402,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "story-choice-requirements",
    "title": "Story Choice Requirements",
    "headingPath": [
      "Story Choice Requirements"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 411,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "story-choice-requirements-extracted-branch-effects",
    "title": "Extracted Branch Effects",
    "headingPath": [
      "Story Choice Requirements",
      "Extracted Branch Effects"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 417,
    "phase": "2D",
    "status": "ambiguous",
    "notes": "Story-choice page extraction interleaves columns and needs visual verification before production data entry."
  },
  {
    "id": "calendar-and-story-event-requirements",
    "title": "Calendar And Story Event Requirements",
    "headingPath": [
      "Calendar And Story Event Requirements"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 439,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "calendar-and-story-event-requirements-calendar",
    "title": "Calendar",
    "headingPath": [
      "Calendar And Story Event Requirements",
      "Calendar"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 441,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "calendar-and-story-event-requirements-day-03",
    "title": "Day 03",
    "headingPath": [
      "Calendar And Story Event Requirements",
      "Day 03"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 447,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "calendar-and-story-event-requirements-day-15",
    "title": "Day 15",
    "headingPath": [
      "Calendar And Story Event Requirements",
      "Day 15"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 453,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "calendar-and-story-event-requirements-day-25",
    "title": "Day 25",
    "headingPath": [
      "Calendar And Story Event Requirements",
      "Day 25"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 459,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "calendar-and-story-event-requirements-day-40-radio-tower",
    "title": "Day 40 Radio Tower",
    "headingPath": [
      "Calendar And Story Event Requirements",
      "Day 40 Radio Tower"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 468,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "calendar-and-story-event-requirements-day-50-power-supply",
    "title": "Day 50 Power Supply",
    "headingPath": [
      "Calendar And Story Event Requirements",
      "Day 50 Power Supply"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 481,
    "phase": "2D",
    "status": "ambiguous",
    "notes": "Power Supply attempt resolution is not fully extractable from text."
  },
  {
    "id": "calendar-and-story-event-requirements-after-day-50",
    "title": "After Day 50",
    "headingPath": [
      "Calendar And Story Event Requirements",
      "After Day 50"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 494,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "calendar-and-story-event-requirements-ending",
    "title": "Ending",
    "headingPath": [
      "Calendar And Story Event Requirements",
      "Ending"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 499,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "villages-shops-quests",
    "title": "Villages, Shops, Quests",
    "headingPath": [
      "Villages, Shops, Quests"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 504,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "villages-shops-quests-villages",
    "title": "Villages",
    "headingPath": [
      "Villages, Shops, Quests",
      "Villages"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 506,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "villages-shops-quests-shop-progression",
    "title": "Shop Progression",
    "headingPath": [
      "Villages, Shops, Quests",
      "Shop Progression"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 515,
    "phase": "2D",
    "status": "ambiguous",
    "notes": "Shop buy and sell prices require visual verification against the item catalog."
  },
  {
    "id": "villages-shops-quests-fight-club",
    "title": "Fight Club",
    "headingPath": [
      "Villages, Shops, Quests",
      "Fight Club"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 529,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "villages-shops-quests-quest-discovery",
    "title": "Quest Discovery",
    "headingPath": [
      "Villages, Shops, Quests",
      "Quest Discovery"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 541,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "villages-shops-quests-quests",
    "title": "Quests",
    "headingPath": [
      "Villages, Shops, Quests",
      "Quests"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 547,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "villages-shops-quests-treasure-maps",
    "title": "Treasure Maps",
    "headingPath": [
      "Villages, Shops, Quests",
      "Treasure Maps"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 554,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "special-location-requirements",
    "title": "Special Location Requirements",
    "headingPath": [
      "Special Location Requirements"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 564,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "special-location-requirements-impasse-garden",
    "title": "Impasse Garden",
    "headingPath": [
      "Special Location Requirements",
      "Impasse Garden"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 566,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "special-location-requirements-cave-of-shinda",
    "title": "Cave Of Shinda",
    "headingPath": [
      "Special Location Requirements",
      "Cave Of Shinda"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 580,
    "phase": "2C",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "item-requirements",
    "title": "Item Requirements",
    "headingPath": [
      "Item Requirements"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 595,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "item-requirements-duplicate-items",
    "title": "Duplicate Items",
    "headingPath": [
      "Item Requirements",
      "Duplicate Items"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 597,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "item-requirements-food",
    "title": "Food",
    "headingPath": [
      "Item Requirements",
      "Food"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 603,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "item-requirements-tools",
    "title": "Tools",
    "headingPath": [
      "Item Requirements",
      "Tools"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 609,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "item-requirements-weapons",
    "title": "Weapons",
    "headingPath": [
      "Item Requirements",
      "Weapons"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 614,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "item-requirements-wearables",
    "title": "Wearables",
    "headingPath": [
      "Item Requirements",
      "Wearables"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 623,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "item-requirements-tech-skills",
    "title": "Tech Skills",
    "headingPath": [
      "Item Requirements",
      "Tech Skills"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 632,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "item-requirements-maps-scrap-and-treasures",
    "title": "Maps, Scrap, And Treasures",
    "headingPath": [
      "Item Requirements",
      "Maps, Scrap, And Treasures"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 642,
    "phase": "2B",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "death-requirements",
    "title": "Death Requirements",
    "headingPath": [
      "Death Requirements"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 656,
    "phase": "2D",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "challenge-mode-requirements",
    "title": "Challenge Mode Requirements",
    "headingPath": [
      "Challenge Mode Requirements"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 670,
    "phase": "post-phase-2",
    "status": "deferred",
    "notes": "Challenge mode is outside the Phase 2 standard solo loop."
  },
  {
    "id": "challenge-mode-requirements-weather",
    "title": "Weather",
    "headingPath": [
      "Challenge Mode Requirements",
      "Weather"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 672,
    "phase": "post-phase-2",
    "status": "deferred",
    "notes": "Challenge mode is outside the Phase 2 standard solo loop."
  },
  {
    "id": "challenge-mode-requirements-terrain-odds-variant",
    "title": "Terrain Odds Variant",
    "headingPath": [
      "Challenge Mode Requirements",
      "Terrain Odds Variant"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 683,
    "phase": "post-phase-2",
    "status": "deferred",
    "notes": "Challenge mode is outside the Phase 2 standard solo loop."
  },
  {
    "id": "challenge-mode-requirements-rusty-weapons-variant",
    "title": "Rusty Weapons Variant",
    "headingPath": [
      "Challenge Mode Requirements",
      "Rusty Weapons Variant"
    ],
    "level": 3,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 691,
    "phase": "post-phase-2",
    "status": "deferred",
    "notes": "Challenge mode is outside the Phase 2 standard solo loop."
  },
  {
    "id": "asset-derived-requirements",
    "title": "Asset-Derived Requirements",
    "headingPath": [
      "Asset-Derived Requirements"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 695,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  },
  {
    "id": "verification-and-data-entry-notes",
    "title": "Verification And Data Entry Notes",
    "headingPath": [
      "Verification And Data Entry Notes"
    ],
    "level": 2,
    "sourcePath": "docs/miru-rules-requirements.md",
    "sourceLine": 706,
    "phase": "2E",
    "status": "verified",
    "notes": "Requirement text is extracted and ready for implementation tracking."
  }
] as const satisfies readonly SourceVerificationEntry[];

export function summarizeSourceVerification(
  entries: readonly SourceVerificationEntry[] = SOURCE_VERIFICATION_ENTRIES,
): SourceVerificationSummary {
  const byStatus = Object.fromEntries(
    SOURCE_VERIFICATION_STATUSES.map((status) => [status, 0]),
  ) as Record<SourceVerificationStatus, number>;

  for (const entry of entries) {
    byStatus[entry.status] += 1;
  }

  return {
    total: entries.length,
    byStatus,
  };
}

export const SOURCE_VERIFICATION_SUMMARY = summarizeSourceVerification();
