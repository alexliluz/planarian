import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession, NetworkRequestSummary } from "@planarian/shared";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface AssetInventoryResult {
  sessionId: string;
  files: string[];
}

interface AssetGroup {
  images: NetworkRequestSummary[];
  fonts: NetworkRequestSummary[];
  stylesheets: NetworkRequestSummary[];
  scripts: NetworkRequestSummary[];
  videos: NetworkRequestSummary[];
  apiCandidates: NetworkRequestSummary[];
  other: NetworkRequestSummary[];
}

interface VisualSignals {
  title: string;
  description?: string;
  navigationLabels: string[];
  headings: string[];
  visibleTextExcerpt: string;
  bodyClasses: string[];
  htmlClasses: string[];
  linkedAssets: string[];
}

export async function createAssetInventory(projectRoot: string, sessionId: string): Promise<AssetInventoryResult> {
  const session = await readCloneSession(projectRoot, sessionId);
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const rawHtml = await readFile(path.join(sessionRoot, "target-research", "raw-html.html"), "utf8");
  const network = await readNetwork(sessionRoot, session.network);
  const groups = groupAssets(network);
  const signals = extractVisualSignals(rawHtml, session);
  const referencesRoot = path.join(sessionRoot, "references");
  const files = [
    {
      path: "ASSET_INVENTORY.md",
      content: renderAssetInventory(session, groups, signals)
    },
    {
      path: "VISUAL_PLAN.md",
      content: renderVisualPlan(session, groups, signals)
    }
  ];

  await mkdir(referencesRoot, { recursive: true });
  for (const file of files) {
    await writeFile(path.join(referencesRoot, file.path), file.content, "utf8");
  }

  return {
    sessionId,
    files: files.map((file) => path.posix.join("references", file.path))
  };
}

export function groupAssets(network: NetworkRequestSummary[]): AssetGroup {
  const groups: AssetGroup = {
    images: [],
    fonts: [],
    stylesheets: [],
    scripts: [],
    videos: [],
    apiCandidates: [],
    other: []
  };

  for (const request of network) {
    if (request.isApiCandidate) {
      groups.apiCandidates.push(request);
    }

    if (request.resourceType === "image" || request.contentType?.startsWith("image/")) {
      groups.images.push(request);
    } else if (request.resourceType === "font" || request.contentType?.includes("font")) {
      groups.fonts.push(request);
    } else if (request.resourceType === "stylesheet" || request.contentType?.includes("text/css")) {
      groups.stylesheets.push(request);
    } else if (request.resourceType === "script" || request.contentType?.includes("javascript")) {
      groups.scripts.push(request);
    } else if (request.resourceType === "media" || request.contentType?.startsWith("video/")) {
      groups.videos.push(request);
    } else if (!request.isApiCandidate) {
      groups.other.push(request);
    }
  }

  return groups;
}

export function extractVisualSignals(rawHtml: string, session: CloneSession): VisualSignals {
  return {
    title: session.target.title ?? firstTagText(rawHtml, "title") ?? session.target.hostname,
    description: session.target.description,
    navigationLabels: unique(extractAnchorLabels(rawHtml)).slice(0, 40),
    headings: unique([...extractTagTexts(rawHtml, "h1"), ...extractTagTexts(rawHtml, "h2"), ...extractTagTexts(rawHtml, "h3")]).slice(0, 40),
    visibleTextExcerpt: extractVisibleText(rawHtml).slice(0, 1800),
    bodyClasses: extractElementClasses(rawHtml, "body"),
    htmlClasses: extractElementClasses(rawHtml, "html"),
    linkedAssets: unique(extractLinkedAssets(rawHtml)).slice(0, 80)
  };
}

function renderAssetInventory(session: CloneSession, groups: AssetGroup, signals: VisualSignals): string {
  return `# Asset Inventory

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}

## Summary

- Images: ${groups.images.length}
- Fonts: ${groups.fonts.length}
- Stylesheets: ${groups.stylesheets.length}
- Scripts: ${groups.scripts.length}
- Videos/media: ${groups.videos.length}
- API candidates: ${groups.apiCandidates.length}
- Linked assets in HTML: ${signals.linkedAssets.length}

## Stylesheets

${renderRequests(groups.stylesheets, 20)}

## Fonts

${renderRequests(groups.fonts, 20)}

## Images

${renderRequests(groups.images, 80)}

## Scripts

${renderRequests(groups.scripts, 30)}

## Videos And Media

${renderRequests(groups.videos, 20)}

## API Candidates

These are evidence for mock-data shape only. Do not call private or analytics endpoints from the formal clone.

${renderRequests(groups.apiCandidates, 40)}

## HTML Linked Assets

${signals.linkedAssets.length > 0 ? signals.linkedAssets.map((asset) => `- ${asset}`).join("\n") : "- No linked assets extracted from HTML."}
`;
}

function renderVisualPlan(session: CloneSession, groups: AssetGroup, signals: VisualSignals): string {
  return `# Visual Plan

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}

## Page Identity

- Title: ${signals.title}
- Description: ${signals.description ?? "Unknown"}
- Classification: ${session.target.classification}
- Detected frameworks: ${session.target.detectedFrameworks.length > 0 ? session.target.detectedFrameworks.join(", ") : "none"}

## Visual Signals

- HTML classes: ${signals.htmlClasses.length > 0 ? signals.htmlClasses.join(", ") : "none"}
- Body classes: ${signals.bodyClasses.length > 0 ? signals.bodyClasses.join(", ") : "none"}
- Image count: ${groups.images.length}
- Font count: ${groups.fonts.length}
- Stylesheet count: ${groups.stylesheets.length}

## Navigation Labels

${signals.navigationLabels.length > 0 ? signals.navigationLabels.map((label) => `- ${label}`).join("\n") : "- No navigation labels extracted."}

## Headings

${signals.headings.length > 0 ? signals.headings.map((heading) => `- ${heading}`).join("\n") : "- No headings extracted."}

## Text Excerpt

\`\`\`text
${signals.visibleTextExcerpt || "No visible text extracted."}
\`\`\`

## Implementation Guidance

- Use \`../target-research/desktop.png\` as the first visual baseline.
- Treat \`ASSET_INVENTORY.md\` as the source for public visual asset references.
- Recreate the first viewport before deeper page sections.
- Prefer local mock data for dynamic sections.
- Do not implement real analytics, consent logging, personalization, tracking, private API, account, payment, or backend calls.
- For this type of media-heavy marketing site, do not rely on \`formal-static-pass\` as the final clone. Use research, assets, and visual comparison instead.

## Suggested First Clone Pass

1. Build the global shell: theme, background, header/nav, and typography.
2. Recreate the first hero section using public image references or local placeholders.
3. Add portfolio/story tiles from visible page text and captured asset URLs.
4. Run \`corepack pnpm cli formal-validate ${session.sessionId}\`.
5. Run \`corepack pnpm cli formal-compare ${session.sessionId}\`.
6. Use React Grab repair tasks for component-level visual mismatches.
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

function renderRequests(requests: NetworkRequestSummary[], limit: number): string {
  if (requests.length === 0) {
    return "- None captured.";
  }

  return requests
    .slice(0, limit)
    .map((request) => `- ${request.method} ${request.status ?? ""} ${request.resourceType} ${request.contentType ?? ""} ${request.url}`.trim())
    .join("\n");
}

function extractAnchorLabels(rawHtml: string): string[] {
  const labels: string[] = [];
  const pattern = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(rawHtml)) !== null) {
    const label = extractVisibleText(match[1] ?? "");
    if (label) {
      labels.push(label);
    }
  }

  return labels;
}

function extractTagTexts(rawHtml: string, tagName: string): string[] {
  const values: string[] = [];
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(rawHtml)) !== null) {
    const value = extractVisibleText(match[1] ?? "");
    if (value) {
      values.push(value);
    }
  }

  return values;
}

function firstTagText(rawHtml: string, tagName: string): string | undefined {
  return extractTagTexts(rawHtml, tagName)[0];
}

function extractElementClasses(rawHtml: string, tagName: string): string[] {
  const pattern = new RegExp(`<${tagName}\\b[^>]*class=["']([^"']+)["']`, "i");
  const match = pattern.exec(rawHtml);
  return match ? match[1].split(/\s+/).filter(Boolean) : [];
}

function extractLinkedAssets(rawHtml: string): string[] {
  const assets: string[] = [];
  const pattern = /\b(?:src|href)=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(rawHtml)) !== null) {
    const asset = match[1] ?? "";
    if (/\.(?:css|js|png|jpe?g|webp|gif|svg|ico|woff2?|mp4|webm)(?:\?|$)/i.test(asset)) {
      assets.push(asset);
    }
  }

  return assets;
}

function extractVisibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
