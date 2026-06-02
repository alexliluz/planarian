import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runClonePipeline } from "./clonePipeline.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("runClonePipeline", () => {
  it("runs the default agent-friendly workflow with an injected analyzer", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-pipeline-"));
    const result = await runClonePipeline({
      projectRoot: tempRoot,
      url: "https://example.com",
      skipPageCapture: true,
      analyzer: async ({ outputDir }) => {
        await mkdir(outputDir, { recursive: true });
        await writeFile(outputDirPath(outputDir, "raw-html.html"), '<h1>Example</h1><a href="/about">About</a>', "utf8");
        await writeFile(outputDirPath(outputDir, "desktop.png"), "fake png", "utf8");
        return {
          title: "Example",
          description: "Example target",
          classification: "static",
          requiresAuth: false,
          hasApiRequests: false,
          hasHeavyClientRendering: false,
          detectedFrameworks: [],
          notes: [],
          network: [
            {
              url: "https://example.com/home-hero.webp",
              method: "GET",
              resourceType: "image",
              status: 200,
              contentType: "image/webp",
              isApiCandidate: false
            }
          ]
        };
      }
    });

    const sessionRoot = path.join(tempRoot, "outputs", "sessions", result.sessionId);
    const runbook = await readFile(path.join(sessionRoot, "RUNBOOK.md"), "utf8");
    const siteMap = await readFile(path.join(sessionRoot, "target-research", "site-map.json"), "utf8");
    const validation = await readFile(path.join(sessionRoot, "formal-clone", "VALIDATION.md"), "utf8");
    const pipelineReport = await readFile(path.join(sessionRoot, "PIPELINE_RUN.md"), "utf8");
    const pipelineJson = await readFile(path.join(sessionRoot, "pipeline-run.json"), "utf8");

    expect(result.steps.map((step) => step.name)).toEqual([
      "init",
      "session-runbook",
      "discover-pages",
      "capture-pages",
      "asset-inventory",
      "asset-download-plan",
      "asset-localize",
      "formal-research",
      "formal-scaffold",
      "formal-validate"
    ]);
    expect(runbook).toContain("Planarian Session Runbook");
    expect(siteMap).toContain("https://example.com/about");
    expect(validation).toContain("Status: ready");
    expect(result.reportPath).toBe(path.join(sessionRoot, "PIPELINE_RUN.md"));
    expect(result.jsonReportPath).toBe(path.join(sessionRoot, "pipeline-run.json"));
    expect(pipelineReport).toContain("# Pipeline Run");
    expect(pipelineReport).toContain("| capture-pages | skipped | Skipped by option |");
    expect(pipelineJson).toContain('"status": "complete"');
  });
});

function outputDirPath(outputDir: string, fileName: string): string {
  return path.join(outputDir, fileName);
}
