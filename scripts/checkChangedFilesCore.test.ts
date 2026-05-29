import { describe, expect, it } from "vitest";
import { checkChangedFiles, parseGitPorcelain } from "./checkChangedFilesCore.js";

describe("parseGitPorcelain", () => {
  it("parses changed files from porcelain output", () => {
    expect(parseGitPorcelain(" M README.md\nA  scripts/new-file.ts\n")).toEqual([
      { status: "M", file: "README.md" },
      { status: "A", file: "scripts/new-file.ts" }
    ]);
  });
});

describe("checkChangedFiles", () => {
  it("fails when PROJECT_EXECUTION.md is modified after creation", () => {
    const result = checkChangedFiles({
      changedFiles: [{ status: "M", file: "PROJECT_EXECUTION.md" }],
      cwd: "G:/workspace/planarian",
      fileExists: () => false
    });

    expect(result.failures).toContain("PROJECT_EXECUTION.md was modified. Keep execution rules stable during normal agent tasks.");
  });

  it("allows PROJECT_EXECUTION.md when it is still untracked before the first commit", () => {
    const result = checkChangedFiles({
      changedFiles: [{ status: "??", file: "PROJECT_EXECUTION.md" }],
      cwd: "G:/workspace/planarian",
      fileExists: () => false
    });

    expect(result.failures).toEqual([]);
  });

  it("fails when test files are deleted", () => {
    const result = checkChangedFiles({
      changedFiles: [{ status: "D", file: "apps/orchestrator/src/core/demo.test.ts" }],
      cwd: "G:/workspace/planarian",
      fileExists: () => false
    });

    expect(result.failures).toEqual(["Test file was deleted: apps/orchestrator/src/core/demo.test.ts"]);
  });

  it("fails when existing clone-session.json files are modified", () => {
    const result = checkChangedFiles({
      changedFiles: [{ status: "M", file: "workspace/sessions/demo/clone-session.json" }],
      cwd: "G:/workspace/planarian",
      fileExists: () => false
    });

    expect(result.failures).toEqual(["Existing clone-session.json was modified: workspace/sessions/demo/clone-session.json"]);
  });

  it("allows clone-session.json when it is newly created", () => {
    const result = checkChangedFiles({
      changedFiles: [{ status: "??", file: "workspace/sessions/demo/clone-session.json" }],
      cwd: "G:/workspace/planarian",
      fileExists: () => false
    });

    expect(result.failures).toEqual([]);
  });

  it("warns when session files changed without updating the session changelog", () => {
    const result = checkChangedFiles({
      changedFiles: [{ status: "M", file: "workspace/sessions/demo/target-research/raw-html.html" }],
      cwd: "G:/workspace/planarian",
      fileExists: (filePath) => filePath.replace(/\\/g, "/").endsWith("workspace/sessions/demo/agent-memory/CHANGELOG_AGENT.md")
    });

    expect(result.warnings).toEqual([
      "workspace/sessions/demo/agent-memory/CHANGELOG_AGENT.md exists but was not updated while session files changed."
    ]);
  });

  it("does not warn when the session changelog was updated", () => {
    const result = checkChangedFiles({
      changedFiles: [
        { status: "M", file: "workspace/sessions/demo/target-research/raw-html.html" },
        { status: "M", file: "workspace/sessions/demo/agent-memory/CHANGELOG_AGENT.md" }
      ],
      cwd: "G:/workspace/planarian",
      fileExists: () => true
    });

    expect(result.warnings).toEqual([]);
  });
});
