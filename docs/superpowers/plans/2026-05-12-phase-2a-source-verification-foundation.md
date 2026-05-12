# Phase 2A Source Verification Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 2 source verification foundation so every heading in `docs/miru-rules-requirements.md` is tracked, typed, summarized in the Miru 1 v2e manifest, documented for reviewers, and tied to TASK-027.

**Architecture:** Keep the tracker data source-derived and test-enforced. Store the machine-readable tracker fixture under `tests/fixtures/miru1v2e`, mirror it into a typed source data module for app and rules tooling, expose summary metadata from `src/data/miru1v2e/manifest.ts`, and publish a concise reviewer-facing document in `docs/source-verification.md`.

**Tech Stack:** Next.js 16 app router, TypeScript strict mode, Vitest, Node `fs`/`path` in unit tests, JSON fixtures with `resolveJsonModule`.

---

## File Structure Map

- Create `tests/fixtures/miru1v2e/source-verification.json`: machine-readable source tracker generated from the current headings in `docs/miru-rules-requirements.md`.
- Create `tests/unit/data/miru1v2e/source-verification.test.ts`: verifies the fixture exactly matches every `##`, `###`, and `####` heading from `docs/miru-rules-requirements.md`, has valid statuses, and includes ambiguous and deferred coverage.
- Create `src/data/miru1v2e/sourceVerification.ts`: typed source verification entries and summary helper mirrored from the fixture.
- Modify `src/data/miru1v2e/manifest.ts`: expose the tracker path, docs path, supported statuses, and computed summary.
- Create `tests/unit/data/miru1v2e/manifest-source-verification.test.ts`: verifies source data and manifest summary stay aligned with the fixture.
- Create `docs/source-verification.md`: human-readable source verification tracker for reviewers.
- Create `tests/unit/docs/source-verification-doc.test.ts`: verifies the doc includes the summary and a row for every tracker entry.
- Modify `docs/product-roadmap.md`: mark TASK-027 complete after the fixture, typed data, manifest summary, docs, and tests pass.

## Task 1: Source Verification Fixture

**Files:**
- Create: `tests/fixtures/miru1v2e/source-verification.json`
- Create: `tests/unit/data/miru1v2e/source-verification.test.ts`

- [ ] **Step 1: Write the failing fixture coverage test**

Create `tests/unit/data/miru1v2e/source-verification.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import tracker from "../../../fixtures/miru1v2e/source-verification.json";

type SourceVerificationStatus = "implemented" | "verified" | "ambiguous" | "deferred" | "blocked";

type SourceVerificationEntry = {
  id: string;
  title: string;
  headingPath: readonly string[];
  level: 2 | 3 | 4;
  sourcePath: "docs/miru-rules-requirements.md";
  sourceLine: number;
  phase: "current" | "2B" | "2C" | "2D" | "2E" | "post-phase-2";
  status: SourceVerificationStatus;
  notes: string;
};

const VALID_STATUSES = ["implemented", "verified", "ambiguous", "deferred", "blocked"] as const;
const SOURCE_PATH = "docs/miru-rules-requirements.md";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function idForHeadingPath(headingPath: string[]) {
  return slugify(headingPath.join(" "));
}

function extractSourceHeadings() {
  const source = fs.readFileSync(path.join(process.cwd(), SOURCE_PATH), "utf8");
  const stack: Partial<Record<2 | 3 | 4, string>> = {};

  return source.split(/\r?\n/).flatMap((line, index) => {
    const match = /^(#{2,4})\s+(.+)$/.exec(line);

    if (!match) {
      return [];
    }

    const level = match[1].length as 2 | 3 | 4;
    const title = match[2].trim();

    stack[level] = title;

    if (level < 4) {
      delete stack[4];
    }

    if (level < 3) {
      delete stack[3];
    }

    const headingPath = [stack[2], stack[3], stack[4]].filter(Boolean) as string[];

    return [
      {
        id: idForHeadingPath(headingPath),
        title,
        headingPath,
        level,
        sourcePath: SOURCE_PATH,
        sourceLine: index + 1,
      },
    ];
  });
}

describe("source verification tracker fixture", () => {
  it("lists every requirement heading from the source requirements document", () => {
    const entries = tracker as SourceVerificationEntry[];
    const sourceHeadings = extractSourceHeadings();

    expect(entries.map(({ id, title, headingPath, level, sourcePath, sourceLine }) => ({
      id,
      title,
      headingPath,
      level,
      sourcePath,
      sourceLine,
    }))).toEqual(sourceHeadings);
    expect(entries).toHaveLength(81);
  });

  it("uses unique ids and known review statuses", () => {
    const entries = tracker as SourceVerificationEntry[];
    const ids = new Set(entries.map((entry) => entry.id));

    expect(ids.size).toBe(entries.length);
    expect(entries.every((entry) => VALID_STATUSES.includes(entry.status))).toBe(true);
  });

  it("calls out known ambiguous and deferred rule groups", () => {
    const entries = tracker as SourceVerificationEntry[];

    expect(entries.some((entry) => entry.status === "ambiguous")).toBe(true);
    expect(entries.some((entry) => entry.status === "deferred")).toBe(true);
    expect(entries.find((entry) => entry.id === "calendar-and-story-event-requirements-day-50-power-supply")?.status).toBe("ambiguous");
    expect(entries.find((entry) => entry.id === "challenge-mode-requirements")?.status).toBe("deferred");
  });
});
```

- [ ] **Step 2: Run the fixture coverage test and verify it fails**

Run:

```bash
npm run test:unit -- tests/unit/data/miru1v2e/source-verification.test.ts
```

Expected: FAIL because `tests/fixtures/miru1v2e/source-verification.json` does not exist.

- [ ] **Step 3: Generate the tracker fixture from the source requirements headings**

Run this one-time generator:

```bash
mkdir -p tests/fixtures/miru1v2e
node <<'NODE'
const fs = require("fs");
const path = require("path");

const SOURCE_PATH = "docs/miru-rules-requirements.md";
const OUT_PATH = "tests/fixtures/miru1v2e/source-verification.json";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function idForHeadingPath(headingPath) {
  return slugify(headingPath.join(" "));
}

const implemented = new Set([
  "core-game-model-game-session",
  "core-game-model-player-character-state",
  "core-game-model-map-state",
  "survival-rules-camping",
  "survival-rules-food-effects",
  "survival-rules-sleep-effects",
  "survival-rules-starvation",
  "survival-rules-sleep-deprivation",
  "combat-rules-basic-attack",
]);

const ambiguous = new Set([
  "enemy-and-reward-rules-enemy-cards",
  "enemy-and-reward-rules-reward-roll",
  "terrain-event-requirements-forest-event-table",
  "terrain-event-requirements-mountains-event-table",
  "terrain-event-requirements-grasslands-event-table-grassland-ruins",
  "terrain-event-requirements-grasslands-event-table-grassland-encounters",
  "story-choice-requirements-extracted-branch-effects",
  "calendar-and-story-event-requirements-day-50-power-supply",
  "villages-shops-quests-shop-progression",
]);

const deferred = new Set([
  "challenge-mode-requirements",
  "challenge-mode-requirements-weather",
  "challenge-mode-requirements-terrain-odds-variant",
  "challenge-mode-requirements-rusty-weapons-variant",
]);

const notes = new Map([
  ["enemy-and-reward-rules-enemy-cards", "Enemy black skill-dot counts require visual verification before production data entry."],
  ["enemy-and-reward-rules-reward-roll", "Reward dice count depends on enemy black skill-dot counts that require visual verification."],
  ["terrain-event-requirements-forest-event-table", "The Nothing or Cave of Shinda condition requires visual verification."],
  ["terrain-event-requirements-mountains-event-table", "The Impassable or Impasse Garden condition requires visual verification."],
  ["terrain-event-requirements-grasslands-event-table-grassland-ruins", "Grassland R4 optional Bitlith branch lacks a clearly extracted source branch."],
  ["terrain-event-requirements-grasslands-event-table-grassland-encounters", "Grassland E5 and Day 50 conflict on Power Supply terrain placement."],
  ["story-choice-requirements-extracted-branch-effects", "Story-choice page extraction interleaves columns and needs visual verification before production data entry."],
  ["calendar-and-story-event-requirements-day-50-power-supply", "Power Supply attempt resolution is not fully extractable from text."],
  ["villages-shops-quests-shop-progression", "Shop buy and sell prices require visual verification against the item catalog."],
]);

function statusFor(id) {
  if (implemented.has(id)) {
    return "implemented";
  }

  if (ambiguous.has(id)) {
    return "ambiguous";
  }

  if (deferred.has(id)) {
    return "deferred";
  }

  return "verified";
}

function phaseFor(id) {
  if (implemented.has(id)) {
    return "current";
  }

  if (deferred.has(id)) {
    return "post-phase-2";
  }

  if (id.startsWith("enemy-and-reward-rules") || id.startsWith("combat-rules") || id.startsWith("item-requirements")) {
    return "2B";
  }

  if (id.startsWith("terrain-event-requirements") || id.startsWith("special-location-requirements")) {
    return "2C";
  }

  if (id.startsWith("villages-shops-quests") || id.startsWith("calendar-and-story-event-requirements") || id.startsWith("death-requirements") || id.startsWith("story-choice-requirements")) {
    return "2D";
  }

  return "2E";
}

function noteFor(id, status) {
  if (notes.has(id)) {
    return notes.get(id);
  }

  if (status === "implemented") {
    return "Covered by the current Phase 1 engine, map, survival, or combat implementation and tests.";
  }

  if (status === "deferred") {
    return "Challenge mode is outside the Phase 2 standard solo loop.";
  }

  return "Requirement text is extracted and ready for implementation tracking.";
}

const source = fs.readFileSync(SOURCE_PATH, "utf8");
const stack = {};
const entries = [];

source.split(/\r?\n/).forEach((line, index) => {
  const match = /^(#{2,4})\s+(.+)$/.exec(line);

  if (!match) {
    return;
  }

  const level = match[1].length;
  const title = match[2].trim();

  stack[level] = title;

  for (const key of Object.keys(stack)) {
    if (Number(key) > level) {
      delete stack[key];
    }
  }

  const headingPath = [stack[2], stack[3], stack[4]].filter(Boolean);
  const id = idForHeadingPath(headingPath);
  const status = statusFor(id);

  entries.push({
    id,
    title,
    headingPath,
    level,
    sourcePath: SOURCE_PATH,
    sourceLine: index + 1,
    phase: phaseFor(id),
    status,
    notes: noteFor(id, status),
  });
});

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(entries, null, 2) + "\n");
NODE
```

Expected: `tests/fixtures/miru1v2e/source-verification.json` is created with 81 entries.

- [ ] **Step 4: Run the fixture coverage test and verify it passes**

Run:

```bash
npm run test:unit -- tests/unit/data/miru1v2e/source-verification.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the source verification fixture**

Run:

```bash
git add tests/fixtures/miru1v2e/source-verification.json tests/unit/data/miru1v2e/source-verification.test.ts
git commit -m "test: track Miru source requirement headings"
```

Expected: commit succeeds with the fixture and its coverage test.

## Task 2: Typed Source Verification Data And Manifest Summary

**Files:**
- Create: `src/data/miru1v2e/sourceVerification.ts`
- Modify: `src/data/miru1v2e/manifest.ts`
- Create: `tests/unit/data/miru1v2e/manifest-source-verification.test.ts`

- [ ] **Step 1: Write the failing manifest summary test**

Create `tests/unit/data/miru1v2e/manifest-source-verification.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MIRU1V2E_MANIFEST } from "@/data/miru1v2e/manifest";
import {
  SOURCE_VERIFICATION_ENTRIES,
  SOURCE_VERIFICATION_STATUSES,
  SOURCE_VERIFICATION_SUMMARY,
  summarizeSourceVerification,
} from "@/data/miru1v2e/sourceVerification";
import fixture from "../../../fixtures/miru1v2e/source-verification.json";

describe("Miru 1 v2e source verification manifest", () => {
  it("exports typed source verification entries mirrored from the tracker fixture", () => {
    expect(SOURCE_VERIFICATION_ENTRIES).toEqual(fixture);
    expect(SOURCE_VERIFICATION_ENTRIES).toHaveLength(81);
  });

  it("summarizes source verification statuses for the manifest", () => {
    expect(SOURCE_VERIFICATION_SUMMARY).toEqual(summarizeSourceVerification(SOURCE_VERIFICATION_ENTRIES));
    expect(SOURCE_VERIFICATION_SUMMARY.total).toBe(81);
    expect(SOURCE_VERIFICATION_SUMMARY.byStatus.implemented).toBe(9);
    expect(SOURCE_VERIFICATION_SUMMARY.byStatus.ambiguous).toBe(9);
    expect(SOURCE_VERIFICATION_SUMMARY.byStatus.deferred).toBe(4);
    expect(SOURCE_VERIFICATION_SUMMARY.byStatus.blocked).toBe(0);
  });

  it("exposes the tracker paths and status summary from the rules manifest", () => {
    expect(MIRU1V2E_MANIFEST.sourceVerification).toEqual({
      trackerPath: "tests/fixtures/miru1v2e/source-verification.json",
      documentPath: "docs/source-verification.md",
      statuses: SOURCE_VERIFICATION_STATUSES,
      summary: SOURCE_VERIFICATION_SUMMARY,
    });
  });
});
```

- [ ] **Step 2: Run the manifest summary test and verify it fails**

Run:

```bash
npm run test:unit -- tests/unit/data/miru1v2e/manifest-source-verification.test.ts
```

Expected: FAIL because `@/data/miru1v2e/sourceVerification` and `MIRU1V2E_MANIFEST.sourceVerification` do not exist.

- [ ] **Step 3: Generate the typed source verification module from the tracker fixture**

Run this one-time generator:

```bash
node <<'NODE'
const fs = require("fs");
const path = require("path");

const fixturePath = "tests/fixtures/miru1v2e/source-verification.json";
const outPath = "src/data/miru1v2e/sourceVerification.ts";
const entries = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

const content = [
  'export const SOURCE_VERIFICATION_STATUSES = ["implemented", "verified", "ambiguous", "deferred", "blocked"] as const;',
  "",
  "export type SourceVerificationStatus = (typeof SOURCE_VERIFICATION_STATUSES)[number];",
  'export type SourceVerificationPhase = "current" | "2B" | "2C" | "2D" | "2E" | "post-phase-2";',
  "",
  "export type SourceVerificationEntry = {",
  "  id: string;",
  "  title: string;",
  "  headingPath: readonly string[];",
  "  level: 2 | 3 | 4;",
  '  sourcePath: "docs/miru-rules-requirements.md";',
  "  sourceLine: number;",
  "  phase: SourceVerificationPhase;",
  "  status: SourceVerificationStatus;",
  "  notes: string;",
  "};",
  "",
  "export type SourceVerificationSummary = {",
  "  total: number;",
  "  byStatus: Record<SourceVerificationStatus, number>;",
  "};",
  "",
  "export const SOURCE_VERIFICATION_ENTRIES = " + JSON.stringify(entries, null, 2) + " as const satisfies readonly SourceVerificationEntry[];",
  "",
  "export function summarizeSourceVerification(",
  "  entries: readonly SourceVerificationEntry[] = SOURCE_VERIFICATION_ENTRIES,",
  "): SourceVerificationSummary {",
  "  const byStatus = Object.fromEntries(",
  "    SOURCE_VERIFICATION_STATUSES.map((status) => [status, 0]),",
  "  ) as Record<SourceVerificationStatus, number>;",
  "",
  "  for (const entry of entries) {",
  "    byStatus[entry.status] += 1;",
  "  }",
  "",
  "  return {",
  "    total: entries.length,",
  "    byStatus,",
  "  };",
  "}",
  "",
  "export const SOURCE_VERIFICATION_SUMMARY = summarizeSourceVerification();",
  "",
].join("\n");

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content);
NODE
```

Expected: `src/data/miru1v2e/sourceVerification.ts` is created with typed entries and a summary helper.

- [ ] **Step 4: Modify the Miru 1 v2e manifest**

Modify `src/data/miru1v2e/manifest.ts` to import and expose the source verification summary:

```ts
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
```

- [ ] **Step 5: Run the manifest summary test and verify it passes**

Run:

```bash
npm run test:unit -- tests/unit/data/miru1v2e/manifest-source-verification.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run the fixture and manifest tests together**

Run:

```bash
npm run test:unit -- tests/unit/data/miru1v2e/source-verification.test.ts tests/unit/data/miru1v2e/manifest-source-verification.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit typed source verification metadata**

Run:

```bash
git add src/data/miru1v2e/sourceVerification.ts src/data/miru1v2e/manifest.ts tests/unit/data/miru1v2e/manifest-source-verification.test.ts
git commit -m "feat: expose Miru source verification metadata"
```

Expected: commit succeeds with the typed tracker data and manifest summary.

## Task 3: Reviewer-Facing Source Verification Document

**Files:**
- Create: `docs/source-verification.md`
- Create: `tests/unit/docs/source-verification-doc.test.ts`

- [ ] **Step 1: Write the failing source verification document test**

Create `tests/unit/docs/source-verification-doc.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import tracker from "../../fixtures/miru1v2e/source-verification.json";

type SourceVerificationEntry = {
  id: string;
  headingPath: string[];
  sourcePath: string;
  sourceLine: number;
  status: string;
  phase: string;
};

function readDoc() {
  return fs.readFileSync(path.join(process.cwd(), "docs/source-verification.md"), "utf8");
}

describe("source verification document", () => {
  it("summarizes the tracker for reviewers", () => {
    const doc = readDoc();
    const entries = tracker as SourceVerificationEntry[];

    expect(doc).toContain("# Miru 1 v2e Source Verification");
    expect(doc).toContain(`Total headings: ${entries.length}`);
    expect(doc).toContain("Implemented: 9");
    expect(doc).toContain("Ambiguous: 9");
    expect(doc).toContain("Deferred: 4");
  });

  it("contains a table row for every source requirement heading", () => {
    const doc = readDoc();
    const entries = tracker as SourceVerificationEntry[];

    for (const entry of entries) {
      const row = `| \`${entry.id}\` | ${entry.status} | ${entry.phase} | ${entry.headingPath.join(" > ")} | ${entry.sourcePath}:${entry.sourceLine} |`;

      expect(doc).toContain(row);
    }
  });
});
```

- [ ] **Step 2: Run the document test and verify it fails**

Run:

```bash
npm run test:unit -- tests/unit/docs/source-verification-doc.test.ts
```

Expected: FAIL because `docs/source-verification.md` does not exist.

- [ ] **Step 3: Generate the reviewer-facing source verification document**

Run this one-time generator:

```bash
mkdir -p docs
node <<'NODE'
const fs = require("fs");

const entries = JSON.parse(fs.readFileSync("tests/fixtures/miru1v2e/source-verification.json", "utf8"));
const statuses = ["implemented", "verified", "ambiguous", "deferred", "blocked"];
const counts = Object.fromEntries(statuses.map((status) => [status, 0]));

for (const entry of entries) {
  counts[entry.status] += 1;
}

const lines = [
  "# Miru 1 v2e Source Verification",
  "",
  "This tracker maps the current `docs/miru-rules-requirements.md` headings to Phase 2 source verification status. It is intentionally concise and does not reproduce large source text.",
  "",
  "## Summary",
  "",
  "- Total headings: " + entries.length,
  "- Implemented: " + counts.implemented,
  "- Verified: " + counts.verified,
  "- Ambiguous: " + counts.ambiguous,
  "- Deferred: " + counts.deferred,
  "- Blocked: " + counts.blocked,
  "",
  "## Status Definitions",
  "",
  "- `implemented`: encoded and covered by tests.",
  "- `verified`: source requirement text is extracted and ready for implementation tracking.",
  "- `ambiguous`: known source conflict or extraction issue.",
  "- `deferred`: outside the Phase 2 standard solo loop.",
  "- `blocked`: required for the loop but not safe to implement from available sources.",
  "",
  "## Tracker",
  "",
  "| ID | Status | Phase | Heading | Source | Notes |",
  "| --- | --- | --- | --- | --- | --- |",
];

for (const entry of entries) {
  lines.push(
    "| `" + entry.id + "` | " +
      entry.status + " | " +
      entry.phase + " | " +
      entry.headingPath.join(" > ") + " | " +
      entry.sourcePath + ":" + entry.sourceLine + " | " +
      entry.notes.replace(/\|/g, "\\|") + " |",
  );
}

fs.writeFileSync("docs/source-verification.md", lines.join("\n") + "\n");
NODE
```

Expected: `docs/source-verification.md` is created with a summary and 81 tracker rows.

- [ ] **Step 4: Run the document test and verify it passes**

Run:

```bash
npm run test:unit -- tests/unit/docs/source-verification-doc.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the reviewer-facing source verification document**

Run:

```bash
git add docs/source-verification.md tests/unit/docs/source-verification-doc.test.ts
git commit -m "docs: add Miru source verification tracker"
```

Expected: commit succeeds with the reviewer-facing tracker and document test.

## Task 4: Roadmap Completion And Phase 2A Verification

**Files:**
- Modify: `docs/product-roadmap.md`

- [ ] **Step 1: Run the focused Phase 2A tests**

Run:

```bash
npm run test:unit -- tests/unit/data/miru1v2e/source-verification.test.ts tests/unit/data/miru1v2e/manifest-source-verification.test.ts tests/unit/docs/source-verification-doc.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Mark TASK-027 complete in the roadmap**

Modify `docs/product-roadmap.md` so the TASK-027 line changes from:

```md
- [ ] **TASK-027** - Create source verification tracker
```

to:

```md
- [x] **TASK-027** - Create source verification tracker
```

- [ ] **Step 4: Verify the roadmap checkbox changed**

Run:

```bash
rg -n -- "- \\[x\\] \\*\\*TASK-027\\*\\*" docs/product-roadmap.md
```

Expected: one match on the TASK-027 line.

- [ ] **Step 5: Run lint after the roadmap update**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit the roadmap completion**

Run:

```bash
git add docs/product-roadmap.md
git commit -m "docs: mark phase 2 source tracker complete"
```

Expected: commit succeeds with the roadmap checkbox update.

- [ ] **Step 7: Confirm the working tree is clean**

Run:

```bash
git status --short
```

Expected: no output.

## Self-Review Checklist

- Spec coverage: TASK-027 is fully covered by the fixture, typed metadata, manifest summary, reviewer doc, tests, and roadmap checkbox.
- Source accountability: every source heading is parsed from `docs/miru-rules-requirements.md`, matched in the fixture, mirrored to typed data, and listed in the reviewer document.
- Type consistency: fixture, source data, manifest summary, and document tests use the same status names: `implemented`, `verified`, `ambiguous`, `deferred`, and `blocked`.
- Phase scope: this plan intentionally stops before TASK-028 item catalog work; the next implementation plan should begin Phase 2B after this plan passes.
