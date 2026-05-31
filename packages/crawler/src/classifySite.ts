import type { NetworkRequestSummary, SiteClassification } from "@planarian/shared";

export interface ClassificationSignals {
  bodyTextLength: number;
  hasRootOnlyHtml: boolean;
  scriptCount: number;
  detectedFrameworks: string[];
  authSignals: string[];
  network: NetworkRequestSummary[];
}

export interface ClassificationResult {
  classification: SiteClassification;
  requiresAuth: boolean;
  hasApiRequests: boolean;
  hasHeavyClientRendering: boolean;
  notes: string[];
}

export function classifySite(signals: ClassificationSignals): ClassificationResult {
  const notes: string[] = [];
  const hasApiRequests = signals.network.some((request) => request.isApiCandidate);
  const hasAppApiRequests = signals.network.some((request) => request.isApiCandidate && !isTelemetryOrConsentRequest(request.url));
  const hasHeavyClientRendering =
    signals.hasRootOnlyHtml || (signals.scriptCount >= 8 && signals.bodyTextLength < 600);
  const requiresAuth = signals.authSignals.length > 0 && hasAppApiRequests;
  const hasNext = signals.detectedFrameworks.includes("next");
  const hasNuxt = signals.detectedFrameworks.includes("nuxt");

  if (requiresAuth) {
    notes.push("Auth-related text or routes appeared alongside API-like requests.");
    return { classification: "auth-gated", requiresAuth, hasApiRequests, hasHeavyClientRendering, notes };
  }

  if (hasAppApiRequests && hasHeavyClientRendering) {
    notes.push("API-like requests and heavy client rendering suggest an interactive web app.");
    return { classification: "web-app", requiresAuth, hasApiRequests, hasHeavyClientRendering, notes };
  }

  if (hasNext) {
    notes.push("Next.js markers detected; classifying as SSR unless static export signals are proven later.");
    return { classification: "ssr", requiresAuth, hasApiRequests, hasHeavyClientRendering, notes };
  }

  if (hasNuxt) {
    notes.push("Nuxt markers detected; classifying as SSR unless static generation is proven later.");
    return { classification: "ssr", requiresAuth, hasApiRequests, hasHeavyClientRendering, notes };
  }

  if (hasHeavyClientRendering) {
    notes.push("Initial HTML appears sparse relative to script usage.");
    return { classification: "spa", requiresAuth, hasApiRequests, hasHeavyClientRendering, notes };
  }

  if (signals.bodyTextLength >= 800 && !hasApiRequests) {
    return { classification: "static", requiresAuth, hasApiRequests, hasHeavyClientRendering, notes };
  }

  notes.push("Signals were inconclusive; review raw HTML and network analysis.");
  return { classification: "unknown", requiresAuth, hasApiRequests, hasHeavyClientRendering, notes };
}

function isTelemetryOrConsentRequest(url: string): boolean {
  return [
    "google-analytics.com",
    "googletagmanager.com",
    "cookieyes.com",
    "parsely.com",
    "wp.com",
    "cloudflareinsights.com",
    "/cdn-cgi/rum"
  ].some((pattern) => url.toLowerCase().includes(pattern));
}
