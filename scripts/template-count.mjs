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
  return getPolicyJsonFiles(tree).length;
}

function getPolicyJsonFiles(tree) {
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
  });
}

export function getPolicyJsonHashes(tree) {
  const hashes = getPolicyJsonFiles(tree).map((entry) => {
    if (!entry.sha) throw new Error(`Missing Git content hash: ${entry.path}`);
    return entry.sha;
  });
  return [...new Set(hashes)].sort();
}

export function deduplicateRepositoryCounts(repositories) {
  const seenHashes = new Set();
  return repositories.map((repository) => {
    if (repository.name === "ALSO-Microsoft-Security-Purview") {
      return { ...repository, templateCount: 24 };
    }
    if (!Array.isArray(repository.templateHashes)) {
      throw new Error(`Missing template hashes for ${repository.name}. Sync with repository access first.`);
    }
    let templateCount = 0;
    for (const hash of repository.templateHashes) {
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        templateCount++;
      }
    }
    return { ...repository, templateCount };
  });
}
