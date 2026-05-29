import { describe, expect, it } from "vitest";
import { createSessionId, normalizeTargetUrl } from "./createCloneSession.js";

describe("createSessionId", () => {
  it("generates stable ids for the same normalized target URL", () => {
    expect(createSessionId("https://example.com/")).toBe(createSessionId("https://example.com"));
  });

  it("includes a readable hostname prefix", () => {
    expect(createSessionId("https://www.example.com/demo")).toMatch(/^example-com-[a-f0-9]{10}$/);
  });
});

describe("normalizeTargetUrl", () => {
  it("adds https when protocol is omitted", () => {
    expect(normalizeTargetUrl("example.com").toString()).toBe("https://example.com/");
  });

  it("removes hashes and trailing non-root slashes", () => {
    expect(normalizeTargetUrl("https://example.com/docs/#intro").toString()).toBe("https://example.com/docs");
  });
});

