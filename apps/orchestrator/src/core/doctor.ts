import { access } from "node:fs/promises";
import path from "node:path";
import { getSessionsRoot, listCloneSessions } from "./sessionRepository.js";

export interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface DoctorReport {
  projectRoot: string;
  checks: DoctorCheck[];
  ok: boolean;
}

export async function runDoctor(projectRoot: string): Promise<DoctorReport> {
  const checks: DoctorCheck[] = [];

  checks.push(await pathExistsCheck("package.json", path.join(projectRoot, "package.json")));
  checks.push(await pathExistsCheck("pnpm-workspace.yaml", path.join(projectRoot, "pnpm-workspace.yaml")));
  checks.push(await pathExistsCheck("workspace/sessions", getSessionsRoot(projectRoot)));

  const sessions = await listCloneSessions(projectRoot);
  checks.push({
    name: "clone sessions",
    ok: true,
    detail: `${sessions.length} session(s) found`
  });

  return {
    projectRoot,
    checks,
    ok: checks.every((check) => check.ok)
  };
}

async function pathExistsCheck(name: string, targetPath: string): Promise<DoctorCheck> {
  try {
    await access(targetPath);
    return { name, ok: true, detail: "found" };
  } catch {
    return { name, ok: false, detail: `missing at ${targetPath}` };
  }
}

