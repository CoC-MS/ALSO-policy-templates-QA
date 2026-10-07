import { describe, expect, it } from "vitest";
import {
  enterpriseLicenses,
  getAgentSecurityLicenseNoteForLicenses,
  getLimitedExperienceNoteForLicenses,
  getPlatform,
  getPlatformLicenseGuidance,
  getPlatformRepositories,
  getWindowsServerLicenseNote,
  getWindowsServerLicenseNotes,
  isLicenseEligible,
  isPlatformAvailableForLicense,
  isPlatformAvailableForLicenses,
  licenses,
  platforms,
  smbLicenses,
  toggleLicenseSelection,
  togglePlatformSelection,
} from "./catalog";

describe("license catalog", () => {
  it("blocks only Business Basic and Business Standard", () => {
    expect(
      licenses.filter((license) => !isLicenseEligible(license.id)).map((license) => license.id),
    ).toEqual(["business-standard", "business-basic"]);
  });

  it("keeps the stated equivalent plans together and separates F3", () => {
    expect(enterpriseLicenses.map((license) => license.id)).toEqual([
      "e7g7",
      "e5a5g5",
      "eag3",
      "eag3-defender",
      "eag3-purview",
      "eag3-defender-purview",
      "f3",
      "f3-defender",
      "f3-purview",
      "f3-defender-purview",
      "f1a1",
      "f1a1-defender",
      "f1a1-purview",
      "f1a1-defender-purview",
    ]);
    expect(smbLicenses).toHaveLength(6);
  });
});

describe("repository routing", () => {
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

  it("routes Agent Security to Conditional Access and Windows 11 AI Security", () => {
    expect(
      getPlatformRepositories(getPlatform("agent-security")).map((repository) => repository.name),
    ).toEqual(["Conditional Access", "AI Security Windows 11"]);
  });

  it("contains one route for every platform", () => {
    expect(platforms).toHaveLength(11);
    expect(new Set(platforms.map((platform) => platform.id)).size).toBe(platforms.length);
  });
});

describe("selection helpers", () => {
  it("toggles multiple platforms", () => {
    const windows = getPlatform("windows-11");
    const purview = getPlatform("purview");
    const selected = togglePlatformSelection(togglePlatformSelection([], windows), purview);

    expect(selected.map((platform) => platform.id)).toEqual(["windows-11", "purview"]);
    expect(togglePlatformSelection(selected, windows)).toEqual([purview]);
  });

  it("toggles multiple licenses", () => {
    const e5 = licenses.find((license) => license.id === "e5a5g5")!;
    const e7 = licenses.find((license) => license.id === "e7g7")!;
    const selected = toggleLicenseSelection(toggleLicenseSelection([], e5), e7);

    expect(selected.map((license) => license.id)).toEqual(["e5a5g5", "e7g7"]);
    expect(toggleLicenseSelection(selected, e5)).toEqual([e7]);
  });

  it("unions capabilities from all selected licenses", () => {
    expect(
      isPlatformAvailableForLicenses(["eag3", "eag3-purview"], "purview"),
    ).toBe(true);
    expect(
      isPlatformAvailableForLicenses(["f1a1", "business-premium"], "windows-11"),
    ).toBe(true);
  });
});

describe("licensing prerequisite matrix", () => {
  it("allows Conditional Access with every eligible base license", () => {
    for (const license of licenses.filter((item) => item.eligible)) {
      expect(isPlatformAvailableForLicense(license.id, "conditional-access")).toBe(true);
    }
  });

  it("requires an AI Security base with Intune P1, Entra P1, and qualifying Defender", () => {
    expect(isPlatformAvailableForLicense("business-premium", "ai-security")).toBe(true);
    expect(isPlatformAvailableForLicense("eag3", "ai-security")).toBe(true);
    expect(isPlatformAvailableForLicense("eag3-purview", "ai-security")).toBe(true);
    expect(isPlatformAvailableForLicense("f3", "ai-security")).toBe(true);
    expect(isPlatformAvailableForLicense("f3-defender", "ai-security")).toBe(true);
    expect(isPlatformAvailableForLicense("f1a1", "ai-security")).toBe(false);
  });

  it("keeps limited client repositories available to supported base plans", () => {
    for (const platformId of ["windows-11", "macos", "ios-ipados", "android"] as const) {
      expect(isPlatformAvailableForLicense("business-premium", platformId)).toBe(true);
      expect(isPlatformAvailableForLicense("eag3", platformId)).toBe(true);
      expect(isPlatformAvailableForLicense("eag3-defender", platformId)).toBe(true);
      expect(isPlatformAvailableForLicense("f3-defender", platformId)).toBe(true);
      expect(isPlatformAvailableForLicense("f1a1", platformId)).toBe(true);
      expect(isPlatformAvailableForLicense("f1a1-defender", platformId)).toBe(true);
      expect(isPlatformAvailableForLicense("e5a5g5", platformId)).toBe(true);
      expect(isPlatformAvailableForLicense("e7g7", platformId)).toBe(true);
    }
  });

  it("hides Linux Desktop unless Endpoint P2 is included", () => {
    expect(isPlatformAvailableForLicense("business-premium", "linux-desktop")).toBe(false);
    expect(isPlatformAvailableForLicense("business-premium-defender", "linux-desktop")).toBe(true);
    expect(isPlatformAvailableForLicense("eag3", "linux-desktop")).toBe(false);
    expect(isPlatformAvailableForLicense("eag3-defender", "linux-desktop")).toBe(true);
    expect(isPlatformAvailableForLicense("f1a1-defender", "linux-desktop")).toBe(true);
    expect(isPlatformAvailableForLicense("e5a5g5", "linux-desktop")).toBe(true);
  });

  it("keeps Windows Server availability and add-on guidance", () => {
    expect(isPlatformAvailableForLicense("business-premium", "windows-servers")).toBe(true);
    expect(isPlatformAvailableForLicense("eag3", "windows-servers")).toBe(true);
    expect(isPlatformAvailableForLicense("f3", "windows-servers")).toBe(true);
    expect(isPlatformAvailableForLicense("f1a1", "windows-servers")).toBe(true);
    expect(getWindowsServerLicenseNote("business-premium")).toContain(
      "Microsoft Defender for Business servers",
    );
    expect(getWindowsServerLicenseNote("eag3")).toContain(
      "Microsoft Defender for Endpoint Server",
    );
    expect(
      getWindowsServerLicenseNotes(["business-premium", "business-premium-defender", "e5a5g5"]),
    ).toHaveLength(2);
  });

  it("keeps limited Purview access visible for base plans", () => {
    expect(isPlatformAvailableForLicense("business-premium", "purview")).toBe(true);
    expect(isPlatformAvailableForLicense("eag3", "purview")).toBe(true);
    expect(isPlatformAvailableForLicense("eag3-purview", "purview")).toBe(true);
    expect(isPlatformAvailableForLicense("f3-purview", "purview")).toBe(true);
    expect(isPlatformAvailableForLicense("f1a1-purview", "purview")).toBe(true);
    expect(isPlatformAvailableForLicense("e5a5g5", "purview")).toBe(true);
    expect(isPlatformAvailableForLicense("e7g7", "purview")).toBe(true);
  });
});

describe("result guidance", () => {
  it("states Conditional Access, risky policy, and Agent 365 prerequisites", () => {
    const message = getPlatformLicenseGuidance("conditional-access")?.message;

    expect(message).toContain("Microsoft Entra ID Plan 1");
    expect(message).toContain("Business Premium");
    expect(message).toContain("Microsoft Entra ID Plan 2");
    expect(message).toContain("Agent 365 license");
  });

  it.each([
    ["ai-security", "Microsoft Defender for Endpoint Plan 1"],
    ["windows-11", "Full experience: Microsoft Defender Suite"],
    ["macos", "Full experience: Microsoft Defender Suite"],
    ["linux-desktop", "Microsoft Defender for Endpoint Plan 2"],
    ["ios-ipados", "Microsoft Defender for Business"],
    ["android", "Microsoft Defender for Business"],
    ["purview", "Full experience: Microsoft Purview Suite"],
  ] as const)("shows accurate %s guidance", (platformId, expectedText) => {
    expect(getPlatformLicenseGuidance(platformId)?.message).toContain(expectedText);
  });

  it("always requires Agent 365, including for E7/G7", () => {
    for (const licenseId of ["e7g7", "e5a5g5", "business-premium"] as const) {
      const note = getAgentSecurityLicenseNoteForLicenses([licenseId], "agent-security");
      if (isPlatformAvailableForLicense(licenseId, "agent-security")) {
        expect(note?.title).toBe("Agent 365 license required");
      }
    }
    expect(
      getAgentSecurityLicenseNoteForLicenses(["e7g7"], "agent-security")?.message,
    ).toContain("also applies when Microsoft 365 E7 or G7 is selected");
  });

  it("names both Conditional Access top-ups when the selected plan lacks them", () => {
    const note = getLimitedExperienceNoteForLicenses(
      ["business-premium"],
      "conditional-access",
    );

    expect(note?.message).toContain("With Microsoft 365 Business Premium");
    expect(note?.message).toContain("add Microsoft Entra ID Plan 2");
    expect(note?.message).toContain("Add an Agent 365 license");
  });

  it("only names Agent 365 when Entra ID Plan 2 is already covered", () => {
    const note = getLimitedExperienceNoteForLicenses(
      ["e5a5g5"],
      "conditional-access",
    );

    expect(note?.message).toContain("includes Microsoft Entra ID Plan 2");
    expect(note?.message).toContain("Add an Agent 365 license");
  });

  it.each(["windows-11", "macos", "ios-ipados", "android"] as const)(
    "names Defender Suite as the %s top-up for a limited base plan",
    (platformId) => {
      const note = getLimitedExperienceNoteForLicenses(["eag3"], platformId);

      expect(note?.title).toContain("Limited");
      expect(note?.message).toContain("With Microsoft 365 E3/A3/G3");
      expect(note?.message).toContain("Microsoft Defender Suite add-on");
    },
  );

  it("does not show a limited client notice when any selection provides full Defender coverage", () => {
    expect(
      getLimitedExperienceNoteForLicenses(
        ["business-premium", "eag3-defender"],
        "windows-11",
      ),
    ).toBeUndefined();
  });

  it("names Purview Suite as the top-up for limited Purview selections", () => {
    const note = getLimitedExperienceNoteForLicenses(["eag3"], "purview");

    expect(note?.message).toContain("With Microsoft 365 E3/A3/G3");
    expect(note?.message).toContain("add Microsoft Purview Suite");
    expect(
      getLimitedExperienceNoteForLicenses(["eag3-purview"], "purview"),
    ).toBeUndefined();
  });
});

describe("Business Premium-only results", () => {
  const businessPremiumOnly = ["business-premium"] as const;

  it("shows every supported repository except Linux Desktop", () => {
    expect(
      platforms
        .filter((platform) =>
          isPlatformAvailableForLicenses(businessPremiumOnly, platform.id),
        )
        .map((platform) => platform.id),
    ).toEqual([
      "windows-11",
      "windows-servers",
      "ai-security",
      "agent-security",
      "conditional-access",
      "linux-server",
      "macos",
      "ios-ipados",
      "android",
      "purview",
    ]);
  });

  it("explains that Defender Suite includes Entra ID P2 for risky policies", () => {
    const note = getLimitedExperienceNoteForLicenses(
      businessPremiumOnly,
      "conditional-access",
    );

    expect(note?.message).toContain("add Microsoft Entra ID Plan 2");
    expect(note?.message).toContain(
      "also included with the Microsoft Defender Suite add-on",
    );
    expect(note?.message).toContain("Add an Agent 365 license");
  });

  it.each([
    "windows-11",
    "ai-security",
    "macos",
    "ios-ipados",
    "android",
  ] as const)("requires the Defender Suite add-on for full %s coverage", (platformId) => {
    expect(
      getLimitedExperienceNoteForLicenses(businessPremiumOnly, platformId)
        ?.message,
    ).toBe(
      `With Microsoft 365 Business Premium, add the Microsoft Defender Suite add-on to unlock the full ${getPlatform(platformId).name} policy-template experience.`,
    );
  });

  it("requires Agent 365 for Agent Security", () => {
    expect(
      getAgentSecurityLicenseNoteForLicenses(
        businessPremiumOnly,
        "agent-security",
      )?.message,
    ).toContain("All Agent 365 policies require an Agent 365 license");
  });

  it("uses the Windows Server licensing message for both server repositories", () => {
    const serverMessage = getWindowsServerLicenseNotes(businessPremiumOnly);

    expect(serverMessage).toHaveLength(1);
    expect(serverMessage[0]).toContain(
      "Microsoft Defender for Business servers",
    );
    expect(serverMessage[0]).toContain(
      "Microsoft Defender for Servers Plan 1 or Plan 2",
    );
  });

  it("requires the Purview Suite add-on for full Purview coverage", () => {
    expect(
      getLimitedExperienceNoteForLicenses(businessPremiumOnly, "purview")
        ?.message,
    ).toBe(
      "With Microsoft 365 Business Premium, add Microsoft Purview Suite to one of your selected qualifying base licenses to unlock the full Microsoft Purview policy-template experience.",
    );
  });
});
