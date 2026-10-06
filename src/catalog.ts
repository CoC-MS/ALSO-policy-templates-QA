export const licenses = [
  { id: "e7", name: "Microsoft 365 E7", eligible: true },
  { id: "g7", name: "Microsoft 365 G7", eligible: true },
  { id: "e5", name: "Microsoft 365 E5", eligible: true },
  { id: "g5", name: "Microsoft 365 G5", eligible: true },
  { id: "a5", name: "Microsoft 365 A5", eligible: true },
  { id: "eag3f3", name: "Microsoft 365 E3/A3/G3/F3", eligible: true },
  { id: "eag3f3-defender", name: "Microsoft 365 E3/A3/G3/F3 + Defender Suite", eligible: true },
  { id: "eag3f3-purview", name: "Microsoft 365 E3/A3/G3/F3 + Purview Suite", eligible: true },
  { id: "eag3f3-defender-purview", name: "Microsoft 365 E3/A3/G3/F3 + Defender and Purview Suite", eligible: true },
  { id: "f1a1", name: "Microsoft 365 F1/A1", eligible: true },
  { id: "f1a1-defender", name: "Microsoft 365 F1/A1 + Defender Suite FLW", eligible: true },
  { id: "f1a1-purview", name: "Microsoft 365 F1/A1 + Purview Suite FLW", eligible: true },
  { id: "f1a1-defender-purview", name: "Microsoft 365 F1/A1 + Defender and Purview Suite FLW", eligible: true },
  { id: "business-premium-defender-purview", name: "Microsoft 365 Business Premium + Defender and Purview Suite", eligible: true },
  { id: "business-premium-defender", name: "Microsoft 365 Business Premium + Defender Suite", eligible: true },
  { id: "business-premium-purview", name: "Microsoft 365 Business Premium + Purview Suite", eligible: true },
  { id: "business-premium", name: "Microsoft 365 Business Premium", eligible: true },
  { id: "business-standard", name: "Microsoft 365 Business Standard", eligible: false },
  { id: "business-basic", name: "Microsoft 365 Business Basic", eligible: false },
] as const;

const smbLicenseIds = new Set([
  "business-basic",
  "business-standard",
  "business-premium",
  "business-premium-defender",
  "business-premium-purview",
  "business-premium-defender-purview",
]);

export const smbLicenses = licenses.filter((license) =>
  smbLicenseIds.has(license.id),
);

export const enterpriseLicenses = licenses.filter(
  (license) => !smbLicenseIds.has(license.id),
);

export const platforms = [
  {
    id: "windows-11",
    name: "Windows 11",
    shortLabel: "W11",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Windows",
    description: "All policies belonging to Windows",
  },
  {
    id: "windows-servers",
    name: "Windows Servers",
    shortLabel: "WS",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-WindowsServer",
    description: "A collection of Microsoft Security Windows Server policies to help organizations accelerate secure deployments to servers with Defender for Servers (Defender for Cloud), Defender Business for Servers and Endpoint for Servers with Intune.",
  },
  {
    id: "ai-security",
    name: "AI Security Windows 11",
    shortLabel: "AI",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
    description: "This baseline delivers a hardened Windows 11 configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience",
  },
  {
    id: "agent-security",
    name: "Agent Security",
    shortLabel: "AG",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access",
    repositoryLabel: "Conditional Access",
    additionalRepositories: [
      {
        name: "AI Security Windows 11",
        url: "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
        description: "This baseline delivers a hardened Windows 11 configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience",
      },
    ],
    description: "A collection of Microsoft Entra Conditional Access policy templates, named locations, security groups and authentication context designed to help organizations accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.",
  },
  {
    id: "conditional-access",
    name: "Conditional Access",
    shortLabel: "CA",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Conditional-Access",
    description: "A collection of Microsoft Entra Conditional Access policy templates, named locations, security groups and authentication context designed to help organizations accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.",
  },
  {
    id: "linux-desktop",
    name: "Linux Desktop",
    shortLabel: "LD",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux",
    description: "A collection of Microsoft Security Linux Server and Desktop policies to help organizations accelerate secure deployments to servers with Defender for Endpoint, Defender for Servers (Defender for Cloud), Defender Business for Servers and Endpoint for Servers with Intune.",
  },
  {
    id: "linux-server",
    name: "Linux Server",
    shortLabel: "LS",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux",
    description: "A collection of Microsoft Security Linux Server and Desktop policies to help organizations accelerate secure deployments to servers with Defender for Endpoint, Defender for Servers (Defender for Cloud), Defender Business for Servers and Endpoint for Servers with Intune.",
  },
  {
    id: "macos",
    name: "macOS",
    shortLabel: "MAC",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-MacOS",
    description: "A collection of Microsoft Security MacOS policy to help organizations automate onboarding/offboarding of Macbook's to/from Defender with Intune, accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.",
  },
  {
    id: "ios-ipados",
    name: "iOS/iPadOS",
    shortLabel: "IOS",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-iOSandiPadOS",
    description: "Collection of Microsoft Security policy templates for iOS and iPadOS devices, covering both BYOD (Bring Your Own Device) and corporate-managed deployments.",
  },
  {
    id: "android",
    name: "Android",
    shortLabel: "AND",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Android",
    description: "All about managing android",
  },
  {
    id: "purview",
    name: "Purview",
    shortLabel: "PV",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview",
    description: "No repository description is currently provided in GitHub About.",
  },
] as const;

export type License = (typeof licenses)[number];
export type Platform = (typeof platforms)[number];

export function isLicenseEligible(licenseId: License["id"]): boolean {
  return licenses.find((license) => license.id === licenseId)?.eligible ?? false;
}

export function getPlatform(platformId: Platform["id"]): Platform {
  const platform = platforms.find((item) => item.id === platformId);
  if (!platform) {
    throw new Error(`Unknown platform: ${platformId}`);
  }
  return platform;
}

export function getPlatformRepositories(
  platform: Platform,
): Array<{ name: string; url: string; description: string }> {
  const repositories = [
    {
      name: "repositoryLabel" in platform ? platform.repositoryLabel : platform.name,
      url: platform.repository,
      description: platform.description,
    },
  ];

  return "additionalRepositories" in platform
    ? [...repositories, ...platform.additionalRepositories]
    : repositories;
}

export function togglePlatformSelection(
  selected: readonly Platform[],
  platform: Platform,
): Platform[] {
  return selected.some((item) => item.id === platform.id)
    ? selected.filter((item) => item.id !== platform.id)
    : [...selected, platform];
}

export function toggleLicenseSelection(
  selected: readonly License[],
  license: License,
): License[] {
  return selected.some((item) => item.id === license.id)
    ? selected.filter((item) => item.id !== license.id)
    : [...selected, license];
}

export function requiresAgent365Note(
  licenseId: License["id"],
  platformId: Platform["id"],
): boolean {
  return getAgentSecurityLicenseNoteForLicenses([licenseId], platformId) !== undefined;
}

export function getAgentSecurityLicenseNote(
  licenseId: License["id"],
  platformId: Platform["id"],
): { title: string; message: string } | undefined {
  return getAgentSecurityLicenseNoteForLicenses([licenseId], platformId);
}

export function getAgentSecurityLicenseNoteForLicenses(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): { title: string; message: string } | undefined {
  if (
    platformId !== "agent-security" ||
    !isPlatformAvailableForLicenses(licenseIds, platformId) ||
    licenseIds.some((licenseId) => licenseId === "e7" || licenseId === "g7")
  ) {
    return undefined;
  }

  if (licenseIds.includes("e5")) {
    return {
      title: "Agent 365, Microsoft 365 E7, or Microsoft 365 G7 license required",
      message: "Agent Security policies require either an Agent 365 license with Agent 365 portal onboarding completed, a Microsoft 365 E7 license, or a Microsoft 365 G7 license. Otherwise, the policies will fail during import and display an error message.",
    };
  }

  return {
    title: "Agent 365 license required",
    message: "All Agent policies require an Agent 365 license to be assigned and Agent 365 portal onboarding to be completed before import. Otherwise, the policies will fail during import and display the following error message.",
  };
}

const linuxDesktopIncludedLicenseIds = new Set<License["id"]>([
  "e5",
  "e7",
  "g7",
  "eag3f3-defender",
  "eag3f3-defender-purview",
  "business-premium-defender",
  "business-premium-defender-purview",
  "f1a1-defender",
  "f1a1-defender-purview",
]);

export function requiresLinuxDesktopLicenseNote(
  licenseId: License["id"],
  platformId: Platform["id"],
): boolean {
  return requiresLinuxDesktopLicenseNoteForLicenses([licenseId], platformId);
}

export function requiresLinuxDesktopLicenseNoteForLicenses(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): boolean {
  return (
    platformId === "linux-desktop" &&
    !licenseIds.some((licenseId) => linuxDesktopIncludedLicenseIds.has(licenseId))
  );
}

const agentSecurityLicenseIds = new Set<License["id"]>([
  "business-premium-defender",
  "business-premium-defender-purview",
  "eag3f3-defender",
  "eag3f3-defender-purview",
  "e5",
  "g5",
  "a5",
  "e7",
  "g7",
  "f1a1-defender",
  "f1a1-defender-purview",
]);

const purviewUnavailableLicenseIds = new Set<License["id"]>();

const limitedBaseLicenseIds = new Set<License["id"]>(["eag3f3", "f1a1"]);

const limitedBasePlatformIds = new Set<Platform["id"]>([
  "windows-11",
  "windows-servers",
  "ai-security",
  "conditional-access",
  "macos",
  "ios-ipados",
  "android",
]);

export function isPlatformAvailableForLicense(
  licenseId: License["id"],
  platformId: Platform["id"],
): boolean {
  return isPlatformAvailableForLicenses([licenseId], platformId);
}

export function isPlatformAvailableForLicenses(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): boolean {
  const eligibleLicenseIds = licenseIds.filter((licenseId) =>
    isLicenseEligible(licenseId),
  );

  if (platformId === "agent-security") {
    return eligibleLicenseIds.some((licenseId) =>
      agentSecurityLicenseIds.has(licenseId),
    );
  }

  if (platformId === "purview") {
    return eligibleLicenseIds.some(
      (licenseId) => !purviewUnavailableLicenseIds.has(licenseId),
    );
  }

  return eligibleLicenseIds.some((licenseId) => {
    if (licenseId === "eag3f3-purview" || licenseId === "f1a1-purview") {
      return false;
    }

    return (
      !limitedBaseLicenseIds.has(licenseId) ||
      limitedBasePlatformIds.has(platformId)
    );
  });
}

const limitedConditionalAccessLicenseIds = new Set<License["id"]>([
  "business-premium",
  "business-premium-purview",
  "eag3f3",
  "f1a1",
]);

const limitedPurviewLicenseIds = new Set<License["id"]>([
  "business-premium",
  "business-premium-defender",
  "eag3f3",
  "eag3f3-defender",
  "f1a1",
  "f1a1-defender",
]);

export function getPlatformLicenseNoteForLicenses(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): { title: string; message: string } | undefined {
  if (platformId === "conditional-access") {
    const conditionalAccessLicenseIds = licenseIds.filter((licenseId) =>
      isPlatformAvailableForLicense(licenseId, platformId),
    );
    const hasOnlyLimitedConditionalAccess = conditionalAccessLicenseIds.every(
      (licenseId) => limitedConditionalAccessLicenseIds.has(licenseId),
    );

    if (
      conditionalAccessLicenseIds.length > 0 &&
      hasOnlyLimitedConditionalAccess
    ) {
      return {
        title: "Limited Conditional Access experience",
        message: "Microsoft 365 Business Premium and the E3/A3/G3/F3 and F1/A1 base licenses provide limited Conditional Access capabilities. Some policy templates require an additional Microsoft Entra ID P2 license and an Agent 365 license.",
      };
    }
  }

  if (platformId === "purview") {
    const purviewLicenseIds = licenseIds.filter(
      (licenseId) => !purviewUnavailableLicenseIds.has(licenseId),
    );
    if (
      purviewLicenseIds.length > 0 &&
      purviewLicenseIds.every((licenseId) =>
        limitedPurviewLicenseIds.has(licenseId),
      )
    ) {
      return {
        title: "Limited Microsoft Purview experience",
        message: "Microsoft 365 Business Premium and the E3/A3/G3/F3 and F1/A1 base licenses provide a limited Microsoft Purview experience. Some policy templates require additional Microsoft Purview licensing.",
      };
    }
  }

  return undefined;
}

const businessPremiumLicenseIds = new Set<License["id"]>([
  "business-premium",
  "business-premium-defender",
  "business-premium-purview",
  "business-premium-defender-purview",
]);

const enterpriseServerLicenseIds = new Set<License["id"]>([
  "eag3f3",
  "eag3f3-defender",
  "eag3f3-defender-purview",
  "e5",
  "e7",
  "g7",
  "f1a1",
  "f1a1-defender",
  "f1a1-defender-purview",
]);

export function getWindowsServerLicenseNote(
  licenseId: License["id"],
): string | undefined {
  if (businessPremiumLicenseIds.has(licenseId)) {
    return "A Microsoft Defender for Business servers license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.";
  }

  if (enterpriseServerLicenseIds.has(licenseId)) {
    return "A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.";
  }

  return undefined;
}

export function getWindowsServerLicenseNotes(
  licenseIds: readonly License["id"][],
): string[] {
  return [
    ...new Set(
      licenseIds
        .map((licenseId) => getWindowsServerLicenseNote(licenseId))
        .filter((note): note is string => note !== undefined),
    ),
  ];
}
