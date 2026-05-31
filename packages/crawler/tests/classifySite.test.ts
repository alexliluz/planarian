import { describe, expect, it } from "vitest";
import { classifySite } from "../src/classifySite.js";

describe("classifySite", () => {
  it("returns static for a content-heavy page without API requests", () => {
    const result = classifySite({
      bodyTextLength: 2400,
      hasRootOnlyHtml: false,
      scriptCount: 1,
      detectedFrameworks: [],
      authSignals: [],
      network: []
    });

    expect(result.classification).toBe("static");
  });

  it("returns spa for a root-only script-heavy page", () => {
    const result = classifySite({
      bodyTextLength: 100,
      hasRootOnlyHtml: true,
      scriptCount: 12,
      detectedFrameworks: ["react-root", "vite"],
      authSignals: [],
      network: []
    });

    expect(result.classification).toBe("spa");
  });

  it("returns auth-gated when auth signals and API requests exist", () => {
    const result = classifySite({
      bodyTextLength: 500,
      hasRootOnlyHtml: false,
      scriptCount: 4,
      detectedFrameworks: [],
      authSignals: ["login", "password"],
      network: [
        {
          url: "https://example.com/api/session",
          method: "GET",
          resourceType: "fetch",
          status: 200,
          contentType: "application/json",
          isApiCandidate: true
        }
      ]
    });

    expect(result.classification).toBe("auth-gated");
  });

  it("does not treat analytics and consent requests as auth-gated app APIs", () => {
    const result = classifySite({
      bodyTextLength: 1800,
      hasRootOnlyHtml: false,
      scriptCount: 6,
      detectedFrameworks: ["react-root"],
      authSignals: ["auth"],
      network: [
        {
          url: "https://cdn-cookieyes.com/client_data/example/config.json",
          method: "GET",
          resourceType: "fetch",
          status: 200,
          contentType: "application/json",
          isApiCandidate: true
        },
        {
          url: "https://www.google-analytics.com/g/collect",
          method: "POST",
          resourceType: "fetch",
          status: 204,
          isApiCandidate: true
        }
      ]
    });

    expect(result.classification).not.toBe("auth-gated");
    expect(result.requiresAuth).toBe(false);
    expect(result.hasApiRequests).toBe(true);
  });
});
