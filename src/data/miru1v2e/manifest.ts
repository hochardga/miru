import {
  SOURCE_VERIFICATION_STATUSES,
  SOURCE_VERIFICATION_SUMMARY,
} from "@/data/miru1v2e/sourceVerification";

export const MIRU1V2E_MANIFEST = {
  rulesVersion: "miru1v2e",
  startingStats: {
    hp: 10,
    ep: 10,
    baseAtk: 1,
    baseDef: 1,
    bitliths: 0,
    starvationCount: 0,
    sleepDeprivationCount: 0,
    minorInjuryCount: 0,
  },
  startingInventory: [
    {
      key: "meal-bar",
      name: "Meal Bar",
      category: "food",
      quantity: 3,
      metadata: {},
    },
  ],
  representativeEventKey: "first-field-discovery",
  representativeEnemyKey: "training-drone",
  sourceVerification: {
    trackerPath: "tests/fixtures/miru1v2e/source-verification.json",
    documentPath: "docs/source-verification.md",
    statuses: SOURCE_VERIFICATION_STATUSES,
    summary: SOURCE_VERIFICATION_SUMMARY,
  },
} as const;
