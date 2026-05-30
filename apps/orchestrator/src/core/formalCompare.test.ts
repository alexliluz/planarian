import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createFormalComparison, renderFormalComparison, renderRepairQueue } from "./formalCompare.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("formal comparison rendering", () => {
  it("renders missing inputs, visual checks, and repair instructions", () => {
    const session = createSession();
    const inputs = [
      { name: "Desktop screenshot", path: "target-research/desktop.png", exists: true, detail: "found" },
      { name: "Formal clone research", path: "formal-clone/docs/research/README.md", exists: false, detail: "missing" }
    ];

    const comparison = renderFormalComparison(session, inputs, ["app/page.tsx"]);
    const queue = renderRepairQueue(session, inputs);

    expect(comparison).toContain("Formal Comparison");
    expect(comparison).toContain("`../formal-clone/app/page.tsx`");
    expect(comparison).toContain("No real private backend calls");
    expect(queue).toContain("Create or regenerate `formal-clone/docs/research/README.md`");
    expect(queue).toContain("react-grab-task demo");
  });
});

describe("createFormalComparison", () => {
  it("writes comparison report and repair queue", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-formal-compare-"));
    const session = createSession();
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", session.sessionId);
    await mkdir(path.join(sessionRoot, "target-research"), { recursive: true });
    await mkdir(path.join(sessionRoot, "formal-clone", "docs", "research"), { recursive: true });
    await writeFile(path.join(sessionRoot, "clone-session.json"), JSON.stringify(session), "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "desktop.png"), "fake png", "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "raw-html.html"), "<html></html>", "utf8");
    await writeFile(path.join(sessionRoot, "target-research", "network-analysis.json"), "[]", "utf8");
    await writeFile(path.join(sessionRoot, "formal-clone", "TASK_BUNDLE.md"), "# Task", "utf8");
    await writeFile(path.join(sessionRoot, "formal-clone", "docs", "research", "README.md"), "# Research", "utf8");

    const result = await createFormalComparison(tempRoot, session.sessionId);
    const report = await readFile(path.join(result.comparisonRoot, "FORMAL_COMPARISON.md"), "utf8");
    const queue = await readFile(path.join(result.comparisonRoot, "REPAIR_QUEUE.md"), "utf8");

    expect(result.files).toEqual(["comparison/FORMAL_COMPARISON.md", "comparison/REPAIR_QUEUE.md"]);
    expect(result.inputs.some((input) => input.name === "Open Lovable task" && !input.exists)).toBe(true);
    expect(report).toContain("Input Status");
    expect(queue).toContain("Visual Repair Items");
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
