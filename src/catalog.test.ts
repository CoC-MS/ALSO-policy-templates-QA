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
  requiresLinuxDesktopLicenseNote,
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

  it("uses repository About descriptions for platform copy", () => {
    expect(getPlatform("windows-11").description).toBe(
      "All policies belonging to Windows",
    );
    expect(getPlatform("windows-servers").description).toContain(
      "A collection of Microsoft Security Windows Server policies",
    );
    expect(getPlatform("conditional-access").description).toContain(
      "A collection of Microsoft Entra Conditional Access policy templates",
    );
    expect(getPlatform("android").description).toBe(
      "All about managing android",
    );
    expect(getPlatform("purview").description).toBe(
      "No repository description is currently provided in GitHub About.",
    );
  });

  it("routes Agent Security to Conditional Access and AI Security Windows 11", () => {
    expect(getPlatformRepositories(getPlatform("agent-security"))).toEqual([
      {
        name: "Conditional Access",
        url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access",
        description: "A collection of Microsoft Entra Conditional Access policy templates, named locations, security groups and authentication context designed to help organizations accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.",
      },
      {
        name: "AI Security Windows 11",
        url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
        description: "This baseline delivers a hardened Windows 11 configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience",
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
    "business-premium-defender-purview",
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

  describe("Linux Desktop prerequisite note", () => {
    it.each([
      "e5",
      "e7",
      "a3-defender",
      "a3-defender-purview",
      "business-premium-defender",
      "business-premium-defender-purview",
      "e3-defender",
      "e3-defender-purview",
    ] as const)("does not show for %s because Defender for Endpoint is included", (licenseId) => {
      expect(requiresLinuxDesktopLicenseNote(licenseId, "linux-desktop")).toBe(false);
    });

    it.each([
      "business-premium",
      "business-premium-purview",
      "e3",
      "e3-purview",
      "a3",
      "a5",
      "g3",
      "g5",
    ] as const)("shows for %s because Defender for Endpoint Plan 2 is additional", (licenseId) => {
      expect(requiresLinuxDesktopLicenseNote(licenseId, "linux-desktop")).toBe(true);
    });

    it("does not show for other platforms", () => {
      expect(requiresLinuxDesktopLicenseNote("e3", "linux-server")).toBe(false);
    });
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
    expect(requiresAgent365Note("business-premium-defender-purview", "agent-security")).toBe(true);
    expect(requiresAgent365Note("e5", "agent-security")).toBe(true);
    expect(requiresAgent365Note("e7", "agent-security")).toBe(false);
    expect(requiresAgent365Note("business-premium", "agent-security")).toBe(false);
  });

  it("does not show for other platforms", () => {
    expect(requiresAgent365Note("e5", "ai-security")).toBe(false);
  });
});
