import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface WrittenIntegrationFile {
  path: string;
  absolutePath: string;
}

export async function writeIntegrationFile(root: string, relativePath: string, content: string): Promise<WrittenIntegrationFile> {
  const absolutePath = path.join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, "utf8");
  return {
    path: relativePath,
    absolutePath
  };
}

