import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { renderRouteSmokeReport, runFormalRouteSmoke } from "./formalRouteSmoke.js";

let tempRoot: string | undefined;

afterEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("runFormalRouteSmoke", () => {
  it("checks generated route pages and writes a report", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-route-smoke-"));
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", "demo");
    const formalCloneRoot = path.join(sessionRoot, "formal-clone");
    await mkdir(path.join(formalCloneRoot, "app", "people"), { recursive: true });
    await mkdir(path.join(formalCloneRoot, "data"), { recursive: true });
    await writeFile(
      path.join(formalCloneRoot, "data", "route-content.json"),
      JSON.stringify([
        {
          title: "Our Team",
          routePath: "/people",
          sections: ["Jane Doe"],
          paragraphs: [],
          links: []
        }
      ]),
      "utf8"
    );
    await writeFile(
      path.join(formalCloneRoot, "app", "people", "page.tsx"),
      `const route = { "title": "Our Team" };\nexport default function Page() { return <main className="route-shell">{route.title}</main>; }`,
      "utf8"
    );
    await writeFile(path.join(formalCloneRoot, "app", "globals.css"), ".route-shell { min-height: 100vh; }", "utf8");

    const report = await runFormalRouteSmoke(tempRoot, "demo");
    const content = await readFile(report.reportPath, "utf8");

    expect(report.ready).toBe(true);
    expect(content).toContain("Status: ready");
    expect(content).toContain("Mode: static");
    expect(content).toContain("| /people | ok | 5 |");
  });

  it("adds browser-backed checks when a browser runner is provided", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-route-smoke-"));
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", "demo");
    const formalCloneRoot = path.join(sessionRoot, "formal-clone");
    await mkdir(path.join(formalCloneRoot, "app", "people"), { recursive: true });
    await mkdir(path.join(formalCloneRoot, "data"), { recursive: true });
    await writeFile(
      path.join(formalCloneRoot, "data", "route-content.json"),
      JSON.stringify([{ title: "Our Team", routePath: "/people", sections: ["Jane Doe"], paragraphs: [], links: [] }]),
      "utf8"
    );
    await writeFile(
      path.join(formalCloneRoot, "app", "people", "page.tsx"),
      `const route = { "title": "Our Team" };\nexport default function Page() { return <main className="route-shell">{route.title}</main>; }`,
      "utf8"
    );
    await writeFile(path.join(formalCloneRoot, "app", "globals.css"), ".route-shell { min-height: 100vh; }", "utf8");

    const report = await runFormalRouteSmoke(tempRoot, "demo", {
      browser: true,
      browserRunner: async ({ routes }) =>
        routes.map((route) => ({
          routePath: route.routePath,
          checks: [{ name: "browser response", ok: true, detail: "200" }]
        }))
    });
    const content = await readFile(report.reportPath, "utf8");

    expect(report.ready).toBe(true);
    expect(report.mode).toBe("browser");
    expect(report.routes[0]?.checks).toHaveLength(6);
    expect(content).toContain("Mode: browser");
    expect(content).toContain("- [x] browser response: 200");
  });

  it("records browser runner failures as failed checks", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "planarian-route-smoke-"));
    const sessionRoot = path.join(tempRoot, "outputs", "sessions", "demo");
    const formalCloneRoot = path.join(sessionRoot, "formal-clone");
    await mkdir(path.join(formalCloneRoot, "app", "people"), { recursive: true });
    await mkdir(path.join(formalCloneRoot, "data"), { recursive: true });
    await writeFile(
      path.join(formalCloneRoot, "data", "route-content.json"),
      JSON.stringify([{ title: "Our Team", routePath: "/people", sections: ["Jane Doe"], paragraphs: [], links: [] }]),
      "utf8"
    );
    await writeFile(
      path.join(formalCloneRoot, "app", "people", "page.tsx"),
      `const route = { "title": "Our Team" };\nexport default function Page() { return <main className="route-shell">{route.title}</main>; }`,
      "utf8"
    );
    await writeFile(path.join(formalCloneRoot, "app", "globals.css"), ".route-shell { min-height: 100vh; }", "utf8");

    const report = await runFormalRouteSmoke(tempRoot, "demo", {
      browser: true,
      browserRunner: async ({ routes }) =>
        routes.map((route) => ({
          routePath: route.routePath,
          checks: [{ name: "browser smoke", ok: false, detail: "server failed" }]
        }))
    });
    const content = await readFile(report.reportPath, "utf8");

    expect(report.ready).toBe(false);
    expect(content).toContain("Status: not ready");
    expect(content).toContain("- [ ] browser smoke: server failed");
  });
});

describe("renderRouteSmokeReport", () => {
  it("renders failed route status", () => {
    const report = renderRouteSmokeReport({
      sessionId: "demo",
      formalCloneRoot: "formal-clone",
      mode: "static",
      ready: false,
      reportPath: "formal-clone/ROUTE_SMOKE.md",
      routes: [
        {
          routePath: "/people",
          ok: false,
          checks: [{ name: "route page", ok: false, detail: "missing" }]
        }
      ]
    });

    expect(report).toContain("Status: not ready");
    expect(report).toContain("- [ ] route page: missing");
  });
});
