export interface ParsedGrabContext {
  raw: unknown;
  summary: string;
  componentName?: string;
  filePath?: string;
  selector?: string;
  source?: string;
  notes: string[];
}

export function parseGrabContext(raw: unknown): ParsedGrabContext {
  const source = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
  const record = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const componentName = readString(record, ["componentName", "name", "displayName"]);
  const filePath = readString(record, ["filePath", "path", "filename"]);
  const selector = readString(record, ["selector", "cssSelector"]);
  const notes: string[] = [];

  if (!componentName) {
    notes.push("No component name was found in the React Grab context.");
  }
  if (!filePath) {
    notes.push("No source file path was found in the React Grab context.");
  }

  return {
    raw,
    summary: [componentName, filePath, selector].filter(Boolean).join(" | ") || "React Grab context parsed without structured identifiers.",
    componentName,
    filePath,
    selector,
    source,
    notes
  };
}

function readString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}
