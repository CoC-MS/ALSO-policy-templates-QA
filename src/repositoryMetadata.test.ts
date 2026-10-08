import { describe, expect, it } from "vitest";
import { getPlatform, platforms } from "./catalog";
import {
  filterPlatformsByTopics,
  getRepositoryMetadata,
  type RepositoryMetadata,
} from "./repositoryMetadata";

const repositories: RepositoryMetadata[] = [
  {
    name: "ALSO-Microsoft-Security-Windows",
    url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows",
    description: "Windows policies",
    topics: ["app-control", "bitlocker", "windows"],
  },
  {
    name: "ALSO-Microsoft-Security-Conditional-Access",
    url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access",
    description: "Conditional Access policies",
    topics: ["conditional-access", "device-code-flow", "phishing-resistant-mfa"],
  },
  {
    name: "ALSO-Microsoft-Security-AI-Security-Windows11",
    url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
    description: "AI policies",
    topics: ["agentsecurity", "aisecurity"],
  },
];

describe("repository topic metadata", () => {
  it("looks up metadata by repository URL", () => {
    expect(
      getRepositoryMetadata(
        repositories,
        "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows",
      )?.topics,
    ).toContain("bitlocker");
  });

  it.each([
    ["Phishing Resistant MFA", ["agent-security", "conditional-access"]],
    ["Device Code Flow", ["agent-security", "conditional-access"]],
    ["App Control", ["windows-11"]],
    ["BitLocker", ["windows-11"]],
    ["Agent", ["ai-security", "agent-security"]],
  ] as const)("filters %s using repository topics", (query, expectedIds) => {
    expect(
      filterPlatformsByTopics(platforms, repositories, query).map(
        (platform) => platform.id,
      ),
    ).toEqual(expectedIds);
  });

  it("returns all candidates for an empty search", () => {
    const candidates = [getPlatform("windows-11"), getPlatform("purview")];

    expect(filterPlatformsByTopics(candidates, repositories, " ")).toEqual(
      candidates,
    );
  });

  it("does not invent matches for repositories without matching topics", () => {
    expect(filterPlatformsByTopics(platforms, repositories, "android")).toEqual(
      [],
    );
  });
});
