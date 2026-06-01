import { Command } from "commander";
import { createAssetDownloadPlan } from "../core/assetDownloadPlan.js";
import { createAssetInventory } from "../core/assetInventory.js";
import { localizeAssets } from "../core/assetLocalize.js";
import { capturePages } from "../core/pageCapture.js";
import { runClonePipeline } from "../core/clonePipeline.js";
import { discoverPages } from "../core/pageDiscovery.js";
import { initCloneSession } from "../core/initCloneSession.js";
import { createSessionRunbook } from "../core/sessionRunbook.js";
import { runDoctor } from "../core/doctor.js";
import { createFormalCloneTask, getFormalCloneStatus } from "../core/formalTask.js";
import { createFormalComparison } from "../core/formalCompare.js";
import { createFormalResearch } from "../core/formalResearch.js";
import { createFormalCloneScaffold } from "../core/formalScaffold.js";
import { createFormalStaticPass } from "../core/formalStaticPass.js";
import { validateFormalClone } from "../core/formalValidate.js";
import {
  createReactGrabInstallTaskFile,
  createReactGrabRepairTask,
  createUpstreamIntegrationTasks
} from "../core/upstreamIntegrations.js";
import { createSessionId } from "../core/createCloneSession.js";
import { cloneSessionExists, listCloneSessions, readCloneSession } from "../core/sessionRepository.js";

export interface CreateProgramOptions {
  getProjectRoot?: () => string;
}

export function createProgram(options: CreateProgramOptions = {}): Command {
  const getProjectRoot = options.getProjectRoot ?? defaultProjectRoot;
  const program = new Command();

  program
    .name("planarian")
    .description("Agent-friendly website UI clone orchestrator")
    .version("0.1.0");

  program
    .command("init")
    .argument("<url>", "Target public website URL")
    .option("--refresh", "Re-analyze and overwrite generated target research for an existing session")
    .description("Create and analyze a CloneSession for a target URL")
    .action(async (url: string, commandOptions: { refresh?: boolean }) => {
      const projectRoot = getProjectRoot();
      const sessionId = createSessionId(url);
      const existed = await cloneSessionExists(projectRoot, sessionId);
      const session = await initCloneSession({ url, projectRoot, refresh: commandOptions.refresh });
      const action = commandOptions.refresh && existed ? "Refreshed" : existed ? "Reused" : "Created";
      console.log(`${action} session ${session.sessionId}`);
      console.log(`Classification: ${session.target.classification}`);
    });

  program
    .command("pipeline")
    .argument("<url>", "Target public website URL")
    .option("--refresh", "Re-analyze and overwrite generated target research for an existing session")
    .option("--pages <count>", "Maximum discovered pages to capture", parsePositiveInteger)
    .option("--assets <count>", "Maximum high-priority public assets to download", parsePositiveInteger)
    .option("--asset-dry-run", "Plan asset localization without downloading assets")
    .option("--skip-page-capture", "Skip discovered page capture")
    .option("--skip-scaffold", "Skip formal clone scaffold creation")
    .option("--run-build", "Run formal clone build validation at the end")
    .description("Run the default Planarian capture, research, asset, scaffold, and validation workflow")
    .action(
      async (
        url: string,
        commandOptions: {
          refresh?: boolean;
          pages?: number;
          assets?: number;
          assetDryRun?: boolean;
          skipPageCapture?: boolean;
          skipScaffold?: boolean;
          runBuild?: boolean;
        }
      ) => {
        const result = await runClonePipeline({
          projectRoot: getProjectRoot(),
          url,
          refresh: commandOptions.refresh,
          pageLimit: commandOptions.pages,
          assetLimit: commandOptions.assets,
          assetDryRun: commandOptions.assetDryRun,
          skipPageCapture: commandOptions.skipPageCapture,
          skipScaffold: commandOptions.skipScaffold,
          runBuild: commandOptions.runBuild
        });
        console.log(`Pipeline completed for ${result.sessionId}`);
        for (const step of result.steps) {
          console.log(`${step.status.toUpperCase()} ${step.name}: ${step.detail}`);
        }
      }
    );

  program
    .command("list")
    .description("List CloneSessions in the current project")
    .action(async () => {
      const sessions = await listCloneSessions(getProjectRoot());
      if (sessions.length === 0) {
        console.log("No sessions found.");
        return;
      }

      for (const session of sessions) {
        console.log(`${session.sessionId}\t${session.target.classification}\t${session.target.normalizedUrl}`);
      }
    });

  program
    .command("show")
    .argument("<session-id>", "CloneSession id")
    .description("Show a CloneSession summary")
    .action(async (sessionId: string) => {
      const session = await readCloneSession(getProjectRoot(), sessionId);
      console.log(JSON.stringify(session, null, 2));
    });

  program
    .command("doctor")
    .description("Check the local Planarian project setup")
    .action(async () => {
      const report = await runDoctor(getProjectRoot());
      console.log(`Project root: ${report.projectRoot}`);
      for (const check of report.checks) {
        console.log(`${check.ok ? "OK" : "FAIL"} ${check.name}: ${check.detail}`);
      }

      if (!report.ok) {
        process.exitCode = 1;
      }
    });

  program
    .command("asset-inventory")
    .argument("<session-id>", "CloneSession id")
    .description("Create public asset inventory and visual planning notes for a CloneSession")
    .action(async (sessionId: string) => {
      const result = await createAssetInventory(getProjectRoot(), sessionId);
      console.log(`Created asset inventory for ${result.sessionId}`);
      for (const file of result.files) {
        console.log(`- ${file}`);
      }
    });

  program
    .command("asset-download-plan")
    .argument("<session-id>", "CloneSession id")
    .description("Create a public asset localization, reference, and ignore plan")
    .action(async (sessionId: string) => {
      const result = await createAssetDownloadPlan(getProjectRoot(), sessionId);
      console.log(`Created asset download plan for ${result.sessionId}`);
      console.log(`Path: ${result.planPath}`);
    });

  program
    .command("asset-localize")
    .argument("<session-id>", "CloneSession id")
    .option("--limit <count>", "Maximum localize-first assets to download", parsePositiveInteger)
    .option("--dry-run", "Write the manifest without downloading assets")
    .description("Download high-priority public assets into formal-clone/public/assets")
    .action(async (sessionId: string, commandOptions: { limit?: number; dryRun?: boolean }) => {
      const result = await localizeAssets({
        projectRoot: getProjectRoot(),
        sessionId,
        limit: commandOptions.limit,
        dryRun: commandOptions.dryRun
      });
      console.log(`Localized assets for ${result.sessionId}`);
      for (const asset of result.assets) {
        console.log(`${asset.status.toUpperCase()} ${asset.publicPath}: ${asset.url}`);
      }
      console.log(`Manifest: ${result.manifestPath}`);
    });

  program
    .command("discover-pages")
    .argument("<session-id>", "CloneSession id")
    .option("--max <count>", "Maximum pages to include in the discovery queue", parsePositiveInteger)
    .description("Discover same-host public page URLs from captured homepage HTML")
    .action(async (sessionId: string, commandOptions: { max?: number }) => {
      const result = await discoverPages(getProjectRoot(), sessionId, commandOptions.max);
      console.log(`Discovered ${result.pageCount} page(s) for ${result.sessionId}`);
      for (const file of result.files) {
        console.log(`- ${file}`);
      }
    });

  program
    .command("capture-pages")
    .argument("<session-id>", "CloneSession id")
    .option("--limit <count>", "Maximum pages to capture from target-research/site-map.json", parsePositiveInteger)
    .option("--refresh", "Re-capture pages that already have saved HTML")
    .description("Capture HTML, desktop screenshots, and network summaries for discovered pages")
    .action(async (sessionId: string, commandOptions: { limit?: number; refresh?: boolean }) => {
      const result = await capturePages({
        projectRoot: getProjectRoot(),
        sessionId,
        limit: commandOptions.limit,
        refresh: commandOptions.refresh
      });
      console.log(`Captured ${result.captured.length} page(s) for ${result.sessionId}`);
      for (const page of result.captured) {
        console.log(`${page.skipped ? "SKIP" : "OK"} ${page.url}: ${page.outputDir}`);
      }
      console.log(`Manifest: ${result.manifestPath}`);
    });

  program
    .command("session-runbook")
    .argument("<session-id>", "CloneSession id")
    .description("Create a session runbook with open, run, validate, and next-step instructions")
    .action(async (sessionId: string) => {
      const result = await createSessionRunbook(getProjectRoot(), sessionId);
      console.log(`Created session runbook for ${result.sessionId}`);
      console.log(`Path: ${result.runbookPath}`);
    });

  program
    .command("formal-task")
    .argument("<session-id>", "CloneSession id")
    .description("Create a formal clone task bundle for a CloneSession")
    .action(async (sessionId: string) => {
      const result = await createFormalCloneTask(getProjectRoot(), sessionId);
      console.log(`Created formal clone task bundle for ${result.sessionId}`);
      console.log(`Path: ${result.taskBundlePath}`);
    });

  program
    .command("formal-status")
    .argument("<session-id>", "CloneSession id")
    .description("Check whether a CloneSession has the inputs needed for formal clone work")
    .action(async (sessionId: string) => {
      const report = await getFormalCloneStatus(getProjectRoot(), sessionId);
      console.log(`Formal clone status for ${report.sessionId}: ${report.ready ? "ready" : "not ready"}`);
      for (const check of report.checks) {
        console.log(`${check.ok ? "OK" : "FAIL"} ${check.name}: ${check.detail}`);
      }

      if (!report.ready) {
        process.exitCode = 1;
      }
    });

  program
    .command("formal-compare")
    .argument("<session-id>", "CloneSession id")
    .description("Create a formal clone comparison report and repair queue")
    .action(async (sessionId: string) => {
      const result = await createFormalComparison(getProjectRoot(), sessionId);
      console.log(`Created formal clone comparison for ${result.sessionId}`);
      for (const input of result.inputs) {
        console.log(`${input.exists ? "OK" : "MISSING"} ${input.name}: ${input.path}`);
      }
      for (const file of result.files) {
        console.log(`- ${file}`);
      }
    });

  program
    .command("formal-research")
    .argument("<session-id>", "CloneSession id")
    .description("Create formal clone research notes from captured target analysis")
    .action(async (sessionId: string) => {
      const result = await createFormalResearch(getProjectRoot(), sessionId);
      console.log(`Created formal clone research for ${result.sessionId}`);
      for (const file of result.files) {
        console.log(`- ${file}`);
      }
    });

  program
    .command("formal-static-pass")
    .argument("<session-id>", "CloneSession id")
    .description("Generate a simple static first pass inside formal-clone from captured HTML")
    .action(async (sessionId: string) => {
      const result = await createFormalStaticPass(getProjectRoot(), sessionId);
      console.log(`Created formal static pass for ${result.sessionId}`);
      for (const file of result.files) {
        console.log(`- ${file}`);
      }
    });

  program
    .command("formal-validate")
    .argument("<session-id>", "CloneSession id")
    .option("--run-build", "Run the formal clone build command after static checks")
    .description("Validate formal clone app structure and optionally run its build")
    .action(async (sessionId: string, commandOptions: { runBuild?: boolean }) => {
      const report = await validateFormalClone(getProjectRoot(), sessionId, {
        runBuild: commandOptions.runBuild
      });
      console.log(`Formal clone validation for ${report.sessionId}: ${report.ready ? "ready" : "not ready"}`);
      for (const check of report.checks) {
        console.log(`${check.ok ? "OK" : "FAIL"} ${check.name}: ${check.detail}`);
      }
      for (const command of report.commands) {
        console.log(`${command.ok ? "OK" : "FAIL"} ${command.command}`);
      }
      console.log(`Report: ${report.reportPath}`);

      if (!report.ready) {
        process.exitCode = 1;
      }
    });

  program
    .command("formal-scaffold")
    .argument("<session-id>", "CloneSession id")
    .option("--force", "Overwrite existing scaffold files")
    .description("Create a minimal runnable Next.js scaffold in formal-clone")
    .action(async (sessionId: string, commandOptions: { force?: boolean }) => {
      const result = await createFormalCloneScaffold(getProjectRoot(), sessionId, {
        force: commandOptions.force
      });
      console.log(`Created formal clone scaffold for ${result.sessionId}`);
      console.log(`Path: ${result.formalCloneRoot}`);
      console.log(`Written: ${result.writtenFiles.length}`);
      console.log(`Skipped: ${result.skippedFiles.length}`);
    });

  program
    .command("integrate-upstreams")
    .argument("<session-id>", "CloneSession id")
    .description("Create integration task files for Open Lovable, formal clone, comparison, and React Grab workflows")
    .action(async (sessionId: string) => {
      const result = await createUpstreamIntegrationTasks(getProjectRoot(), sessionId);
      console.log(`Created upstream integration tasks for ${result.sessionId}`);
      for (const file of result.files) {
        console.log(`- ${file}`);
      }
    });

  program
    .command("react-grab-install-task")
    .argument("<session-id>", "CloneSession id")
    .description("Create a React Grab install task for the formal clone app")
    .action(async (sessionId: string) => {
      const result = await createReactGrabInstallTaskFile(getProjectRoot(), sessionId);
      console.log(`Created React Grab install task for ${result.sessionId}`);
      console.log(`Title: ${result.title}`);
      console.log(`Path: ${result.taskPath}`);
    });

  program
    .command("react-grab-task")
    .argument("<session-id>", "CloneSession id")
    .requiredOption("--context <path>", "Path to a React Grab context JSON or text file")
    .description("Create a focused UI repair task from React Grab selected element context")
    .action(async (sessionId: string, commandOptions: { context: string }) => {
      const result = await createReactGrabRepairTask(getProjectRoot(), sessionId, commandOptions.context);
      console.log(`Created React Grab repair task for ${result.sessionId}`);
      console.log(`Title: ${result.title}`);
      console.log(`Path: ${result.taskPath}`);
    });

  return program;
}

function defaultProjectRoot(): string {
  return process.env.PLANARIAN_PROJECT_ROOT ?? process.cwd();
}

function parsePositiveInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`Expected a positive integer, received: ${value}`);
  }
  return parsed;
}
