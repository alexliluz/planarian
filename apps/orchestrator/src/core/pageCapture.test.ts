import { describe, expect, it } from "vitest";
import { slugForPage } from "./pageCapture.js";

describe("slugForPage", () => {
  it("uses home for the root page", () => {
    expect(slugForPage({ pathname: "/" })).toBe("home");
  });

  it("creates stable nested page slugs", () => {
    expect(slugForPage({ pathname: "/stories/alkira-lumen" })).toBe("stories--alkira-lumen");
  });
});
