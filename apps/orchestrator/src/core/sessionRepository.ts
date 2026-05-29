import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { CloneSession } from "@planarian/shared";

export function getSessionsRoot(projectRoot: string): string {
  return path.join(projectRoot, "workspace", "sessions");
}

export function getSessionRoot(projectRoot: string, sessionId: string): string {
  return path.join(getSessionsRoot(projectRoot), sessionId);
}

export function getCloneSessionPath(projectRoot: string, sessionId: string): string {
  return path.join(getSessionRoot(projectRoot, sessionId), "clone-session.json");
}

export async function cloneSessionExists(projectRoot: string, sessionId: string): Promise<boolean> {
  try {
    await access(getCloneSessionPath(projectRoot, sessionId));
    return true;
  } catch {
    return false;
  }
}

export async function readCloneSession(projectRoot: string, sessionId: string): Promise<CloneSession> {
  const content = await readFile(getCloneSessionPath(projectRoot, sessionId), "utf8");
  return JSON.parse(content) as CloneSession;
}

export async function listCloneSessions(projectRoot: string): Promise<CloneSession[]> {
  const sessionsRoot = getSessionsRoot(projectRoot);

  let entries: string[];
  try {
    entries = await readdir(sessionsRoot);
  } catch {
    return [];
  }

  const sessions: CloneSession[] = [];
  for (const entry of entries) {
    try {
      sessions.push(await readCloneSession(projectRoot, entry));
    } catch {
      // Ignore incomplete or non-session directories.
    }
  }

  return sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

