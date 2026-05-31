import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession } from "@planarian/shared";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface SessionRunbookResult {
  sessionId: string;
  runbookPath: string;
}

export async function createSessionRunbook(projectRoot: string, sessionId: string): Promise<SessionRunbookResult> {
  const session = await readCloneSession(projectRoot, sessionId);
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const runbookPath = path.join(sessionRoot, "RUNBOOK.md");

  await mkdir(sessionRoot, { recursive: true });
  await writeFile(runbookPath, renderSessionRunbook(session, sessionRoot), "utf8");

  return {
    sessionId,
    runbookPath
  };
}

export function renderSessionRunbook(session: CloneSession, sessionRoot: string): string {
  const formalCloneRoot = path.join(sessionRoot, "formal-clone");

  return `# Planarian Session Runbook

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}
Classification: ${session.target.classification}

## Open The Captured Target

- Screenshot: \`target-research/desktop.png\`
- Raw HTML: \`target-research/raw-html.html\`
- Network summary: \`target-research/network-analysis.json\`

## Run The Formal Clone App

\`\`\`bash
cd ${formalCloneRoot}
corepack pnpm install
corepack pnpm dev
\`\`\`

Then open:

\`\`\`text
http://localhost:3000
\`\`\`

## Validate The Formal Clone

From the Planarian repository root:

\`\`\`bash
corepack pnpm cli formal-validate ${session.sessionId}
corepack pnpm cli formal-validate ${session.sessionId} --run-build
\`\`\`

Use \`--run-build\` after dependencies have been installed inside \`formal-clone/\`.

## Continue The Workflow

\`\`\`bash
corepack pnpm cli formal-task ${session.sessionId}
corepack pnpm cli formal-research ${session.sessionId}
corepack pnpm cli formal-scaffold ${session.sessionId}
corepack pnpm cli formal-static-pass ${session.sessionId}
corepack pnpm cli formal-compare ${session.sessionId}
corepack pnpm cli react-grab-install-task ${session.sessionId}
\`\`\`

## Key Files

- \`clone-session.json\`
- \`formal-clone/TASK_BUNDLE.md\`
- \`formal-clone/docs/research/README.md\`
- \`formal-clone/STATIC_IMPLEMENTATION.md\`
- \`formal-clone/VALIDATION.md\`
- \`comparison/FORMAL_COMPARISON.md\`
- \`comparison/REPAIR_QUEUE.md\`
- \`react-grab-repairs/INSTALL_REACT_GRAB.md\`
- \`agent-memory/CHANGELOG_AGENT.md\`

## Safety

- Rebuild visible public UI only.
- Do not bypass authentication, paywalls, private APIs, or private backend systems.
- Use local mock data for dynamic or private behavior.
`;
}
