import { describe, expect, it } from "vitest";
import {
  getPlatform,
  getAgentSecurityLicenseNote,
  getAgentSecurityLicenseNoteForLicenses,
  enterpriseLicenses,
  getPlatformLicenseNoteForLicenses,
  getPlatformRepositories,
  getWindowsServerLicenseNote,
  getWindowsServerLicenseNotes,
  isLicenseEligible,
  isPlatformAvailableForLicense,
  isPlatformAvailableForLicenses,
  licenses,
  platforms,
  requiresAgent365Note,
  requiresLinuxDesktopLicenseNote,
  requiresLinuxDesktopLicenseNoteForLicenses,
  smbLicenses,
  toggleLicenseSelection,
  togglePlatformSelection,
} from "./catalog";

describe("license eligibility", () => {
  it("blocks only Business Basic and Business Standard", () => {
    const ineligible = licenses.filter((license) => !isLicenseEligible(license.id));

    expect(ineligible.map((license) => license.id)).toEqual([
      "business-basic",
      "business-standard",
    ]);
    expect(licenses.filter((license) => isLicenseEligible(license.id))).toHaveLength(23);
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
    expect(enterpriseLicenses).toHaveLength(19);
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

describe("license selection", () => {
  it("selects multiple licenses and toggles individual selections", () => {
    const e5 = licenses.find((license) => license.id === "e5")!;
    const g7 = licenses.find((license) => license.id === "g7")!;

    const twoSelected = toggleLicenseSelection(
      toggleLicenseSelection([], e5),
      g7,
    );
    expect(twoSelected.map((license) => license.id)).toEqual(["e5", "g7"]);
    expect(toggleLicenseSelection(twoSelected, e5)).toEqual([g7]);
  });

  it("combines platform access across all selected licenses", () => {
    expect(
      isPlatformAvailableForLicenses(
        ["business-premium", "e5"],
        "agent-security",
      ),
    ).toBe(true);
    expect(
      isPlatformAvailableForLicenses(["business-premium"], "agent-security"),
    ).toBe(false);
  });

  it("gives G7 the same platform access as E7", () => {
    for (const platform of platforms) {
      expect(isPlatformAvailableForLicense("g7", platform.id)).toBe(
        isPlatformAvailableForLicense("e7", platform.id),
      );
    }
  });

  it("limits Purview access for F1 while allowing F3", () => {
    expect(isPlatformAvailableForLicense("f1", "purview")).toBe(false);
    expect(isPlatformAvailableForLicense("f1-defender", "purview")).toBe(false);
    expect(isPlatformAvailableForLicense("f3", "purview")).toBe(true);
    expect(
      isPlatformAvailableForLicense("f1-defender-purview", "purview"),
    ).toBe(true);
  });

  it("allows standalone E3 to access only Purview policies", () => {
    const available = platforms
      .filter((platform) => isPlatformAvailableForLicense("e3", platform.id))
      .map((platform) => platform.id);

    expect(available).toEqual(["purview"]);
  });

  it("allows standalone A3 to access only Purview policies", () => {
    const available = platforms
      .filter((platform) => isPlatformAvailableForLicense("a3", platform.id))
      .map((platform) => platform.id);

    expect(available).toEqual(["purview"]);
  });

  it("allows standalone G3 to access only Purview policies", () => {
    const available = platforms
      .filter((platform) => isPlatformAvailableForLicense("g3", platform.id))
      .map((platform) => platform.id);

    expect(available).toEqual(["purview"]);
  });

  it("combines E3 Purview access with another license's platform access", () => {
    expect(
      isPlatformAvailableForLicenses(["e3", "business-premium"], "windows-11"),
    ).toBe(true);
    expect(
      isPlatformAvailableForLicenses(["e3", "business-premium"], "purview"),
    ).toBe(true);
    expect(
      isPlatformAvailableForLicenses(
        ["e3", "business-premium"],
        "agent-security",
      ),
    ).toBe(false);
  });
});

describe("Agent 365 prerequisite note", () => {
  const eligibleLicenses = [
    "e5",
    "e7",
    "a3-defender-purview",
    "a5",
    "g5",
    "g7",
    "f1-defender-purview",
    "f3-defender-purview",
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
      "g7",
      "a3-defender",
      "a3-defender-purview",
      "business-premium-defender",
      "business-premium-defender-purview",
      "e3-defender",
      "e3-defender-purview",
      "f1-defender",
      "f1-defender-purview",
      "f3-defender",
      "f3-defender-purview",
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
      "f1",
      "f3",
    ] as const)("shows for %s because Defender for Endpoint Plan 2 is additional", (licenseId) => {
      expect(requiresLinuxDesktopLicenseNote(licenseId, "linux-desktop")).toBe(true);
    });

    it("does not show for other platforms", () => {
      expect(requiresLinuxDesktopLicenseNote("e3", "linux-server")).toBe(false);
    });

    it("does not show when any selected license includes the prerequisite", () => {
      expect(
        requiresLinuxDesktopLicenseNoteForLicenses(
          ["business-premium", "g7"],
          "linux-desktop",
        ),
      ).toBe(false);
      expect(
        requiresLinuxDesktopLicenseNoteForLicenses(
          ["business-premium", "g3"],
          "linux-desktop",
        ),
      ).toBe(true);
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

    it("uses the Defender for Endpoint Server requirement for enterprise and frontline plans", () => {
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
      expect(getWindowsServerLicenseNote("g7")).toBe(
        getWindowsServerLicenseNote("e7"),
      );
      expect(getWindowsServerLicenseNote("f1")).toBe(
        getWindowsServerLicenseNote("e7"),
      );
      expect(getWindowsServerLicenseNote("f3-defender-purview")).toBe(
        getWindowsServerLicenseNote("e7"),
      );
    });

    it("does not show a Windows Server note for unrelated license families", () => {
      expect(getWindowsServerLicenseNote("a3")).toBeUndefined();
      expect(getWindowsServerLicenseNote("g5")).toBeUndefined();
    });

    it("returns each applicable server note once for multiple licenses", () => {
      expect(
        getWindowsServerLicenseNotes([
          "business-premium",
          "business-premium-defender",
          "e5",
        ]),
      ).toHaveLength(2);
    });
  });

  it("shows for supported Agent Security licenses except E7", () => {
    expect(requiresAgent365Note("business-premium-defender", "agent-security")).toBe(true);
    expect(requiresAgent365Note("business-premium-defender-purview", "agent-security")).toBe(true);
    expect(requiresAgent365Note("e5", "agent-security")).toBe(true);
    expect(requiresAgent365Note("e7", "agent-security")).toBe(false);
    expect(requiresAgent365Note("g7", "agent-security")).toBe(false);
    expect(requiresAgent365Note("business-premium", "agent-security")).toBe(false);
    expect(requiresAgent365Note("f1-defender", "agent-security")).toBe(false);
    expect(
      requiresAgent365Note("f1-defender-purview", "agent-security"),
    ).toBe(true);
  });

  describe("frontline license guidance", () => {
    it("shows limited Conditional Access guidance for frontline-only selections", () => {
      expect(
        getPlatformLicenseNoteForLicenses(
          ["f1", "f3-defender-purview"],
          "conditional-access",
        )?.title,
      ).toBe("Limited Conditional Access experience");
      expect(
        getPlatformLicenseNoteForLicenses(
          ["f1", "e5"],
          "conditional-access",
        ),
      ).toBeUndefined();
    });

    it("shows limited Purview guidance for Business Premium, E3, A3, G3, and F3", () => {
      expect(
        getPlatformLicenseNoteForLicenses(
          ["business-premium", "e3", "a3", "g3", "f3"],
          "purview",
        )?.title,
      ).toBe("Limited Microsoft Purview experience");
      expect(
        getPlatformLicenseNoteForLicenses(["f1", "e3"], "purview")?.title,
      ).toBe("Limited Microsoft Purview experience");
      expect(
        getPlatformLicenseNoteForLicenses(
          ["f3", "f3-defender-purview"],
          "purview",
        ),
      ).toBeUndefined();
    });

    it("shows Business Premium Conditional Access prerequisites", () => {
      const note = getPlatformLicenseNoteForLicenses(
        ["business-premium"],
        "conditional-access",
      );

      expect(note?.title).toBe("Limited Conditional Access experience");
      expect(note?.message).toContain("Microsoft Entra ID P2");
      expect(note?.message).toContain("Agent 365");
      expect(
        getPlatformLicenseNoteForLicenses(
          ["business-premium", "e5"],
          "conditional-access",
        ),
      ).toBeUndefined();
    });

    it.each(["windows-11", "macos", "ios-ipados", "android"] as const)(
      "shows limited endpoint guidance for F1 and F3 on %s",
      (platformId) => {
        expect(
          getPlatformLicenseNoteForLicenses(["f1", "f3"], platformId)?.title,
        ).toBe("Limited endpoint policy coverage");
      },
    );

    it("removes limited endpoint guidance when Defender Suite is selected", () => {
      expect(
        getPlatformLicenseNoteForLicenses(
          ["f1", "f3-defender"],
          "windows-11",
        ),
      ).toBeUndefined();
    });
  });

  it("does not show for other platforms", () => {
    expect(requiresAgent365Note("e5", "ai-security")).toBe(false);
  });

  it("offers Microsoft 365 E7 and G7 as alternatives for E5", () => {
    expect(getAgentSecurityLicenseNote("e5", "agent-security")).toEqual({
      title: "Agent 365, Microsoft 365 E7, or Microsoft 365 G7 license required",
      message: expect.stringContaining("either an Agent 365 license"),
    });
    expect(getAgentSecurityLicenseNote("e5", "agent-security")?.message).toContain(
      "a Microsoft 365 E7 license",
    );
    expect(getAgentSecurityLicenseNote("e5", "agent-security")?.message).toContain(
      "or a Microsoft 365 G7 license",
    );
  });

  it("keeps the Agent 365-only warning for other supported licenses", () => {
    expect(
      getAgentSecurityLicenseNote(
        "business-premium-defender-purview",
        "agent-security",
      )?.title,
    ).toBe("Agent 365 license required");
    expect(getAgentSecurityLicenseNote("e7", "agent-security")).toBeUndefined();
    expect(getAgentSecurityLicenseNote("g7", "agent-security")).toBeUndefined();
  });

  it("uses E7 or G7 to satisfy the Agent prerequisite across selections", () => {
    expect(
      getAgentSecurityLicenseNoteForLicenses(
        ["business-premium-defender", "g7"],
        "agent-security",
      ),
    ).toBeUndefined();
    expect(
      getAgentSecurityLicenseNoteForLicenses(
        ["business-premium-defender", "e5"],
        "agent-security",
      )?.title,
    ).toContain("Microsoft 365 G7");
  });
});
