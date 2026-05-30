import type { ParsedGrabContext } from "./parseGrabContext.js";

export interface PatchTask {
  title: string;
  body: string;
}

export function createPatchTask(context: ParsedGrabContext): PatchTask {
  const titleTarget = context.componentName ?? context.selector ?? "selected UI element";

  return {
    title: `Repair ${titleTarget}`,
    body: `# React Grab UI Repair Task

## Selected Element

- Component: ${context.componentName ?? "Unknown"}
- File: ${context.filePath ?? "Unknown"}
- Selector: ${context.selector ?? "Unknown"}

## Context Summary

${context.summary}

## Repair Goal

Use the selected element context to make a focused UI repair inside \`formal-clone/\`.

## Safety

- Keep the repair scoped to the selected component or nearest owning component.
- Do not add private backend calls.
- Use local mock data when dynamic behavior is needed.
- Update the session changelog after changes.

## Notes

${context.notes.length > 0 ? context.notes.map((note) => `- ${note}`).join("\n") : "- No parser notes."}

## Raw Context

\`\`\`text
${context.source ?? ""}
\`\`\`
`
  };
}
