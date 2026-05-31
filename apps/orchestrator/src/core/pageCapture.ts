import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Response } from "playwright";
import type { NetworkRequestSummary } from "@planarian/shared";
import { getSessionRoot } from "./sessionRepository.js";
import type { DiscoveredPage } from "./pageDiscovery.js";

export interface CapturePagesOptions {
  projectRoot: string;
  sessionId: string;
  limit?: number;
  refresh?: boolean;
}

export interface CapturedPageResult {
  url: string;
  outputDir: string;
  skipped: boolean;
}

export interface CapturePagesResult {
  sessionId: string;
  captured: CapturedPageResult[];
  manifestPath: string;
}

export async function capturePages(options: CapturePagesOptions): Promise<CapturePagesResult> {
  const sessionRoot = getSessionRoot(options.projectRoot, options.sessionId);
  const siteMap = (await importSiteMap(path.join(sessionRoot, "target-research", "site-map.json"))).slice(
    0,
    options.limit ?? 10
  );
  const pagesRoot = path.join(sessionRoot, "target-research", "pages");
  const executablePath = findChromiumExecutable();
  const browser = await chromium.launch({ headless: true, executablePath });
  const captured: CapturedPageResult[] = [];

  try {
    for (const pageInfo of siteMap) {
      const slug = slugForPage(pageInfo);
      const outputDir = path.join(pagesRoot, slug);
      const htmlPath = path.join(outputDir, "raw-html.html");

      if (!options.refresh && existsSync(htmlPath)) {
        captured.push({ url: pageInfo.url, outputDir: relativeSessionPath(sessionRoot, outputDir), skipped: true });
        continue;
      }

      await mkdir(outputDir, { recursive: true });
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const network = new Map<string, NetworkRequestSummary>();
      page.on("response", (response) => {
        const summary = summarizeResponse(response);
        network.set(`${summary.method}:${summary.url}`, summary);
      });

      try {
        await page.goto(pageInfo.url, { waitUntil: "networkidle", timeout: 45_000 });
        await writeFile(htmlPath, await page.content(), "utf8");
        await page.screenshot({ path: path.join(outputDir, "desktop.png"), fullPage: true });
        await writeFile(
          path.join(outputDir, "network-analysis.json"),
          `${JSON.stringify(Array.from(network.values()), null, 2)}\n`,
          "utf8"
        );
        await writeFile(path.join(outputDir, "page.json"), `${JSON.stringify(pageInfo, null, 2)}\n`, "utf8");
        captured.push({ url: pageInfo.url, outputDir: relativeSessionPath(sessionRoot, outputDir), skipped: false });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  const manifestPath = path.join(pagesRoot, "capture-manifest.json");
  await mkdir(pagesRoot, { recursive: true });
  await writeFile(
    manifestPath,
    `${JSON.stringify({ sessionId: options.sessionId, capturedAt: new Date().toISOString(), pages: captured }, null, 2)}\n`,
    "utf8"
  );

  return {
    sessionId: options.sessionId,
    captured,
    manifestPath
  };
}

export function slugForPage(page: Pick<DiscoveredPage, "pathname">): string {
  const parts = page.pathname.split("/").filter(Boolean);
  if (parts.length === 0) {
    return "home";
  }
  return parts.join("--").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 120) || "page";
}

async function importSiteMap(siteMapPath: string): Promise<DiscoveredPage[]> {
  const { readFile } = await import("node:fs/promises");
  const content = await readFile(siteMapPath, "utf8");
  return JSON.parse(content) as DiscoveredPage[];
}

function summarizeResponse(response: Response): NetworkRequestSummary {
  const request = response.request();
  const contentType = response.headers()["content-type"];
  const url = response.url();
  const resourceType = request.resourceType();
  const isApiCandidate =
    resourceType === "xhr" ||
    resourceType === "fetch" ||
    /\/api(\/|$)/i.test(url) ||
    /\/graphql(\/|$|\?)/i.test(url) ||
    contentType?.toLowerCase().includes("application/json") === true;

  return {
    url,
    method: request.method(),
    resourceType,
    status: response.status(),
    contentType,
    isApiCandidate
  };
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

function relativeSessionPath(sessionRoot: string, targetPath: string): string {
  return path.relative(sessionRoot, targetPath).replace(/\\/g, "/");
}
