import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createProgram } from "./program.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("createProgram", () => {
  it("prints a friendly message when no sessions exist", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));

    const output = await runCommand(tempRoot, ["node", "planarian", "list"]);

    expect(output).toBe("No sessions found.\n");
  });

  it("lists and shows sessions", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");

    const listOutput = await runCommand(tempRoot, ["node", "planarian", "list"]);
    const showOutput = await runCommand(tempRoot, ["node", "planarian", "show", "demo"]);

    expect(listOutput).toContain("demo\tunknown\thttps://example.com/");
    expect(JSON.parse(showOutput)).toMatchObject({ sessionId: "demo" });
  });

  it("prints doctor checks", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeFile(path.join(tempRoot, "package.json"), "{}", "utf8");
    await writeFile(path.join(tempRoot, "pnpm-workspace.yaml"), "packages: []\n", "utf8");
    await mkdir(path.join(tempRoot, "workspace", "sessions"), { recursive: true });

    const output = await runCommand(tempRoot, ["node", "planarian", "doctor"]);

    expect(output).toContain(`Project root: ${tempRoot}`);
    expect(output).toContain("OK package.json: found");
    expect(output).toContain("OK clone sessions: 0 session(s) found");
  });
});

async function runCommand(projectRoot: string, args: string[]): Promise<string> {
  let output = "";
  const originalLog = console.log;
  const originalExitCode = process.exitCode;
  console.log = (message?: unknown) => {
    output += `${String(message ?? "")}\n`;
  };

  try {
    const program = createProgram({ getProjectRoot: () => projectRoot });
    await program.parseAsync(args, { from: "node" });
    return output;
  } finally {
    console.log = originalLog;
    process.exitCode = originalExitCode;
  }
}

async function writeSession(projectRoot: string, sessionId: string): Promise<void> {
  const sessionRoot = path.join(projectRoot, "workspace", "sessions", sessionId);
  await mkdir(sessionRoot, { recursive: true });
  const session: CloneSession = {
    sessionId,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    target: {
      url: "https://example.com",
      normalizedUrl: "https://example.com/",
      hostname: "example.com",
      classification: "unknown",
      cloneMode: "visual-plus-interactions",
      requiresAuth: false,
      hasApiRequests: false,
      hasHeavyClientRendering: false,
      detectedFrameworks: [],
      notes: []
    },
    screenshots: {},
    network: [],
    versions: {},
    status: "analyzed"
  };
  await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
}

