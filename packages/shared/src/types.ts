export type SiteClassification =
  | "static"
  | "ssg"
  | "ssr"
  | "spa"
  | "web-app"
  | "auth-gated"
  | "unknown";

export type CloneMode =
  | "visual-only"
  | "visual-plus-interactions"
  | "visual-plus-mock-api"
  | "full-owned-app-rebuild";

export interface TargetSiteInfo {
  url: string;
  normalizedUrl: string;
  hostname: string;
  title?: string;
  description?: string;
  classification: SiteClassification;
  cloneMode: CloneMode;
  requiresAuth: boolean;
  hasApiRequests: boolean;
  hasHeavyClientRendering: boolean;
  detectedFrameworks: string[];
  notes: string[];
}

export interface NetworkRequestSummary {
  url: string;
  method: string;
  resourceType: string;
  status?: number;
  contentType?: string;
  isApiCandidate: boolean;
}

export interface ScreenshotSet {
  desktop?: string;
  tablet?: string;
  mobile?: string;
  fullPageDesktop?: string;
  fullPageMobile?: string;
}

export interface VersionPaths {
  openLovableVersion?: string;
  formalClone?: string;
  comparison?: string;
  references?: string;
  mockData?: string;
}

export interface CloneSession {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  target: TargetSiteInfo;
  screenshots: ScreenshotSet;
  network: NetworkRequestSummary[];
  versions: VersionPaths;
  status:
    | "created"
    | "analyzed"
    | "draft-generated"
    | "formal-generated"
    | "repairing"
    | "validated"
    | "completed"
    | "failed";
}

