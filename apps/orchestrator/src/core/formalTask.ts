import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession } from "@planarian/shared";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface FormalTaskResult {
  sessionId: string;
  taskBundlePath: string;
}

export interface FormalStatusCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface FormalStatusReport {
  sessionId: string;
  ready: boolean;
  checks: FormalStatusCheck[];
}

const REQUIRED_FORMAL_INPUTS = [
  "clone-session.json",
  "target-research/raw-html.html",
  "target-research/desktop.png",
  "target-research/network-analysis.json",
  "agent-memory/PROMPTS.md",
  "agent-memory/DECISIONS.md"
];

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

export async function getFormalCloneStatus(projectRoot: string, sessionId: string): Promise<FormalStatusReport> {
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const checks: FormalStatusCheck[] = [];

  for (const relativePath of REQUIRED_FORMAL_INPUTS) {
    checks.push(await fileCheck(relativePath, path.join(sessionRoot, relativePath)));
  }

  checks.push(await fileCheck("formal-clone/TASK_BUNDLE.md", path.join(sessionRoot, "formal-clone", "TASK_BUNDLE.md")));

  return {
    sessionId,
    ready: checks.every((check) => check.ok),
    checks
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

${REQUIRED_FORMAL_INPUTS.map((input) => `- \`../${input}\``).join("\n")}

## Target Summary

- URL: ${session.target.normalizedUrl}
- Hostname: ${session.target.hostname}
- Title: ${session.target.title ?? "Unknown"}
- Classification: ${session.target.classification}
- Requires auth: ${String(session.target.requiresAuth)}
- Has API requests: ${String(session.target.hasApiRequests)}
- Heavy client rendering: ${String(session.target.hasHeavyClientRendering)}
- Detected frameworks: ${session.target.detectedFrameworks.length > 0 ? session.target.detectedFrameworks.join(", ") : "none"}

## Asset Inventory

- Primary desktop screenshot: \`../${session.screenshots.desktop ?? "target-research/desktop.png"}\`
- Raw HTML snapshot: \`../target-research/raw-html.html\`
- Network summary: \`../target-research/network-analysis.json\`
- Mock data directory: \`../mock-data/\`
- Reference directory: \`../references/\`

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

## Acceptance Criteria

- The first viewport visually matches the desktop screenshot at a practical engineering level.
- Major layout regions, typography scale, spacing, and color relationships are represented.
- Static content visible in the captured page is present in the formal clone.
- Dynamic/private sections use local mock data only.
- No real login, payment, trading, account, database, or private backend calls are implemented.
- The generated app has documented install, dev, build, and validation commands.
- The final agent updates \`../agent-memory/CHANGELOG_AGENT.md\`.

## Agent Instructions

1. Inspect the required inputs before writing code.
2. Create the smallest useful scaffold first.
3. Keep the implementation testable and easy for Cursor Auto to continue.
4. Preserve this task bundle as the source of truth for formal clone generation.

## Target Notes

${session.target.notes.length > 0 ? session.target.notes.map((note) => `- ${note}`).join("\n") : "- No classifier notes recorded."}
`;
}

async function fileCheck(name: string, filePath: string): Promise<FormalStatusCheck> {
  try {
    await access(filePath);
    return { name, ok: true, detail: "found" };
  } catch {
    return { name, ok: false, detail: `missing at ${filePath}` };
  }
}
