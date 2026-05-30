import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession } from "@planarian/shared";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface FormalCompareResult {
  sessionId: string;
  comparisonRoot: string;
  files: string[];
  inputs: CompareInputStatus[];
}

export interface CompareInputStatus {
  name: string;
  path: string;
  exists: boolean;
  detail: string;
}

const EXPECTED_INPUTS = [
  { name: "Desktop screenshot", path: "target-research/desktop.png" },
  { name: "Raw HTML", path: "target-research/raw-html.html" },
  { name: "Network analysis", path: "target-research/network-analysis.json" },
  { name: "Open Lovable task", path: "open-lovable-version/OPEN_LOVABLE_TASK.md" },
  { name: "Formal clone task bundle", path: "formal-clone/TASK_BUNDLE.md" },
  { name: "Formal clone pipeline", path: "formal-clone/FORMAL_CLONE_PIPELINE.md" },
  { name: "Formal clone research", path: "formal-clone/docs/research/README.md" }
];

export async function createFormalComparison(projectRoot: string, sessionId: string): Promise<FormalCompareResult> {
  const session = await readCloneSession(projectRoot, sessionId);
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const comparisonRoot = path.join(sessionRoot, "comparison");
  const inputs = await inspectCompareInputs(sessionRoot);
  const formalCloneFiles = await listFormalCloneFiles(sessionRoot);
  const files = [
    {
      path: "FORMAL_COMPARISON.md",
      content: renderFormalComparison(session, inputs, formalCloneFiles)
    },
    {
      path: "REPAIR_QUEUE.md",
      content: renderRepairQueue(session, inputs)
    }
  ];

  await mkdir(comparisonRoot, { recursive: true });
  for (const file of files) {
    await writeFile(path.join(comparisonRoot, file.path), file.content, "utf8");
  }

  return {
    sessionId,
    comparisonRoot,
    files: files.map((file) => path.posix.join("comparison", file.path)),
    inputs
  };
}

export async function inspectCompareInputs(sessionRoot: string): Promise<CompareInputStatus[]> {
  const statuses: CompareInputStatus[] = [];

  for (const input of EXPECTED_INPUTS) {
    const absolutePath = path.join(sessionRoot, input.path);
    try {
      await access(absolutePath);
      statuses.push({
        name: input.name,
        path: input.path,
        exists: true,
        detail: "found"
      });
    } catch {
      statuses.push({
        name: input.name,
        path: input.path,
        exists: false,
        detail: "missing"
      });
    }
  }

  return statuses;
}

export function renderFormalComparison(
  session: CloneSession,
  inputs: CompareInputStatus[],
  formalCloneFiles: string[]
): string {
  const missing = inputs.filter((input) => !input.exists);
  const present = inputs.filter((input) => input.exists);

  return `# Formal Comparison

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}
Classification: ${session.target.classification}

This document coordinates comparison between the captured target, the quick visual draft, and the formal clone work area.

## Input Status

### Present

${present.length > 0 ? present.map((input) => `- ${input.name}: \`${input.path}\``).join("\n") : "- No expected inputs found."}

### Missing

${missing.length > 0 ? missing.map((input) => `- ${input.name}: \`${input.path}\``).join("\n") : "- No expected inputs are missing."}

## Formal Clone File Snapshot

${formalCloneFiles.length > 0 ? formalCloneFiles.slice(0, 80).map((file) => `- \`../formal-clone/${file}\``).join("\n") : "- No formal clone files found yet."}

## Comparison Procedure

1. Open \`../target-research/desktop.png\` as the visual baseline.
2. Review \`../formal-clone/docs/research/\` for target structure and implementation notes.
3. If \`../open-lovable-version/\` exists, use it only as a fast visual reference.
4. Inspect \`../formal-clone/\` for current implementation coverage.
5. Record mismatches in \`REPAIR_QUEUE.md\`.
6. Use React Grab repair tasks only after the formal clone app can run locally.

## Visual Checks

- First viewport layout and content order.
- Header, navigation, and primary call-to-action placement.
- Typography scale, weight, and line height.
- Color relationships and surface contrast.
- Spacing, alignment, and responsive behavior.
- Missing static content from the captured HTML or screenshot.
- Dynamic sections that need mock data.

## Safety Checks

- No real private backend calls.
- No authentication bypass.
- No payment, trading, account, database, or user-data behavior against the target.
- API-like behavior uses local mock data or placeholder routes only.
`;
}

export function renderRepairQueue(session: CloneSession, inputs: CompareInputStatus[]): string {
  const missing = inputs.filter((input) => !input.exists);

  return `# Repair Queue

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}

Use this file to queue formal clone repair work. Keep each item small enough for one Codex or Cursor pass.

## Blocking Inputs

${missing.length > 0 ? missing.map((input) => `- [ ] Create or regenerate \`${input.path}\``).join("\n") : "- No blocking comparison inputs are currently missing."}

## Visual Repair Items

- [ ] Compare first viewport against \`../target-research/desktop.png\`.
- [ ] Verify global typography and spacing.
- [ ] Verify header/navigation structure.
- [ ] Verify main content order.
- [ ] Verify dynamic sections use mock data when needed.

## React Grab Candidates

- [ ] Run the formal clone app locally.
- [ ] Select the most visibly mismatched component with React Grab.
- [ ] Create a task with \`corepack pnpm cli react-grab-task ${session.sessionId} --context <grab-context.json>\`.

## Notes

- Keep \`../agent-memory/CHANGELOG_AGENT.md\` updated after repair work.
- Do not modify \`../clone-session.json\` during repair tasks.
`;
}

async function listFormalCloneFiles(sessionRoot: string): Promise<string[]> {
  const formalCloneRoot = path.join(sessionRoot, "formal-clone");

  try {
    return await listFiles(formalCloneRoot);
  } catch {
    return [];
  }
}

async function listFiles(root: string, relativeRoot = ""): Promise<string[]> {
  const entries = await readdir(path.join(root, relativeRoot), { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") {
      continue;
    }

    const relativePath = path.posix.join(relativeRoot.replace(/\\/g, "/"), entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(root, relativePath)));
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
}
