import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSessionRoot } from "./sessionRepository.js";

export interface RouteSmokeCheck {
  routePath: string;
  ok: boolean;
  checks: Array<{
    name: string;
    ok: boolean;
    detail: string;
  }>;
}

export interface RouteSmokeReport {
  sessionId: string;
  formalCloneRoot: string;
  ready: boolean;
  routes: RouteSmokeCheck[];
  reportPath: string;
}

interface RouteContent {
  title: string;
  routePath: string;
  sections: string[];
  paragraphs: string[];
  links: Array<{ label: string; href: string }>;
}

export async function runFormalRouteSmoke(projectRoot: string, sessionId: string): Promise<RouteSmokeReport> {
  const formalCloneRoot = path.join(getSessionRoot(projectRoot, sessionId), "formal-clone");
  const routeContentPath = path.join(formalCloneRoot, "data", "route-content.json");
  const routes = await readRouteContent(routeContentPath);
  const cssPath = path.join(formalCloneRoot, "app", "globals.css");
  const css = await readOptional(cssPath);
  const routeChecks: RouteSmokeCheck[] = [];

  for (const route of routes) {
    const pagePath = path.join(formalCloneRoot, appPathForRoute(route.routePath));
    const page = await readOptional(pagePath);
    const checks = [
      await fileCheck("route page", pagePath),
      {
        name: "title rendered",
        ok: page.includes(JSON.stringify(route.title)) || page.includes(route.title),
        detail: route.title
      },
      {
        name: "route shell",
        ok: page.includes("route-shell"),
        detail: "page uses route-shell layout class"
      },
      {
        name: "content signal",
        ok: route.sections.length > 0 || route.paragraphs.length > 0 || route.links.length > 0,
        detail: `${route.sections.length} sections, ${route.paragraphs.length} paragraphs, ${route.links.length} links`
      },
      {
        name: "route css",
        ok: css.includes(".route-shell"),
        detail: "app/globals.css contains route-shell styles"
      }
    ];
    routeChecks.push({
      routePath: route.routePath,
      ok: checks.every((check) => check.ok),
      checks
    });
  }

  const ready = routeChecks.length > 0 && routeChecks.every((route) => route.ok);
  const reportPath = path.join(formalCloneRoot, "ROUTE_SMOKE.md");
  const report = { sessionId, formalCloneRoot, ready, routes: routeChecks, reportPath };
  await writeFile(reportPath, renderRouteSmokeReport(report), "utf8");
  return report;
}

export function renderRouteSmokeReport(report: RouteSmokeReport): string {
  const rows = report.routes
    .map((route) => `| ${route.routePath} | ${route.ok ? "ok" : "failed"} | ${route.checks.length} |`)
    .join("\n");
  const details = report.routes
    .map(
      (route) => `### ${route.routePath}

${route.checks.map((check) => `- ${check.ok ? "[x]" : "[ ]"} ${check.name}: ${check.detail}`).join("\n")}`
    )
    .join("\n\n");

  return `# Route Smoke Report

Session: ${report.sessionId}
Formal clone root: ${report.formalCloneRoot}
Status: ${report.ready ? "ready" : "not ready"}

## Routes

| Route | Status | Checks |
| --- | --- | --- |
${rows}

## Details

${details}

## Next

- Run \`formal-validate <session-id> --run-build\` after route smoke passes.
- Continue visual repair against captured route screenshots.
`;
}

async function readRouteContent(routeContentPath: string): Promise<RouteContent[]> {
  try {
    return JSON.parse(await readFile(routeContentPath, "utf8")) as RouteContent[];
  } catch {
    return [];
  }
}

async function readOptional(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function fileCheck(name: string, filePath: string): Promise<RouteSmokeCheck["checks"][number]> {
  try {
    await access(filePath);
    return { name, ok: true, detail: `found ${filePath}` };
  } catch {
    return { name, ok: false, detail: `missing ${filePath}` };
  }
}

function appPathForRoute(routePath: string): string {
  const segments = routePath
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]+/g, "-"));
  return path.join("app", ...segments, "page.tsx");
}
