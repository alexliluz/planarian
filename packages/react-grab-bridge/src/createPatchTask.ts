import type { ParsedGrabContext } from "./parseGrabContext.js";

export interface PatchTask {
  title: string;
  body: string;
}

export function createPatchTask(context: ParsedGrabContext): PatchTask {
  // TODO: Phase 2 integration point for component-level UI repair task creation.
  return {
    title: "React Grab UI repair task placeholder",
    body: `Context summary: ${context.summary}`
  };
}

