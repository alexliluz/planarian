import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page, type Response } from "playwright";
import type { NetworkRequestSummary } from "@planarian/shared";
import { classifySite } from "./classifySite.js";

export interface AnalyzeTargetOptions {
  url: string;
  outputDir: string;
}

export interface AnalyzeTargetResult {
  title?: string;
  description?: string;
  classification: ReturnType<typeof classifySite>["classification"];
  requiresAuth: boolean;
  hasApiRequests: boolean;
  hasHeavyClientRendering: boolean;
  detectedFrameworks: string[];
  notes: string[];
  network: NetworkRequestSummary[];
}

export async function analyzeTarget(options: AnalyzeTargetOptions): Promise<AnalyzeTargetResult> {
  await mkdir(options.outputDir, { recursive: true });

  const executablePath = findChromiumExecutable();
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const network = new Map<string, NetworkRequestSummary>();

  page.on("response", (response) => {
    const summary = summarizeResponse(response);
    network.set(`${summary.method}:${summary.url}`, summary);
  });

  try {
    await page.goto(options.url, { waitUntil: "networkidle", timeout: 45_000 });
  } catch (error) {
    await browser.close();
    throw new Error(`Failed to analyze target ${options.url}: ${(error as Error).message}`);
  }

  const html = await page.content();
  await writeFile(path.join(options.outputDir, "raw-html.html"), html, "utf8");
  await page.screenshot({ path: path.join(options.outputDir, "desktop.png"), fullPage: true });

  const pageSignals = await collectPageSignals(page, html);
  await browser.close();

  const networkSummaries = Array.from(network.values());
  const classification = classifySite({
    bodyTextLength: pageSignals.bodyTextLength,
    hasRootOnlyHtml: pageSignals.hasRootOnlyHtml,
    scriptCount: pageSignals.scriptCount,
    detectedFrameworks: pageSignals.detectedFrameworks,
    authSignals: pageSignals.authSignals,
    network: networkSummaries
  });

  return {
    title: pageSignals.title,
    description: pageSignals.description,
    classification: classification.classification,
    requiresAuth: classification.requiresAuth,
    hasApiRequests: classification.hasApiRequests,
    hasHeavyClientRendering: classification.hasHeavyClientRendering,
    detectedFrameworks: pageSignals.detectedFrameworks,
    notes: classification.notes,
    network: networkSummaries
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

async function collectPageSignals(page: Page, html: string) {
  return page.evaluate((documentHtml) => {
    const bodyText = document.body?.innerText ?? "";
    const bodyTextLower = bodyText.toLowerCase();
    const scriptCount = document.scripts.length;
    const rootIds = ["root", "__next", "app"];
    const rootElements = rootIds.map((id) => document.getElementById(id)).filter(Boolean);
    const bodyElementCount = document.body?.querySelectorAll("*").length ?? 0;
    const hasRootOnlyHtml = rootElements.length > 0 && bodyElementCount <= scriptCount + 8 && bodyText.trim().length < 300;
    const detectedFrameworks = new Set<string>();

    if (document.getElementById("__NEXT_DATA__") || documentHtml.includes("_next/static")) {
      detectedFrameworks.add("next");
    }
    if (document.getElementById("__NUXT__") || documentHtml.includes("__NUXT__")) {
      detectedFrameworks.add("nuxt");
    }
    if (document.getElementById("root")) {
      detectedFrameworks.add("react-root");
    }
    if (document.getElementById("__next")) {
      detectedFrameworks.add("next-root");
    }
    if (document.getElementById("app")) {
      detectedFrameworks.add("app-root");
    }
    if (documentHtml.toLowerCase().includes("vite")) {
      detectedFrameworks.add("vite");
    }

    const authTerms = ["sign in", "log in", "login", "logout", "dashboard", "my account", "auth", "session", "password"];
    const authSignals = authTerms.filter((term) => bodyTextLower.includes(term) || documentHtml.toLowerCase().includes(term));

    return {
      title: document.title || undefined,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? undefined,
      bodyTextLength: bodyText.trim().length,
      hasRootOnlyHtml,
      scriptCount,
      detectedFrameworks: Array.from(detectedFrameworks),
      authSignals
    };
  }, html);
}
