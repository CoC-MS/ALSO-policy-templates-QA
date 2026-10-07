export interface RepositorySearchDocument {
  repositoryName: string;
  repositoryUrl: string;
  path: string;
  url: string;
  content: string;
}

export interface RepositorySearchIndex {
  generatedAt: string;
  documents: RepositorySearchDocument[];
}

export interface RepositorySearchResult extends RepositorySearchDocument {
  snippet: string;
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function createSnippet(content: string, query: string): string {
  const compactContent = content.replace(/\s+/g, " ").trim();
  const normalizedQuery = normalize(query);
  const normalizedContent = normalize(compactContent);
  const firstTerm = normalizedQuery.split(" ").find(Boolean) ?? "";
  const matchIndex = normalizedContent.indexOf(normalizedQuery) >= 0
    ? normalizedContent.indexOf(normalizedQuery)
    : normalizedContent.indexOf(firstTerm);
  const start = Math.max(0, matchIndex - 90);
  const end = Math.min(compactContent.length, start + 240);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < compactContent.length ? "..." : "";

  return `${prefix}${compactContent.slice(start, end)}${suffix}`;
}

export function searchRepositoryDocuments(
  documents: readonly RepositorySearchDocument[],
  query: string,
  limit = 50,
): RepositorySearchResult[] {
  const normalizedQuery = normalize(query);
  const terms = normalizedQuery.split(" ").filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  return documents
    .map((document) => {
      const normalizedPath = normalize(document.path);
      const normalizedContent = normalize(document.content);
      const searchableText = `${normalizedPath} ${normalizedContent}`;

      if (!terms.every((term) => searchableText.includes(term))) {
        return undefined;
      }

      let score = 0;
      if (normalizedPath.includes(normalizedQuery)) score += 100;
      if (normalizedContent.includes(normalizedQuery)) score += 50;
      score += terms.filter((term) => normalizedPath.includes(term)).length * 10;

      return {
        score,
        result: {
          ...document,
          snippet: createSnippet(document.content, query),
        },
      };
    })
    .filter(
      (
        match,
      ): match is { score: number; result: RepositorySearchResult } =>
        match !== undefined,
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.result.repositoryName.localeCompare(right.result.repositoryName) ||
        left.result.path.localeCompare(right.result.path),
    )
    .slice(0, limit)
    .map((match) => match.result);
}
