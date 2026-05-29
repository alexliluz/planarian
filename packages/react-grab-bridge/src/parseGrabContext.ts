export interface ParsedGrabContext {
  raw: unknown;
  summary: string;
}

export function parseGrabContext(raw: unknown): ParsedGrabContext {
  // TODO: Phase 2 integration point for aidenybai/react-grab selected element context.
  return {
    raw,
    summary: "React Grab parsing is not implemented in Phase 1."
  };
}

