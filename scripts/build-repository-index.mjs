import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repositories = [
  "ALSO-Microsoft-Security-WindowsServer",
  "ALSO-Microsoft-Security-AI-Security-Windows11",
  "ALSO-Microsoft-Security-Conditional-Access",
  "ALSO-Microsoft-Security-MacOS",
  "ALSO-Microsoft-Security-iOSandiPadOS",
];

const maximumFileSize = 512 * 1024;
const owner = "CoC-MS";
const outputPath = join(process.cwd(), "public", "repository-index.json");

function toGitHubPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

const temporaryRoot = await mkdtemp(join(tmpdir(), "also-policy-index-"));
const documents = [];

try {
  for (const repository of repositories) {
    const repositoryUrl = `https://github.com/${owner}/${repository}`;
    const checkoutPath = join(temporaryRoot, repository);
    console.log(`Indexing ${repository}...`);
    execFileSync(
      "git",
      [
        "clone",
        "--depth",
        "1",
        "--no-checkout",
        "--quiet",
        `${repositoryUrl}.git`,
        checkoutPath,
      ],
      { stdio: "inherit" },
    );
    const branch = execFileSync(
      "git",
      ["-C", checkoutPath, "symbolic-ref", "--short", "HEAD"],
      { encoding: "utf8" },
    ).trim();
    const tree = execFileSync(
      "git",
      [
        "-C",
        checkoutPath,
        "-c",
        "core.quotePath=false",
        "ls-tree",
        "-r",
        "-l",
        "HEAD",
      ],
      { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );

    for (const line of tree.split(/\r?\n/).filter(Boolean)) {
      const [metadata, path] = line.split("\t", 2);
      const [, objectType, objectId, sizeText] = metadata.trim().split(/\s+/);
      const size = Number(sizeText);
      if (!path || !Number.isFinite(size) || size > maximumFileSize) continue;
      const buffer = execFileSync(
        "git",
        ["-C", checkoutPath, "cat-file", objectType, objectId],
        { encoding: "buffer", maxBuffer: maximumFileSize + 1024 },
      );
      if (buffer.includes(0)) continue;
      const content = buffer.toString("utf8").trim();
      if (!content) continue;

      documents.push({
        repositoryName: repository,
        repositoryUrl,
        path,
        url: `${repositoryUrl}/blob/${encodeURIComponent(branch)}/${toGitHubPath(path)}`,
        content,
      });
    }
  }

  await mkdir(join(process.cwd(), "public"), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      documents,
    })}\n`,
  );
  console.log(`Indexed ${documents.length} files from ${repositories.length} repositories.`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
