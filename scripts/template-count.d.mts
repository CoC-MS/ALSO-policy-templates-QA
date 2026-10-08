export function countRepositoryTemplates(repositoryName: string, tree: {
  truncated?: boolean;
  tree: Array<{ type: string; path: string }>;
}): number;

export function countPolicyJsonFiles(tree: {
  truncated?: boolean;
  tree: Array<{ type: string; path: string }>;
}): number;
