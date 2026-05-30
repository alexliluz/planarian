import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession, NetworkRequestSummary } from "@planarian/shared";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface FormalResearchResult {
  sessionId: string;
  researchRoot: string;
  files: string[];
}

interface ResearchInput {
  session: CloneSession;
  rawHtml: string;
  network: NetworkRequestSummary[];
}

const RESEARCH_FILES = [
  "README.md",
  "00-target-overview.md",
  "01-page-structure.md",
  "02-network-and-data.md",
  "03-implementation-plan.md"
];

export async function createFormalResearch(projectRoot: string, sessionId: string): Promise<FormalResearchResult> {
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const session = await readCloneSession(projectRoot, sessionId);
  const rawHtml = await readFile(path.join(sessionRoot, "target-research", "raw-html.html"), "utf8");
  const network = await readNetworkSummary(sessionRoot, session.network);
  const researchRoot = path.join(sessionRoot, "formal-clone", "docs", "research");
  const input = { session, rawHtml, network };
  const files = renderFormalResearch(input);

  await mkdir(researchRoot, { recursive: true });
  for (const file of files) {
    await writeFile(path.join(researchRoot, file.path), file.content, "utf8");
  }

  return {
    sessionId,
    researchRoot,
    files: files.map((file) => path.posix.join("formal-clone", "docs", "research", file.path))
  };
}

export function renderFormalResearch(input: ResearchInput): Array<{ path: string; content: string }> {
  return [
    {
      path: "README.md",
      content: renderResearchReadme(input.session)
    },
    {
      path: "00-target-overview.md",
      content: renderTargetOverview(input.session)
    },
    {
      path: "01-page-structure.md",
      content: renderPageStructure(input)
    },
    {
      path: "02-network-and-data.md",
      content: renderNetworkAndData(input.session, input.network)
    },
    {
      path: "03-implementation-plan.md",
      content: renderImplementationPlan(input.session, input.network)
    }
  ];
}

async function readNetworkSummary(sessionRoot: string, fallback: NetworkRequestSummary[]): Promise<NetworkRequestSummary[]> {
  try {
    const content = await readFile(path.join(sessionRoot, "target-research", "network-analysis.json"), "utf8");
    return JSON.parse(content) as NetworkRequestSummary[];
  } catch {
    return fallback;
  }
}

function renderResearchReadme(session: CloneSession): string {
  return `# Formal Clone Research

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}

This directory converts Planarian target analysis into formal clone research notes. It is intended for Codex, Cursor, Claude Code, or another coding agent before implementation starts.

## Files

${RESEARCH_FILES.filter((file) => file !== "README.md").map((file) => `- \`${file}\``).join("\n")}

## Source Inputs

- \`../../../clone-session.json\`
- \`../../../target-research/raw-html.html\`
- \`../../../target-research/desktop.png\`
- \`../../../target-research/network-analysis.json\`

## Rule

Use these notes to rebuild visible public UI only. Private backend, auth, payment, trading, account, and user-data behavior must be mocked unless explicitly owned by this project.
`;
}

function renderTargetOverview(session: CloneSession): string {
  return `# Target Overview

## Identity

- URL: ${session.target.normalizedUrl}
- Hostname: ${session.target.hostname}
- Title: ${session.target.title ?? "Unknown"}
- Description: ${session.target.description ?? "Unknown"}

## Classification

- Site classification: ${session.target.classification}
- Clone mode: ${session.target.cloneMode}
- Requires auth: ${String(session.target.requiresAuth)}
- Has API requests: ${String(session.target.hasApiRequests)}
- Heavy client rendering: ${String(session.target.hasHeavyClientRendering)}
- Detected frameworks: ${session.target.detectedFrameworks.length > 0 ? session.target.detectedFrameworks.join(", ") : "none"}

## Notes

${session.target.notes.length > 0 ? session.target.notes.map((note) => `- ${note}`).join("\n") : "- No classifier notes recorded."}

## Primary References

- Desktop screenshot: \`../../../${session.screenshots.desktop ?? "target-research/desktop.png"}\`
- Raw HTML: \`../../../target-research/raw-html.html\`
- Network summary: \`../../../target-research/network-analysis.json\`
`;
}

function renderPageStructure(input: ResearchInput): string {
  const text = extractVisibleText(input.rawHtml);
  const headings = extractHeadings(input.rawHtml);
  const links = extractLinks(input.rawHtml);

  return `# Page Structure

## Initial HTML Signals

- Raw HTML size: ${input.rawHtml.length} characters
- Extracted text size: ${text.length} characters
- Heading count: ${headings.length}
- Link count: ${links.length}

## Detected Headings

${headings.length > 0 ? headings.slice(0, 20).map((heading) => `- ${heading}`).join("\n") : "- No headings detected in initial HTML."}

## Link Inventory

${links.length > 0 ? links.slice(0, 30).map((link) => `- ${link}`).join("\n") : "- No links detected in initial HTML."}

## Text Excerpt

\`\`\`text
${text.slice(0, 1600) || "No visible text extracted from the initial HTML."}
\`\`\`

## Agent Notes

- Use the screenshot as the visual source of truth when HTML is sparse.
- If initial HTML is root-only or script-heavy, prefer component reconstruction from screenshot and network/mock-data clues.
- Do not scrape or call private backend systems during implementation.
`;
}

function renderNetworkAndData(session: CloneSession, network: NetworkRequestSummary[]): string {
  const apiRequests = network.filter((request) => request.isApiCandidate);
  const byType = countBy(network, (request) => request.resourceType || "unknown");
  const apiRows = apiRequests.slice(0, 30).map((request) => {
    return `| ${request.method} | ${request.status ?? ""} | ${request.resourceType} | ${request.contentType ?? ""} | ${request.url} |`;
  });

  return `# Network And Data

## Summary

- Total captured responses: ${network.length}
- API candidates: ${apiRequests.length}
- Session says has API requests: ${String(session.target.hasApiRequests)}
- Session says requires auth: ${String(session.target.requiresAuth)}

## Resource Types

${Object.entries(byType).map(([type, count]) => `- ${type}: ${count}`).join("\n") || "- No captured network responses."}

## API Candidates

| Method | Status | Type | Content-Type | URL |
| --- | --- | --- | --- | --- |
${apiRows.length > 0 ? apiRows.join("\n") : "|  |  |  |  | No API candidates captured. |"}

## Data Policy

- Treat captured API URLs as evidence for mock-data shape only.
- Do not implement real calls to private or authenticated endpoints.
- Use \`../../../mock-data/\` for dynamic sections.
- Use placeholder API routes only when the formal clone needs interactive behavior.
`;
}

function renderImplementationPlan(session: CloneSession, network: NetworkRequestSummary[]): string {
  const needsMockData = session.target.requiresAuth || session.target.hasApiRequests || network.some((request) => request.isApiCandidate);

  return `# Implementation Plan

## Recommended Order

1. Read \`00-target-overview.md\`, \`01-page-structure.md\`, and the desktop screenshot.
2. Confirm global layout, color palette, typography scale, and major sections.
3. Build the formal clone scaffold or continue the existing scaffold in \`../../\`.
4. Create page-level components first, then split repeated sections into smaller components.
5. ${needsMockData ? "Create mock data before wiring dynamic UI sections." : "Use static content from the captured page where practical."}
6. Run local validation and update \`../../../agent-memory/CHANGELOG_AGENT.md\`.

## Suggested Boundaries

- \`app/\`: Next.js routes and layouts.
- \`components/\`: visual sections and reusable UI.
- \`data/\`: target summary and mock content.
- \`public/\`: copied or reconstructed public assets.
- \`docs/research/\`: research notes generated by Planarian.

## Acceptance Checklist

- First viewport matches the captured screenshot at a practical engineering level.
- Main visible sections are present.
- Typography, spacing, and color relationships are represented.
- Dynamic or private behavior uses local mock data.
- No authentication, payment, trading, account, database, or private backend flow calls the real target.
- README documents install, dev, build, and validation commands.

## Cursor Auto Tasks

- Add focused component tests after the first scaffold is stable.
- Refine responsive layout against desktop and mobile screenshots when available.
- Add mock data for sections inferred from network/API candidates.
- Compare against \`../../open-lovable-version/\` only as a visual reference when that draft exists.
`;
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

function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const headingPattern = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(html)) !== null) {
    const text = extractVisibleText(match[1] ?? "");
    if (text) {
      headings.push(text);
    }
  }

  return unique(headings);
}

function extractLinks(html: string): string[] {
  const links: string[] = [];
  const linkPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1] ?? "";
    const label = extractVisibleText(match[2] ?? "");
    links.push(label ? `${label} (${href})` : href);
  }

  return unique(links);
}

function countBy<T>(items: T[], getKey: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}
