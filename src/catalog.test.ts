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
      "business-standard",
      "business-basic",
    ]);
    expect(licenses.filter((license) => isLicenseEligible(license.id))).toHaveLength(14);
  });

  it("groups all Business plans under SMB", () => {
    expect(smbLicenses.map((license) => license.id)).toEqual([
      "business-premium-defender-purview",
      "business-premium-defender",
      "business-premium-purview",
      "business-premium",
      "business-standard",
      "business-basic",
    ]);
    expect(enterpriseLicenses.map((license) => license.id)).toEqual([
      "e7g7",
      "e5a5g5",
      "eag3f3",
      "eag3f3-defender",
      "eag3f3-purview",
      "eag3f3-defender-purview",
      "f1a1",
      "f1a1-defender",
      "f1a1-purview",
      "f1a1-defender-purview",
    ]);
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
    const e5a5g5 = licenses.find((license) => license.id === "e5a5g5")!;
    const e7g7 = licenses.find((license) => license.id === "e7g7")!;

    const twoSelected = toggleLicenseSelection(
      toggleLicenseSelection([], e5a5g5),
      e7g7,
    );
    expect(twoSelected.map((license) => license.id)).toEqual([
      "e5a5g5",
      "e7g7",
    ]);
    expect(toggleLicenseSelection(twoSelected, e5a5g5)).toEqual([e7g7]);
  });

  it("combines platform access across all selected licenses", () => {
    expect(
      isPlatformAvailableForLicenses(
        ["business-premium", "e5a5g5"],
        "agent-security",
      ),
    ).toBe(true);
    expect(
      isPlatformAvailableForLicenses(["business-premium"], "agent-security"),
    ).toBe(false);
  });

  it("allows limited Purview access for both merged base options", () => {
    expect(isPlatformAvailableForLicense("f1a1", "purview")).toBe(true);
    expect(isPlatformAvailableForLicense("f1a1-defender", "purview")).toBe(true);
    expect(isPlatformAvailableForLicense("eag3f3", "purview")).toBe(true);
    expect(
      isPlatformAvailableForLicense("f1a1-defender-purview", "purview"),
    ).toBe(true);
  });

  it("gives the merged E3/A3/G3/F3 base option limited access", () => {
    const available = platforms
      .filter((platform) =>
        isPlatformAvailableForLicense("eag3f3", platform.id),
      )
      .map((platform) => platform.id);

    expect(available).toEqual([
      "windows-11",
      "windows-servers",
      "ai-security",
      "conditional-access",
      "macos",
      "ios-ipados",
      "android",
      "purview",
    ]);
  });

  it("gives both shared Purview Suite options full Purview-only access", () => {
    const available = platforms
      .filter((platform) =>
        isPlatformAvailableForLicense("eag3f3-purview", platform.id),
      )
      .map((platform) => platform.id);

    expect(available).toEqual(["purview"]);
    expect(
      getPlatformLicenseNoteForLicenses(["eag3f3-purview"], "purview"),
    ).toBeUndefined();
    expect(
      platforms
        .filter((platform) =>
          isPlatformAvailableForLicense("f1a1-purview", platform.id),
        )
        .map((platform) => platform.id),
    ).toEqual(["purview"]);
    expect(
      getPlatformLicenseNoteForLicenses(["f1a1-purview"], "purview"),
    ).toBeUndefined();
  });

  it.each([
    ["eag3f3", "f1a1"],
    ["eag3f3-defender", "f1a1-defender"],
    ["eag3f3-purview", "f1a1-purview"],
    ["eag3f3-defender-purview", "f1a1-defender-purview"],
  ] as const)(
    "gives %s and %s the same platform capabilities",
    (eag3f3LicenseId, f1a1LicenseId) => {
      for (const platform of platforms) {
        expect(
          isPlatformAvailableForLicense(f1a1LicenseId, platform.id),
        ).toBe(isPlatformAvailableForLicense(eag3f3LicenseId, platform.id));
      }
    },
  );

  it("combines merged base access with another license's platform access", () => {
    expect(
      isPlatformAvailableForLicenses(
        ["eag3f3", "business-premium"],
        "windows-11",
      ),
    ).toBe(true);
    expect(
      isPlatformAvailableForLicenses(
        ["eag3f3", "business-premium"],
        "purview",
      ),
    ).toBe(true);
    expect(
      isPlatformAvailableForLicenses(
        ["eag3f3", "business-premium"],
        "agent-security",
      ),
    ).toBe(false);
  });
});

describe("Agent 365 prerequisite note", () => {
  const eligibleLicenses = [
    "e7g7",
    "e5a5g5",
    "eag3f3-defender",
    "eag3f3-defender-purview",
    "f1a1-defender",
    "f1a1-defender-purview",
    "business-premium-defender-purview",
    "business-premium-defender",
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
      "e5a5g5",
      "e7g7",
      "eag3f3-defender",
      "eag3f3-defender-purview",
      "business-premium-defender",
      "business-premium-defender-purview",
      "f1a1-defender",
      "f1a1-defender-purview",
    ] as const)("does not show for %s because Defender for Endpoint is included", (licenseId) => {
      expect(requiresLinuxDesktopLicenseNote(licenseId, "linux-desktop")).toBe(false);
    });

    it.each([
      "business-premium",
      "business-premium-purview",
      "eag3f3",
      "eag3f3-purview",
      "f1a1",
    ] as const)("shows for %s because Defender for Endpoint Plan 2 is additional", (licenseId) => {
      expect(requiresLinuxDesktopLicenseNote(licenseId, "linux-desktop")).toBe(true);
    });

    it("does not show for other platforms", () => {
      expect(
        requiresLinuxDesktopLicenseNote("eag3f3", "linux-server"),
      ).toBe(false);
    });

    it("does not show when any selected license includes the prerequisite", () => {
      expect(
        requiresLinuxDesktopLicenseNoteForLicenses(
          ["business-premium", "e7g7"],
          "linux-desktop",
        ),
      ).toBe(false);
      expect(
        requiresLinuxDesktopLicenseNoteForLicenses(
          ["business-premium", "eag3f3"],
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
      expect(getWindowsServerLicenseNote("eag3f3-defender")).toContain(
        "Microsoft Defender for Endpoint Server",
      );
      expect(getWindowsServerLicenseNote("eag3f3")).toContain(
        "Microsoft Defender for Endpoint Server",
      );
      expect(
        getWindowsServerLicenseNote("eag3f3-defender-purview"),
      ).toContain(
        "Microsoft Defender for Servers Plan 1 or Plan 2",
      );
      expect(getWindowsServerLicenseNote("e5a5g5")).toContain(
        "Microsoft Defender for Endpoint Server",
      );
      expect(getWindowsServerLicenseNote("e7g7")).toContain(
        "Microsoft Defender for Endpoint Server",
      );
      expect(getWindowsServerLicenseNote("f1a1")).toBe(
        getWindowsServerLicenseNote("e7g7"),
      );
    });

    it("does not show a Windows Server note for unrelated license families", () => {
      expect(getWindowsServerLicenseNote("business-basic")).toBeUndefined();
    });

    it("returns each applicable server note once for multiple licenses", () => {
      expect(
        getWindowsServerLicenseNotes([
          "business-premium",
          "business-premium-defender",
          "e5a5g5",
        ]),
      ).toHaveLength(2);
    });
  });

  it("shows for supported Agent Security licenses except E7", () => {
    expect(requiresAgent365Note("business-premium-defender", "agent-security")).toBe(true);
    expect(requiresAgent365Note("business-premium-defender-purview", "agent-security")).toBe(true);
    expect(requiresAgent365Note("e5a5g5", "agent-security")).toBe(true);
    expect(requiresAgent365Note("e7g7", "agent-security")).toBe(false);
    expect(requiresAgent365Note("business-premium", "agent-security")).toBe(false);
    expect(requiresAgent365Note("eag3f3", "agent-security")).toBe(false);
    expect(requiresAgent365Note("f1a1-defender", "agent-security")).toBe(true);
    expect(
      requiresAgent365Note("f1a1-defender-purview", "agent-security"),
    ).toBe(true);
  });

  describe("frontline license guidance", () => {
    it("shows limited Conditional Access guidance for frontline-only selections", () => {
      expect(
        getPlatformLicenseNoteForLicenses(
          ["f1a1"],
          "conditional-access",
        )?.title,
      ).toBe("Limited Conditional Access experience");
      expect(
        getPlatformLicenseNoteForLicenses(
          ["f1a1", "e5a5g5"],
          "conditional-access",
        ),
      ).toBeUndefined();
    });

    it("shows limited Purview guidance for Business Premium and the merged base option", () => {
      expect(
        getPlatformLicenseNoteForLicenses(
          ["business-premium", "eag3f3"],
          "purview",
        )?.title,
      ).toBe("Limited Microsoft Purview experience");
      expect(
        getPlatformLicenseNoteForLicenses(["f1a1", "eag3f3"], "purview")?.title,
      ).toBe("Limited Microsoft Purview experience");
      expect(
        getPlatformLicenseNoteForLicenses(
          ["eag3f3", "eag3f3-defender-purview"],
          "purview",
        ),
      ).toBeUndefined();
    });

    it("shows Business Premium and merged-base Conditional Access prerequisites", () => {
      const note = getPlatformLicenseNoteForLicenses(
        ["business-premium"],
        "conditional-access",
      );

      expect(note?.title).toBe("Limited Conditional Access experience");
      expect(note?.message).toContain("Microsoft Entra ID P2");
      expect(note?.message).toContain("Agent 365");
      expect(
        getPlatformLicenseNoteForLicenses(["eag3f3"], "conditional-access")
          ?.message,
      ).toContain("E3/A3/G3/F3 and F1/A1 base licenses");
      expect(
        getPlatformLicenseNoteForLicenses(
          ["business-premium", "e5a5g5"],
          "conditional-access",
        ),
      ).toBeUndefined();
    });

  });

  it("does not show for other platforms", () => {
    expect(requiresAgent365Note("e5a5g5", "ai-security")).toBe(false);
  });

  it("offers Microsoft 365 E7 and G7 as alternatives for E5", () => {
    expect(getAgentSecurityLicenseNote("e5a5g5", "agent-security")).toEqual({
      title: "Agent 365, Microsoft 365 E7, or Microsoft 365 G7 license required",
      message: expect.stringContaining("either an Agent 365 license"),
    });
    expect(getAgentSecurityLicenseNote("e5a5g5", "agent-security")?.message).toContain(
      "a Microsoft 365 E7 license",
    );
    expect(getAgentSecurityLicenseNote("e5a5g5", "agent-security")?.message).toContain(
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
    expect(getAgentSecurityLicenseNote("e7g7", "agent-security")).toBeUndefined();
  });

  it("uses E7 or G7 to satisfy the Agent prerequisite across selections", () => {
    expect(
      getAgentSecurityLicenseNoteForLicenses(
        ["business-premium-defender", "e7g7"],
        "agent-security",
      ),
    ).toBeUndefined();
    expect(
      getAgentSecurityLicenseNoteForLicenses(
        ["business-premium-defender", "e5a5g5"],
        "agent-security",
      )?.title,
    ).toContain("Microsoft 365 G7");
  });
});
