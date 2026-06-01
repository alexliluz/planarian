import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NetworkRequestSummary } from "@planarian/shared";
import { createAssetCandidates, type AssetCandidate } from "./assetDownloadPlan.js";
import { getSessionRoot, readCloneSession } from "./sessionRepository.js";

export interface LocalizeAssetsOptions {
  projectRoot: string;
  sessionId: string;
  limit?: number;
  dryRun?: boolean;
}

export interface LocalizedAsset {
  url: string;
  kind: AssetCandidate["kind"];
  localPath: string;
  publicPath: string;
  status: "downloaded" | "skipped" | "failed" | "planned";
  contentType?: string;
  bytes?: number;
  error?: string;
}

export interface LocalizeAssetsResult {
  sessionId: string;
  manifestPath: string;
  assets: LocalizedAsset[];
}

const DEFAULT_LIMIT = 6;

export async function localizeAssets(options: LocalizeAssetsOptions): Promise<LocalizeAssetsResult> {
  await readCloneSession(options.projectRoot, options.sessionId);
  const sessionRoot = getSessionRoot(options.projectRoot, options.sessionId);
  const network = await readNetwork(sessionRoot);
  const candidates = createAssetCandidates(network)
    .filter((candidate) => candidate.priority === "localize" && candidate.suggestedPath)
    .slice(0, options.limit ?? DEFAULT_LIMIT);

  const assets: LocalizedAsset[] = [];
  for (const candidate of candidates) {
    assets.push(await localizeCandidate(sessionRoot, candidate, Boolean(options.dryRun)));
  }

  const manifestPath = path.join(sessionRoot, "formal-clone", "public", "assets", "ASSET_MANIFEST.json");
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify({ sessionId: options.sessionId, assets }, null, 2)}\n`, "utf8");

  return {
    sessionId: options.sessionId,
    manifestPath,
    assets
  };
}

async function localizeCandidate(sessionRoot: string, candidate: AssetCandidate, dryRun: boolean): Promise<LocalizedAsset> {
  const suggestedPath = candidate.suggestedPath;
  if (!suggestedPath) {
    return {
      url: candidate.url,
      kind: candidate.kind,
      localPath: "",
      publicPath: "",
      status: "failed",
      error: "Candidate has no suggestedPath."
    };
  }

  const localPath = path.join(sessionRoot, "formal-clone", suggestedPath);
  const publicPath = toPublicPath(suggestedPath);

  if (dryRun) {
    return {
      url: candidate.url,
      kind: candidate.kind,
      localPath: toPosixPath(path.relative(sessionRoot, localPath)),
      publicPath,
      status: "planned"
    };
  }

  try {
    const response = await fetch(candidate.url, {
      headers: {
        "user-agent": "Planarian public UI asset localizer"
      }
    });

    if (!response.ok) {
      return {
        url: candidate.url,
        kind: candidate.kind,
        localPath: toPosixPath(path.relative(sessionRoot, localPath)),
        publicPath,
        status: "failed",
        error: `HTTP ${response.status}`
      };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await mkdir(path.dirname(localPath), { recursive: true });
    await writeFile(localPath, buffer);

    return {
      url: candidate.url,
      kind: candidate.kind,
      localPath: toPosixPath(path.relative(sessionRoot, localPath)),
      publicPath,
      status: "downloaded",
      contentType: response.headers.get("content-type") ?? undefined,
      bytes: buffer.length
    };
  } catch (error) {
    return {
      url: candidate.url,
      kind: candidate.kind,
      localPath: toPosixPath(path.relative(sessionRoot, localPath)),
      publicPath,
      status: "failed",
      error: (error as Error).message
    };
  }
}

async function readNetwork(sessionRoot: string): Promise<NetworkRequestSummary[]> {
  const content = await readFile(path.join(sessionRoot, "target-research", "network-analysis.json"), "utf8");
  return JSON.parse(content) as NetworkRequestSummary[];
}

function toPublicPath(suggestedPath: string): string {
  return `/${suggestedPath.replace(/^public\//, "")}`;
}

function toPosixPath(value: string): string {
  return value.replace(/\\/g, "/");
}
