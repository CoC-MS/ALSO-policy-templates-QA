export function countRepositoryTemplates(repositoryName: string, tree: {
  truncated?: boolean;
  tree: Array<{ type: string; path: string }>;
}): number;

export function countPolicyJsonFiles(tree: {
  truncated?: boolean;
  tree: Array<{ type: string; path: string }>;
}): number;
export function getPolicyJsonHashes(tree: {
  truncated?: boolean;
  tree: Array<{ type: string; path: string; sha?: string }>;
}): string[];

export function deduplicateRepositoryCounts(
  repositories: Array<{ name: string; templateHashes?: string[]; templateCount?: number }>,
): Array<{ name: string; templateHashes?: string[]; templateCount: number }>;
