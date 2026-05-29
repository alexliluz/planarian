import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession } from "@planarian/shared";

export async function initializeAgentMemory(sessionRoot: string, session: CloneSession): Promise<void> {
  const agentMemoryRoot = path.join(sessionRoot, "agent-memory");
  await mkdir(agentMemoryRoot, { recursive: true });

  await writeFile(path.join(agentMemoryRoot, "TASKS.md"), tasksTemplate(session), "utf8");
  await writeFile(path.join(agentMemoryRoot, "DECISIONS.md"), decisionsTemplate(), "utf8");
  await writeFile(path.join(agentMemoryRoot, "CHANGELOG_AGENT.md"), changelogTemplate(), "utf8");
  await writeFile(path.join(agentMemoryRoot, "PROMPTS.md"), promptsTemplate(session), "utf8");
}

function tasksTemplate(session: CloneSession): string {
  return `# Tasks

Target: ${session.target.normalizedUrl}

- [ ] Generate Open Lovable visual draft
- [ ] Generate formal clone using ai-website-cloner-template
- [ ] Compare two generated versions
- [ ] Install React Grab in formal clone
- [ ] Create UI repair tasks
- [ ] Add mock data for dynamic sections
- [ ] Run lint/build validation
`;
}

function decisionsTemplate(): string {
  return `# Decisions

- formal-clone is the main codebase.
- open-lovable-version is only visual reference.
- backend/API/auth features should use mock data unless explicitly owned by us.
- Planarian does not bypass auth, paywalls, private APIs, or private backend systems.
`;
}

function changelogTemplate(): string {
  return `# Agent Changelog

Use this format for future Codex/Cursor changes:

## YYYY-MM-DD - Agent Name

- Summary:
- Files changed:
- Tests run:
- Notes:
`;
}

function promptsTemplate(session: CloneSession): string {
  return `# Reusable Prompts

## Formal Clone Agent Prompt

Rebuild the visible UI of ${session.target.normalizedUrl} inside formal-clone. Use mock data for private, authenticated, payment, database, or backend behavior. Do not call or reproduce private backend systems.

## UI Repair Prompt

Use the React Grab context and current formal-clone implementation to repair the selected component. Keep changes scoped, add or update tests where practical, and update CHANGELOG_AGENT.md.
`;
}

