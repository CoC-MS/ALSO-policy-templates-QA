import { describe, expect, it } from "vitest";
import {
  searchRepositoryDocuments,
  type RepositorySearchDocument,
} from "./repositorySearch";

const documents: RepositorySearchDocument[] = [
  {
    repositoryName: "Conditional Access",
    repositoryUrl: "https://github.com/CoC-MS/conditional-access",
    path: "policies/phishing-resistant-mfa.json",
    url: "https://github.com/CoC-MS/conditional-access/blob/main/policies/phishing-resistant-mfa.json",
    content: "Require phishing resistant MFA and block device code flow.",
  },
  {
    repositoryName: "Windows",
    repositoryUrl: "https://github.com/CoC-MS/windows",
    path: "policies/app-control.md",
    url: "https://github.com/CoC-MS/windows/blob/main/policies/app-control.md",
    content: "Configure App Control and BitLocker.",
  },
  {
    repositoryName: "AI Security",
    repositoryUrl: "https://github.com/CoC-MS/ai",
    path: "agent/README.md",
    url: "https://github.com/CoC-MS/ai/blob/main/agent/README.md",
    content: "Security controls for Agent 365.",
  },
];

describe("GitHub repository search", () => {
  it.each([
    ["Phishing Resistant MFA", "Conditional Access"],
    ["Device Code Flow", "Conditional Access"],
    ["App Control", "Windows"],
    ["BitLocker", "Windows"],
    ["Agent", "AI Security"],
  ])("finds actual repository content for %s", (query, repositoryName) => {
    expect(searchRepositoryDocuments(documents, query)[0]?.repositoryName).toBe(
      repositoryName,
    );
  });

  it("requires every search term to match", () => {
    expect(searchRepositoryDocuments(documents, "BitLocker Agent")).toEqual([]);
  });

  it("returns a direct file URL and matching snippet", () => {
    const [result] = searchRepositoryDocuments(documents, "Device Code Flow");

    expect(result.url).toContain("/blob/main/");
    expect(result.snippet).toContain("device code flow");
  });

  it("returns no results for blank or unknown searches", () => {
    expect(searchRepositoryDocuments(documents, "   ")).toEqual([]);
    expect(searchRepositoryDocuments(documents, "unknown policy")).toEqual([]);
  });
});
