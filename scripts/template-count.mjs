const excludedFolders = new Set([
  "applications",
  "authenticationcontext",
  "groups",
  "namedlocations",
]);

export function countRepositoryTemplates(repositoryName, tree) {
  if (repositoryName === "ALSO-Microsoft-Security-Purview") {
    return 24;
  }
  return countPolicyJsonFiles(tree);
}

export function countPolicyJsonFiles(tree) {
  if (tree.truncated) {
    throw new Error("Cannot count templates from a truncated GitHub tree.");
  }

  return tree.tree.filter((entry) => {
    if (entry.type !== "blob" || !entry.path.toLowerCase().endsWith(".json")) {
      return false;
    }

    const folders = entry.path.split("/").slice(0, -1);
    return !folders.some((folder) =>
      excludedFolders.has(folder.toLowerCase().replace(/[\s_-]/g, "")),
    );
  }).length;
}
