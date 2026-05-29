import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { checkChangedFiles, parseGitPorcelain, type ChangedFile } from "./checkChangedFilesCore.js";

const changedFiles = getChangedFiles();
const result = checkChangedFiles({
  changedFiles,
  cwd: process.cwd(),
  fileExists: existsSync
});

for (const warning of result.warnings) {
  console.warn(`Warning: ${warning}`);
}

if (result.failures.length > 0) {
  for (const failure of result.failures) {
    console.error(`Error: ${failure}`);
  }
  process.exit(1);
}

console.log("Changed-file safety checks passed.");

function getChangedFiles(): ChangedFile[] {
  try {
    const output = execFileSync("git", ["status", "--porcelain"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return parseGitPorcelain(output);
  } catch {
    console.log("Warning: git status unavailable; skipping changed-file safety checks.");
    return [];
  }
}
