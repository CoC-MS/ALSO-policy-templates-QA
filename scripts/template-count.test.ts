import { describe, expect, it } from "vitest";
import { countPolicyJsonFiles } from "./template-count.mjs";

describe("policy JSON file count", () => {
  it("counts JSON files at every depth, case-insensitively", () => {
    expect(countPolicyJsonFiles({
      tree: [
        { type: "blob", path: "policy.json" },
        { type: "blob", path: "Windows/Intune/policy.JSON" },
        { type: "blob", path: "Windows/script.ps1" },
        { type: "tree", path: "folder.json" },
      ],
    })).toBe(2);
  });

  it("excludes the requested folders and their nested files", () => {
    expect(countPolicyJsonFiles({
      tree: [
        { type: "blob", path: "CA/Applications/policy.json" },
        { type: "blob", path: "Authentication Context/nested/policy.json" },
        { type: "blob", path: "AuthenticationContext/policy.json" },
        { type: "blob", path: "authentication-context/policy.json" },
        { type: "blob", path: "CA/namedlocations/policy.json" },
        { type: "blob", path: "Named Locations/policy.json" },
        { type: "blob", path: "ConditionalAccess/policy.json" },
      ],
    })).toBe(1);
  });

  it("matches folder names rather than file names or partial folder names", () => {
    expect(countPolicyJsonFiles({
      tree: [
        { type: "blob", path: "Applications.json" },
        { type: "blob", path: "ApplicationsPolicy/policy.json" },
      ],
    })).toBe(2);
  });

  it("rejects incomplete trees rather than publishing an inaccurate count", () => {
    expect(() => countPolicyJsonFiles({ truncated: true, tree: [] })).toThrow(
      "truncated",
    );
  });
});
