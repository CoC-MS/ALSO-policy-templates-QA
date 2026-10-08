import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { countPolicyJsonFiles } from "./template-count.mjs";

const owner = "CoC-MS";
const repositoryNames = [
  "ALSO-Microsoft-Security-Windows",
  "ALSO-Microsoft-Security-WindowsServer",
  "ALSO-Microsoft-Security-AI-Security-Windows11",
  "ALSO-Microsoft-Security-Conditional-Access",
  "ALSO-Microsoft-Security-Linux",
  "ALSO-Microsoft-Security-MacOS",
  "ALSO-Microsoft-Security-iOSandiPadOS",
  "ALSO-Microsoft-Security-Android",
  "ALSO-Microsoft-Security-Purview",
];
const outputPath = join(process.cwd(), "public", "repository-metadata.json");

let cachedRepositories = [];
try {
  const cachedIndex = JSON.parse(await readFile(outputPath, "utf8"));
  cachedRepositories = Array.isArray(cachedIndex.repositories)
    ? cachedIndex.repositories
    : [];
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const repositories = repositoryNames.map((name) => {
  const url = `https://github.com/${owner}/${name}`;
  let metadata;
  try {
    metadata = JSON.parse(
      execFileSync("gh", ["api", `repos/${owner}/${name}`], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    );
  } catch (error) {
    if (!String(error.stderr).includes("HTTP 404")) throw error;
    const cached = cachedRepositories.find(
      (repository) => repository.url === url,
    );
    if (!cached) {
      throw new Error(`Unable to fetch ${name} and no cached metadata exists.`);
    }
    console.warn(`Using cached metadata for ${name}.`);
    return cached;
  }

  const tree = JSON.parse(
    execFileSync(
      "gh",
      ["api", `repos/${owner}/${name}/git/trees/${encodeURIComponent(metadata.default_branch)}?recursive=1`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 20 * 1024 * 1024 },
    ),
  );
  const templateCount = countPolicyJsonFiles(tree);
  console.log(`Synced ${name} (${metadata.topics.length} topics, ${templateCount} JSON templates).`);

  return {
    name,
    url,
    description: metadata.description,
    topics: [...metadata.topics].sort(),
    templateCount,
    templateCountUpdatedAt: new Date().toISOString(),
  };
});

await mkdir(join(process.cwd(), "public"), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    repositories,
  })}\n`,
);
console.log(`Synchronized metadata for ${repositories.length} repositories.`);
