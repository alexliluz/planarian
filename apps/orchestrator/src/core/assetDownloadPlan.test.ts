import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession, NetworkRequestSummary } from "@planarian/shared";
import { createAssetCandidates, createAssetDownloadPlan } from "./assetDownloadPlan.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("createAssetCandidates", () => {
  it("prioritizes visual assets and ignores scripts or telemetry", () => {
    const candidates = createAssetCandidates([
      request("https://example.com/home-hero.webp", "image", "image/webp"),
      request("https://example.com/fonts/brand.woff2", "font", "font/woff2"),
      request("https://example.com/app.css", "stylesheet", "text/css"),
      request("https://example.com/app.js", "script", "application/javascript"),
      request("https://www.googletagmanager.com/gtm.js", "script", "application/javascript")
    ]);

    expect(candidates.filter((candidate) => candidate.priority === "localize")).toHaveLength(2);
    expect(candidates.find((candidate) => candidate.url.includes("home-hero"))?.suggestedPath).toBe(
      "public/assets/images/home-hero.webp"
    );
    expect(candidates.find((candidate) => candidate.url.includes("app.css"))?.priority).toBe("reference");
    expect(candidates.find((candidate) => candidate.url.includes("gtm.js"))?.priority).toBe("ignore");
  });
});

describe("createAssetDownloadPlan", () => {
  it("writes an asset download plan file", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-asset-plan-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "network-analysis.json"), JSON.stringify(session.network), "utf8");

    const result = await createAssetDownloadPlan(tempRoot, session.sessionId);
    const plan = await readFile(result.planPath, "utf8");

    expect(result.sessionId).toBe("demo");
    expect(plan).toContain("Asset Download Plan");
    expect(plan).toContain("public/assets/images/home-hero.webp");
    expect(plan).toContain("Original site scripts should not be copied");
  });
});

function request(url: string, resourceType: string, contentType: string): NetworkRequestSummary {
  return {
    url,
    method: "GET",
    resourceType,
    status: 200,
    contentType,
    isApiCandidate: false
  };
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
      notes: []
    },
    screenshots: {},
    network: [
      request("https://example.com/home-hero.webp", "image", "image/webp"),
      request("https://example.com/app.js", "script", "application/javascript")
    ],
    versions: {},
    status: "analyzed"
  };
}
