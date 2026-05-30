import type { CloneSession } from "@planarian/shared";
import { writeIntegrationFile, type WrittenIntegrationFile } from "./integrationFiles.js";

export interface RunFormalCloneOptions {
  sessionRoot: string;
  session: CloneSession;
}

export interface RunFormalCloneResult {
  files: WrittenIntegrationFile[];
}

export async function runFormalClone(options: RunFormalCloneOptions): Promise<RunFormalCloneResult> {
  const files = [
    await writeIntegrationFile(options.sessionRoot, "formal-clone/FORMAL_CLONE_PIPELINE.md", renderFormalClonePipeline(options.session)),
    await writeIntegrationFile(options.sessionRoot, "formal-clone/AGENTS.md", renderFormalCloneAgents(options.session))
  ];

  return { files };
}

function renderFormalClonePipeline(session: CloneSession): string {
  return `# Formal Clone Pipeline

Target: ${session.target.normalizedUrl}
Session: ${session.sessionId}

## Role

Use the ai-website-cloner-template approach as the formal engineering workflow for the final clone codebase.

## Upstream Reference

- Repository: \`JCodesMore/ai-website-cloner-template\`
- Purpose in Planarian: clean, agent-driven Next.js reconstruction workflow.

## Planarian Inputs

- \`../clone-session.json\`
- \`../target-research/raw-html.html\`
- \`../target-research/desktop.png\`
- \`../target-research/network-analysis.json\`
- \`TASK_BUNDLE.md\`

## Formal Build Stages

1. Inspect target research and safety constraints.
2. Create or update the local Next.js scaffold.
3. Rebuild visible layout and static content first.
4. Add mock data for dynamic sections.
5. Compare against \`../target-research/desktop.png\`.
6. Run lint/build validation.
7. Update \`../agent-memory/CHANGELOG_AGENT.md\`.

## Safety

- Do not call private APIs.
- Do not bypass auth or paywalls.
- Use mock data for private, authenticated, payment, trading, database, or user-data behavior.
`;
}

function renderFormalCloneAgents(session: CloneSession): string {
  return `# Formal Clone Agent Instructions

Target: ${session.target.normalizedUrl}

## Agent Contract

- Work inside this \`formal-clone/\` directory.
- Treat \`TASK_BUNDLE.md\` and \`FORMAL_CLONE_PIPELINE.md\` as the local source of truth.
- Keep changes scoped and testable.
- Prefer small commits/checkpoints.
- Update \`../agent-memory/CHANGELOG_AGENT.md\` after meaningful changes.

## Cursor Auto Tasks

- Add tests for generated components.
- Refine UI differences found by screenshot comparison.
- Keep dynamic sections backed by local mock data.

## Codex Tasks

- Maintain scaffolding, CLI integration, and safety checks.
- Add deterministic generators before adding upstream automation.
`;
}
