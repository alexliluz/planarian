import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createFormalCloneScaffold, renderFormalCloneScaffold } from "./formalScaffold.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("renderFormalCloneScaffold", () => {
  it("renders a minimal Next.js scaffold file set", () => {
    const files = renderFormalCloneScaffold(createSession());
    const paths = files.map((file) => file.path);

    expect(paths).toContain("package.json");
    expect(paths).toContain("app/page.tsx");
    expect(paths).toContain("app/layout.tsx");
    expect(paths).toContain("data/target-summary.json");
  });
});

describe("createFormalCloneScaffold", () => {
  it("writes scaffold files into formal-clone", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-scaffold-"));
    await writeSession(tempRoot, createSession());

    const result = await createFormalCloneScaffold(tempRoot, "demo");
    const packageJson = await readFile(path.join(result.formalCloneRoot, "package.json"), "utf8");

    expect(result.writtenFiles).toContain("package.json");
    expect(result.skippedFiles).toEqual([]);
    expect(JSON.parse(packageJson)).toMatchObject({
      name: "planarian-formal-clone-demo",
      scripts: {
        dev: "next dev"
      }
    });
  });

  it("skips existing files by default", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-scaffold-"));
    await writeSession(tempRoot, createSession());
    await createFormalCloneScaffold(tempRoot, "demo");

    const result = await createFormalCloneScaffold(tempRoot, "demo");

    expect(result.writtenFiles).toEqual([]);
    expect(result.skippedFiles).toContain("package.json");
  });

  it("overwrites existing files when force is true", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-scaffold-"));
    await writeSession(tempRoot, createSession());
    const first = await createFormalCloneScaffold(tempRoot, "demo");
    await writeFile(path.join(first.formalCloneRoot, "README.md"), "custom", "utf8");

    const result = await createFormalCloneScaffold(tempRoot, "demo", { force: true });
    const readme = await readFile(path.join(result.formalCloneRoot, "README.md"), "utf8");

    expect(result.writtenFiles).toContain("README.md");
    expect(readme).toContain("Formal Clone Scaffold");
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
      notes: ["Signals were inconclusive."]
    },
    screenshots: {
      desktop: "target-research/desktop.png"
    },
    network: [],
    versions: {
      formalClone: "formal-clone"
    },
    status: "analyzed"
  };
}

