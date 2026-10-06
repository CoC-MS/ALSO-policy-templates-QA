import { describe, expect, it } from "vitest";
import {
  getPlatform,
  isLicenseEligible,
  licenses,
  platforms,
  togglePlatformSelection,
} from "./catalog";

describe("license eligibility", () => {
  it("blocks only Business Basic and Business Standard", () => {
    const ineligible = licenses.filter((license) => !isLicenseEligible(license.id));

    expect(ineligible.map((license) => license.id)).toEqual([
      "business-basic",
      "business-standard",
    ]);
    expect(licenses.filter((license) => isLicenseEligible(license.id))).toHaveLength(14);
  });
});

describe("platform repository routing", () => {
  it.each([
    ["windows-11", "https://github.com/CoC-MS/security-template"],
    ["windows-servers", "https://github.com/CoC-MS/ALSO-Microsoft-Security-WindowsServer"],
    ["ai-security", "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11"],
    ["agent-security", "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11"],
    ["linux-desktop", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux"],
    ["linux-server", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux"],
    ["macos", "https://github.com/CoC-MS/ALSO-Microsoft-Security-MacOS"],
    ["ios-ipados", "https://github.com/CoC-MS/ALSO-Microsoft-Security-iOSandiPadOS"],
    ["android", "https://github.com/CoC-MS/security-template"],
    ["purview", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview"],
  ] as const)("routes %s correctly", (platformId, repository) => {
    expect(getPlatform(platformId).repository).toBe(repository);
  });

  it("contains one route for every displayed platform", () => {
    expect(platforms).toHaveLength(10);
    expect(new Set(platforms.map((platform) => platform.id)).size).toBe(platforms.length);
  });
});

describe("platform selection", () => {
  it("selects multiple platforms and toggles individual selections", () => {
    const windows = getPlatform("windows-11");
    const purview = getPlatform("purview");

    const twoSelected = togglePlatformSelection(
      togglePlatformSelection([], windows),
      purview,
    );
    expect(twoSelected.map((platform) => platform.id)).toEqual([
      "windows-11",
      "purview",
    ]);

    expect(togglePlatformSelection(twoSelected, windows)).toEqual([purview]);
  });
});
