import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { inspectFormalClone, renderFormalValidationReport, validateFormalClone } from "./formalValidate.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("inspectFormalClone", () => {
  it("reports ready static checks for a minimal Next.js formal clone", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-validate-"));
    const formalCloneRoot = path.join(tempRoot, "formal-clone");
    await writeMinimalFormalClone(formalCloneRoot);

    const checks = await inspectFormalClone(formalCloneRoot);

    expect(checks.every((check) => check.ok)).toBe(true);
    expect(checks.some((check) => check.name === "script build" && check.detail === "next build")).toBe(true);
  });

  it("reports missing scripts and route entry", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-validate-"));
    const formalCloneRoot = path.join(tempRoot, "formal-clone");
    await mkdir(formalCloneRoot, { recursive: true });
    await writeFile(path.join(formalCloneRoot, "package.json"), JSON.stringify({ scripts: {} }), "utf8");

    const checks = await inspectFormalClone(formalCloneRoot);

    expect(checks.some((check) => check.name === "route entry" && !check.ok)).toBe(true);
    expect(checks.some((check) => check.name === "script build" && !check.ok)).toBe(true);
  });
});

describe("validateFormalClone", () => {
  it("writes a validation report", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-validate-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(sessionRoot, { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeMinimalFormalClone(path.join(sessionRoot, "formal-clone"));

    const report = await validateFormalClone(tempRoot, session.sessionId);
    const content = await readFile(report.reportPath, "utf8");

    expect(report.ready).toBe(true);
    expect(content).toContain("Formal Clone Validation");
    expect(content).toContain("Status: ready");
  });

  it("renders command guidance when no commands ran", () => {
    const content = renderFormalValidationReport({
      sessionId: "demo",
      formalCloneRoot: "formal-clone",
      ready: true,
      checks: [{ name: "package.json", ok: true, detail: "found" }],
      commands: [],
      reportPath: "formal-clone/VALIDATION.md"
    });

    expect(content).toContain("formal-validate <session-id> --run-build");
  });
});

async function writeMinimalFormalClone(formalCloneRoot: string): Promise<void> {
  await mkdir(path.join(formalCloneRoot, "app"), { recursive: true });
  await writeFile(
    path.join(formalCloneRoot, "package.json"),
    JSON.stringify({
      scripts: {
        dev: "next dev",
        build: "next build"
      },
      dependencies: {
        next: "^15.0.0",
        react: "^19.0.0",
        "react-dom": "^19.0.0"
      }
    }),
    "utf8"
  );
  await writeFile(path.join(formalCloneRoot, "README.md"), "# Formal Clone", "utf8");
  await writeFile(path.join(formalCloneRoot, "app", "page.tsx"), "export default function Page() { return null; }", "utf8");
  await writeFile(path.join(formalCloneRoot, "app", "globals.css"), "body { margin: 0; }", "utf8");
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
