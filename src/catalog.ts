export const licenses = [
  { id: "business-basic", name: "Microsoft 365 Business Basic", eligible: false },
  { id: "business-standard", name: "Microsoft 365 Business Standard", eligible: false },
  { id: "business-premium", name: "Microsoft 365 Business Premium", eligible: true },
  { id: "e3", name: "Microsoft 365 E3", eligible: true },
  { id: "e5", name: "Microsoft 365 E5", eligible: true },
  { id: "e7", name: "Microsoft 365 E7", eligible: true },
  { id: "a3", name: "Microsoft 365 A3", eligible: true },
  { id: "a5", name: "Microsoft 365 A5", eligible: true },
  { id: "g3", name: "Microsoft 365 G3", eligible: true },
  { id: "g5", name: "Microsoft 365 G5", eligible: true },
  { id: "business-premium-defender", name: "Microsoft 365 Business Premium + Defender Suite", eligible: true },
  { id: "business-premium-purview", name: "Microsoft 365 Business Premium + Purview Suite", eligible: true },
  { id: "business-premium-defender-purview", name: "Microsoft 365 Business Premium + Defender and Purview Suite", eligible: true },
  { id: "e3-defender", name: "Microsoft 365 E3 + Defender Suite", eligible: true },
  { id: "e3-purview", name: "Microsoft 365 E3 + Purview Suite", eligible: true },
  { id: "e3-defender-purview", name: "Microsoft 365 E3 + Defender and Purview Suite", eligible: true },
] as const;

export const platforms = [
  {
    id: "windows-11",
    name: "Windows 11",
    shortLabel: "W11",
    repository: "https://github.com/CoC-MS/security-template",
    description: "Security policy templates and implementation guidance for managed Windows 11 endpoints.",
  },
  {
    id: "windows-servers",
    name: "Windows Servers",
    shortLabel: "WS",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-WindowsServer",
    description: "Security policy templates for hardening and managing Windows Server environments.",
  },
  {
    id: "ai-security",
    name: "AI Security",
    shortLabel: "AI",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
    description: "Controls and policy guidance for securing AI use on Windows 11.",
  },
  {
    id: "agent-security",
    name: "Agent Security",
    shortLabel: "AG",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-AI-Security-Windows11",
    description: "Security guidance for AI agents and their Windows 11 operating environment.",
  },
  {
    id: "linux-desktop",
    name: "Linux Desktop",
    shortLabel: "LD",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux",
    description: "Security templates and guidance for managed Linux desktop devices.",
  },
  {
    id: "linux-server",
    name: "Linux Server",
    shortLabel: "LS",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Linux",
    description: "Security templates and guidance for Linux server workloads.",
  },
  {
    id: "macos",
    name: "macOS",
    shortLabel: "MAC",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-MacOS",
    description: "Security policy templates for Apple macOS endpoints.",
  },
  {
    id: "ios-ipados",
    name: "iOS/iPadOS",
    shortLabel: "IOS",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-iOSandiPadOS",
    description: "Security policy templates for managed iPhone and iPad devices.",
  },
  {
    id: "android",
    name: "Android",
    shortLabel: "AND",
    repository: "https://github.com/CoC-MS/security-template",
    description: "Security policy templates and implementation guidance for managed Android devices.",
  },
  {
    id: "purview",
    name: "Purview",
    shortLabel: "PV",
    repository: "https://github.com/CoC-MS/ALSO-Microsoft-Security-Purview",
    description: "Policy templates for Microsoft Purview data security and compliance capabilities.",
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

export function togglePlatformSelection(
  selected: readonly Platform[],
  platform: Platform,
): Platform[] {
  return selected.some((item) => item.id === platform.id)
    ? selected.filter((item) => item.id !== platform.id)
    : [...selected, platform];
}
