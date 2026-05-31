import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createSessionRunbook, renderSessionRunbook } from "./sessionRunbook.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("renderSessionRunbook", () => {
  it("includes run, validation, and workflow commands", () => {
    const content = renderSessionRunbook(createSession(), "G:\\workspace\\planarian\\outputs\\sessions\\demo");

    expect(content).toContain("corepack pnpm install");
    expect(content).toContain("corepack pnpm cli formal-validate demo");
    expect(content).toContain("corepack pnpm cli formal-compare demo");
    expect(content).toContain("target-research/desktop.png");
  });
});

describe("createSessionRunbook", () => {
  it("writes RUNBOOK.md into the session root", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-runbook-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(sessionRoot, { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");

    const result = await createSessionRunbook(tempRoot, session.sessionId);
    const content = await readFile(result.runbookPath, "utf8");

    expect(result.runbookPath.replace(/\\/g, "/")).toContain("/outputs/sessions/demo/RUNBOOK.md");
    expect(content).toContain("Planarian Session Runbook");
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
      classification: "static",
      cloneMode: "visual-plus-interactions",
      requiresAuth: false,
      hasApiRequests: false,
      hasHeavyClientRendering: false,
      detectedFrameworks: [],
      notes: []
    },
    screenshots: { desktop: "target-research/desktop.png" },
    network: [],
    versions: { formalClone: "formal-clone" },
    status: "analyzed"
  };
}
