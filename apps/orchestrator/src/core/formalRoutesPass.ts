import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractVisibleText } from "./htmlText.js";
import { getSessionRoot } from "./sessionRepository.js";

export interface FormalRoutesPassResult {
  sessionId: string;
  formalCloneRoot: string;
  files: string[];
}

interface CapturedPageManifest {
  pages?: Array<{
    url: string;
    outputDir: string;
  }>;
}

interface RouteContent {
  title: string;
  url: string;
  routePath: string;
  sourceDir: string;
  sections: string[];
  paragraphs: string[];
  links: Array<{
    label: string;
    href: string;
  }>;
}

interface RouteFile {
  path: string;
  content: string;
}

export async function createFormalRoutesPass(projectRoot: string, sessionId: string): Promise<FormalRoutesPassResult> {
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const formalCloneRoot = path.join(sessionRoot, "formal-clone");
  const manifest = await readCaptureManifest(sessionRoot);
  const routeContents: RouteContent[] = [];

  for (const page of manifest.pages ?? []) {
    const routePath = routePathFromUrl(page.url);
    if (!routePath || routePath === "/") {
      continue;
    }

    const htmlPath = path.join(sessionRoot, page.outputDir, "raw-html.html");
    const rawHtml = await readFile(htmlPath, "utf8");
    routeContents.push(extractRouteContent(rawHtml, page.url, routePath, page.outputDir));
  }

  if (routeContents.length === 0) {
    return {
      sessionId,
      formalCloneRoot,
      files: []
    };
  }

  const files = renderFormalRoutesPass(routeContents);

  for (const file of files) {
    const absolutePath = path.join(formalCloneRoot, file.path);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");
  }

  const styleFile = await ensureRouteStyles(formalCloneRoot);
  if (styleFile) {
    files.push(styleFile);
  }

  return {
    sessionId,
    formalCloneRoot,
    files: files.map((file) => path.posix.join("formal-clone", file.path))
  };
}

async function ensureRouteStyles(formalCloneRoot: string): Promise<RouteFile | undefined> {
  const cssPath = path.join(formalCloneRoot, "app", "globals.css");
  let css = "";

  try {
    css = await readFile(cssPath, "utf8");
  } catch {
    return undefined;
  }

  if (css.includes(".route-shell")) {
    return undefined;
  }

  const nextCss = `${css.trimEnd()}

.route-shell {
  min-height: 100vh;
  padding: 112px 6vw 96px;
  color: #ffffff;
  background: #000000;
}

.route-hero {
  max-width: 980px;
  margin: 0 0 72px;
}

.route-kicker {
  margin: 0 0 20px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.route-hero h1 {
  margin: 0;
  font-size: 64px;
  line-height: 1;
}

.route-intro,
.route-copy {
  max-width: 860px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 21px;
  line-height: 1.55;
}

.route-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 70px 0;
}

.route-card {
  min-height: 150px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 4px;
  background: #0d0d0d;
}

.route-card h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
}

.route-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 64px;
}

.route-links a {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
}

@media (max-width: 900px) {
  .route-shell {
    padding: 92px 24px 72px;
  }

  .route-hero h1 {
    font-size: 44px;
  }

  .route-grid {
    grid-template-columns: 1fr;
  }
}
`;

  await writeFile(cssPath, nextCss, "utf8");
  return { path: "app/globals.css", content: nextCss };
}

export function extractRouteContent(rawHtml: string, url: string, routePath: string, sourceDir: string): RouteContent {
  const title =
    firstMatchText(rawHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    firstMatchText(rawHtml, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
    titleFromRoutePath(routePath);
  const sections = unique(extractTagText(rawHtml, "h2").filter(isUsefulText)).slice(0, 24);
  const paragraphs = unique(extractTagText(rawHtml, "p").filter(isUsefulParagraph)).slice(0, 24);
  const links = uniqueLinks(extractLinks(rawHtml).filter(isUsefulLink)).slice(0, 18);

  return {
    title,
    url,
    routePath,
    sourceDir,
    sections,
    paragraphs,
    links
  };
}

export function renderFormalRoutesPass(routes: RouteContent[]): RouteFile[] {
  const files: RouteFile[] = [
    {
      path: "data/route-content.json",
      content: `${JSON.stringify(routes, null, 2)}\n`
    },
    {
      path: "ROUTE_IMPLEMENTATION.md",
      content: renderRouteImplementationNotes(routes)
    }
  ];

  for (const route of routes) {
    files.push({
      path: appPathForRoute(route.routePath),
      content: renderRoutePage(route)
    });
  }

  return files;
}

async function readCaptureManifest(sessionRoot: string): Promise<CapturedPageManifest> {
  const manifestPath = path.join(sessionRoot, "target-research", "pages", "capture-manifest.json");
  return JSON.parse(await readFile(manifestPath, "utf8")) as CapturedPageManifest;
}

function routePathFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const normalized = parsed.pathname.replace(/\/+$/g, "");
    return normalized === "" ? "/" : normalized;
  } catch {
    return undefined;
  }
}

function appPathForRoute(routePath: string): string {
  const segments = routePath
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]+/g, "-"));
  return path.posix.join("app", ...segments, "page.tsx");
}

function renderRoutePage(route: RouteContent): string {
  return `const route = ${JSON.stringify(route, null, 2)};

export default function CapturedRoutePage() {
  return (
    <main className="route-shell">
      <section className="route-hero">
        <p className="route-kicker">{route.routePath}</p>
        <h1>{route.title}</h1>
      </section>

      {route.paragraphs.length > 0 ? (
        <section className="route-intro" aria-label="Page introduction">
          {route.paragraphs.slice(0, 3).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      {route.sections.length > 0 ? (
        <section className="route-grid" aria-label="Captured sections">
          {route.sections.map((section) => (
            <article className="route-card" key={section}>
              <h2>{section}</h2>
            </article>
          ))}
        </section>
      ) : null}

      {route.paragraphs.length > 3 ? (
        <section className="route-copy" aria-label="Additional captured text">
          {route.paragraphs.slice(3).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      {route.links.length > 0 ? (
        <section className="route-links" aria-label="Captured public links">
          {route.links.map((link) => (
            <a key={\`\${link.href}-\${link.label}\`} href={link.href}>
              {link.label}
            </a>
          ))}
        </section>
      ) : null}
    </main>
  );
}
`;
}

function renderRouteImplementationNotes(routes: RouteContent[]): string {
  const rows = routes
    .map(
      (route) =>
        `| ${route.routePath} | ${route.title.replace(/\|/g, "\\|")} | ${route.sections.length} | ${route.paragraphs.length} | ${route.links.length} |`
    )
    .join("\n");

  return `# Route Implementation Pass

This file records the first content-aware route implementation generated from captured public HTML.

## Routes

| Route | Title | Sections | Paragraphs | Links |
| --- | --- | --- | --- | --- |
${rows}

## Notes

- These pages are public UI reconstruction drafts.
- They use captured text and links only.
- They do not call private backends or reproduce authenticated behavior.
- Continue visual repair against each route screenshot in \`../target-research/pages/<route>/desktop.png\`.
`;
}

function extractTagText(rawHtml: string, tagName: string): string[] {
  const values: string[] = [];
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(rawHtml)) !== null) {
    const text = extractVisibleText(match[1] ?? "");
    if (text) {
      values.push(text);
    }
  }

  return values;
}

function extractLinks(rawHtml: string): RouteContent["links"] {
  const links: RouteContent["links"] = [];
  const pattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(rawHtml)) !== null) {
    const href = match[1] ?? "";
    const label = extractVisibleText(match[2] ?? "") || href;
    links.push({ label, href });
  }

  return links;
}

function firstMatchText(rawHtml: string, pattern: RegExp): string | undefined {
  const match = pattern.exec(rawHtml);
  return match ? extractVisibleText(match[1] ?? "") : undefined;
}

function isUsefulParagraph(text: string): boolean {
  return (
    isUsefulText(text) &&
    text.length >= 20 &&
    !/cookies?|privacy|consent|accept all|reject all|customi[sz]e/i.test(text) &&
    !/partnerships people perspectives about search/i.test(text)
  );
}

function isUsefulText(text: string): boolean {
  return text.length > 0 && text.length <= 240 && !/^(about|company|connect|login|search)$/i.test(text);
}

function isUsefulLink(link: RouteContent["links"][number]): boolean {
  return (
    isUsefulText(link.label) &&
    !/^(\/|home|partnerships|people|perspectives)$/i.test(link.label) &&
    !/privacy|cookie|consent|google/i.test(link.label) &&
    !/privacy|cookie|consent|google/i.test(link.href) &&
    link.href !== "#"
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function uniqueLinks(links: RouteContent["links"]): RouteContent["links"] {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.href}:${link.label}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function titleFromRoutePath(routePath: string): string {
  return routePath
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment
        .split(/[-_]/g)
        .filter(Boolean)
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(" ")
    )
    .join(" / ");
}
