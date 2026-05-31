import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession } from "@planarian/shared";
import { decodeHtmlEntities } from "./htmlText.js";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface PageDiscoveryResult {
  sessionId: string;
  pageCount: number;
  files: string[];
}

export interface DiscoveredPage {
  url: string;
  pathname: string;
  title?: string;
  source: "homepage-link";
  priority: number;
  reason: string;
}

interface LinkCandidate {
  href: string;
  text?: string;
}

const DEFAULT_MAX_PAGES = 40;

export async function discoverPages(projectRoot: string, sessionId: string, maxPages = DEFAULT_MAX_PAGES): Promise<PageDiscoveryResult> {
  const session = await readCloneSession(projectRoot, sessionId);
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const html = await readFile(path.join(sessionRoot, "target-research", "raw-html.html"), "utf8");
  const pages = discoverInternalPages(html, session, maxPages);
  const researchRoot = path.join(sessionRoot, "target-research");
  const siteMapPath = path.join(researchRoot, "site-map.json");
  const reportPath = path.join(researchRoot, "PAGE_DISCOVERY.md");

  await mkdir(researchRoot, { recursive: true });
  await writeFile(siteMapPath, `${JSON.stringify(pages, null, 2)}\n`, "utf8");
  await writeFile(reportPath, renderPageDiscovery(session, pages), "utf8");

  return {
    sessionId,
    pageCount: pages.length,
    files: ["target-research/site-map.json", "target-research/PAGE_DISCOVERY.md"]
  };
}

export function discoverInternalPages(html: string, session: CloneSession, maxPages = DEFAULT_MAX_PAGES): DiscoveredPage[] {
  const base = new URL(session.target.normalizedUrl);
  const links = extractLinks(html);
  const pages = new Map<string, DiscoveredPage>();

  pages.set(base.href, {
    url: base.href,
    pathname: base.pathname,
    title: session.target.title,
    source: "homepage-link",
    priority: 0,
    reason: "Homepage is always the root capture target."
  });

  for (const link of links) {
    const normalized = normalizeInternalUrl(link.href, base);
    if (!normalized || shouldIgnorePath(normalized)) {
      continue;
    }

    const existing = pages.get(normalized.href);
    const candidate = createDiscoveredPage(normalized, link);
    if (!existing || candidate.priority < existing.priority) {
      pages.set(normalized.href, candidate);
    }
  }

  return Array.from(pages.values())
    .sort((a, b) => a.priority - b.priority || a.url.localeCompare(b.url))
    .slice(0, maxPages);
}

export function extractLinks(html: string): LinkCandidate[] {
  const links: LinkCandidate[] = [];
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(html))) {
    const attrs = match[1] ?? "";
    const href = extractAttribute(attrs, "href");
    if (!href) {
      continue;
    }

    links.push({
      href,
      text: stripTags(match[2] ?? "").trim().replace(/\s+/g, " ").slice(0, 120) || undefined
    });
  }

  return links;
}

export function normalizeInternalUrl(href: string, base: URL): URL | undefined {
  const trimmed = href.trim();
  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    /^(mailto|tel|sms|javascript):/i.test(trimmed)
  ) {
    return undefined;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed, base);
  } catch {
    return undefined;
  }

  if (parsed.hostname !== base.hostname) {
    return undefined;
  }

  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = normalizePathname(parsed.pathname);
  return parsed;
}

export function renderPageDiscovery(session: CloneSession, pages: DiscoveredPage[]): string {
  return `# Page Discovery

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}

This file is the first multi-page capture queue for the target site. It is intentionally conservative: start with high-priority navigation and overview pages before capturing deep archive pages.

## Summary

- Discovered pages: ${pages.length}
- Source: homepage HTML links
- Scope: same-host public URLs only

## Capture Queue

${pages
  .map(
    (page, index) => `### ${index + 1}. ${page.pathname}

- URL: ${page.url}
- Priority: ${page.priority}
- Reason: ${page.reason}${page.title ? `\n- Label: ${page.title}` : ""}
`
  )
  .join("\n")}
## Suggested Command

\`\`\`bash
corepack pnpm cli capture-pages ${session.sessionId} --limit 10
\`\`\`
`;
}

function createDiscoveredPage(url: URL, link: LinkCandidate): DiscoveredPage {
  const priority = priorityForPath(url.pathname, link.text);
  return {
    url: url.href,
    pathname: url.pathname,
    title: link.text,
    source: "homepage-link",
    priority,
    reason: reasonForPriority(priority)
  };
}

function priorityForPath(pathname: string, text?: string): number {
  const source = `${pathname} ${text ?? ""}`.toLowerCase();
  const parts = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    return 0;
  }
  if (parts.length <= 1 && /\b(about|team|people|portfolio|companies|investments|contact)\b/.test(source)) {
    return 10;
  }
  if (parts.length <= 1 && /\b(news|stories|blog|insights|perspectives|careers|jobs)\b/.test(source)) {
    return 20;
  }
  if (parts.length <= 1) {
    return 30;
  }
  if (["about", "people", "portfolio", "companies", "perspectives", "stories", "news"].includes(parts[0] ?? "")) {
    return 40;
  }
  return 50;
}

function reasonForPriority(priority: number): string {
  if (priority === 0) {
    return "Homepage.";
  }
  if (priority === 10) {
    return "Likely primary navigation or core site section.";
  }
  if (priority === 20) {
    return "Likely editorial, jobs, or supporting section.";
  }
  if (priority === 30) {
    return "Top-level internal page.";
  }
  if (priority === 40) {
    return "Section detail page; capture after top-level sections.";
  }
  return "Deeper internal page; capture after core sections.";
}

function shouldIgnorePath(url: URL): boolean {
  const pathname = url.pathname.toLowerCase();
  return (
    /\.(pdf|zip|rar|7z|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif|webp|svg|mp4|mov|mp3|woff|woff2|ttf|otf)$/i.test(pathname) ||
    pathname.includes("/wp-json/") ||
    pathname.includes("/feed/")
  );
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "") {
    return "/";
  }
  const normalized = pathname.replace(/\/{2,}/g, "/");
  if (normalized !== "/" && normalized.endsWith("/")) {
    return normalized.slice(0, -1);
  }
  return normalized;
}

function extractAttribute(attrs: string, name: string): string | undefined {
  const pattern = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const match = attrs.match(pattern);
  return match?.[2] ?? match?.[3] ?? match?.[4] ?? undefined;
}

function stripTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " "));
}
