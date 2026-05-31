import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { discoverInternalPages, discoverPages, extractLinks, normalizeInternalUrl } from "./pageDiscovery.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("extractLinks", () => {
  it("extracts href and readable labels", () => {
    const links = extractLinks('<a class="nav" href="/people"><span>People</span></a>');

    expect(links).toEqual([{ href: "/people", text: "People" }]);
  });
});

describe("normalizeInternalUrl", () => {
  it("keeps same-host URLs and removes query/hash noise", () => {
    const base = new URL("https://example.com/");

    expect(normalizeInternalUrl("/about?utm_source=x#team", base)?.href).toBe("https://example.com/about");
  });

  it("rejects external and non-navigation URLs", () => {
    const base = new URL("https://example.com/");

    expect(normalizeInternalUrl("https://other.example/about", base)).toBeUndefined();
    expect(normalizeInternalUrl("mailto:hello@example.com", base)).toBeUndefined();
    expect(normalizeInternalUrl("#content", base)).toBeUndefined();
  });
});

describe("discoverInternalPages", () => {
  it("prioritizes core navigation pages before deep pages", () => {
    const pages = discoverInternalPages(
      `
      <a href="/stories/deep-post">Deep post</a>
      <a href="/people">People</a>
      <a href="/portfolio/">Portfolio</a>
      <a href="https://example.com/about?ref=home">About</a>
      <a href="https://external.example/">External</a>
      `,
      createSession()
    );

    expect(pages.map((page) => page.pathname)).toEqual(["/", "/about", "/people", "/portfolio", "/stories/deep-post"]);
  });
});

describe("discoverPages", () => {
  it("writes site-map and page discovery report", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-pages-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "raw-html.html"), '<a href="/people">People</a>', "utf8");

    const result = await discoverPages(tempRoot, session.sessionId);
    const siteMap = JSON.parse(await readFile(path.join(sessionRoot, "target-research", "site-map.json"), "utf8"));
    const report = await readFile(path.join(sessionRoot, "target-research", "PAGE_DISCOVERY.md"), "utf8");

    expect(result.pageCount).toBe(2);
    expect(siteMap[1]).toMatchObject({ pathname: "/people" });
    expect(report).toContain("capture-pages demo --limit 10");
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
      title: "Example",
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
