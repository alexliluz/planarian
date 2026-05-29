import { mkdtemp, mkdir, rm, writeFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CloneSession } from "@planarian/shared";
import type { AnalyzeTargetFunction } from "./initCloneSession.js";
import { initCloneSession } from "./initCloneSession.js";
import { createCloneSession, createSessionId } from "./createCloneSession.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("initCloneSession", () => {
  it("reuses an existing session by default without calling the analyzer", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-init-"));
    const existing = await writeExistingSession(tempRoot, "https://example.com");
    const analyzer = vi.fn<AnalyzeTargetFunction>();

    const session = await initCloneSession({
      url: "https://example.com",
      projectRoot: tempRoot,
      analyzer
    });

    expect(session).toMatchObject({ sessionId: existing.sessionId });
    expect(analyzer).not.toHaveBeenCalled();
  });

  it("runs the analyzer when refresh is true", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-init-"));
    await writeExistingSession(tempRoot, "https://example.com");
    const analyzer = vi.fn<AnalyzeTargetFunction>(async ({ outputDir }) => {
      await mkdir(outputDir, { recursive: true });
      await writeFile(path.join(outputDir, "raw-html.html"), "<html><body>updated</body></html>", "utf8");
      await writeFile(path.join(outputDir, "desktop.png"), "fake png", "utf8");
      return {
        title: "Updated",
        classification: "static",
        requiresAuth: false,
        hasApiRequests: false,
        hasHeavyClientRendering: false,
        detectedFrameworks: [],
        notes: [],
        network: []
      };
    });

    const session = await initCloneSession({
      url: "https://example.com",
      projectRoot: tempRoot,
      refresh: true,
      analyzer
    });

    expect(session.target.title).toBe("Updated");
    expect(session.target.classification).toBe("static");
    expect(analyzer).toHaveBeenCalledOnce();
    await expect(stat(path.join(tempRoot, "workspace", "sessions", session.sessionId, "agent-memory", "TASKS.md"))).resolves.toBeTruthy();
  });
});

async function writeExistingSession(projectRoot: string, url: string): Promise<CloneSession> {
  const session = createCloneSession({
    url,
    title: "Existing",
    classification: "unknown",
    requiresAuth: false,
    hasApiRequests: false,
    hasHeavyClientRendering: false,
    detectedFrameworks: [],
    notes: [],
    network: []
  });
  const sessionId = createSessionId(url);
  const sessionRoot = path.join(projectRoot, "workspace", "sessions", sessionId);
  await mkdir(sessionRoot, { recursive: true });
  await writeFile(path.join(sessionRoot, "clone-session.json"), `${JSON.stringify(session, null, 2)}\n`, "utf8");
  return session;
}

