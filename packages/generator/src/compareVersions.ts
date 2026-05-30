import type { CloneSession } from "@planarian/shared";
import { writeIntegrationFile, type WrittenIntegrationFile } from "./integrationFiles.js";

export interface CompareVersionsOptions {
  sessionRoot: string;
  session: CloneSession;
}

export interface CompareVersionsResult {
  files: WrittenIntegrationFile[];
}

export async function compareVersions(options: CompareVersionsOptions): Promise<CompareVersionsResult> {
  const files = [
    await writeIntegrationFile(options.sessionRoot, "comparison/VERSION_COMPARISON_CHECKLIST.md", renderComparisonChecklist(options.session))
  ];

  return { files };
}

function renderComparisonChecklist(session: CloneSession): string {
  return `# Version Comparison Checklist

Target: ${session.target.normalizedUrl}
Session: ${session.sessionId}

## Compare

- \`../target-research/desktop.png\`
- \`../open-lovable-version/\`
- \`../formal-clone/\`

## Checks

- First viewport layout
- Typography scale
- Color relationships
- Spacing and alignment
- Header/navigation structure
- Main content order
- Responsive behavior
- Dynamic sections that need mock data

## Output

Record findings in this directory before creating React Grab repair tasks.
`;
}
