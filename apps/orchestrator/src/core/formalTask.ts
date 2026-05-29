import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession } from "@planarian/shared";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface FormalTaskResult {
  sessionId: string;
  taskBundlePath: string;
}

export async function createFormalCloneTask(projectRoot: string, sessionId: string): Promise<FormalTaskResult> {
  const session = await readCloneSession(projectRoot, sessionId);
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const formalCloneRoot = path.join(sessionRoot, "formal-clone");
  const taskBundlePath = path.join(formalCloneRoot, "TASK_BUNDLE.md");

  await mkdir(formalCloneRoot, { recursive: true });
  await writeFile(taskBundlePath, renderFormalCloneTaskBundle(session), "utf8");

  return {
    sessionId,
    taskBundlePath
  };
}

export function renderFormalCloneTaskBundle(session: CloneSession): string {
  return `# Formal Clone Task Bundle

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}
Classification: ${session.target.classification}
Clone mode: ${session.target.cloneMode}

## Goal

Rebuild the visible public UI of the target website as a clean, modern Next.js application inside this session's \`formal-clone/\` directory.

## Required Inputs

- \`../clone-session.json\`
- \`../target-research/raw-html.html\`
- \`../target-research/desktop.png\`
- \`../target-research/network-analysis.json\`
- \`../agent-memory/PROMPTS.md\`
- \`../agent-memory/DECISIONS.md\`

## Safety Constraints

- Do not bypass authentication, paywalls, private APIs, private data, or backend systems.
- Do not call private backend endpoints discovered during analysis.
- Use mock data for authenticated, payment, trading, database, user-data, or private API behavior.
- Rebuild only visible UI, public page structure, static assets, front-end interactions, and mock-data flows.

## Expected Output

- A maintainable Next.js codebase in \`formal-clone/\`.
- Mock data for dynamic or private sections.
- Clear component boundaries.
- Validation scripts documented in the generated app README.
- Changes recorded in \`../agent-memory/CHANGELOG_AGENT.md\`.

## Agent Instructions

1. Inspect the required inputs before writing code.
2. Create the smallest useful scaffold first.
3. Keep the implementation testable and easy for Cursor Auto to continue.
4. Preserve this task bundle as the source of truth for formal clone generation.

## Target Notes

${session.target.notes.length > 0 ? session.target.notes.map((note) => `- ${note}`).join("\n") : "- No classifier notes recorded."}
`;
}

