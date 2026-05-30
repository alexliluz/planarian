import path from "node:path";

export interface ChangedFile {
  status: string;
  file: string;
}

export interface ChangedFilesCheckInput {
  changedFiles: ChangedFile[];
  cwd: string;
  fileExists: (filePath: string) => boolean;
}

export interface ChangedFilesCheckResult {
  failures: string[];
  warnings: string[];
}

export function checkChangedFiles(input: ChangedFilesCheckInput): ChangedFilesCheckResult {
  const failures: string[] = [];
  const warnings: string[] = [];

  for (const changed of input.changedFiles) {
    const normalized = normalizeChangedFilePath(changed.file);
    const isNewFile = changed.status === "A" || changed.status === "??";
    const isRename = changed.status.startsWith("R");

    if (normalized === "PROJECT_EXECUTION.md" && !isNewFile) {
      failures.push("PROJECT_EXECUTION.md was modified. Keep execution rules stable during normal agent tasks.");
    }

    if (changed.status.startsWith("D") && /\.(test|spec)\.ts$/.test(normalized)) {
      failures.push(`Test file was deleted: ${changed.file}`);
    }

    if (normalized.endsWith("clone-session.json") && !isNewFile && !isRename) {
      failures.push(`Existing clone-session.json was modified: ${changed.file}`);
    }
  }

  const sessionChanges = input.changedFiles.filter((changed) => normalizeChangedFilePath(changed.file).startsWith("outputs/sessions/"));
  const sessionsTouched = new Set(
    sessionChanges
      .map((changed) => normalizeChangedFilePath(changed.file).split("/").slice(0, 3).join("/"))
      .filter((sessionPath) => sessionPath.split("/").length === 3)
  );

  for (const sessionPath of sessionsTouched) {
    const changelogPath = `${sessionPath}/agent-memory/CHANGELOG_AGENT.md`;
    const changelogChanged = input.changedFiles.some((changed) => normalizeChangedFilePath(changed.file) === changelogPath);
    if (input.fileExists(path.join(input.cwd, changelogPath)) && !changelogChanged) {
      warnings.push(`${changelogPath} exists but was not updated while session files changed.`);
    }
  }

  return { failures, warnings };
}

export function parseGitPorcelain(output: string): ChangedFile[] {
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const status = line.slice(0, 2).trim() || line.slice(0, 2);
      const file = line.slice(3).trim().replace(/^"|"$/g, "");
      return { status, file };
    });
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

function normalizeChangedFilePath(filePath: string): string {
  const normalized = normalizePath(filePath);
  const renameArrow = " -> ";
  if (normalized.includes(renameArrow)) {
    return normalized.slice(normalized.lastIndexOf(renameArrow) + renameArrow.length);
  }
  return normalized;
}
