export const licenses = [
  { id: "e7", name: "Microsoft 365 E7", eligible: true },
  { id: "e5", name: "Microsoft 365 E5", eligible: true },
  { id: "e3", name: "Microsoft 365 E3", eligible: true },
  { id: "e3-defender", name: "Microsoft 365 E3 + Defender Suite", eligible: true },
  { id: "e3-purview", name: "Microsoft 365 E3 + Purview Suite", eligible: true },
  { id: "e3-defender-purview", name: "Microsoft 365 E3 + Defender and Purview Suite", eligible: true },
  { id: "f3", name: "Microsoft 365 F3", eligible: true },
  { id: "f3-defender", name: "Microsoft 365 F3 + Defender Suite FLW", eligible: true },
  { id: "f3-purview", name: "Microsoft 365 F3 + Purview Suite FLW", eligible: true },
  { id: "f3-defender-purview", name: "Microsoft 365 F3 + Defender and Purview Suite FLW", eligible: true },
  { id: "f1", name: "Microsoft 365 F1", eligible: true },
  { id: "f1-defender", name: "Microsoft 365 F1 + Defender Suite FLW", eligible: true },
  { id: "f1-purview", name: "Microsoft 365 F1 + Purview Suite FLW", eligible: true },
  { id: "f1-defender-purview", name: "Microsoft 365 F1 + Defender and Purview Suite", eligible: true },
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
      name: platform.name,
      url: platform.repository,
      description: platform.description,
    },
  ];

  return repositories;
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

const aiSecurityLicenseIds = new Set<License["id"]>([
  "e5",
  "e7",
  "e3",
  "e3-defender",
  "e3-purview",
  "e3-defender-purview",
  "f3",
  "f3-defender",
  "f3-purview",
  "f3-defender-purview",
  "business-premium-defender",
  "business-premium-defender-purview",
  "business-premium",
  "business-premium-purview",
  "f1",
  "f1-defender",
  "f1-defender-purview",
]);

const fullDefenderExperienceLicenseIds = new Set<License["id"]>([
  "e7",
  "e5",
  "e3-defender",
  "e3-defender-purview",
  "f3-defender",
  "f3-defender-purview",
  "f1-defender",
  "f1-defender-purview",
  "business-premium-defender",
  "business-premium-defender-purview",
]);

const entraIdP2LicenseIds = new Set<License["id"]>([
  "e7",
  "e5",
  "e3-defender",
  "e3-defender-purview",
  "f3-defender",
  "f3-defender-purview",
  "f1-defender",
  "f1-defender-purview",
  "business-premium-defender",
  "business-premium-defender-purview",
]);

const fullPurviewExperienceLicenseIds = new Set<License["id"]>([
  "e7",
  "e5",
  "e3-purview",
  "e3-defender-purview",
  "f3-purview",
  "f3-defender-purview",
  "f1-purview",
  "f1-defender-purview",
  "business-premium-purview",
  "business-premium-defender-purview",
]);

const serverBaseLicenseIds = new Set<License["id"]>([
  "e7",
  "e5",
  "e3",
  "e3-defender",
  "e3-defender-purview",
  "f3",
  "f3-defender",
  "f3-defender-purview",
  "f1",
  "f1-defender",
  "f1-defender-purview",
  "business-premium",
  "business-premium-defender",
  "business-premium-purview",
  "business-premium-defender-purview",
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

  if (platformId === "conditional-access") {
    return eligibleLicenseIds.length > 0;
  }

  if (platformId === "ai-security") {
    return eligibleLicenseIds.some((licenseId) =>
      aiSecurityLicenseIds.has(licenseId),
    );
  }

  if (
    platformId === "windows-11" ||
    platformId === "macos" ||
    platformId === "ios-ipados" ||
    platformId === "android"
  ) {
    return eligibleLicenseIds.length > 0;
  }

  if (platformId === "linux-desktop") {
    return eligibleLicenseIds.some((licenseId) =>
      fullDefenderExperienceLicenseIds.has(licenseId),
    );
  }

  if (platformId === "windows-servers") {
    return eligibleLicenseIds.some((licenseId) =>
      serverBaseLicenseIds.has(licenseId),
    );
  }

  if (platformId === "linux-server") {
    return eligibleLicenseIds.some((licenseId) =>
      serverBaseLicenseIds.has(licenseId),
    );
  }

  if (platformId === "purview") {
    return eligibleLicenseIds.length > 0;
  }

  return false;
}

function formatSelectedLicenseNames(
  licenseIds: readonly License["id"][],
): string {
  return licenseIds
    .map((licenseId) => licenses.find((license) => license.id === licenseId)?.name)
    .filter((name): name is License["name"] => name !== undefined)
    .join(", ");
}

export function getLimitedExperienceNoteForLicenses(
  licenseIds: readonly License["id"][],
  platformId: Platform["id"],
): { title: string; message: string } | undefined {
  const eligibleLicenseIds = licenseIds.filter((licenseId) =>
    isLicenseEligible(licenseId),
  );
  const selectedNames = formatSelectedLicenseNames(eligibleLicenseIds);
  const isF1Only =
    eligibleLicenseIds.length === 1 && eligibleLicenseIds[0] === "f1";

  if (eligibleLicenseIds.length === 0) {
    return undefined;
  }

  if (eligibleLicenseIds.includes("e7")) {
    return undefined;
  }

  if (platformId === "conditional-access") {
    const needsEntraIdP2 = !eligibleLicenseIds.some((licenseId) =>
      entraIdP2LicenseIds.has(licenseId),
    );

    if (!needsEntraIdP2) {
      return undefined;
    }

    return {
      title: "Limited Conditional Access experience",
      message: `With ${selectedNames}, add Microsoft Entra ID Plan 2 for risky user and risky sign-in policy templates. Microsoft Entra ID Plan 2 is also included with the Microsoft Defender Suite${isF1Only ? " FLW" : ""} add-on. An Agent 365 license is required for all Agent 365 policy templates.`,
    };
  }

  if (platformId === "ai-security") {
    if (
      eligibleLicenseIds.some((licenseId) =>
        fullDefenderExperienceLicenseIds.has(licenseId),
      )
    ) {
      return {
        title: "Agent 365 license required for full AI Security experience",
        message: `With ${selectedNames}, add an Agent 365 license to unlock the full AI Security Windows 11 policy-template experience.`,
      };
    }
  }

  if (
    platformId === "ai-security" ||
    platformId === "windows-11" ||
    platformId === "macos" ||
    platformId === "ios-ipados" ||
    platformId === "android"
  ) {
    if (
      eligibleLicenseIds.some((licenseId) =>
        fullDefenderExperienceLicenseIds.has(licenseId),
      )
    ) {
      return undefined;
    }

    return {
      title: `Limited ${getPlatform(platformId).name} experience`,
      message: `With ${selectedNames}, add the Microsoft Defender Suite${isF1Only ? " FLW" : ""} add-on to unlock the full ${getPlatform(platformId).name} policy-template experience.`,
    };
  }

  if (platformId === "linux-desktop") {
    if (
      eligibleLicenseIds.some((licenseId) =>
        fullDefenderExperienceLicenseIds.has(licenseId),
      )
    ) {
      return undefined;
    }

    return {
      title: "Limited Linux Desktop experience",
      message: `With ${selectedNames}, add Microsoft Defender Suite to one of your selected qualifying base licenses, or purchase Microsoft Defender for Endpoint Plan 2, to unlock the full Linux Desktop policy-template experience.`,
    };
  }

  if (platformId === "purview") {
    if (
      eligibleLicenseIds.some((licenseId) =>
        fullPurviewExperienceLicenseIds.has(licenseId),
      )
    ) {
      return undefined;
    }

    return {
      title: "Limited Microsoft Purview experience",
      message: `With ${selectedNames}, add the Microsoft Purview Suite${isF1Only ? " FLW" : ""} add-on to unlock the full Microsoft Purview policy-template experience.`,
    };
  }

  return undefined;
}

const businessPremiumLicenseIds = new Set<License["id"]>([
  "business-premium",
  "business-premium-purview",
]);

const enterpriseServerLicenseIds = new Set<License["id"]>([
  "e3",
  "e3-defender",
  "e3-defender-purview",
  "f3",
  "f3-defender",
  "f3-defender-purview",
  "e5",
  "e7",
  "f1",
  "f1-defender",
  "f1-defender-purview",
  "business-premium-defender",
  "business-premium-defender-purview",
]);

export function getWindowsServerLicenseNote(
  licenseId: License["id"],
): string | undefined {
  if (licenseId === "f1") {
    return "Microsoft Defender for Endpoint Plan 2 or the Microsoft Defender Suite FLW add-on is required. A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.";
  }

  if (licenseId === "e3") {
    return "The Microsoft Defender Suite add-on is required. A Microsoft Defender for Endpoint Server license is also required for each on-premises server. For cloud or Azure Arc-enabled servers, a Microsoft Defender for Servers Plan 1 or Plan 2 subscription through Microsoft Defender for Cloud is required in addition to the selected Microsoft 365 licenses.";
  }

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
