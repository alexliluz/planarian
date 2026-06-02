import { access, readFile, writeFile } from "node:fs/promises";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
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
  mode: "static" | "browser";
  ready: boolean;
  routes: RouteSmokeCheck[];
  reportPath: string;
}

export interface BrowserRouteSmokeResult {
  routePath: string;
  checks: RouteSmokeCheck["checks"];
}

export interface FormalRouteSmokeOptions {
  browser?: boolean;
  startServer?: boolean;
  baseUrl?: string;
  port?: number;
  timeoutMs?: number;
  browserRunner?: (input: BrowserRouteSmokeInput) => Promise<BrowserRouteSmokeResult[]>;
}

export interface BrowserRouteSmokeInput {
  formalCloneRoot: string;
  routes: RouteContent[];
  baseUrl?: string;
  startServer?: boolean;
  port: number;
  timeoutMs: number;
}

export interface RouteContent {
  title: string;
  routePath: string;
  sections: string[];
  paragraphs: string[];
  links: Array<{ label: string; href: string }>;
}

export async function runFormalRouteSmoke(
  projectRoot: string,
  sessionId: string,
  options: FormalRouteSmokeOptions = {}
): Promise<RouteSmokeReport> {
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

  if (options.browser) {
    const runner = options.browserRunner ?? runBrowserRouteSmoke;
    const browserResults = await runner({
      formalCloneRoot,
      routes,
      baseUrl: options.baseUrl,
      startServer: options.startServer,
      port: options.port ?? 3220,
      timeoutMs: options.timeoutMs ?? 60_000
    });

    for (const result of browserResults) {
      const route = routeChecks.find((candidate) => candidate.routePath === result.routePath);
      if (route) {
        route.checks.push(...result.checks);
        route.ok = route.checks.every((check) => check.ok);
      }
    }
  }

  const ready = routeChecks.length > 0 && routeChecks.every((route) => route.ok);
  const reportPath = path.join(formalCloneRoot, "ROUTE_SMOKE.md");
  const report = {
    sessionId,
    formalCloneRoot,
    mode: options.browser ? "browser" as const : "static" as const,
    ready,
    routes: routeChecks,
    reportPath
  };
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
Mode: ${report.mode}
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

async function runBrowserRouteSmoke(input: BrowserRouteSmokeInput): Promise<BrowserRouteSmokeResult[]> {
  let server: ChildProcessWithoutNullStreams | undefined;
  const baseUrl = input.baseUrl ?? `http://127.0.0.1:${input.port}`;

  try {
    if (input.startServer) {
      server = startFormalCloneDevServer(input.formalCloneRoot, input.port);
      await waitForServer(baseUrl, input.timeoutMs);
    } else if (!input.baseUrl) {
      return input.routes.map((route) => ({
        routePath: route.routePath,
        checks: [{ name: "browser base url", ok: false, detail: "Use --base-url or --start-server with --browser" }]
      }));
    }

    const executablePath = findChromiumExecutable();
    const browser = await chromium.launch({ headless: true, executablePath });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const results: BrowserRouteSmokeResult[] = [];

      for (const route of input.routes) {
        const target = new URL(route.routePath, baseUrl).toString();
        const response = await page.goto(target, { waitUntil: "networkidle", timeout: input.timeoutMs });
        const text = await page.locator("body").innerText({ timeout: input.timeoutMs }).catch(() => "");
        const shell = await page.locator(".route-shell").boundingBox({ timeout: 5_000 }).catch(() => null);
        results.push({
          routePath: route.routePath,
          checks: [
            {
              name: "browser response",
              ok: Boolean(response && response.status() < 400),
              detail: response ? `${response.status()} ${target}` : `no response for ${target}`
            },
            {
              name: "browser title text",
              ok: text.includes(route.title),
              detail: route.title
            },
            {
              name: "browser route shell visible",
              ok: Boolean(shell && shell.width > 0 && shell.height > 0),
              detail: shell ? `${Math.round(shell.width)}x${Math.round(shell.height)}` : "missing .route-shell"
            }
          ]
        });
      }

      await page.close();
      return results;
    } finally {
      await browser.close();
    }
  } finally {
    if (server) {
      stopServer(server);
    }
  }
}

function startFormalCloneDevServer(formalCloneRoot: string, port: number): ChildProcessWithoutNullStreams {
  const executable = process.platform === "win32" ? "cmd.exe" : "corepack";
  const args =
    process.platform === "win32"
      ? ["/c", "corepack", "pnpm", "dev", "--hostname", "127.0.0.1", "--port", String(port)]
      : ["pnpm", "dev", "--hostname", "127.0.0.1", "--port", String(port)];

  return spawn(executable, args, {
    cwd: formalCloneRoot,
    windowsHide: true,
    stdio: "pipe"
  });
}

async function waitForServer(baseUrl: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(baseUrl);
      if (response.status < 500) {
        return;
      }
    } catch {
      // Wait and retry.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

function stopServer(server: ChildProcessWithoutNullStreams): void {
  if (process.platform === "win32" && server.pid) {
    spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], { windowsHide: true });
    return;
  }
  server.kill("SIGTERM");
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

function findChromiumExecutable(): string | undefined {
  const candidates = [
    process.env.PLANARIAN_CHROMIUM_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find((candidate) => existsSync(candidate));
}
