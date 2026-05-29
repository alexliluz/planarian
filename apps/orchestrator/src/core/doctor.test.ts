import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runDoctor } from "./doctor.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("runDoctor", () => {
  it("reports missing required project files", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-doctor-"));

    const report = await runDoctor(tempRoot);

    expect(report.ok).toBe(false);
    expect(report.checks).toContainEqual(
      expect.objectContaining({
        name: "package.json",
        ok: false
      })
    );
  });

  it("reports a healthy minimal project and session count", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-doctor-"));
    await writeFile(path.join(tempRoot, "package.json"), "{}", "utf8");
    await writeFile(path.join(tempRoot, "pnpm-workspace.yaml"), "packages: []\n", "utf8");
    await mkdir(path.join(tempRoot, "workspace", "sessions", "demo"), { recursive: true });
    await writeFile(
      path.join(tempRoot, "workspace", "sessions", "demo", "clone-session.json"),
      JSON.stringify({
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
          notes: []
        },
        screenshots: {},
        network: [],
        versions: {},
        status: "analyzed"
      }),
      "utf8"
    );

    const report = await runDoctor(tempRoot);

    expect(report.ok).toBe(true);
    expect(report.checks).toContainEqual({
      name: "clone sessions",
      ok: true,
      detail: "1 session(s) found"
    });
  });
});

