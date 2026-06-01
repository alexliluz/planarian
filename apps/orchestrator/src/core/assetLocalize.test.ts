import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { localizeAssets } from "./assetLocalize.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("localizeAssets", () => {
  it("writes a dry-run manifest for high-priority assets", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-localize-assets-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeFile(
      path.join(sessionRoot, "target-research", "network-analysis.json"),
      JSON.stringify([
        {
          url: "https://example.com/home-hero.webp",
          method: "GET",
          resourceType: "image",
          status: 200,
          contentType: "image/webp",
          isApiCandidate: false
        },
        {
          url: "https://example.com/app.js",
          method: "GET",
          resourceType: "script",
          status: 200,
          contentType: "application/javascript",
          isApiCandidate: false
        }
      ]),
      "utf8"
    );

    const result = await localizeAssets({ projectRoot: tempRoot, sessionId: session.sessionId, dryRun: true });
    const manifest = JSON.parse(await readFile(result.manifestPath, "utf8"));

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0]).toMatchObject({
      status: "planned",
      publicPath: "/assets/images/home-hero.webp"
    });
    expect(manifest.assets[0].localPath).toBe("formal-clone/public/assets/images/home-hero.webp");
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
      notes: []
    },
    screenshots: {},
    network: [],
    versions: {},
    status: "analyzed"
  };
}
