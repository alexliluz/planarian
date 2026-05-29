import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createFormalCloneTask, renderFormalCloneTaskBundle } from "./formalTask.js";

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
  });
});

describe("createFormalCloneTask", () => {
  it("writes TASK_BUNDLE.md into formal-clone", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-task-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "workspace", "sessions", session.sessionId);
    await mkdir(sessionRoot, { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");

    const result = await createFormalCloneTask(tempRoot, session.sessionId);
    const content = await readFile(result.taskBundlePath, "utf8");

    expect(result.taskBundlePath.replace(/\\/g, "/")).toContain("/formal-clone/TASK_BUNDLE.md");
    expect(content).toContain(`Session: ${session.sessionId}`);
    expect(content).toContain(`Target: ${session.target.normalizedUrl}`);
  });
});

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

