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
