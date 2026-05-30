import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { compareVersions, runFormalClone, runOpenLovable } from "@planarian/generator";
import { createPatchTask, parseGrabContext } from "@planarian/react-grab-bridge";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface UpstreamIntegrationResult {
  sessionId: string;
  files: string[];
}

export interface ReactGrabTaskResult {
  sessionId: string;
  taskPath: string;
  title: string;
}

export async function createUpstreamIntegrationTasks(projectRoot: string, sessionId: string): Promise<UpstreamIntegrationResult> {
  const session = await readCloneSession(projectRoot, sessionId);
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const openLovable = await runOpenLovable({ sessionRoot, session });
  const formalClone = await runFormalClone({ sessionRoot, session });
  const comparison = await compareVersions({ sessionRoot, session });

  return {
    sessionId,
    files: [...openLovable.files, ...formalClone.files, ...comparison.files].map((file) => file.path)
  };
}

export async function createReactGrabRepairTask(
  projectRoot: string,
  sessionId: string,
  contextFilePath: string
): Promise<ReactGrabTaskResult> {
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const rawText = await readFile(contextFilePath, "utf8");
  const raw = parseContextText(rawText);
  const task = createPatchTask(parseGrabContext(raw));
  const repairsRoot = path.join(sessionRoot, "react-grab-repairs");
  const taskPath = path.join(repairsRoot, `${Date.now()}-${slugify(task.title)}.md`);

  await mkdir(repairsRoot, { recursive: true });
  await writeFile(taskPath, task.body, "utf8");

  return {
    sessionId,
    taskPath,
    title: task.title
  };
}

function parseContextText(rawText: string): unknown {
  try {
    return JSON.parse(rawText);
  } catch {
    return rawText;
  }
}

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "repair-task";
}

