import { execFileSync } from "node:child_process";

try {
  const output = execFileSync("git", ["status", "--short"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });
  process.stdout.write(output || "Working tree clean.\n");
} catch {
  console.log("Not a git repository.");
}

