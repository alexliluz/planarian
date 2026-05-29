import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { cloneSessionExists, listCloneSessions, readCloneSession } from "./sessionRepository.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("sessionRepository", () => {
  it("lists sessions sorted by updatedAt descending", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-session-repo-"));
    await writeSession(tempRoot, {
      sessionId: "older",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });
    await writeSession(tempRoot, {
      sessionId: "newer",
      updatedAt: "2026-02-01T00:00:00.000Z"
    });

    const sessions = await listCloneSessions(tempRoot);

    expect(sessions.map((session) => session.sessionId)).toEqual(["newer", "older"]);
  });

  it("reads existing sessions and reports missing sessions", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-session-repo-"));
    await writeSession(tempRoot, {
      sessionId: "demo",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });

    await expect(readCloneSession(tempRoot, "demo")).resolves.toMatchObject({ sessionId: "demo" });
    await expect(cloneSessionExists(tempRoot, "demo")).resolves.toBe(true);
    await expect(cloneSessionExists(tempRoot, "missing")).resolves.toBe(false);
  });
});

async function writeSession(root: string, input: { sessionId: string; updatedAt: string }): Promise<void> {
  const sessionRoot = path.join(root, "workspace", "sessions", input.sessionId);
  await mkdir(sessionRoot, { recursive: true });
  const session: CloneSession = {
    sessionId: input.sessionId,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: input.updatedAt,
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

