import { createAssetDownloadPlan } from "./assetDownloadPlan.js";
import { createAssetInventory } from "./assetInventory.js";
import { localizeAssets } from "./assetLocalize.js";
import { type AnalyzeTargetFunction, initCloneSession } from "./initCloneSession.js";
import { createSessionId } from "./createCloneSession.js";
import { capturePages } from "./pageCapture.js";
import { discoverPages } from "./pageDiscovery.js";
import { createFormalCloneScaffold } from "./formalScaffold.js";
import { createFormalResearch } from "./formalResearch.js";
import { validateFormalClone } from "./formalValidate.js";
import { createSessionRunbook } from "./sessionRunbook.js";

export interface ClonePipelineOptions {
  projectRoot: string;
  url: string;
  refresh?: boolean;
  pageLimit?: number;
  assetLimit?: number;
  assetDryRun?: boolean;
  skipPageCapture?: boolean;
  skipScaffold?: boolean;
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
}

const DEFAULT_PAGE_LIMIT = 5;

export async function runClonePipeline(options: ClonePipelineOptions): Promise<ClonePipelineResult> {
  const sessionId = createSessionId(options.url);
  const steps: ClonePipelineStep[] = [];

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

  const validation = await validateFormalClone(options.projectRoot, sessionId, { runBuild: options.runBuild });
  steps.push({
    name: "formal-validate",
    status: validation.ready ? "ok" : "failed",
    detail: options.runBuild ? "build checked" : validation.reportPath
  });

  return { sessionId, steps };
}
