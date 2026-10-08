import { describe, expect, it } from "vitest";
import { countPolicyJsonFiles, countRepositoryTemplates, getPolicyJsonHashes, deduplicateRepositoryCounts } from "./template-count.mjs";

describe("policy JSON file count", () => {
  it("deduplicates identical JSON content within a repository", () => {
    expect(getPolicyJsonHashes({ tree: [
      { type: "blob", path: "Basic/policy.json", sha: "same" },
      { type: "blob", path: "Full/copy.json", sha: "same" },
      { type: "blob", path: "Full/other.json", sha: "different" },
      { type: "blob", path: "Groups/group.json", sha: "excluded" },
    ] })).toEqual(["different", "same"]);
  });

  it("deduplicates across repositories and retains Purview's 24 templates", () => {
    const result = deduplicateRepositoryCounts([
      { name: "Windows", templateHashes: ["one", "one", "two"] },
      { name: "AI", templateHashes: ["two", "three"] },
      { name: "ALSO-Microsoft-Security-Purview", templateHashes: [] },
    ]);
    expect(result.map((repository) => repository.templateCount)).toEqual([2, 1, 24]);
  });

  it("refuses to publish a total without cached content hashes", () => {
    expect(() => deduplicateRepositoryCounts([{ name: "Windows" }])).toThrow("Missing template hashes");
    expect(() => getPolicyJsonHashes({ tree: [
      { type: "blob", path: "policy.json" },
    ] })).toThrow("Missing Git content hash");
  });

  it("includes the specified 24 Purview templates even without JSON files", () => {
    expect(countRepositoryTemplates("ALSO-Microsoft-Security-Purview", {
      tree: [],
    })).toBe(24);
  });

  it("continues counting JSON files for other repositories", () => {
    expect(countRepositoryTemplates("ALSO-Microsoft-Security-Windows", {
      tree: [{ type: "blob", path: "policy.json" }],
    })).toBe(1);
  });

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
        { type: "blob", path: "Groups/group.json" },
        { type: "blob", path: "CA/groups/nested/group.JSON" },
        { type: "blob", path: "ConditionalAccess/policy.json" },
      ],
    })).toBe(1);
  });

  it("matches folder names rather than file names or partial folder names", () => {
    expect(countPolicyJsonFiles({
      tree: [
        { type: "blob", path: "Applications.json" },
        { type: "blob", path: "ApplicationsPolicy/policy.json" },
        { type: "blob", path: "Groups.json" },
        { type: "blob", path: "GroupsPolicy/policy.json" },
      ],
    })).toBe(4);
  });

  it("rejects incomplete trees rather than publishing an inaccurate count", () => {
    expect(() => countPolicyJsonFiles({ truncated: true, tree: [] })).toThrow(
      "truncated",
    );
  });
});
