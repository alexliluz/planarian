import { describe, expect, it } from "vitest";
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
});

