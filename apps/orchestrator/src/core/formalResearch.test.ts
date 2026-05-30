import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createFormalResearch, renderFormalResearch } from "./formalResearch.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("renderFormalResearch", () => {
  it("creates research files with visible structure, data policy, and implementation plan", () => {
    const files = renderFormalResearch({
      session: createSession(),
      rawHtml: "<html><body><h1>Hello</h1><a href=\"/docs\">Docs</a><script>ignored()</script></body></html>",
      network: [
        {
          url: "https://example.com/api/items",
          method: "GET",
          resourceType: "fetch",
          status: 200,
          contentType: "application/json",
          isApiCandidate: true
        }
      ]
    });

    expect(files.map((file) => file.path)).toEqual([
      "README.md",
      "00-target-overview.md",
      "01-page-structure.md",
      "02-network-and-data.md",
      "03-implementation-plan.md"
    ]);
    expect(files.find((file) => file.path === "01-page-structure.md")?.content).toContain("Hello");
    expect(files.find((file) => file.path === "02-network-and-data.md")?.content).toContain("Use `../../../mock-data/`");
    expect(files.find((file) => file.path === "03-implementation-plan.md")?.content).toContain("Cursor Auto Tasks");
  });
});

describe("createFormalResearch", () => {
  it("writes formal clone research files under formal-clone/docs/research", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-research-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "raw-html.html"), "<h1>Example Domain</h1>", "utf8");
    await writeFile(
      path.join(sessionRoot, "target-research", "network-analysis.json"),
      JSON.stringify(session.network),
      "utf8"
    );

    const result = await createFormalResearch(tempRoot, session.sessionId);
    const overview = await readFile(path.join(result.researchRoot, "00-target-overview.md"), "utf8");
    const structure = await readFile(path.join(result.researchRoot, "01-page-structure.md"), "utf8");

    expect(result.files).toContain("formal-clone/docs/research/00-target-overview.md");
    expect(overview).toContain("https://example.com/");
    expect(structure).toContain("Example Domain");
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
      description: "Example description",
      classification: "static",
      cloneMode: "visual-plus-interactions",
      requiresAuth: false,
      hasApiRequests: true,
      hasHeavyClientRendering: false,
      detectedFrameworks: [],
      notes: ["Content-heavy page with no framework markers."]
    },
    screenshots: {
      desktop: "target-research/desktop.png"
    },
    network: [
      {
        url: "https://example.com/api/items",
        method: "GET",
        resourceType: "fetch",
        status: 200,
        contentType: "application/json",
        isApiCandidate: true
      }
    ],
    versions: {
      formalClone: "formal-clone"
    },
    status: "analyzed"
  };
}
