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
