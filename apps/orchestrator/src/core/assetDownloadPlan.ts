import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession, NetworkRequestSummary } from "@planarian/shared";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface AssetDownloadPlanResult {
  sessionId: string;
  planPath: string;
}

interface AssetCandidate {
  url: string;
  kind: "image" | "font" | "stylesheet" | "script" | "other";
  priority: "localize" | "reference" | "ignore";
  reason: string;
  suggestedPath?: string;
}

export async function createAssetDownloadPlan(projectRoot: string, sessionId: string): Promise<AssetDownloadPlanResult> {
  const session = await readCloneSession(projectRoot, sessionId);
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const network = await readNetwork(sessionRoot, session.network);
  const candidates = createAssetCandidates(network);
  const referencesRoot = path.join(sessionRoot, "references");
  const planPath = path.join(referencesRoot, "ASSET_DOWNLOAD_PLAN.md");

  await mkdir(referencesRoot, { recursive: true });
  await writeFile(planPath, renderAssetDownloadPlan(session, candidates), "utf8");

  return {
    sessionId,
    planPath
  };
}

export function createAssetCandidates(network: NetworkRequestSummary[]): AssetCandidate[] {
  const seen = new Set<string>();
  const candidates: AssetCandidate[] = [];

  for (const request of network) {
    if (seen.has(request.url)) {
      continue;
    }
    seen.add(request.url);

    const kind = classifyAssetKind(request);
    if (!kind) {
      continue;
    }

    candidates.push({
      url: request.url,
      kind,
      ...prioritizeAsset(request, kind)
    });
  }

  return candidates.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
}

export function renderAssetDownloadPlan(session: CloneSession, candidates: AssetCandidate[]): string {
  const localize = candidates.filter((candidate) => candidate.priority === "localize");
  const reference = candidates.filter((candidate) => candidate.priority === "reference");
  const ignore = candidates.filter((candidate) => candidate.priority === "ignore");

  return `# Asset Download Plan

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}

This plan decides which public visual assets are worth localizing into \`formal-clone/public/\`, which should remain references, and which should be ignored.

## Policy

- Localize public visual assets needed for stable first-viewport or component rendering.
- Keep large long-tail image galleries as references until a specific section needs them.
- Ignore analytics, consent, tracking, telemetry, and private/backend-like endpoints.
- Do not download or call private APIs.
- Preserve source URLs in comments or data files when localizing public assets.

## Summary

- Localize: ${localize.length}
- Reference: ${reference.length}
- Ignore: ${ignore.length}

## Localize First

${renderCandidates(localize, 40)}

## Keep As References

${renderCandidates(reference, 80)}

## Ignore

${renderCandidates(ignore, 60)}

## Suggested Next Steps

1. Create \`formal-clone/public/assets/\`.
2. Localize only the assets listed in "Localize First".
3. Keep filenames stable and descriptive.
4. Update formal clone data/components to reference local assets.
5. Re-run \`corepack pnpm cli formal-validate ${session.sessionId}\`.
6. Re-run \`corepack pnpm cli formal-compare ${session.sessionId}\`.
`;
}

async function readNetwork(sessionRoot: string, fallback: NetworkRequestSummary[]): Promise<NetworkRequestSummary[]> {
  try {
    const content = await readFile(path.join(sessionRoot, "target-research", "network-analysis.json"), "utf8");
    return JSON.parse(content) as NetworkRequestSummary[];
  } catch {
    return fallback;
  }
}

function classifyAssetKind(request: NetworkRequestSummary): AssetCandidate["kind"] | undefined {
  const contentType = request.contentType?.toLowerCase() ?? "";
  if (request.resourceType === "image" || contentType.startsWith("image/")) {
    return "image";
  }
  if (request.resourceType === "font" || contentType.includes("font")) {
    return "font";
  }
  if (request.resourceType === "stylesheet" || contentType.includes("text/css")) {
    return "stylesheet";
  }
  if (request.resourceType === "script" || contentType.includes("javascript")) {
    return "script";
  }
  return undefined;
}

function prioritizeAsset(
  request: NetworkRequestSummary,
  kind: AssetCandidate["kind"]
): Pick<AssetCandidate, "priority" | "reason" | "suggestedPath"> {
  const url = request.url.toLowerCase();

  if (isTelemetryOrConsent(url)) {
    return {
      priority: "ignore",
      reason: "Analytics, consent, telemetry, or tracking asset should not be implemented in the formal clone."
    };
  }

  if (kind === "font") {
    return {
      priority: "localize",
      reason: "Font assets strongly affect visual fidelity and are usually small.",
      suggestedPath: `public/assets/fonts/${filenameFromUrl(request.url)}`
    };
  }

  if (kind === "stylesheet") {
    return {
      priority: "reference",
      reason: "Stylesheets are useful for research, but the formal clone should implement clean local CSS rather than copying site CSS."
    };
  }

  if (kind === "script") {
    return {
      priority: "ignore",
      reason: "Original site scripts should not be copied; rebuild visible interactions locally."
    };
  }

  if (kind === "image" && isLikelyHeroOrLogo(url)) {
    return {
      priority: "localize",
      reason: "Likely hero, logo, or primary visual asset for first-pass fidelity.",
      suggestedPath: `public/assets/images/${filenameFromUrl(request.url)}`
    };
  }

  if (kind === "image") {
    return {
      priority: "reference",
      reason: "Public visual asset captured from the page; localize only when the corresponding section is implemented."
    };
  }

  return {
    priority: "reference",
    reason: "Potentially useful public asset."
  };
}

function renderCandidates(candidates: AssetCandidate[], limit: number): string {
  if (candidates.length === 0) {
    return "- None.";
  }

  return candidates
    .slice(0, limit)
    .map((candidate) => {
      const suggestedPath = candidate.suggestedPath ? `\n  - Suggested path: \`${candidate.suggestedPath}\`` : "";
      return `- ${candidate.kind}: ${candidate.url}\n  - Reason: ${candidate.reason}${suggestedPath}`;
    })
    .join("\n");
}

function isTelemetryOrConsent(url: string): boolean {
  return [
    "google-analytics.com",
    "googletagmanager.com",
    "cookieyes.com",
    "parsely.com",
    "wp.com",
    "cloudflareinsights.com",
    "/cdn-cgi/rum",
    "pixel.wp.com"
  ].some((pattern) => url.includes(pattern));
}

function isLikelyHeroOrLogo(url: string): boolean {
  return ["hero", "home", "takeover", "logo", "desktop", "mobile", "portrait"].some((token) => url.includes(token));
}

function filenameFromUrl(url: string): string {
  const parsed = new URL(url);
  const rawName = path.posix.basename(parsed.pathname) || "asset";
  return rawName.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function priorityRank(priority: AssetCandidate["priority"]): number {
  if (priority === "localize") {
    return 0;
  }
  if (priority === "reference") {
    return 1;
  }
  return 2;
}
