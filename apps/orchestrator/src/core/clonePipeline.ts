import { createAssetDownloadPlan } from "./assetDownloadPlan.js";
import { createAssetInventory } from "./assetInventory.js";
import { localizeAssets } from "./assetLocalize.js";
import { type AnalyzeTargetFunction, initCloneSession } from "./initCloneSession.js";
import { createSessionId } from "./createCloneSession.js";
import { capturePages } from "./pageCapture.js";
import { discoverPages } from "./pageDiscovery.js";
import { createFormalCloneScaffold } from "./formalScaffold.js";
import { createFormalResearch } from "./formalResearch.js";
import { createFormalRoutesPass } from "./formalRoutesPass.js";
import { validateFormalClone } from "./formalValidate.js";
import { createSessionRunbook } from "./sessionRunbook.js";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface ClonePipelineOptions {
  projectRoot: string;
  url: string;
  refresh?: boolean;
  pageLimit?: number;
  assetLimit?: number;
  assetDryRun?: boolean;
  skipPageCapture?: boolean;
  skipScaffold?: boolean;
  skipRoutesPass?: boolean;
  runBuild?: boolean;
  analyzer?: AnalyzeTargetFunction;
}

export interface ClonePipelineStep {
  name: string;
  status: "ok" | "skipped" | "failed";
  detail: string;
}

export interface ClonePipelineResult {
  sessionId: string;
  steps: ClonePipelineStep[];
  reportPath: string;
  jsonReportPath: string;
}

const DEFAULT_PAGE_LIMIT = 5;

export async function runClonePipeline(options: ClonePipelineOptions): Promise<ClonePipelineResult> {
  const sessionId = createSessionId(options.url);
  const steps: ClonePipelineStep[] = [];
  const startedAt = new Date().toISOString();

  const session = await initCloneSession({
    url: options.url,
    projectRoot: options.projectRoot,
    refresh: options.refresh,
    analyzer: options.analyzer
  });
  steps.push({ name: "init", status: "ok", detail: `Session ${session.sessionId}` });

  await createSessionRunbook(options.projectRoot, sessionId);
  steps.push({ name: "session-runbook", status: "ok", detail: "RUNBOOK.md" });

  const discovery = await discoverPages(options.projectRoot, sessionId);
  steps.push({ name: "discover-pages", status: "ok", detail: `${discovery.pageCount} page(s)` });

  if (options.skipPageCapture) {
    steps.push({ name: "capture-pages", status: "skipped", detail: "Skipped by option" });
  } else {
    const capture = await capturePages({
      projectRoot: options.projectRoot,
      sessionId,
      limit: options.pageLimit ?? DEFAULT_PAGE_LIMIT,
      refresh: options.refresh
    });
    steps.push({ name: "capture-pages", status: "ok", detail: `${capture.captured.length} page(s)` });
  }

  const inventory = await createAssetInventory(options.projectRoot, sessionId);
  steps.push({ name: "asset-inventory", status: "ok", detail: inventory.files.join(", ") });

  const assetPlan = await createAssetDownloadPlan(options.projectRoot, sessionId);
  steps.push({ name: "asset-download-plan", status: "ok", detail: assetPlan.planPath });

  if ((options.assetLimit ?? 0) > 0) {
    const assets = await localizeAssets({
      projectRoot: options.projectRoot,
      sessionId,
      limit: options.assetLimit,
      dryRun: options.assetDryRun
    });
    const downloaded = assets.assets.filter((asset) => asset.status === "downloaded").length;
    const planned = assets.assets.filter((asset) => asset.status === "planned").length;
    const failed = assets.assets.filter((asset) => asset.status === "failed").length;
    steps.push({
      name: "asset-localize",
      status: failed > 0 ? "failed" : "ok",
      detail: `${downloaded} downloaded, ${planned} planned, ${failed} failed`
    });
  } else {
    steps.push({ name: "asset-localize", status: "skipped", detail: "Use --assets <count> to download public assets" });
  }

  const research = await createFormalResearch(options.projectRoot, sessionId);
  steps.push({ name: "formal-research", status: "ok", detail: `${research.files.length} file(s)` });

  if (options.skipScaffold) {
    steps.push({ name: "formal-scaffold", status: "skipped", detail: "Skipped by option" });
  } else {
    const scaffold = await createFormalCloneScaffold(options.projectRoot, sessionId);
    steps.push({
      name: "formal-scaffold",
      status: "ok",
      detail: `${scaffold.writtenFiles.length} written, ${scaffold.skippedFiles.length} skipped`
    });
  }

  if (options.skipPageCapture || options.skipRoutesPass) {
    steps.push({
      name: "formal-routes-pass",
      status: "skipped",
      detail: options.skipRoutesPass ? "Skipped by option" : "Skipped because page capture was skipped"
    });
  } else {
    const routes = await createFormalRoutesPass(options.projectRoot, sessionId);
    steps.push({ name: "formal-routes-pass", status: "ok", detail: `${routes.files.length} file(s)` });
  }

  const validation = await validateFormalClone(options.projectRoot, sessionId, { runBuild: options.runBuild });
  steps.push({
    name: "formal-validate",
    status: validation.ready ? "ok" : "failed",
    detail: options.runBuild ? "build checked" : validation.reportPath
  });

  const finishedAt = new Date().toISOString();
  const report = await writePipelineReport({
    projectRoot: options.projectRoot,
    sessionId,
    startedAt,
    finishedAt,
    steps,
    options: {
      pageLimit: options.pageLimit ?? DEFAULT_PAGE_LIMIT,
      assetLimit: options.assetLimit ?? 0,
      assetDryRun: options.assetDryRun ?? false,
      skipPageCapture: options.skipPageCapture ?? false,
      skipScaffold: options.skipScaffold ?? false,
      skipRoutesPass: options.skipRoutesPass ?? false,
      runBuild: options.runBuild ?? false,
      refresh: options.refresh ?? false
    }
  });

  return { sessionId, steps, reportPath: report.reportPath, jsonReportPath: report.jsonReportPath };
}

interface PipelineReportInput {
  projectRoot: string;
  sessionId: string;
  startedAt: string;
  finishedAt: string;
  steps: ClonePipelineStep[];
  options: {
    pageLimit: number;
    assetLimit: number;
    assetDryRun: boolean;
    skipPageCapture: boolean;
    skipScaffold: boolean;
    skipRoutesPass: boolean;
    runBuild: boolean;
    refresh: boolean;
  };
}

async function writePipelineReport(input: PipelineReportInput): Promise<{ reportPath: string; jsonReportPath: string }> {
  const session = await readCloneSession(input.projectRoot, input.sessionId);
  const sessionRoot = getSessionRoot(input.projectRoot, input.sessionId);
  const reportPath = path.join(sessionRoot, "PIPELINE_RUN.md");
  const jsonReportPath = path.join(sessionRoot, "pipeline-run.json");
  const failedSteps = input.steps.filter((step) => step.status === "failed");
  const skippedSteps = input.steps.filter((step) => step.status === "skipped");
  const summary = {
    sessionId: input.sessionId,
    targetUrl: session.target.normalizedUrl,
    classification: session.target.classification,
    status: failedSteps.length > 0 ? "needs-attention" : "complete",
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    options: input.options,
    steps: input.steps,
    nextActions: createNextActions(input.steps)
  };

  await mkdir(sessionRoot, { recursive: true });
  await writeFile(jsonReportPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  await writeFile(reportPath, renderPipelineRunReport(summary, skippedSteps.length), "utf8");

  return { reportPath, jsonReportPath };
}

function createNextActions(steps: ClonePipelineStep[]): string[] {
  const failed = steps.filter((step) => step.status === "failed").map((step) => step.name);
  if (failed.length > 0) {
    return [
      `Review failed step(s): ${failed.join(", ")}`,
      "Open formal-clone/VALIDATION.md if formal validation failed.",
      "Rerun the pipeline with a smaller page or asset budget if the target is unstable."
    ];
  }

  const actions = [
    "Review PIPELINE_RUN.md, target-research/PAGE_DISCOVERY.md, and formal-clone/docs/research/04-multi-page-map.md.",
    "Open formal-clone/ and start the visible UI reconstruction from captured reference materials.",
    "Use asset-localize with an explicit limit when public assets should be copied into formal-clone/public/assets."
  ];

  if (steps.some((step) => step.name === "asset-localize" && step.status === "skipped")) {
    actions.push("Run the pipeline again with --assets <count> when local public assets are needed.");
  }

  return actions;
}

function renderPipelineRunReport(
  summary: {
    sessionId: string;
    targetUrl: string;
    classification: string;
    status: string;
    startedAt: string;
    finishedAt: string;
    options: PipelineReportInput["options"];
    steps: ClonePipelineStep[];
    nextActions: string[];
  },
  skippedStepCount: number
): string {
  const rows = summary.steps
    .map((step) => `| ${step.name} | ${step.status} | ${step.detail.replace(/\|/g, "\\|")} |`)
    .join("\n");
  const optionRows = Object.entries(summary.options)
    .map(([key, value]) => `- ${key}: ${String(value)}`)
    .join("\n");
  const nextActions = summary.nextActions.map((action) => `- ${action}`).join("\n");

  return `# Pipeline Run

Session: ${summary.sessionId}
Target: ${summary.targetUrl}
Classification: ${summary.classification}
Status: ${summary.status}
Started: ${summary.startedAt}
Finished: ${summary.finishedAt}

## Options

${optionRows}

## Steps

| Step | Status | Detail |
| --- | --- | --- |
${rows}

## Result

- Failed steps: ${summary.steps.filter((step) => step.status === "failed").length}
- Skipped steps: ${skippedStepCount}
- JSON report: pipeline-run.json

## Next Actions

${nextActions}
`;
}
