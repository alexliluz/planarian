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
    await mkdir(path.join(tempRoot, "outputs", "sessions"), { recursive: true });

    const output = await runCommand(tempRoot, ["node", "planarian", "doctor"]);

    expect(output).toContain(`Project root: ${tempRoot}`);
    expect(output).toContain("OK package.json: found");
    expect(output).toContain("OK clone sessions: 0 session(s) found");
  });

  it("creates a session runbook", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");

    const output = await runCommand(tempRoot, ["node", "planarian", "session-runbook", "demo"]);

    expect(output).toContain("Created session runbook for demo");
    expect(output).toContain("RUNBOOK.md");
  });

  it("creates a formal clone task bundle", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");

    const output = await runCommand(tempRoot, ["node", "planarian", "formal-task", "demo"]);

    expect(output).toContain("Created formal clone task bundle for demo");
    expect(output).toContain("TASK_BUNDLE.md");
  });

  it("prints formal clone readiness status", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");

    const output = await runCommand(tempRoot, ["node", "planarian", "formal-status", "demo"]);

    expect(output).toContain("Formal clone status for demo: not ready");
    expect(output).toContain("FAIL target-research/raw-html.html");
  });

  it("creates formal clone research notes", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", "demo");
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "target-research", "raw-html.html"), "<h1>Example Domain</h1>", "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "network-analysis.json"), "[]", "utf8");

    const output = await runCommand(tempRoot, ["node", "planarian", "formal-research", "demo"]);

    expect(output).toContain("Created formal clone research for demo");
    expect(output).toContain("formal-clone/docs/research/00-target-overview.md");
  });

  it("creates formal clone comparison files", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", "demo");
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await mkdir(path.join(sessionRoot, "formal-clone", "docs", "research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "target-research", "desktop.png"), "fake png", "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "raw-html.html"), "<html></html>", "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "network-analysis.json"), "[]", "utf8");
    await writeFile(path.join(sessionRoot, "formal-clone", "TASK_BUNDLE.md"), "# Task", "utf8");
    await writeFile(path.join(sessionRoot, "formal-clone", "docs", "research", "README.md"), "# Research", "utf8");

    const output = await runCommand(tempRoot, ["node", "planarian", "formal-compare", "demo"]);

    expect(output).toContain("Created formal clone comparison for demo");
    expect(output).toContain("OK Desktop screenshot: target-research/desktop.png");
    expect(output).toContain("comparison/FORMAL_COMPARISON.md");
  });

  it("creates a formal clone scaffold", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");

    const output = await runCommand(tempRoot, ["node", "planarian", "formal-scaffold", "demo"]);

    expect(output).toContain("Created formal clone scaffold for demo");
    expect(output).toContain("Written:");
    expect(output).toContain("Skipped:");
  });

  it("validates a formal clone scaffold", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");
    await writeFormalClone(tempRoot, "demo");

    const output = await runCommand(tempRoot, ["node", "planarian", "formal-validate", "demo"]);

    expect(output).toContain("Formal clone validation for demo: ready");
    expect(output).toContain("OK package.json: found");
    expect(output).toContain("VALIDATION.md");
  });

  it("creates a static first pass", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", "demo");
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "target-research", "raw-html.html"), "<h1>Example Domain</h1>", "utf8");

    const output = await runCommand(tempRoot, ["node", "planarian", "formal-static-pass", "demo"]);

    expect(output).toContain("Created formal static pass for demo");
    expect(output).toContain("formal-clone/app/page.tsx");
    expect(output).toContain("formal-clone/STATIC_IMPLEMENTATION.md");
  });

  it("creates upstream integration task files", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");

    const output = await runCommand(tempRoot, ["node", "planarian", "integrate-upstreams", "demo"]);

    expect(output).toContain("Created upstream integration tasks for demo");
    expect(output).toContain("open-lovable-version/OPEN_LOVABLE_TASK.md");
    expect(output).toContain("formal-clone/FORMAL_CLONE_PIPELINE.md");
  });

  it("creates a React Grab install task", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-cli-"));
    await writeSession(tempRoot, "demo");

    const output = await runCommand(tempRoot, ["node", "planarian", "react-grab-install-task", "demo"]);

    expect(output).toContain("Created React Grab install task for demo");
    expect(output).toContain("Install React Grab for demo");
    expect(output).toContain("INSTALL_REACT_GRAB.md");
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
  const sessionRoot = path.join(projectRoot, "outputs", "sessions", sessionId);
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

async function writeFormalClone(projectRoot: string, sessionId: string): Promise<void> {
  const formalCloneRoot = path.join(projectRoot, "outputs", "sessions", sessionId, "formal-clone");
  await mkdir(path.join(formalCloneRoot, "app"), { recursive: true });
  await writeFile(
    path.join(formalCloneRoot, "package.json"),
    JSON.stringify({
      scripts: {
        dev: "next dev",
        build: "next build"
      },
      dependencies: {
        next: "^15.0.0",
        react: "^19.0.0",
        "react-dom": "^19.0.0"
      }
    }),
    "utf8"
  );
  await writeFile(path.join(formalCloneRoot, "README.md"), "# Formal Clone", "utf8");
  await writeFile(path.join(formalCloneRoot, "app", "page.tsx"), "export default function Page() { return null; }", "utf8");
  await writeFile(path.join(formalCloneRoot, "app", "globals.css"), "body { margin: 0; }", "utf8");
}
