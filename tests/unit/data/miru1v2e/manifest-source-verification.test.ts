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
    expect(SOURCE_VERIFICATION_SUMMARY.byStatus.implemented).toBe(0);
    expect(SOURCE_VERIFICATION_SUMMARY.byStatus.verified).toBe(68);
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
