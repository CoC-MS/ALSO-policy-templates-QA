import { describe, expect, it } from "vitest";
import {
  enterpriseLicenses,
  getLimitedExperienceNoteForLicenses,
  getPlatform,
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

  it("keeps F3 separate from every E3 combination", () => {
    expect(
      enterpriseLicenses
        .filter((license) => license.id === "e3" || license.id.startsWith("e3-"))
        .map((license) => license.name),
    ).toEqual([
      "Microsoft 365 E3",
      "Microsoft 365 E3 + Defender Suite",
      "Microsoft 365 E3 + Purview Suite",
      "Microsoft 365 E3 + Defender and Purview Suite",
    ]);
    expect(
      enterpriseLicenses
        .filter((license) => license.id.startsWith("f3"))
        .map((license) => license.name),
    ).toEqual([
      "Microsoft 365 F3",
      "Microsoft 365 F3 + Defender Suite FLW",
      "Microsoft 365 F3 + Purview Suite FLW",
      "Microsoft 365 F3 + Defender and Purview Suite FLW",
    ]);
  });

  it("keeps F1 as a separate four-option family", () => {
    expect(
      enterpriseLicenses
        .filter((license) => license.id === "f1" || license.id.startsWith("f1-"))
        .map((license) => license.name),
    ).toEqual([
      "Microsoft 365 F1",
      "Microsoft 365 F1 + Defender Suite FLW",
      "Microsoft 365 F1 + Purview Suite FLW",
      "Microsoft 365 F1 + Defender and Purview Suite",
    ]);
  });

  it("keeps the six Business plans under SMB", () => {
    expect(smbLicenses).toHaveLength(6);
  });

  it("contains no Education or Government license variants", () => {
    expect(licenses.map((license) => license.name).join(" ")).not.toMatch(
      /Microsoft 365 (?:A1|A3|A5|G3|G5|G7)/,
    );
  });
});

describe("repository routing", () => {
  it.each([
    ["windows-11", "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows"],
    ["windows-servers", "https://github.com/CoC-MS/ALSO-Microsoft-Security-WindowsServer"],
    ["ai-security", "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11"],
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

  it("removes Agent Security from the navigator", () => {
    expect(platforms.map((platform) => platform.id)).not.toContain("agent-security");
    expect(platforms).toHaveLength(10);
  });

  it("returns one repository for ordinary platforms", () => {
    expect(getPlatformRepositories(getPlatform("windows-11"))).toHaveLength(1);
  });
});

describe("selection helpers", () => {
  it("toggles platforms", () => {
    const windows = getPlatform("windows-11");
    const purview = getPlatform("purview");
    const selected = togglePlatformSelection(togglePlatformSelection([], windows), purview);

    expect(selected.map((platform) => platform.id)).toEqual(["windows-11", "purview"]);
    expect(togglePlatformSelection(selected, windows)).toEqual([purview]);
  });

  it("toggles licenses", () => {
    const e5 = licenses.find((license) => license.id === "e5")!;
    const e7 = licenses.find((license) => license.id === "e7")!;
    const selected = toggleLicenseSelection(toggleLicenseSelection([], e5), e7);

    expect(selected.map((license) => license.id)).toEqual(["e5", "e7"]);
    expect(toggleLicenseSelection(selected, e5)).toEqual([e7]);
  });

  it("unions capabilities across selected licenses", () => {
    expect(
      isPlatformAvailableForLicenses(["business-premium", "e5"], "linux-desktop"),
    ).toBe(true);
  });
});

describe("Business Premium-only results", () => {
  const licenseIds = ["business-premium"] as const;

  it("shows every in-scope repository except Linux Desktop", () => {
    expect(
      platforms
        .filter((platform) => isPlatformAvailableForLicenses(licenseIds, platform.id))
        .map((platform) => platform.id),
    ).toEqual([
      "windows-11",
      "windows-servers",
      "ai-security",
      "conditional-access",
      "linux-server",
      "macos",
      "ios-ipados",
      "android",
      "purview",
    ]);
  });

  it("names Entra ID P2 and the Defender Suite alternative for Conditional Access", () => {
    const message = getLimitedExperienceNoteForLicenses(
      licenseIds,
      "conditional-access",
    )?.message;

    expect(message).toContain("add Microsoft Entra ID Plan 2");
    expect(message).toContain("included with the Microsoft Defender Suite add-on");
    expect(message).toContain(
      "An Agent 365 license is required for all Agent 365 policy templates",
    );
  });

  it.each([
    "windows-11",
    "ai-security",
    "macos",
    "ios-ipados",
    "android",
  ] as const)("requires Defender Suite for full %s coverage", (platformId) => {
    expect(
      getLimitedExperienceNoteForLicenses(licenseIds, platformId)?.message,
    ).toContain("add the Microsoft Defender Suite add-on");
  });

  it("requires Purview Suite for full Purview coverage", () => {
    expect(
      getLimitedExperienceNoteForLicenses(licenseIds, "purview")?.message,
    ).toContain("add the Microsoft Purview Suite add-on");
  });

  it("uses the Business server add-on message", () => {
    expect(getWindowsServerLicenseNote("business-premium")).toContain(
      "Microsoft Defender for Business servers",
    );
  });
});

describe("full-capability suite tier", () => {
  const fullSuiteLicenseIds = [
    "business-premium-defender-purview",
    "e5",
    "e3-defender-purview",
    "f1-defender-purview",
  ] as const;

  it.each(fullSuiteLicenseIds)("%s provides every in-scope platform", (licenseId) => {
    expect(
      platforms.filter((platform) =>
        isPlatformAvailableForLicense(licenseId, platform.id),
      ),
    ).toHaveLength(platforms.length);
  });

  describe("Microsoft 365 E7 results", () => {
    const licenseIds = ["e7"] as const;

    it("provides every in-scope repository", () => {
      expect(
        platforms.filter((platform) =>
          isPlatformAvailableForLicenses(licenseIds, platform.id),
        ),
      ).toHaveLength(platforms.length);
    });

    describe("Defender Suite package tier", () => {
      const defenderSuiteLicenseIds = [
        "business-premium-defender",
        "e3-defender",
        "f3-defender",
        "f1-defender",
      ] as const;

      it.each(defenderSuiteLicenseIds)(
        "%s provides every in-scope repository",
        (licenseId) => {
          expect(
            platforms.filter((platform) =>
              isPlatformAvailableForLicense(licenseId, platform.id),
            ),
          ).toHaveLength(platforms.length);
        },
      );

      it.each(defenderSuiteLicenseIds)(
        "%s has notices only for AI Security, Purview, and both servers",
        (licenseId) => {
          for (const platform of platforms) {
            const limitedNotice = getLimitedExperienceNoteForLicenses(
              [licenseId],
              platform.id,
            );

            if (platform.id === "ai-security") {
              expect(limitedNotice?.message).toContain("Agent 365 license");
            } else if (platform.id === "purview") {
              expect(limitedNotice?.message).toContain(
                "Microsoft Purview Suite add-on",
              );
            } else {
              expect(limitedNotice).toBeUndefined();
            }
          }
        },
      );

      it.each(defenderSuiteLicenseIds)(
        "%s uses the Endpoint Server add-on message",
        (licenseId) => {
          expect(getWindowsServerLicenseNotes([licenseId])).toEqual([
            "A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.",
          ]);
        },
      );
    });

    describe("Microsoft 365 F1-only results", () => {
      const licenseIds = ["f1"] as const;

      it("mirrors Business Premium availability and excludes Linux Desktop", () => {
        expect(
          platforms
            .filter((platform) =>
              isPlatformAvailableForLicenses(licenseIds, platform.id),
            )
            .map((platform) => platform.id),
        ).toEqual([
          "windows-11",
          "windows-servers",
          "ai-security",
          "conditional-access",
          "linux-server",
          "macos",
          "ios-ipados",
          "android",
          "purview",
        ]);
      });

      describe("Microsoft 365 E3-only results", () => {
        const licenseIds = ["e3"] as const;

        it("mirrors F1 availability and excludes Linux Desktop", () => {
          for (const platform of platforms) {
            expect(
              isPlatformAvailableForLicenses(licenseIds, platform.id),
            ).toBe(isPlatformAvailableForLicenses(["f1"], platform.id));
          }
        });

        it.each([
          "windows-11",
          "ai-security",
          "macos",
          "ios-ipados",
          "android",
        ] as const)("uses the standard Defender Suite for limited %s coverage", (platformId) => {
          const message = getLimitedExperienceNoteForLicenses(
            licenseIds,
            platformId,
          )?.message;

          expect(message).toContain("Microsoft Defender Suite add-on");
          expect(message).not.toContain("Defender Suite FLW");
        });

        it("uses standard Defender Suite in Conditional Access guidance", () => {
          const message = getLimitedExperienceNoteForLicenses(
            licenseIds,
            "conditional-access",
          )?.message;

          expect(message).toContain("Microsoft Entra ID Plan 2");
          expect(message).toContain("Microsoft Defender Suite add-on");
          expect(message).not.toContain("Defender Suite FLW");
          expect(message).toContain("Agent 365 license");
        });

        it("uses standard Purview Suite for limited Purview", () => {
          const message = getLimitedExperienceNoteForLicenses(
            licenseIds,
            "purview",
          )?.message;

          expect(message).toContain("Microsoft Purview Suite add-on");
          expect(message).not.toContain("Purview Suite FLW");
        });

        it("combines Defender and server prerequisites", () => {
          expect(getWindowsServerLicenseNotes(licenseIds)).toEqual([
            "Microsoft Defender for Endpoint Plan 2 or the Microsoft Defender Suite add-on is required. A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.",
          ]);
        });
      });

      it.each([
        "windows-11",
        "ai-security",
        "macos",
        "ios-ipados",
        "android",
      ] as const)("uses Defender Suite FLW for limited %s coverage", (platformId) => {
        const message = getLimitedExperienceNoteForLicenses(
          licenseIds,
          platformId,
        )?.message;

        expect(message).toContain("Microsoft Defender Suite FLW add-on");
        expect(message).not.toContain("Microsoft Defender Suite add-on");
      });

      it("uses Defender Suite FLW in Conditional Access guidance", () => {
        const message = getLimitedExperienceNoteForLicenses(
          licenseIds,
          "conditional-access",
        )?.message;

        expect(message).toContain("Microsoft Entra ID Plan 2");
        expect(message).toContain("Microsoft Defender Suite FLW add-on");
        expect(message).toContain("Agent 365 license");
      });

      it("uses Purview Suite FLW for the limited Purview experience", () => {
        const message = getLimitedExperienceNoteForLicenses(
          licenseIds,
          "purview",
        )?.message;

        expect(message).toContain("Microsoft Purview Suite FLW add-on");
        expect(message).not.toContain("Microsoft Purview Suite add-on");
      });

      it("combines the FLW and server prerequisites in one server message", () => {
        expect(getWindowsServerLicenseNotes(licenseIds)).toEqual([
          "Microsoft Defender for Endpoint Plan 2 or the Microsoft Defender Suite FLW add-on is required. A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.",
        ]);
      });
    });

    it("shows no limited-experience messages", () => {
      for (const platform of platforms) {
        expect(
          getLimitedExperienceNoteForLicenses(licenseIds, platform.id),
        ).toBeUndefined();
      }
    });

    it("uses the Endpoint Server add-on message for both server results", () => {
      const notes = getWindowsServerLicenseNotes(licenseIds);

      expect(notes).toHaveLength(1);
      expect(notes[0]).toBe(
        "A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.",
      );
    });
  });

  it.each(fullSuiteLicenseIds)(
    "%s has no limited notice outside AI Security",
    (licenseId) => {
      for (const platform of platforms.filter(
        (item) => item.id !== "ai-security",
      )) {
        expect(
          getLimitedExperienceNoteForLicenses([licenseId], platform.id),
        ).toBeUndefined();
      }
    },
  );

  it.each(fullSuiteLicenseIds)(
    "%s requires Agent 365 for full AI Security",
    (licenseId) => {
      const note = getLimitedExperienceNoteForLicenses(
        [licenseId],
        "ai-security",
      );

      expect(note?.title).toBe(
        "Agent 365 license required for full AI Security experience",
      );
      expect(note?.message).toContain("add an Agent 365 license");
    },
  );

  it.each(fullSuiteLicenseIds)(
    "%s uses the Endpoint Server add-on message",
    (licenseId) => {
      const notes = getWindowsServerLicenseNotes([licenseId]);

      expect(notes).toHaveLength(1);
      expect(notes[0]).toContain("Microsoft Defender for Endpoint Server");
      expect(notes[0]).toContain("Microsoft Defender for Servers Plan 1 or Plan 2");
    },
  );

  it("does not duplicate the server message for a multi-license full-suite selection", () => {
    expect(getWindowsServerLicenseNotes(fullSuiteLicenseIds)).toHaveLength(1);
  });
});
