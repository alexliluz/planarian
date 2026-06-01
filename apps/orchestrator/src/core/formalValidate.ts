import { access, readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

const execFileAsync = promisify(execFile);

export interface FormalValidateOptions {
  runBuild?: boolean;
}

export interface FormalValidationCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface FormalValidationCommandResult {
  command: string;
  ok: boolean;
  stdout: string;
  stderr: string;
}

export interface FormalValidationReport {
  sessionId: string;
  formalCloneRoot: string;
  ready: boolean;
  checks: FormalValidationCheck[];
  commands: FormalValidationCommandResult[];
  reportPath: string;
}

interface FormalPackageJson {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function validateFormalClone(
  projectRoot: string,
  sessionId: string,
  options: FormalValidateOptions = {}
): Promise<FormalValidationReport> {
  await readCloneSession(projectRoot, sessionId);
  const formalCloneRoot = path.join(getSessionRoot(projectRoot, sessionId), "formal-clone");
  const checks = await inspectFormalClone(formalCloneRoot);
  const commands: FormalValidationCommandResult[] = [];

  if (options.runBuild) {
    commands.push(await runFormalBuild(formalCloneRoot));
  }

  const ready = checks.every((check) => check.ok) && commands.every((command) => command.ok);
  const reportPath = path.join(formalCloneRoot, "VALIDATION.md");
  await writeFile(reportPath, renderFormalValidationReport({ sessionId, formalCloneRoot, ready, checks, commands, reportPath }), "utf8");

  return {
    sessionId,
    formalCloneRoot,
    ready,
    checks,
    commands,
    reportPath
  };
}

export async function inspectFormalClone(formalCloneRoot: string): Promise<FormalValidationCheck[]> {
  const checks: FormalValidationCheck[] = [];
  const packageJsonPath = path.join(formalCloneRoot, "package.json");
  const packageJson = await readPackageJson(packageJsonPath);

  checks.push(await fileCheck("package.json", packageJsonPath));
  checks.push(await fileCheck("README.md", path.join(formalCloneRoot, "README.md")));
  checks.push(await anyFileCheck("route entry", [
    path.join(formalCloneRoot, "app", "page.tsx"),
    path.join(formalCloneRoot, "app", "page.jsx"),
    path.join(formalCloneRoot, "pages", "index.tsx"),
    path.join(formalCloneRoot, "pages", "index.jsx")
  ]));
  checks.push(await anyFileCheck("global styles", [
    path.join(formalCloneRoot, "app", "globals.css"),
    path.join(formalCloneRoot, "styles", "globals.css")
  ]));

  if (packageJson) {
    checks.push(scriptCheck(packageJson, "dev"));
    checks.push(scriptCheck(packageJson, "build"));
    checks.push(dependencyCheck(packageJson, "react"));
    checks.push(dependencyCheck(packageJson, "react-dom"));
    checks.push(dependencyCheck(packageJson, "next"));
  } else {
    checks.push({ name: "script dev", ok: false, detail: "package.json could not be parsed" });
    checks.push({ name: "script build", ok: false, detail: "package.json could not be parsed" });
    checks.push({ name: "dependency react", ok: false, detail: "package.json could not be parsed" });
    checks.push({ name: "dependency react-dom", ok: false, detail: "package.json could not be parsed" });
    checks.push({ name: "dependency next", ok: false, detail: "package.json could not be parsed" });
  }

  return checks;
}

export function renderFormalValidationReport(report: FormalValidationReport): string {
  return `# Formal Clone Validation

Session: ${report.sessionId}
Formal clone root: ${report.formalCloneRoot}
Status: ${report.ready ? "ready" : "not ready"}

## Static Checks

${report.checks.map((check) => `- ${check.ok ? "[x]" : "[ ]"} ${check.name}: ${check.detail}`).join("\n")}

## Commands

${report.commands.length > 0 ? report.commands.map(renderCommandResult).join("\n\n") : "- No commands were run. Use \`formal-validate <session-id> --run-build\` when dependencies are installed."}

## Next

- Fix failed checks before starting detailed visual repair.
- Keep \`../agent-memory/CHANGELOG_AGENT.md\` updated after formal clone changes.
- Use \`../comparison/REPAIR_QUEUE.md\` for focused repair work.
`;
}

async function readPackageJson(packageJsonPath: string): Promise<FormalPackageJson | undefined> {
  try {
    return JSON.parse(await readFile(packageJsonPath, "utf8")) as FormalPackageJson;
  } catch {
    return undefined;
  }
}

async function fileCheck(name: string, filePath: string): Promise<FormalValidationCheck> {
  try {
    await access(filePath);
    return { name, ok: true, detail: "found" };
  } catch {
    return { name, ok: false, detail: `missing at ${filePath}` };
  }
}

async function anyFileCheck(name: string, filePaths: string[]): Promise<FormalValidationCheck> {
  for (const filePath of filePaths) {
    try {
      await access(filePath);
      return { name, ok: true, detail: `found ${filePath}` };
    } catch {
      // Continue checking alternatives.
    }
  }

  return { name, ok: false, detail: `missing one of ${filePaths.join(", ")}` };
}

function scriptCheck(packageJson: FormalPackageJson, scriptName: string): FormalValidationCheck {
  const script = packageJson.scripts?.[scriptName];
  return {
    name: `script ${scriptName}`,
    ok: Boolean(script),
    detail: script ? script : "missing"
  };
}

function dependencyCheck(packageJson: FormalPackageJson, dependencyName: string): FormalValidationCheck {
  const version = packageJson.dependencies?.[dependencyName] ?? packageJson.devDependencies?.[dependencyName];
  return {
    name: `dependency ${dependencyName}`,
    ok: Boolean(version),
    detail: version ? version : "missing"
  };
}

async function runFormalBuild(formalCloneRoot: string): Promise<FormalValidationCommandResult> {
  const executable = process.platform === "win32" ? "cmd.exe" : "corepack";
  const args = process.platform === "win32" ? ["/c", "corepack", "pnpm", "build"] : ["pnpm", "build"];
  const command = "corepack pnpm build";

  try {
    const result = await execFileAsync(executable, args, {
      cwd: formalCloneRoot,
      timeout: 120_000,
      windowsHide: true
    });
    return {
      command,
      ok: true,
      stdout: result.stdout,
      stderr: result.stderr
    };
  } catch (error) {
    const failed = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string };
    return {
      command,
      ok: false,
      stdout: failed.stdout ?? "",
      stderr: failed.stderr ?? failed.message
    };
  }
}

function renderCommandResult(result: FormalValidationCommandResult): string {
  return `### ${result.command}

- Status: ${result.ok ? "passed" : "failed"}

\`\`\`text
${trimCommandOutput(result.stdout) || "(no stdout)"}
\`\`\`

\`\`\`text
${trimCommandOutput(result.stderr) || "(no stderr)"}
\`\`\``;
}

function trimCommandOutput(output: string): string {
  return output
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "")
    .trim()
    .slice(0, 4000);
}
