import { describe, expect, it } from "vitest";
import type { CloneSession } from "@planarian/shared";
import { createReactGrabInstallTask } from "./createInstallTask.js";
import { createPatchTask } from "./createPatchTask.js";
import { parseGrabContext } from "./parseGrabContext.js";

describe("react grab bridge", () => {
  it("parses structured context and creates a repair task", () => {
    const parsed = parseGrabContext({
      componentName: "Hero",
      filePath: "app/page.tsx",
      selector: "[data-testid=hero]"
    });
    const task = createPatchTask(parsed);

    expect(parsed.summary).toContain("Hero");
    expect(task.title).toBe("Repair Hero");
    expect(task.body).toContain("app/page.tsx");
  });

  it("creates an install task for formal clone repair setup", () => {
    const task = createReactGrabInstallTask({ session: createSession() });

    expect(task.title).toBe("Install React Grab for demo");
    expect(task.body).toContain("Work inside `formal-clone/`");
    expect(task.body).toContain("react-grab-task demo");
  });
});

function createSession(): CloneSession {
  return {
    sessionId: "demo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    target: {
      url: "https://example.com",
      normalizedUrl: "https://example.com/",
      hostname: "example.com",
      classification: "static",
      cloneMode: "visual-plus-interactions",
      requiresAuth: false,
      hasApiRequests: false,
      hasHeavyClientRendering: false,
      detectedFrameworks: [],
      notes: []
    },
    screenshots: { desktop: "target-research/desktop.png" },
    network: [],
    versions: { formalClone: "formal-clone" },
    status: "analyzed"
  };
}
