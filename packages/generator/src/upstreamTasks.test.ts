import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { compareVersions } from "./compareVersions.js";
import { runFormalClone } from "./runFormalClone.js";
import { runOpenLovable } from "./runOpenLovable.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("upstream task generators", () => {
  it("writes Open Lovable task files", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-generator-"));
    const result = await runOpenLovable({ sessionRoot: tempRoot, session: createSession() });

    expect(result.files.map((file) => file.path)).toContain("open-lovable-version/OPEN_LOVABLE_TASK.md");
    await expect(readFile(path.join(tempRoot, "open-lovable-version", "OPEN_LOVABLE_TASK.md"), "utf8")).resolves.toContain(
      "Open Lovable Visual Draft Task"
    );
  });

  it("writes formal clone pipeline files", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-generator-"));
    const result = await runFormalClone({ sessionRoot: tempRoot, session: createSession() });

    expect(result.files.map((file) => file.path)).toContain("formal-clone/FORMAL_CLONE_PIPELINE.md");
    await expect(readFile(path.join(tempRoot, "formal-clone", "AGENTS.md"), "utf8")).resolves.toContain("Formal Clone Agent Instructions");
  });

  it("writes comparison checklist", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-generator-"));
    const result = await compareVersions({ sessionRoot: tempRoot, session: createSession() });

    expect(result.files.map((file) => file.path)).toEqual(["comparison/VERSION_COMPARISON_CHECKLIST.md"]);
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

