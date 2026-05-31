import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession, NetworkRequestSummary } from "@planarian/shared";
import { createAssetInventory, extractVisualSignals, groupAssets } from "./assetInventory.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("groupAssets", () => {
  it("groups network requests by asset role", () => {
    const groups = groupAssets([
      request("https://example.com/app.css", "stylesheet", "text/css"),
      request("https://example.com/hero.webp", "image", "image/webp"),
      request("https://example.com/font.woff2", "font", "font/woff2"),
      request("https://example.com/app.js", "script", "application/javascript"),
      { ...request("https://example.com/api/data", "fetch", "application/json"), isApiCandidate: true }
    ]);

    expect(groups.stylesheets).toHaveLength(1);
    expect(groups.images).toHaveLength(1);
    expect(groups.fonts).toHaveLength(1);
    expect(groups.scripts).toHaveLength(1);
    expect(groups.apiCandidates).toHaveLength(1);
  });
});

describe("extractVisualSignals", () => {
  it("extracts headings, navigation labels, classes, and linked assets", () => {
    const signals = extractVisualSignals(
      `<html class="dark"><body class="home"><nav><a href="/people">People</a></nav><h1>Make History</h1><img src="/hero.webp"></body></html>`,
      createSession()
    );

    expect(signals.htmlClasses).toEqual(["dark"]);
    expect(signals.bodyClasses).toEqual(["home"]);
    expect(signals.navigationLabels).toContain("People");
    expect(signals.headings).toContain("Make History");
    expect(signals.linkedAssets).toContain("/hero.webp");
  });
});

describe("createAssetInventory", () => {
  it("writes asset inventory and visual plan files", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-assets-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "raw-html.html"), "<h1>Make History</h1>", "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "network-analysis.json"), JSON.stringify(session.network), "utf8");

    const result = await createAssetInventory(tempRoot, session.sessionId);
    const inventory = await readFile(path.join(sessionRoot, "references", "ASSET_INVENTORY.md"), "utf8");

    expect(result.files).toEqual(["references/ASSET_INVENTORY.md", "references/VISUAL_PLAN.md"]);
    expect(inventory).toContain("Asset Inventory");
    expect(inventory).toContain("hero.webp");
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
      title: "Example",
      classification: "unknown",
      cloneMode: "visual-plus-interactions",
      requiresAuth: false,
      hasApiRequests: false,
      hasHeavyClientRendering: false,
      detectedFrameworks: [],
      notes: []
    },
    screenshots: { desktop: "target-research/desktop.png" },
    network: [request("https://example.com/hero.webp", "image", "image/webp")],
    versions: { formalClone: "formal-clone" },
    status: "analyzed"
  };
}
