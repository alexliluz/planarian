import type { CloneSession } from "@planarian/shared";
import { writeIntegrationFile, type WrittenIntegrationFile } from "./integrationFiles.js";

export interface RunOpenLovableOptions {
  sessionRoot: string;
  session: CloneSession;
}

export interface RunOpenLovableResult {
  files: WrittenIntegrationFile[];
}

export async function runOpenLovable(options: RunOpenLovableOptions): Promise<RunOpenLovableResult> {
  const files = [
    await writeIntegrationFile(options.sessionRoot, "open-lovable-version/OPEN_LOVABLE_TASK.md", renderOpenLovableTask(options.session)),
    await writeIntegrationFile(options.sessionRoot, "open-lovable-version/.env.example", renderOpenLovableEnvExample())
  ];

  return { files };
}

function renderOpenLovableTask(session: CloneSession): string {
  return `# Open Lovable Visual Draft Task

Target: ${session.target.normalizedUrl}
Session: ${session.sessionId}

## Role

Use Open Lovable as a fast visual draft generator only. Its output belongs in \`open-lovable-version/\` and must not be treated as the production codebase.

## Upstream Reference

- Repository: \`firecrawl/open-lovable\`
- Purpose in Planarian: quick visual reference generation from a public URL.

## Inputs

- Target URL: ${session.target.normalizedUrl}
- Desktop screenshot: \`../target-research/desktop.png\`
- Raw HTML: \`../target-research/raw-html.html\`
- Network summary: \`../target-research/network-analysis.json\`

## Expected Output

- A quick React visual draft under this directory.
- Notes about visual mismatches and missing dynamic sections.
- No private backend calls.
- No auth, payment, account, database, or trading behavior except local mock placeholders.

## Suggested Agent Steps

1. Set up Open Lovable separately if needed.
2. Use the target URL as the visual draft source.
3. Export or copy the generated draft into \`open-lovable-version/\`.
4. Compare the draft against \`../target-research/desktop.png\`.
5. Record useful visual observations in \`../comparison/open-lovable-notes.md\`.
`;
}

function renderOpenLovableEnvExample(): string {
  return `# Open Lovable environment placeholder
# Fill these only in a local private environment.
FIRECRAWL_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
E2B_API_KEY=
`;
}
