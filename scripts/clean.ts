import { rm } from "node:fs/promises";
import path from "node:path";

const targets = [
  "apps/orchestrator/dist",
  "apps/orchestrator/tsconfig.tsbuildinfo",
  "packages/shared/dist",
  "packages/shared/tsconfig.tsbuildinfo",
  "packages/crawler/dist",
  "packages/crawler/tsconfig.tsbuildinfo",
  "packages/generator/dist",
  "packages/generator/tsconfig.tsbuildinfo",
  "packages/react-grab-bridge/dist",
  "packages/react-grab-bridge/tsconfig.tsbuildinfo"
];

for (const target of targets) {
  await rm(path.join(process.cwd(), target), { recursive: true, force: true });
}

console.log("Removed TypeScript build outputs.");

