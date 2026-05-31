import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloneSession } from "@planarian/shared";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface FormalStaticPassResult {
  sessionId: string;
  formalCloneRoot: string;
  files: string[];
}

interface StaticContent {
  title: string;
  paragraphs: string[];
  links: Array<{
    label: string;
    href: string;
  }>;
}

interface StaticFile {
  path: string;
  content: string;
}

export async function createFormalStaticPass(projectRoot: string, sessionId: string): Promise<FormalStaticPassResult> {
  const session = await readCloneSession(projectRoot, sessionId);
  const sessionRoot = getSessionRoot(projectRoot, sessionId);
  const formalCloneRoot = path.join(sessionRoot, "formal-clone");
  const rawHtml = await readFile(path.join(sessionRoot, "target-research", "raw-html.html"), "utf8");
  const staticContent = extractStaticContent(rawHtml, session);
  const files = renderFormalStaticPass(session, staticContent);

  for (const file of files) {
    const absolutePath = path.join(formalCloneRoot, file.path);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");
  }

  return {
    sessionId,
    formalCloneRoot,
    files: files.map((file) => path.posix.join("formal-clone", file.path))
  };
}

export function renderFormalStaticPass(session: CloneSession, content: StaticContent): StaticFile[] {
  return [
    {
      path: "app/page.tsx",
      content: renderPage()
    },
    {
      path: "app/globals.css",
      content: renderCss()
    },
    {
      path: "data/static-content.json",
      content: `${JSON.stringify(content, null, 2)}\n`
    },
    {
      path: "STATIC_IMPLEMENTATION.md",
      content: renderImplementationNotes(session, content)
    }
  ];
}

export function extractStaticContent(rawHtml: string, session: CloneSession): StaticContent {
  const title = firstMatchText(rawHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || session.target.title || session.target.hostname;
  const paragraphs = unique(extractTagText(rawHtml, "p").filter((paragraph) => !looksLikeLinkOnly(paragraph)));
  const links = extractLinks(rawHtml);

  return {
    title,
    paragraphs,
    links
  };
}

function renderPage(): string {
  return `import content from "../data/static-content.json";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="example-panel" aria-labelledby="page-title">
        <h1 id="page-title">{content.title}</h1>
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {content.links.length > 0 ? (
          <p>
            {content.links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </p>
        ) : null}
      </section>
    </main>
  );
}
`;
}

function renderCss(): string {
  return `:root {
  color: #111111;
  background: #eeeeee;
  font-family: system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #eeeeee;
}

a:link,
a:visited {
  color: #334488;
}

.page-shell {
  width: 60vw;
  margin: 15vh auto;
}

.example-panel {
  opacity: 0.8;
}

.example-panel h1 {
  margin: 0 0 0.67em;
  font-size: 1.5em;
  line-height: 1.2;
}

.example-panel p {
  margin: 1em 0;
}

@media (max-width: 720px) {
  .page-shell {
    width: calc(100vw - 48px);
    margin: 10vh auto;
  }
}
`;
}

function renderImplementationNotes(session: CloneSession, content: StaticContent): string {
  return `# Static Formal Clone Implementation

Session: ${session.sessionId}
Target: ${session.target.normalizedUrl}

## Generated Files

- \`app/page.tsx\`
- \`app/globals.css\`
- \`data/static-content.json\`

## Extracted Content

- Title: ${content.title}
- Paragraphs: ${content.paragraphs.length}
- Links: ${content.links.length}

## Notes

- This is a simple static first pass for content-heavy public pages.
- It does not use private backend calls.
- It should be validated with \`corepack pnpm cli formal-validate ${session.sessionId}\`.
- Use \`../comparison/REPAIR_QUEUE.md\` for visual refinements.
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

function firstMatchText(rawHtml: string, pattern: RegExp): string | undefined {
  const match = pattern.exec(rawHtml);
  return match ? extractVisibleText(match[1] ?? "") : undefined;
}

function extractLinks(rawHtml: string): StaticContent["links"] {
  const links: StaticContent["links"] = [];
  const pattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(rawHtml)) !== null) {
    const href = match[1] ?? "";
    const label = extractVisibleText(match[2] ?? "") || href;
    links.push({ label, href });
  }

  return links;
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

function looksLikeLinkOnly(text: string): boolean {
  return text.length < 80 && /^learn more$/i.test(text);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
