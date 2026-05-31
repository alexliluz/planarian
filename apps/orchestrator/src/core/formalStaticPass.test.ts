import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createFormalStaticPass, extractStaticContent, renderFormalStaticPass } from "./formalStaticPass.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("extractStaticContent", () => {
  it("extracts title, paragraphs, and links from simple HTML", () => {
    const content = extractStaticContent(
      `<html><body><h1>Example Domain</h1><p>This domain is for examples.</p><p><a href="https://iana.org/domains/example">Learn more</a></p></body></html>`,
      createSession()
    );

    expect(content.title).toBe("Example Domain");
    expect(content.paragraphs).toEqual(["This domain is for examples."]);
    expect(content.links).toEqual([{ label: "Learn more", href: "https://iana.org/domains/example" }]);
  });
});

describe("renderFormalStaticPass", () => {
  it("renders a Next.js page, CSS, data, and implementation notes", () => {
    const files = renderFormalStaticPass(createSession(), {
      title: "Example Domain",
      paragraphs: ["This domain is for examples."],
      links: [{ label: "Learn more", href: "https://iana.org/domains/example" }]
    });

    expect(files.map((file) => file.path)).toEqual([
      "app/page.tsx",
      "app/globals.css",
      "data/static-content.json",
      "STATIC_IMPLEMENTATION.md"
    ]);
    expect(files.find((file) => file.path === "app/page.tsx")?.content).toContain("static-content.json");
    expect(files.find((file) => file.path === "STATIC_IMPLEMENTATION.md")?.content).toContain("Static Formal Clone Implementation");
  });
});

describe("createFormalStaticPass", () => {
  it("writes static formal clone files from captured HTML", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-static-pass-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeFile(
      path.join(sessionRoot, "target-research", "raw-html.html"),
      `<html><body><h1>Example Domain</h1><p>This domain is for examples.</p></body></html>`,
      "utf8"
    );

    const result = await createFormalStaticPass(tempRoot, session.sessionId);
    const data = await readFile(path.join(result.formalCloneRoot, "data", "static-content.json"), "utf8");

    expect(result.files).toContain("formal-clone/STATIC_IMPLEMENTATION.md");
    expect(data).toContain("This domain is for examples.");
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
