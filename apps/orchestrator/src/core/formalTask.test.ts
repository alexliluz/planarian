import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createFormalCloneTask, getFormalCloneStatus, renderFormalCloneTaskBundle } from "./formalTask.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("renderFormalCloneTaskBundle", () => {
  it("includes safety constraints and required research inputs", () => {
    const bundle = renderFormalCloneTaskBundle(createSession());

    expect(bundle).toContain("Do not bypass authentication");
    expect(bundle).toContain("../target-research/raw-html.html");
    expect(bundle).toContain("../target-research/desktop.png");
    expect(bundle).toContain("Use mock data");
    expect(bundle).toContain("## Asset Inventory");
    expect(bundle).toContain("## Acceptance Criteria");
  });
});

describe("createFormalCloneTask", () => {
  it("writes TASK_BUNDLE.md into formal-clone", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-task-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(sessionRoot, { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");

    const result = await createFormalCloneTask(tempRoot, session.sessionId);
    const content = await readFile(result.taskBundlePath, "utf8");

    expect(result.taskBundlePath.replace(/\\/g, "/")).toContain("/formal-clone/TASK_BUNDLE.md");
    expect(content).toContain(`Session: ${session.sessionId}`);
    expect(content).toContain(`Target: ${session.target.normalizedUrl}`);
  });
});

describe("getFormalCloneStatus", () => {
  it("reports ready when all required inputs and task bundle exist", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-status-"));
    const session = createSession();
    await writeCompleteSession(tempRoot, session);
    await createFormalCloneTask(tempRoot, session.sessionId);

    const report = await getFormalCloneStatus(tempRoot, session.sessionId);

    expect(report.ready).toBe(true);
    expect(report.checks.every((check) => check.ok)).toBe(true);
  });

  it("reports missing required inputs", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-status-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(sessionRoot, { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");

    const report = await getFormalCloneStatus(tempRoot, session.sessionId);

    expect(report.ready).toBe(false);
    expect(report.checks.some((check) => check.name === "target-research/raw-html.html" && !check.ok)).toBe(true);
  });
});

async function writeCompleteSession(projectRoot: string, session: CloneSession): Promise<void> {
  const sessionRoot = path.join(projectRoot, "outputs", "sessions", session.sessionId);
  await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
  await mkdir(path.join(sessionRoot, "agent-memory"), { recursive: true });
  await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
  await writeFile(path.join(sessionRoot, "target-research", "raw-html.html"), "<html></html>", "utf8");
  await writeFile(path.join(sessionRoot, "target-research", "desktop.png"), "fake png", "utf8");
  await writeFile(path.join(sessionRoot, "target-research", "network-analysis.json"), "[]", "utf8");
  await writeFile(path.join(sessionRoot, "agent-memory", "PROMPTS.md"), "# Prompts", "utf8");
  await writeFile(path.join(sessionRoot, "agent-memory", "DECISIONS.md"), "# Decisions", "utf8");
}

function createSession(): CloneSession {
  return {
    sessionId: "demo",
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
      notes: ["Signals were inconclusive."]
    },
    screenshots: {
      desktop: "target-research/desktop.png"
    },
    network: [],
    versions: {
      formalClone: "formal-clone"
    },
    status: "analyzed"
  };
}
