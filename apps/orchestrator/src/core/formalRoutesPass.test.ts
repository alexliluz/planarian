import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createFormalRoutesPass, extractRouteContent, renderFormalRoutesPass } from "./formalRoutesPass.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("extractRouteContent", () => {
  it("extracts route title, sections, paragraphs, and links", () => {
    const content = extractRouteContent(
      `<html><body><h1>Our Team</h1><h2>Jane Doe</h2><p>Partner focused on early-stage company building.</p><a href="/people/jane">Read more</a></body></html>`,
      "https://example.com/people",
      "/people",
      "target-research/pages/people"
    );

    expect(content.title).toBe("Our Team");
    expect(content.sections).toEqual(["Jane Doe"]);
    expect(content.paragraphs).toEqual(["Partner focused on early-stage company building."]);
    expect(content.links).toEqual([{ label: "Read more", href: "/people/jane" }]);
  });
});

describe("renderFormalRoutesPass", () => {
  it("renders route pages and shared route data", () => {
    const files = renderFormalRoutesPass([
      {
        title: "Our Team",
        url: "https://example.com/people",
        routePath: "/people",
        sourceDir: "target-research/pages/people",
        sections: ["Jane Doe"],
        paragraphs: ["Partner focused on early-stage company building."],
        links: [{ label: "Read more", href: "/people/jane" }]
      }
    ]);

    expect(files.map((file) => file.path)).toContain("app/people/page.tsx");
    expect(files.map((file) => file.path)).toContain("data/route-content.json");
    expect(files.find((file) => file.path === "app/people/page.tsx")?.content).toContain("route-shell");
  });
});

describe("createFormalRoutesPass", () => {
  it("writes content-aware pages for captured non-home routes", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-routes-pass-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(path.join(sessionRoot, "target-research", "pages", "people"), { recursive: true });
    await mkdir(path.join(sessionRoot, "formal-clone", "app"), { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeFile(path.join(sessionRoot, "formal-clone", "app", "globals.css"), "body { margin: 0; }\n", "utf8");
    await writeFile(
      path.join(sessionRoot, "target-research", "pages", "capture-manifest.json"),
      JSON.stringify({
        sessionId: session.sessionId,
        pages: [
          { url: "https://example.com/", outputDir: "target-research/pages/home" },
          { url: "https://example.com/people", outputDir: "target-research/pages/people" }
        ]
      }),
      "utf8"
    );
    await writeFile(
      path.join(sessionRoot, "target-research", "pages", "people", "raw-html.html"),
      `<h1>Our Team</h1><h2>Jane Doe</h2><p>Partner focused on early-stage company building.</p>`,
      "utf8"
    );

    const result = await createFormalRoutesPass(tempRoot, session.sessionId);
    const page = await readFile(path.join(result.formalCloneRoot, "app", "people", "page.tsx"), "utf8");
    const css = await readFile(path.join(result.formalCloneRoot, "app", "globals.css"), "utf8");

    expect(result.files).toContain("formal-clone/app/people/page.tsx");
    expect(result.files).toContain("formal-clone/app/globals.css");
    expect(page).toContain("Our Team");
    expect(css).toContain(".route-shell");
  });

  it("does not write route files when only the home page was captured", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-routes-pass-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(path.join(sessionRoot, "target-research", "pages", "home"), { recursive: true });
    await mkdir(path.join(sessionRoot, "formal-clone", "app"), { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeFile(path.join(sessionRoot, "formal-clone", "app", "globals.css"), "body { margin: 0; }\n", "utf8");
    await writeFile(
      path.join(sessionRoot, "target-research", "pages", "capture-manifest.json"),
      JSON.stringify({
        sessionId: session.sessionId,
        pages: [{ url: "https://example.com/", outputDir: "target-research/pages/home" }]
      }),
      "utf8"
    );
    await writeFile(path.join(sessionRoot, "target-research", "pages", "home", "raw-html.html"), "<h1>Home</h1>", "utf8");

    const result = await createFormalRoutesPass(tempRoot, session.sessionId);
    const css = await readFile(path.join(result.formalCloneRoot, "app", "globals.css"), "utf8");

    expect(result.files).toEqual([]);
    expect(css).not.toContain(".route-shell");
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
