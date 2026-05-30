import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createReactGrabRepairTask, createUpstreamIntegrationTasks } from "./upstreamIntegrations.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("upstream integrations", () => {
  it("creates integration task files for a session", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-upstreams-"));
    await writeSession(tempRoot, createSession());

    const result = await createUpstreamIntegrationTasks(tempRoot, "demo");

    expect(result.files).toContain("open-lovable-version/OPEN_LOVABLE_TASK.md");
    expect(result.files).toContain("formal-clone/FORMAL_CLONE_PIPELINE.md");
    expect(result.files).toContain("comparison/VERSION_COMPARISON_CHECKLIST.md");
  });

  it("creates a React Grab repair task from context JSON", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-upstreams-"));
    await writeSession(tempRoot, createSession());
    const contextPath = path.join(tempRoot, "grab-context.json");
    await writeFile(contextPath, JSON.stringify({ componentName: "Hero", filePath: "app/page.tsx" }), "utf8");

    const result = await createReactGrabRepairTask(tempRoot, "demo", contextPath);
    const body = await readFile(result.taskPath, "utf8");

    expect(result.title).toBe("Repair Hero");
    expect(body).toContain("React Grab UI Repair Task");
  });
});

async function writeSession(projectRoot: string, session: CloneSession): Promise<void> {
  const sessionRoot = path.join(projectRoot, "outputs", "sessions", session.sessionId);
  await mkdir(sessionRoot, { recursive: true });
  await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
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
      title: "Example Domain",
      classification: "unknown",
      cloneMode: "visual-plus-interactions",
      requiresAuth: false,
      hasApiRequests: false,
      hasHeavyClientRendering: false,
      detectedFrameworks: [],
      notes: []
    },
    screenshots: { desktop: "target-research/desktop.png" },
    network: [],
    versions: {},
    status: "analyzed"
  };
}

