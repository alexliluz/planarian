import { Command } from "commander";
import { initCloneSession } from "../core/initCloneSession.js";
import { runDoctor } from "../core/doctor.js";
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

  return program;
}

function defaultProjectRoot(): string {
  return process.env.PLANARIAN_PROJECT_ROOT ?? process.cwd();
}
