import { mkdtemp, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createSessionId } from "../apps/orchestrator/src/core/createCloneSession.js";

const tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-smoke-"));
const targetUrl = "https://example.com";

try {
  const packageManager = resolvePnpmCommand();
  await run(packageManager.command, [...packageManager.prefixArgs, "cli", "init", targetUrl], {
    cwd: process.cwd(),
    env: { ...process.env, PLANARIAN_PROJECT_ROOT: tempRoot }
  });

  const sessionId = createSessionId(targetUrl);
  const sessionRoot = path.join(tempRoot, "workspace", "sessions", sessionId);
  const requiredFiles = [
    "clone-session.json",
    "target-research/raw-html.html",
    "target-research/desktop.png",
    "target-research/network-analysis.json",
    "agent-memory/TASKS.md",
    "agent-memory/DECISIONS.md",
    "agent-memory/CHANGELOG_AGENT.md",
    "agent-memory/PROMPTS.md"
  ];

  for (const file of requiredFiles) {
    await stat(path.join(sessionRoot, file));
  }

  console.log(`Smoke test passed for ${sessionId}`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

function resolvePnpmCommand(): { command: string; prefixArgs: string[] } {
  const pnpmCommand = findCommand("pnpm");
  if (pnpmCommand) {
    return { command: pnpmCommand, prefixArgs: [] };
  }

  const corepackCommand = findCommand("corepack");
  return { command: corepackCommand ?? "corepack", prefixArgs: ["pnpm"] };
}

function findCommand(command: string): string | undefined {
  const lookup = process.platform === "win32" ? "where.exe" : "which";
  const probe = spawnSync(lookup, [command], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });

  if (probe.status !== 0) {
    return undefined;
  }

  const matches = probe.stdout.split(/\r?\n/).filter(Boolean);
  if (process.platform !== "win32") {
    return matches[0];
  }

  return (
    matches.find((match) => /\.(cmd|exe|bat)$/i.test(match)) ??
    matches.map((match) => `${match}.cmd`).find((match) => existsSync(match)) ??
    matches[0]
  );
}

function run(command: string, args: string[], options: { cwd: string; env: NodeJS.ProcessEnv }): Promise<void> {
  return new Promise((resolve, reject) => {
    const spawnCommand = process.platform === "win32" && /\.(cmd|bat)$/i.test(command) ? "cmd.exe" : command;
    const spawnArgs =
      process.platform === "win32" && /\.(cmd|bat)$/i.test(command)
        ? ["/d", "/s", "/c", command, ...args]
        : args;

    const child = spawn(spawnCommand, spawnArgs, {
      cwd: options.cwd,
      env: options.env,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
      }
    });
  });
}
