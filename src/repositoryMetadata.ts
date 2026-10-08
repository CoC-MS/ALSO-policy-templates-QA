import {
  getPlatformRepositories,
  type Platform,
} from "./catalog";

export interface RepositoryMetadata {
  name: string;
  url: string;
  description: string | null;
  topics: string[];
}

export interface RepositoryMetadataIndex {
  generatedAt: string;
  repositories: RepositoryMetadata[];
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getRepositoryMetadata(
  repositories: readonly RepositoryMetadata[],
  repositoryUrl: string,
): RepositoryMetadata | undefined {
  return repositories.find((repository) => repository.url === repositoryUrl);
}

export function filterPlatformsByTopics(
  candidates: readonly Platform[],
  repositories: readonly RepositoryMetadata[],
  query: string,
): Platform[] {
  const terms = normalize(query).split(" ").filter(Boolean);

  if (terms.length === 0) {
    return [...candidates];
  }

  return candidates.filter((platform) =>
    getPlatformRepositories(platform).some((repository) => {
      const metadata = getRepositoryMetadata(repositories, repository.url);
      const searchableTopics = normalize(metadata?.topics.join(" ") ?? "");

      return terms.every((term) => searchableTopics.includes(term));
    }),
  );
}
