import { Command } from "commander";
import { initCloneSession } from "../core/initCloneSession.js";
import { runDoctor } from "../core/doctor.js";
import { createFormalCloneTask, getFormalCloneStatus } from "../core/formalTask.js";
import { createFormalComparison } from "../core/formalCompare.js";
import { createFormalResearch } from "../core/formalResearch.js";
import { createFormalCloneScaffold } from "../core/formalScaffold.js";
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
