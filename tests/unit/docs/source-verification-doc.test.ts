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
  notes: string;
};

function readDoc() {
  return fs.readFileSync(path.join(process.cwd(), "docs/source-verification.md"), "utf8");
}

const statuses = ["implemented", "verified", "ambiguous", "deferred", "blocked"] as const;

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

describe("source verification document", () => {
  it("summarizes the tracker for reviewers", () => {
    const doc = readDoc();
    const entries = tracker as SourceVerificationEntry[];
    const counts = Object.fromEntries(statuses.map((status) => [status, 0]));

    for (const entry of entries) {
      counts[entry.status as (typeof statuses)[number]] += 1;
    }

    expect(doc).toContain("# Miru 1 v2e Source Verification");
    expect(doc).toContain(`Total headings: ${entries.length}`);

    for (const status of statuses) {
      expect(doc).toContain(`${statusLabel(status)}: ${counts[status]}`);
    }
  });

  it("contains a table row for every source requirement heading", () => {
    const doc = readDoc();
    const entries = tracker as SourceVerificationEntry[];
    const trackerRows = doc
      .split("\n")
      .filter((line) => line.startsWith("| `"));

    expect(trackerRows).toHaveLength(entries.length);

    for (const entry of entries) {
      const escapedNotes = entry.notes.replace(/\|/g, "\\|");
      const row = `| \`${entry.id}\` | ${entry.status} | ${entry.phase} | ${entry.headingPath.join(" > ")} | ${entry.sourcePath}:${entry.sourceLine} | ${escapedNotes} |`;

      expect(doc).toContain(row);
    }
  });
});
