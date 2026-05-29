import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { analyzeTarget } from "@planarian/crawler";
import type { CloneSession } from "@planarian/shared";
import { createCloneSession, createSessionId } from "./createCloneSession.js";
import { initializeAgentMemory } from "./agentMemory.js";
import { cloneSessionExists, getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface InitCloneSessionOptions {
  url: string;
  projectRoot: string;
  refresh?: boolean;
}

const SESSION_DIRECTORIES = [
  "target-research",
  "open-lovable-version",
  "formal-clone",
  "comparison",
  "references",
  "mock-data",
  "agent-memory"
];

export async function initCloneSession(options: InitCloneSessionOptions): Promise<CloneSession> {
  const sessionId = createSessionId(options.url);
  const sessionRoot = getSessionRoot(options.projectRoot, sessionId);

  if (!options.refresh && (await cloneSessionExists(options.projectRoot, sessionId))) {
    return readCloneSession(options.projectRoot, sessionId);
  }

  for (const directory of SESSION_DIRECTORIES) {
    await mkdir(path.join(sessionRoot, directory), { recursive: true });
  }

  const analysis = await analyzeTarget({
    url: options.url,
    outputDir: path.join(sessionRoot, "target-research")
  });

  const session = createCloneSession({
    url: options.url,
    title: analysis.title,
    description: analysis.description,
    classification: analysis.classification,
    requiresAuth: analysis.requiresAuth,
    hasApiRequests: analysis.hasApiRequests,
    hasHeavyClientRendering: analysis.hasHeavyClientRendering,
    detectedFrameworks: analysis.detectedFrameworks,
    notes: analysis.notes,
    network: analysis.network
  });

  await writeFile(
    path.join(sessionRoot, "target-research", "network-analysis.json"),
    `${JSON.stringify(analysis.network, null, 2)}\n`,
    "utf8"
  );
  await writeFile(path.join(sessionRoot, "clone-session.json"), `${JSON.stringify(session, null, 2)}\n`, "utf8");
  await initializeAgentMemory(sessionRoot, session);

  return session;
}
