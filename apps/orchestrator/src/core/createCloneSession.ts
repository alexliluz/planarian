import crypto from "node:crypto";
import type { CloneSession, TargetSiteInfo, NetworkRequestSummary } from "@planarian/shared";

export interface CreateCloneSessionInput {
  url: string;
  title?: string;
  description?: string;
  classification: TargetSiteInfo["classification"];
  requiresAuth: boolean;
  hasApiRequests: boolean;
  hasHeavyClientRendering: boolean;
  detectedFrameworks: string[];
  notes: string[];
  network: NetworkRequestSummary[];
}

export function normalizeTargetUrl(input: string): URL {
  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const url = new URL(withProtocol);
  url.hash = "";
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url;
}

export function createSessionId(input: string): string {
  const url = normalizeTargetUrl(input);
  const readable = url.hostname.replace(/^www\./, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const digest = crypto.createHash("sha256").update(url.toString()).digest("hex").slice(0, 10);
  return `${readable}-${digest}`;
}

export function createCloneSession(input: CreateCloneSessionInput): CloneSession {
  const normalized = normalizeTargetUrl(input.url);
  const now = new Date().toISOString();

  return {
    sessionId: createSessionId(normalized.toString()),
    createdAt: now,
    updatedAt: now,
    target: {
      url: input.url,
      normalizedUrl: normalized.toString(),
      hostname: normalized.hostname,
      title: input.title,
      description: input.description,
      classification: input.classification,
      cloneMode: chooseCloneMode(input.requiresAuth, input.hasApiRequests),
      requiresAuth: input.requiresAuth,
      hasApiRequests: input.hasApiRequests,
      hasHeavyClientRendering: input.hasHeavyClientRendering,
      detectedFrameworks: input.detectedFrameworks,
      notes: input.notes
    },
    screenshots: {
      desktop: "target-research/desktop.png"
    },
    network: input.network,
    versions: {
      openLovableVersion: "open-lovable-version",
      formalClone: "formal-clone",
      comparison: "comparison",
      references: "references",
      mockData: "mock-data"
    },
    status: "analyzed"
  };
}

function chooseCloneMode(requiresAuth: boolean, hasApiRequests: boolean): CloneSession["target"]["cloneMode"] {
  if (requiresAuth || hasApiRequests) {
    return "visual-plus-mock-api";
  }
  return "visual-plus-interactions";
}

