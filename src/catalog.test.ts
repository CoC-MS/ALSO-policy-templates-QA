import { describe, expect, it } from "vitest";
import {
  getPlatform,
  enterpriseLicenses,
  getPlatformRepositories,
  getWindowsServerLicenseNote,
  isLicenseEligible,
  isPlatformAvailableForLicense,
  licenses,
  platforms,
  requiresAgent365Note,
  smbLicenses,
  togglePlatformSelection,
} from "./catalog";

describe("license eligibility", () => {
  it("blocks only Business Basic and Business Standard", () => {
    const ineligible = licenses.filter((license) => !isLicenseEligible(license.id));

    expect(ineligible.map((license) => license.id)).toEqual([
      "business-basic",
      "business-standard",
    ]);
    expect(licenses.filter((license) => isLicenseEligible(license.id))).toHaveLength(16);
  });

  it("groups all Business plans under SMB", () => {
    expect(smbLicenses.map((license) => license.id)).toEqual([
      "business-basic",
      "business-standard",
      "business-premium",
      "business-premium-defender",
      "business-premium-purview",
      "business-premium-defender-purview",
    ]);
    expect(enterpriseLicenses).toHaveLength(12);
    expect(
      new Set([...enterpriseLicenses, ...smbLicenses].map((license) => license.id)),
    ).toEqual(new Set(licenses.map((license) => license.id)));
  });
});

describe("platform repository routing", () => {
  it.each([
    ["windows-11", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows"],
    ["windows-servers", "https://github.com/CoC-MS/ALSO-Microsoft-Security-WindowsServer"],
    ["ai-security", "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11"],
    ["agent-security", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access"],
    ["conditional-access", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access"],
    ["linux-desktop", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux"],
    ["linux-server", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux"],
    ["macos", "https://github.com/CoC-MS/ALSO-Microsoft-Security-MacOS"],
    ["ios-ipados", "https://github.com/CoC-MS/ALSO-Microsoft-Security-iOSandiPadOS"],
    ["android", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Android"],
    ["purview", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview"],
  ] as const)("routes %s correctly", (platformId, repository) => {
    expect(getPlatform(platformId).repository).toBe(repository);
  });

  it("contains one route for every displayed platform", () => {
    expect(platforms).toHaveLength(11);
    expect(new Set(platforms.map((platform) => platform.id)).size).toBe(platforms.length);
  });

  it("routes Agent Security to Conditional Access and AI Security Windows 11", () => {
    expect(getPlatformRepositories(getPlatform("agent-security"))).toEqual([
      {
        name: "Conditional Access",
        url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access",
      },
      {
        name: "AI Security Windows 11",
        url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
      },
    ]);
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

describe("Agent 365 prerequisite note", () => {
  const eligibleLicenses = [
    "e5",
    "e7",
    "a3-defender-purview",
    "a5",
    "g5",
    "business-premium-defender",
    "e3-defender",
    "e3-defender-purview",
  ] as const;

  it("makes Agent Security available only for supported licenses", () => {
    const available = licenses
      .filter((license) =>
        isPlatformAvailableForLicense(license.id, "agent-security"),
      )
      .map((license) => license.id);

    expect(available).toEqual(eligibleLicenses);
  });

  describe("Windows Server licensing notes", () => {
    it("uses the Defender for Business server requirement for Business Premium plans", () => {
      expect(getWindowsServerLicenseNote("business-premium")).toContain(
        "Microsoft Defender for Business servers",
      );
      expect(getWindowsServerLicenseNote("business-premium-defender-purview")).toContain(
        "Microsoft Defender for Servers Plan 1 or Plan 2",
      );
    });

    it("uses the Defender for Endpoint Server requirement for E3, E5, and E7 plans", () => {
      expect(getWindowsServerLicenseNote("e3")).toContain(
        "Microsoft Defender for Endpoint Server",
      );
      expect(getWindowsServerLicenseNote("e3-defender-purview")).toContain(
        "Microsoft Defender for Servers Plan 1 or Plan 2",
      );
      expect(getWindowsServerLicenseNote("e5")).toContain(
        "Microsoft Defender for Endpoint Server",
      );
      expect(getWindowsServerLicenseNote("e7")).toContain(
        "Microsoft Defender for Endpoint Server",
      );
    });

    it("does not show a Windows Server note for unrelated license families", () => {
      expect(getWindowsServerLicenseNote("a3")).toBeUndefined();
      expect(getWindowsServerLicenseNote("g5")).toBeUndefined();
    });
  });

  it("shows for supported Agent Security licenses except E7", () => {
    expect(requiresAgent365Note("business-premium-defender", "agent-security")).toBe(true);
    expect(requiresAgent365Note("e5", "agent-security")).toBe(true);
    expect(requiresAgent365Note("e7", "agent-security")).toBe(false);
    expect(requiresAgent365Note("business-premium", "agent-security")).toBe(false);
  });

  it("does not show for other platforms", () => {
    expect(requiresAgent365Note("e5", "ai-security")).toBe(false);
  });
});
