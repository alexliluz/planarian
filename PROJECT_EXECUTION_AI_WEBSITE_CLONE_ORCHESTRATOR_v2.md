# PROJECT_EXECUTION.md

# AI Website Clone Orchestrator — 三项目整合开发执行文档

> Version: v0.2.0  
> Owner: Alex Liu  
> Primary IDEs/Agents: Codex App / Codex CLI + Cursor IDE  
> Core upstream references:
> - `firecrawl/open-lovable`
> - `JCodesMore/ai-website-cloner-template`
> - `aidenybai/react-grab`

---

## 0. 项目一句话定义

本项目不是简单“复制网页源码”的工具，而是一个 **AI-driven Website Clone Orchestrator**：

> 输入一个目标网站 URL，系统自动判断网站类型，抓取可见页面、截图、DOM、样式、字体、资源、API 线索，生成可维护的 React/Next.js 工程；再通过 AI agent + 可视化元素选择工具，自动完成局部 UI 精修、mock 数据补齐、交互补齐、构建验证和任务记录。

最终目标是把现在需要人工完成的流程：

1. 看网站；
2. 判断静态/动态；
3. 截图；
4. 抓资源；
5. 生成 React 项目；
6. 比较差异；
7. 让 Cursor/Codex 改；
8. 手动追踪修改记录；

变成一个统一的、可恢复、可追踪、可多 Agent 协同的半自动系统。

---

## 1. 为什么要整合这三个项目

### 1.1 `firecrawl/open-lovable` 的价值

定位：

- URL → React app 初版生成器；
- 适合快速复刻 landing page、marketing site、portfolio、Web3 官网、AI 产品官网；
- 价值在于速度快，能快速获得一个“可看的视觉初稿”。

在本项目中的角色：

```text
Open Lovable = Fast Visual Draft Generator
```

也就是：

- 快速抓取目标 URL；
- 快速生成一版 React UI；
- 作为后续正式工程版本的视觉参考；
- 不作为最终主工程的唯一来源。

---

### 1.2 `JCodesMore/ai-website-cloner-template` 的价值

定位：

- AI coding agents 网站复刻模板；
- 面向 Claude Code、Codex CLI、Cursor 等 coding agent；
- 目标是把目标网站重建成干净、现代、可维护的 Next.js codebase。

在本项目中的角色：

```text
ai-website-cloner-template = Formal Engineering Clone Pipeline
```

也就是：

- 作为正式工程主线；
- 负责生成最终可维护 Next.js 项目；
- 负责组件化、设计 token、assets、responsive layout；
- 适合作为 Codex/Cursor 的主要执行基础。

---

### 1.3 `aidenybai/react-grab` 的价值

定位：

- 不是网站克隆器；
- 是 UI 元素选择 + 源码上下文复制工具；
- hover 某个 UI 元素后，可以复制对应 DOM、源码位置、附近代码、component stack，交给 agent 精准修改。

在本项目中的角色：

```text
React Grab = Local UI Precision Repair Layer
```

也就是：

- 不负责生成第一版；
- 用于正式工程生成后做局部 UI 精修；
- 减少 Cursor/Codex “乱改文件、不知道改哪里”的问题；
- 让用户选中某个页面元素后，系统能自动产生针对性 patch task。

---

## 2. 项目总目标

### 2.1 MVP 目标

MVP 阶段至少实现：

1. 输入目标 URL；
2. 自动生成目标网站分析报告；
3. 判断目标网站属于：
   - static/SSG；
   - SSR；
   - SPA；
   - app/dashboard；
   - auth-gated；
4. 自动抓取：
   - 页面 screenshot；
   - HTML；
   - DOM snapshot；
   - CSS links；
   - fonts；
   - image assets；
   - Fetch/XHR/API 线索；
5. 调用 Open Lovable 生成快速参考版；
6. 调用/集成 ai-website-cloner-template 生成正式版；
7. 生成统一的 `clone-session.json`；
8. 生成统一的 `TASKS.md`；
9. 在正式版项目中集成 React Grab；
10. 支持用户选中 UI 后生成修复任务；
11. Codex/Cursor 可以通过统一文档接续工作。

---

### 2.2 长期目标

长期目标是变成一个类似下面的产品：

```text
URL 输入
  ↓
自动侦察目标网站
  ↓
生成视觉参考版
  ↓
生成正式工程版
  ↓
自动比较差异
  ↓
自动生成 UI 修复任务
  ↓
AI agent 多轮修复
  ↓
mock API / mock data 补齐
  ↓
build / lint / visual check
  ↓
输出完整 Next.js 项目
```

最终要减少的人工环节：

- 手动判断静态/动态；
- 手动截图；
- 手动记录目标网站结构；
- 手动整理 assets；
- 手动告诉 AI 改哪个组件；
- 手动记录 Codex/Cursor 修改历史；
- 手动在两个 AI 之间同步上下文。

---

## 3. 系统核心原则

### 3.1 不偷后端原则

本系统只复刻：

- 可见 UI；
- 前端交互；
- 静态内容；
- mock 数据；
- 用户自己授权访问的内容。

本系统不做：

- 绕过登录；
- 绕过 paywall；
- 获取非公开 API；
- 获取数据库；
- 获取服务端源码；
- 盗用品牌、商标或用于钓鱼欺骗。

如果目标页面涉及登录、交易、支付、用户数据，本系统只生成：

```text
UI clone + mock data + placeholder API
```

真实后端需要用户自己实现。

---

### 3.2 主工程唯一原则

本系统允许生成多个候选版本，但最终只能有一个主工程：

```text
workspace/formal-clone/
```

`open-lovable-version/` 只能作为参考，不作为最终主工程。

---

### 3.3 所有 AI 修改必须可追踪

任何 Codex/Cursor 的修改都必须记录到：

```text
workspace/agent-memory/CHANGELOG_AGENT.md
workspace/agent-memory/DECISIONS.md
workspace/agent-memory/TASKS.md
```

避免两个 AI 不知道彼此做过什么。

---

### 3.4 每次任务前必须读上下文

Codex/Cursor 每次接手任务前，必须先读：

```text
PROJECT_EXECUTION.md
workspace/clone-session.json
workspace/agent-memory/TASKS.md
workspace/agent-memory/DECISIONS.md
workspace/agent-memory/CHANGELOG_AGENT.md
```

如果没有读完，不允许直接改代码。

---

## 4. 推荐项目目录结构

```text
ai-website-clone-orchestrator/
  PROJECT_EXECUTION.md
  README.md
  package.json
  turbo.json

  apps/
    orchestrator/
      src/
        cli/
        core/
        integrations/
        server/
        ui/
      package.json

    studio/
      src/
      package.json

  packages/
    shared/
      src/
        types.ts
        schemas.ts
        logger.ts
        fs-utils.ts
      package.json

    crawler/
      src/
        analyzeTarget.ts
        capturePage.ts
        extractAssets.ts
        extractNetwork.ts
        classifySite.ts
      package.json

    generator/
      src/
        runOpenLovable.ts
        runFormalClone.ts
        compareVersions.ts
        patchPlanner.ts
      package.json

    react-grab-bridge/
      src/
        initReactGrab.ts
        parseGrabContext.ts
        createPatchTask.ts
      package.json

    agent-memory/
      src/
        memoryStore.ts
        taskStore.ts
        decisionStore.ts
        changelogStore.ts
      package.json

  templates/
    formal-clone-template/
    mock-api-template/
    nextjs-base/

  workspace/
    sessions/
      example-session-id/
        clone-session.json
        target-research/
        open-lovable-version/
        formal-clone/
        comparison/
        references/
        mock-data/
        agent-memory/
          TASKS.md
          DECISIONS.md
          CHANGELOG_AGENT.md
          PROMPTS.md
```

---

## 5. 核心数据模型

### 5.1 `CloneSession`

文件位置：

```text
packages/shared/src/types.ts
```

关键代码：

```ts
export type SiteClassification =
  | "static"
  | "ssg"
  | "ssr"
  | "spa"
  | "web-app"
  | "auth-gated"
  | "unknown";

export type CloneMode =
  | "visual-only"
  | "visual-plus-interactions"
  | "visual-plus-mock-api"
  | "full-owned-app-rebuild";

export interface TargetSiteInfo {
  url: string;
  normalizedUrl: string;
  hostname: string;
  title?: string;
  description?: string;
  classification: SiteClassification;
  cloneMode: CloneMode;
  requiresAuth: boolean;
  hasApiRequests: boolean;
  hasHeavyClientRendering: boolean;
  detectedFrameworks: string[];
  notes: string[];
}

export interface AssetManifest {
  images: AssetItem[];
  fonts: AssetItem[];
  stylesheets: AssetItem[];
  scripts: AssetItem[];
  videos: AssetItem[];
  other: AssetItem[];
}

export interface AssetItem {
  url: string;
  type: string;
  localPath?: string;
  sizeBytes?: number;
  source: "html" | "css" | "network" | "screenshot" | "manual";
}

export interface NetworkRequestSummary {
  url: string;
  method: string;
  resourceType: string;
  status?: number;
  contentType?: string;
  isApiCandidate: boolean;
  requestPayloadPreview?: unknown;
  responsePreview?: unknown;
}

export interface ScreenshotSet {
  desktop?: string;
  tablet?: string;
  mobile?: string;
  fullPageDesktop?: string;
  fullPageMobile?: string;
}

export interface VersionPaths {
  openLovableVersion?: string;
  formalClone?: string;
  comparison?: string;
  references?: string;
  mockData?: string;
}

export interface CloneSession {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  target: TargetSiteInfo;
  screenshots: ScreenshotSet;
  assets: AssetManifest;
  network: NetworkRequestSummary[];
  versions: VersionPaths;
  tasks: AgentTask[];
  decisions: AgentDecision[];
  status:
    | "created"
    | "analyzed"
    | "draft-generated"
    | "formal-generated"
    | "repairing"
    | "validated"
    | "completed"
    | "failed";
}

export interface AgentTask {
  id: string;
  title: string;
  type:
    | "research"
    | "generate"
    | "compare"
    | "ui-repair"
    | "interaction"
    | "mock-api"
    | "cleanup"
    | "validation";
  status: "todo" | "in-progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: "codex" | "cursor" | "human" | "any";
  description: string;
  relatedFiles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentDecision {
  id: string;
  title: string;
  decision: string;
  rationale: string;
  alternativesConsidered: string[];
  createdAt: string;
  createdBy: "codex" | "cursor" | "human";
}
```

---

## 6. 目标网站自动分析模块

### 6.1 模块目标

输入 URL，输出：

```text
target-research/
  analysis.md
  network-analysis.json
  assets-manifest.json
  screenshots/
  raw-html.html
  dom-snapshot.json
```

---

### 6.2 `analyzeTarget.ts`

文件位置：

```text
packages/crawler/src/analyzeTarget.ts
```

关键代码：

```ts
import { chromium } from "playwright";
import type {
  TargetSiteInfo,
  NetworkRequestSummary,
  ScreenshotSet,
} from "@clone-orchestrator/shared";

export interface AnalyzeTargetOptions {
  url: string;
  outputDir: string;
  waitMs?: number;
}

export interface AnalyzeTargetResult {
  target: TargetSiteInfo;
  network: NetworkRequestSummary[];
  screenshots: ScreenshotSet;
  htmlPath: string;
}

export async function analyzeTarget(
  options: AnalyzeTargetOptions
): Promise<AnalyzeTargetResult> {
  const { url, outputDir, waitMs = 3000 } = options;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
  });

  const network: NetworkRequestSummary[] = [];

  page.on("response", async (response) => {
    const request = response.request();
    const resourceType = request.resourceType();
    const responseUrl = response.url();
    const headers = response.headers();
    const contentType = headers["content-type"] || "";

    const isApiCandidate =
      resourceType === "xhr" ||
      resourceType === "fetch" ||
      responseUrl.includes("/api/") ||
      responseUrl.includes("/graphql") ||
      contentType.includes("application/json");

    network.push({
      url: responseUrl,
      method: request.method(),
      resourceType,
      status: response.status(),
      contentType,
      isApiCandidate,
    });
  });

  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(waitMs);

  const title = await page.title();
  const html = await page.content();

  const fs = await import("fs/promises");
  const path = await import("path");

  await fs.mkdir(outputDir, { recursive: true });

  const htmlPath = path.join(outputDir, "raw-html.html");
  await fs.writeFile(htmlPath, html, "utf-8");

  const desktopPath = path.join(outputDir, "desktop.png");
  await page.screenshot({ path: desktopPath, fullPage: true });

  const bodyText = await page.locator("body").innerText().catch(() => "");
  const detectedFrameworks = await detectFrameworks(page);

  const classification = classifyFromSignals({
    html,
    bodyText,
    network,
    detectedFrameworks,
  });

  const target: TargetSiteInfo = {
    url,
    normalizedUrl: new URL(url).toString(),
    hostname: new URL(url).hostname,
    title,
    classification,
    cloneMode:
      classification === "web-app" || classification === "auth-gated"
        ? "visual-plus-mock-api"
        : "visual-plus-interactions",
    requiresAuth: detectAuthSignals(html, bodyText),
    hasApiRequests: network.some((n) => n.isApiCandidate),
    hasHeavyClientRendering: detectHeavyClientRendering(html, bodyText),
    detectedFrameworks,
    notes: [],
  };

  await browser.close();

  return {
    target,
    network,
    screenshots: {
      desktop: desktopPath,
      fullPageDesktop: desktopPath,
    },
    htmlPath,
  };
}

async function detectFrameworks(page: any): Promise<string[]> {
  return await page.evaluate(() => {
    const frameworks: string[] = [];

    if ((window as any).__NEXT_DATA__) frameworks.push("Next.js");
    if ((window as any).__NUXT__) frameworks.push("Nuxt");
    if (document.querySelector("[data-reactroot]")) frameworks.push("React");
    if (document.querySelector("#root")) frameworks.push("SPA-root");
    if (document.querySelector("#__next")) frameworks.push("Next.js-root");
    if (document.querySelector("#app")) frameworks.push("Vue/Svelte-root");

    const scripts = Array.from(document.scripts).map((s) => s.src);
    if (scripts.some((src) => src.includes("_next/static"))) {
      frameworks.push("Next.js-static-assets");
    }
    if (scripts.some((src) => src.includes("vite"))) {
      frameworks.push("Vite");
    }

    return Array.from(new Set(frameworks));
  });
}

function detectAuthSignals(html: string, bodyText: string): boolean {
  const text = `${html}\n${bodyText}`.toLowerCase();
  return [
    "sign in",
    "log in",
    "login",
    "logout",
    "dashboard",
    "my account",
    "auth",
    "session",
    "password",
  ].some((keyword) => text.includes(keyword));
}

function detectHeavyClientRendering(html: string, bodyText: string): boolean {
  const hasTinyBodyText = bodyText.trim().length < 500;
  const hasRootOnly =
    html.includes('<div id="root"') ||
    html.includes('<div id="__next"') ||
    html.includes('<div id="app"');

  const hasLargeScriptBundles =
    (html.match(/<script/g) || []).length >= 5 &&
    (html.includes(".js") || html.includes("_next/static"));

  return hasTinyBodyText && hasRootOnly && hasLargeScriptBundles;
}

function classifyFromSignals(input: {
  html: string;
  bodyText: string;
  network: NetworkRequestSummary[];
  detectedFrameworks: string[];
}): TargetSiteInfo["classification"] {
  const { html, bodyText, network, detectedFrameworks } = input;

  const hasApi = network.some((n) => n.isApiCandidate);
  const isHeavyClient = detectHeavyClientRendering(html, bodyText);
  const hasAuth = detectAuthSignals(html, bodyText);

  if (hasAuth && hasApi) return "auth-gated";
  if (hasApi && isHeavyClient) return "web-app";
  if (isHeavyClient) return "spa";
  if (detectedFrameworks.some((f) => f.includes("Next"))) return "ssr";
  if (bodyText.length > 1000 && !hasApi) return "static";

  return "unknown";
}
```

---

## 7. Session 初始化模块

### 7.1 `createSession.ts`

文件位置：

```text
apps/orchestrator/src/core/createSession.ts
```

关键代码：

```ts
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { CloneSession } from "@clone-orchestrator/shared";
import { analyzeTarget } from "@clone-orchestrator/crawler";

export interface CreateSessionInput {
  targetUrl: string;
  workspaceRoot: string;
}

export async function createCloneSession(input: CreateSessionInput) {
  const sessionId = createSessionId(input.targetUrl);
  const sessionRoot = path.join(input.workspaceRoot, "sessions", sessionId);

  const dirs = [
    "target-research",
    "target-research/screenshots",
    "open-lovable-version",
    "formal-clone",
    "comparison",
    "references",
    "mock-data",
    "agent-memory",
  ];

  for (const dir of dirs) {
    await fs.mkdir(path.join(sessionRoot, dir), { recursive: true });
  }

  const analysis = await analyzeTarget({
    url: input.targetUrl,
    outputDir: path.join(sessionRoot, "target-research"),
  });

  const now = new Date().toISOString();

  const session: CloneSession = {
    sessionId,
    createdAt: now,
    updatedAt: now,
    target: analysis.target,
    screenshots: analysis.screenshots,
    assets: {
      images: [],
      fonts: [],
      stylesheets: [],
      scripts: [],
      videos: [],
      other: [],
    },
    network: analysis.network,
    versions: {
      openLovableVersion: path.join(sessionRoot, "open-lovable-version"),
      formalClone: path.join(sessionRoot, "formal-clone"),
      comparison: path.join(sessionRoot, "comparison"),
      references: path.join(sessionRoot, "references"),
      mockData: path.join(sessionRoot, "mock-data"),
    },
    tasks: [],
    decisions: [],
    status: "analyzed",
  };

  await fs.writeFile(
    path.join(sessionRoot, "clone-session.json"),
    JSON.stringify(session, null, 2),
    "utf-8"
  );

  await initializeAgentMemory(sessionRoot, session);

  return {
    session,
    sessionRoot,
  };
}

function createSessionId(url: string) {
  const hostname = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, "-");
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 8);
  return `${hostname}-${hash}`;
}

async function initializeAgentMemory(sessionRoot: string, session: CloneSession) {
  const memoryRoot = path.join(sessionRoot, "agent-memory");

  await fs.writeFile(
    path.join(memoryRoot, "TASKS.md"),
    `# TASKS

## Session

- Session ID: ${session.sessionId}
- Target URL: ${session.target.url}
- Classification: ${session.target.classification}
- Clone Mode: ${session.target.cloneMode}

## Current Tasks

- [ ] Generate Open Lovable visual draft
- [ ] Generate formal clone using ai-website-cloner-template
- [ ] Compare two generated versions
- [ ] Install React Grab in formal clone
- [ ] Create UI repair tasks
- [ ] Add mock data for dynamic sections
- [ ] Run lint/build validation
`,
    "utf-8"
  );

  await fs.writeFile(
    path.join(memoryRoot, "DECISIONS.md"),
    `# DECISIONS

## D-0001: Main codebase rule

Decision:
Use \`formal-clone/\` as the main codebase. Use \`open-lovable-version/\` only as visual reference.

Rationale:
Open Lovable is optimized for speed. The formal clone should be more maintainable and agent-friendly.
`,
    "utf-8"
  );

  await fs.writeFile(
    path.join(memoryRoot, "CHANGELOG_AGENT.md"),
    `# AGENT CHANGELOG

All Codex/Cursor modifications must be logged here.

## Format

### YYYY-MM-DD HH:mm — Agent Name

Changed:
- ...

Reason:
- ...

Files:
- ...
`,
    "utf-8"
  );

  await fs.writeFile(
    path.join(memoryRoot, "PROMPTS.md"),
    `# PROMPTS

This file stores reusable prompts for Codex/Cursor.

`,
    "utf-8"
  );
}
```

---

## 8. Open Lovable 集成策略

### 8.1 现实设计

Open Lovable 本身更像一个独立 app，不建议一开始强行深度 fork。

MVP 阶段建议采用：

```text
External Generator Mode
```

也就是：

1. Orchestrator 创建 session；
2. 用户/脚本打开 Open Lovable；
3. 输入目标 URL；
4. 导出生成项目；
5. 放入：

```text
sessions/<session-id>/open-lovable-version/
```

后续再做自动化深度集成。

---

### 8.2 `runOpenLovable.ts`

文件位置：

```text
packages/generator/src/runOpenLovable.ts
```

MVP 代码：

```ts
import fs from "fs/promises";
import path from "path";

export interface OpenLovableImportInput {
  exportedProjectPath: string;
  sessionRoot: string;
}

export async function importOpenLovableVersion(input: OpenLovableImportInput) {
  const targetDir = path.join(input.sessionRoot, "open-lovable-version");

  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });

  await copyDirectory(input.exportedProjectPath, targetDir);

  return {
    ok: true,
    targetDir,
  };
}

async function copyDirectory(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (["node_modules", ".next", "dist", "build"].includes(entry.name)) {
        continue;
      }
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
```

---

## 9. ai-website-cloner-template 集成策略

### 9.1 现实设计

这个项目更适合作为正式主工程模板。

MVP 阶段建议：

```text
Template Copy Mode
```

也就是：

1. 把 ai-website-cloner-template 作为 git submodule 或 template source；
2. 每个 session copy 一份到 `formal-clone/`；
3. 在 `formal-clone/` 内生成 `AGENT_BRIEF.md`；
4. Codex/Cursor 读取 `AGENT_BRIEF.md` 后执行复刻任务。

---

### 9.2 `runFormalClone.ts`

文件位置：

```text
packages/generator/src/runFormalClone.ts
```

关键代码：

```ts
import fs from "fs/promises";
import path from "path";
import type { CloneSession } from "@clone-orchestrator/shared";

export interface FormalCloneInput {
  templatePath: string;
  sessionRoot: string;
  session: CloneSession;
}

export async function prepareFormalClone(input: FormalCloneInput) {
  const targetDir = path.join(input.sessionRoot, "formal-clone");

  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });

  await copyTemplate(input.templatePath, targetDir);

  await fs.writeFile(
    path.join(targetDir, "AGENT_BRIEF.md"),
    createAgentBrief(input.session),
    "utf-8"
  );

  return {
    ok: true,
    targetDir,
    nextAction:
      "Open this folder in Codex/Cursor and ask the agent to follow AGENT_BRIEF.md.",
  };
}

function createAgentBrief(session: CloneSession) {
  return `# AGENT_BRIEF.md

You are working inside the formal clone codebase.

## Required Reading

Before modifying code, read:

1. ../clone-session.json
2. ../agent-memory/TASKS.md
3. ../agent-memory/DECISIONS.md
4. ../agent-memory/CHANGELOG_AGENT.md
5. ./AGENT_BRIEF.md

## Target

- URL: ${session.target.url}
- Hostname: ${session.target.hostname}
- Classification: ${session.target.classification}
- Clone Mode: ${session.target.cloneMode}
- Requires Auth: ${session.target.requiresAuth}
- Has API Requests: ${session.target.hasApiRequests}
- Heavy Client Rendering: ${session.target.hasHeavyClientRendering}
- Detected Frameworks: ${session.target.detectedFrameworks.join(", ") || "unknown"}

## Main Rule

This folder is the final maintainable codebase.

Do not blindly copy minified HTML or CSS.
Rebuild the target as clean React/Next.js components.

## Goal

Clone the visible UI and interactions of the target website.

If backend functionality is required, create mock data and placeholder API routes.
Do not attempt to bypass authentication or access private backend systems.

## Required Output

1. Reusable components
2. Design tokens
3. Responsive layout
4. Mock data for dynamic sections
5. Clear TODO comments for real backend integration
6. Passing build
7. Updated ../agent-memory/CHANGELOG_AGENT.md
`;
}

async function copyTemplate(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (["node_modules", ".next", "dist", "build", ".git"].includes(entry.name)) {
        continue;
      }
      await copyTemplate(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
```

---

## 10. 两个版本的自动对比模块

### 10.1 目标

对比：

```text
open-lovable-version/
formal-clone/
```

输出：

```text
comparison/section-comparison.md
comparison/recommendations.json
```

---

### 10.2 `compareVersions.ts`

文件位置：

```text
packages/generator/src/compareVersions.ts
```

关键代码：

```ts
import fs from "fs/promises";
import path from "path";

export interface CompareVersionsInput {
  sessionRoot: string;
}

export interface SectionComparison {
  sectionName: string;
  betterSource: "open-lovable" | "formal-clone" | "rewrite" | "unknown";
  reason: string;
  recommendedAction: string;
}

export async function createVersionComparison(input: CompareVersionsInput) {
  const openDir = path.join(input.sessionRoot, "open-lovable-version");
  const formalDir = path.join(input.sessionRoot, "formal-clone");
  const comparisonDir = path.join(input.sessionRoot, "comparison");

  await fs.mkdir(comparisonDir, { recursive: true });

  const openFiles = await listSourceFiles(openDir);
  const formalFiles = await listSourceFiles(formalDir);

  const report = `# Section Comparison

## Purpose

Compare the Open Lovable quick draft and the formal clone.

## Open Lovable Files

${openFiles.map((f) => `- ${f}`).join("\n")}

## Formal Clone Files

${formalFiles.map((f) => `- ${f}`).join("\n")}

## Manual / Agent Review Required

Ask Codex or Cursor:

\`\`\`text
Compare the Open Lovable version and the formal clone version.

Use formal-clone as the main codebase.

For each section:
1. Which version is visually closer to the target?
2. Which version has cleaner code?
3. Should we borrow styles/components from Open Lovable?
4. Should we rewrite the section?
5. Which files need to be modified?

Output a table with:
- Section
- Better visual source
- Better code source
- Recommended action
- Files to modify
\`\`\`
`;

  const reportPath = path.join(comparisonDir, "section-comparison.md");
  await fs.writeFile(reportPath, report, "utf-8");

  return {
    reportPath,
  };
}

async function listSourceFiles(root: string) {
  const results: string[] = [];

  async function walk(dir: string) {
    let entries: any[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full);

      if (
        entry.isDirectory() &&
        !["node_modules", ".next", "dist", "build", ".git"].includes(entry.name)
      ) {
        await walk(full);
      } else if (
        entry.isFile() &&
        /\.(tsx|ts|jsx|js|css|json|md)$/.test(entry.name)
      ) {
        results.push(rel);
      }
    }
  }

  await walk(root);
  return results.sort();
}
```

---

## 11. React Grab Bridge

### 11.1 目标

把 React Grab 的输出转化为标准 patch task，让 Codex/Cursor 可以持续修复。

---

### 11.2 React Grab 安装策略

在 `formal-clone/` 中运行：

```bash
npx grab@latest init
```

如果是 Next.js App Router，可以在 `app/layout.tsx` 中开发环境注入：

```tsx
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <>
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              strategy="beforeInteractive"
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

### 11.3 `parseGrabContext.ts`

文件位置：

```text
packages/react-grab-bridge/src/parseGrabContext.ts
```

关键代码：

```ts
export interface ReactGrabContext {
  raw: string;
  selectedElement?: string;
  componentName?: string;
  filePath?: string;
  lineNumber?: number;
  componentStack?: string[];
  nearbyCode?: string;
}

export function parseReactGrabContext(raw: string): ReactGrabContext {
  const filePath = extractFirstMatch(raw, /(?:file|path):\s*([^\n]+)/i);
  const lineNumberRaw = extractFirstMatch(raw, /(?:line):\s*(\d+)/i);
  const componentName = extractFirstMatch(
    raw,
    /(?:component):\s*([A-Za-z0-9_$]+)/i
  );

  return {
    raw,
    selectedElement: extractSelectedElement(raw),
    componentName: componentName || undefined,
    filePath: filePath?.trim(),
    lineNumber: lineNumberRaw ? Number(lineNumberRaw) : undefined,
    componentStack: extractComponentStack(raw),
    nearbyCode: extractNearbyCode(raw),
  };
}

function extractFirstMatch(raw: string, regex: RegExp) {
  const match = raw.match(regex);
  return match?.[1];
}

function extractSelectedElement(raw: string) {
  const match = raw.match(/<([a-zA-Z0-9-]+)(.|\n)*?>/);
  return match?.[0];
}

function extractComponentStack(raw: string) {
  const stackMatch = raw.match(/component stack:([\s\S]*?)(\n\n|$)/i);
  if (!stackMatch) return [];
  return stackMatch[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractNearbyCode(raw: string) {
  const codeBlock = raw.match(/```(?:tsx|jsx|ts|js)?\n([\s\S]*?)```/);
  return codeBlock?.[1];
}
```

---

### 11.4 `createPatchTask.ts`

文件位置：

```text
packages/react-grab-bridge/src/createPatchTask.ts
```

关键代码：

```ts
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { parseReactGrabContext } from "./parseGrabContext";

export interface CreatePatchTaskInput {
  sessionRoot: string;
  rawGrabContext: string;
  userInstruction: string;
}

export async function createPatchTask(input: CreatePatchTaskInput) {
  const parsed = parseReactGrabContext(input.rawGrabContext);
  const taskId = `ui-${crypto.randomUUID().slice(0, 8)}`;
  const taskPath = path.join(
    input.sessionRoot,
    "agent-memory",
    "tasks",
    `${taskId}.md`
  );

  await fs.mkdir(path.dirname(taskPath), { recursive: true });

  const content = `# UI Repair Task: ${taskId}

## User Instruction

${input.userInstruction}

## Selected Component

- Component: ${parsed.componentName || "unknown"}
- File: ${parsed.filePath || "unknown"}
- Line: ${parsed.lineNumber || "unknown"}

## React Grab Context

\`\`\`text
${input.rawGrabContext}
\`\`\`

## Required Agent Behavior

1. Read PROJECT_EXECUTION.md.
2. Read clone-session.json.
3. Modify only the relevant component/style files unless absolutely necessary.
4. Preserve the formal-clone architecture.
5. Do not rewrite unrelated sections.
6. After modification, run lint/build if available.
7. Update CHANGELOG_AGENT.md.

## Repair Focus

- spacing
- typography
- color
- border radius
- shadow
- responsive behavior
- hover/focus state
- visual similarity to target screenshot

## Completion Checklist

- [ ] Component visually improved
- [ ] No unrelated files modified
- [ ] Build passes
- [ ] CHANGELOG_AGENT.md updated
`;

  await fs.writeFile(taskPath, content, "utf-8");

  await appendTaskIndex(input.sessionRoot, taskId, parsed.filePath);

  return {
    taskId,
    taskPath,
  };
}

async function appendTaskIndex(
  sessionRoot: string,
  taskId: string,
  filePath?: string
) {
  const tasksMd = path.join(sessionRoot, "agent-memory", "TASKS.md");
  const line = `\n- [ ] ${taskId}: Repair UI component${filePath ? ` in \`${filePath}\`` : ""}\n`;
  await fs.appendFile(tasksMd, line, "utf-8");
}
```

---

## 12. Agent Memory 设计

### 12.1 为什么需要 Agent Memory

因为你要同时使用：

```text
Codex App / Codex CLI
Cursor IDE
可能还有 Claude Code
```

这些 agent 不共享天然记忆，所以必须用文件系统做“外部长期记忆”。

---

### 12.2 必须维护的文件

```text
agent-memory/
  TASKS.md
  DECISIONS.md
  CHANGELOG_AGENT.md
  PROMPTS.md
  tasks/
    ui-xxxx.md
    mock-api-xxxx.md
```

---

### 12.3 `CHANGELOG_AGENT.md` 规则

每次 AI 修改后都必须写：

```md
### 2026-05-29 14:30 — Codex

Changed:
- Updated hero section spacing.
- Adjusted primary button border radius.
- Added mock pricing data.

Reason:
- Target screenshot showed tighter vertical rhythm and sharper button style.

Files:
- app/page.tsx
- components/Hero.tsx
- data/pricing.ts

Validation:
- npm run lint: passed
- npm run build: passed
```

---

### 12.4 `DECISIONS.md` 规则

只记录长期影响工程方向的决定：

```md
## D-0002: Use mock data before real API integration

Decision:
All dynamic sections will use local mock data during clone stage.

Rationale:
The target website backend is not available and should not be reverse-engineered.

Alternatives:
- Attempt to reproduce API calls directly: rejected.
- Remove dynamic sections: rejected.
```

---

## 13. CLI 设计

### 13.1 CLI 命令规划

最终命令：

```bash
clone-orchestrator init <url>
clone-orchestrator import-open-lovable <session-id> <exported-path>
clone-orchestrator prepare-formal <session-id>
clone-orchestrator compare <session-id>
clone-orchestrator grab-task <session-id>
clone-orchestrator status <session-id>
```

---

### 13.2 `cli/index.ts`

文件位置：

```text
apps/orchestrator/src/cli/index.ts
```

关键代码：

```ts
#!/usr/bin/env node

import { Command } from "commander";
import path from "path";
import fs from "fs/promises";
import { createCloneSession } from "../core/createSession";
import { importOpenLovableVersion } from "@clone-orchestrator/generator";
import { prepareFormalClone } from "@clone-orchestrator/generator";
import { createVersionComparison } from "@clone-orchestrator/generator";
import { createPatchTask } from "@clone-orchestrator/react-grab-bridge";

const program = new Command();

program
  .name("clone-orchestrator")
  .description("AI website clone workflow orchestrator")
  .version("0.1.0");

program
  .command("init")
  .argument("<url>")
  .option("-w, --workspace <path>", "workspace root", "./workspace")
  .action(async (url, options) => {
    const result = await createCloneSession({
      targetUrl: url,
      workspaceRoot: path.resolve(options.workspace),
    });

    console.log("Session created:");
    console.log(result.session.sessionId);
    console.log(result.sessionRoot);
  });

program
  .command("import-open-lovable")
  .argument("<session-id>")
  .argument("<exported-path>")
  .option("-w, --workspace <path>", "workspace root", "./workspace")
  .action(async (sessionId, exportedPath, options) => {
    const sessionRoot = path.resolve(options.workspace, "sessions", sessionId);
    const result = await importOpenLovableVersion({
      exportedProjectPath: path.resolve(exportedPath),
      sessionRoot,
    });

    console.log("Imported Open Lovable version:");
    console.log(result.targetDir);
  });

program
  .command("prepare-formal")
  .argument("<session-id>")
  .option("-t, --template <path>", "formal clone template path", "./templates/formal-clone-template")
  .option("-w, --workspace <path>", "workspace root", "./workspace")
  .action(async (sessionId, options) => {
    const sessionRoot = path.resolve(options.workspace, "sessions", sessionId);
    const sessionPath = path.join(sessionRoot, "clone-session.json");
    const session = JSON.parse(await fs.readFile(sessionPath, "utf-8"));

    const result = await prepareFormalClone({
      templatePath: path.resolve(options.template),
      sessionRoot,
      session,
    });

    console.log("Formal clone prepared:");
    console.log(result.targetDir);
    console.log(result.nextAction);
  });

program
  .command("compare")
  .argument("<session-id>")
  .option("-w, --workspace <path>", "workspace root", "./workspace")
  .action(async (sessionId, options) => {
    const sessionRoot = path.resolve(options.workspace, "sessions", sessionId);
    const result = await createVersionComparison({ sessionRoot });
    console.log("Comparison report created:");
    console.log(result.reportPath);
  });

program
  .command("grab-task")
  .argument("<session-id>")
  .option("-w, --workspace <path>", "workspace root", "./workspace")
  .requiredOption("-f, --file <path>", "file containing React Grab context")
  .requiredOption("-i, --instruction <text>", "user repair instruction")
  .action(async (sessionId, options) => {
    const sessionRoot = path.resolve(options.workspace, "sessions", sessionId);
    const rawGrabContext = await fs.readFile(path.resolve(options.file), "utf-8");

    const result = await createPatchTask({
      sessionRoot,
      rawGrabContext,
      userInstruction: options.instruction,
    });

    console.log("Patch task created:");
    console.log(result.taskId);
    console.log(result.taskPath);
  });

program.parse();
```

---

## 14. Codex / Cursor 协作规则

### 14.1 Codex 适合做什么

Codex 更适合：

- 大范围代码生成；
- 架构重构；
- 写模块；
- 跑测试；
- 修 build；
- 生成 mock API；
- 根据文档执行任务。

推荐交给 Codex 的任务：

```text
1. Implement package structure.
2. Create crawler module.
3. Create session manager.
4. Prepare formal clone template.
5. Add mock API routes.
6. Run npm build and fix errors.
```

---

### 14.2 Cursor 适合做什么

Cursor 更适合：

- 打开项目人工看；
- 配合 React Grab 选 UI；
- 快速局部改组件；
- 调整样式；
- 视觉 review；
- 手工 prompt 精修。

推荐交给 Cursor 的任务：

```text
1. Fix selected UI component based on React Grab context.
2. Adjust spacing and typography.
3. Compare screenshot with local page.
4. Improve responsive behavior.
5. Clean up components after Codex generation.
```

---

### 14.3 两者交接格式

每次 Codex/Cursor 交接必须写：

```md
## Handoff

Current status:
- ...

What changed:
- ...

Next recommended step:
- ...

Files modified:
- ...

Potential risks:
- ...

Validation:
- ...
```

---

## 15. AI Prompt 模板

### 15.1 Codex 初始化 Prompt

```text
You are working on AI Website Clone Orchestrator.

Before coding, read:
1. PROJECT_EXECUTION.md
2. package.json
3. workspace/sessions/<session-id>/clone-session.json
4. workspace/sessions/<session-id>/agent-memory/TASKS.md
5. workspace/sessions/<session-id>/agent-memory/DECISIONS.md
6. workspace/sessions/<session-id>/agent-memory/CHANGELOG_AGENT.md

Rules:
- Do not overwrite unrelated files.
- Update CHANGELOG_AGENT.md after changes.
- If a target website has backend/API/auth behavior, create mock data and placeholder APIs only.
- Do not bypass authentication or scrape private data.
- Keep formal-clone as the main codebase.
- Use open-lovable-version only as visual reference.

Task:
<INSERT TASK HERE>
```

---

### 15.2 Cursor + React Grab Prompt

```text
Here is the React Grab context for a selected UI element.

Goal:
Make this selected component visually closer to the target screenshot.

Rules:
- Only modify the relevant component/style files.
- Do not rewrite unrelated sections.
- Preserve existing component boundaries.
- Preserve formal-clone as the main codebase.
- If data is needed, use mock data.
- Update CHANGELOG_AGENT.md.

Focus:
- spacing
- typography
- color
- border radius
- shadow
- hover/focus state
- responsive behavior

React Grab context:
<PASTE CONTEXT HERE>

User instruction:
<INSERT SPECIFIC UI FIX HERE>
```

---

### 15.3 Version Comparison Prompt

```text
Compare these two generated projects:

1. open-lovable-version
2. formal-clone

Use formal-clone as the main codebase.

For each visible section:
- Which version is closer to the target website visually?
- Which version has cleaner code?
- Should formal-clone borrow styles/components from open-lovable-version?
- Which files should be modified?
- Should the section be kept, patched, or rewritten?

Output a table:
Section | Better Visual Source | Better Code Source | Action | Files | Notes
```

---

## 16. Mock API 策略

### 16.1 原则

如果目标网站存在 API 请求，本系统不复用对方真实 API。

只做：

```text
mock data
local JSON
Next.js route handlers
placeholder services
```

---

### 16.2 推荐目录

```text
formal-clone/
  data/
    mock-products.ts
    mock-users.ts
    mock-metrics.ts
  app/
    api/
      mock/
        products/route.ts
        metrics/route.ts
```

---

### 16.3 示例：mock metrics

```ts
// data/mock-metrics.ts

export const mockMetrics = [
  {
    label: "Total Volume",
    value: "$24.8M",
    change: "+12.4%",
    trend: "up",
  },
  {
    label: "Active Users",
    value: "18,420",
    change: "+8.1%",
    trend: "up",
  },
  {
    label: "Latency",
    value: "42ms",
    change: "-5.3%",
    trend: "down",
  },
];
```

```ts
// app/api/mock/metrics/route.ts

import { NextResponse } from "next/server";
import { mockMetrics } from "@/data/mock-metrics";

export async function GET() {
  return NextResponse.json({
    data: mockMetrics,
    source: "mock",
  });
}
```

---

## 17. Validation 设计

每个 session 至少有这些检查：

```bash
npm run lint
npm run build
npm run typecheck
```

可选：

```bash
npx playwright test
npx playwright screenshot
```

---

### 17.1 `validateClone.ts`

```ts
import { execa } from "execa";

export async function validateClone(projectDir: string) {
  const results = [];

  for (const command of [
    ["npm", ["run", "lint"]],
    ["npm", ["run", "build"]],
  ] as const) {
    try {
      const result = await execa(command[0], command[1], {
        cwd: projectDir,
        all: true,
      });

      results.push({
        command: `${command[0]} ${command[1].join(" ")}`,
        ok: true,
        output: result.all,
      });
    } catch (error: any) {
      results.push({
        command: `${command[0]} ${command[1].join(" ")}`,
        ok: false,
        output: error.all || error.message,
      });
    }
  }

  return results;
}
```

---

## 18. MVP 开发顺序

### Phase 1：Repo skeleton

目标：

- 建 monorepo；
- 建 packages；
- 建 CLI；
- 建 shared types。

任务：

```text
- [ ] Initialize pnpm workspace
- [ ] Create apps/orchestrator
- [ ] Create packages/shared
- [ ] Add TypeScript config
- [ ] Add commander CLI
```

---

### Phase 2：Target analyzer

目标：

- Playwright 打开目标网站；
- 抓 screenshot；
- 抓 HTML；
- 抓 network；
- 判断类型。

任务：

```text
- [ ] Implement analyzeTarget.ts
- [ ] Implement classifySite.ts
- [ ] Write raw-html.html
- [ ] Write network-analysis.json
- [ ] Write screenshot files
```

---

### Phase 3：Session manager

目标：

- 每个目标网站生成一个 session；
- 所有上下文写入文件。

任务：

```text
- [ ] Implement createCloneSession
- [ ] Generate clone-session.json
- [ ] Generate TASKS.md
- [ ] Generate DECISIONS.md
- [ ] Generate CHANGELOG_AGENT.md
```

---

### Phase 4：Generator integration

目标：

- 支持导入 Open Lovable 版本；
- 支持准备 formal clone；
- 支持生成 AGENT_BRIEF.md。

任务：

```text
- [ ] Implement importOpenLovableVersion
- [ ] Implement prepareFormalClone
- [ ] Implement createAgentBrief
```

---

### Phase 5：React Grab bridge

目标：

- 支持粘贴 React Grab context；
- 自动生成 UI repair task。

任务：

```text
- [ ] Implement parseReactGrabContext
- [ ] Implement createPatchTask
- [ ] Append task into TASKS.md
```

---

### Phase 6：Comparison and validation

目标：

- 对比两个版本；
- 输出修复计划；
- 支持 build/lint validation。

任务：

```text
- [ ] Implement compareVersions
- [ ] Implement validateClone
- [ ] Generate section-comparison.md
```

---

## 19. 初始 package.json

根目录：

```json
{
  "name": "ai-website-clone-orchestrator",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter orchestrator dev",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "cli": "tsx apps/orchestrator/src/cli/index.ts"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  },
  "dependencies": {
    "commander": "^12.1.0",
    "execa": "^9.5.0",
    "playwright": "^1.49.0",
    "zod": "^3.24.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

---

## 20. pnpm workspace

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 21. tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@clone-orchestrator/shared": ["packages/shared/src/index.ts"],
      "@clone-orchestrator/crawler": ["packages/crawler/src/index.ts"],
      "@clone-orchestrator/generator": ["packages/generator/src/index.ts"],
      "@clone-orchestrator/react-grab-bridge": ["packages/react-grab-bridge/src/index.ts"]
    }
  }
}
```

---

## 22. README 初版结构

```md
# AI Website Clone Orchestrator

## What it does

This tool orchestrates Open Lovable, ai-website-cloner-template, React Grab, Codex, and Cursor into one repeatable website clone workflow.

## What it does not do

It does not bypass authentication, clone private backend systems, steal databases, or reproduce protected server-side logic.

## Workflow

1. Analyze target URL
2. Generate quick visual draft
3. Generate formal clone
4. Compare versions
5. Repair UI with React Grab
6. Add mock data and interactions
7. Validate build

## Quickstart

\`\`\`bash
pnpm install
pnpm cli init https://example.com
\`\`\`
```

---

## 23. 给 Codex 的第一个开发任务

建议你把下面这段直接交给 Codex App：

```text
You are building AI Website Clone Orchestrator.

Read PROJECT_EXECUTION.md first.

Task:
Implement Phase 1 and Phase 2 only.

Requirements:
1. Create pnpm monorepo structure.
2. Add root package.json, pnpm-workspace.yaml, tsconfig.base.json.
3. Create apps/orchestrator with commander CLI.
4. Create packages/shared with the CloneSession types.
5. Create packages/crawler with analyzeTarget.ts using Playwright.
6. Implement command:
   pnpm cli init <url>
7. The command should create:
   workspace/sessions/<session-id>/
   clone-session.json
   target-research/raw-html.html
   target-research/desktop.png
   agent-memory/TASKS.md
   agent-memory/DECISIONS.md
   agent-memory/CHANGELOG_AGENT.md
8. Do not implement Open Lovable integration yet.
9. Do not implement React Grab bridge yet.
10. Run typecheck/build and fix errors.
11. Update CHANGELOG_AGENT.md with what you changed.
```

---

## 24. 给 Cursor 的第一个开发任务

建议你把下面这段交给 Cursor：

```text
You are reviewing the initial implementation created by Codex.

Read PROJECT_EXECUTION.md first.

Task:
Review Phase 1 and Phase 2 implementation.

Check:
1. Does the CLI work?
2. Does it create the expected workspace structure?
3. Does Playwright capture screenshots correctly?
4. Is clone-session.json complete and readable?
5. Are static/SSR/SPA/auth-gated classifications reasonable?
6. Are files clean and maintainable?

If needed:
- Fix small bugs.
- Improve error messages.
- Improve README quickstart.
- Do not change the architecture unless necessary.
- Update CHANGELOG_AGENT.md.
```

---

## 25. 未来增强路线

### 25.1 自动截图对比

后续可以加入：

```text
target screenshot vs generated screenshot
```

使用：

- Playwright screenshot；
- pixelmatch；
- resemblejs；
- AI vision review。

---

### 25.2 自动生成 patch prompt

系统可以根据视觉差异自动生成：

```text
Hero title too low.
Button radius too large.
Card shadow too weak.
Navbar height too tall.
```

然后自动创建 React Grab-style patch tasks。

---

### 25.3 Browser extension

长期可以做一个 browser extension：

1. 打开目标网站；
2. 点击“Analyze this page”；
3. 自动生成 session；
4. 自动把截图、DOM、style、network 传给 orchestrator；
5. 在本地 clone 项目里同步修复任务。

---

### 25.4 Studio UI

未来可以做：

```text
apps/studio/
```

功能：

- 查看所有 sessions；
- 查看目标截图；
- 查看 Open Lovable 版本；
- 查看 formal clone 版本；
- 查看任务状态；
- 粘贴 React Grab context；
- 一键生成 Codex/Cursor prompt。

---

## 26. 当前最小可执行路线

如果只做最小版本，不要一开始过度复杂化。

最小路线：

```text
1. CLI init URL
2. Playwright analyze
3. clone-session.json
4. agent-memory files
5. manual Open Lovable import
6. formal clone prepare
7. React Grab task creation
8. validation
```

这已经足够大幅减少人工工作。

---

## 27. 最终工作流示例

```bash
# 1. 初始化目标网站 session
pnpm cli init https://example.com

# 2. 得到 session id
# example-com-a1b2c3d4

# 3. 手动或半自动用 Open Lovable 生成快速版本
# 导出到 /tmp/open-lovable-export

pnpm cli import-open-lovable example-com-a1b2c3d4 /tmp/open-lovable-export

# 4. 准备正式工程
pnpm cli prepare-formal example-com-a1b2c3d4 --template ./templates/formal-clone-template

# 5. 用 Codex/Cursor 打开 formal-clone
# 读取 AGENT_BRIEF.md 执行正式复刻

# 6. 生成对比报告
pnpm cli compare example-com-a1b2c3d4

# 7. 在 formal-clone 里安装 React Grab
cd workspace/sessions/example-com-a1b2c3d4/formal-clone
npx grab@latest init
npm run dev

# 8. 用户选中 UI 元素，把 React Grab context 保存为 grab.txt

pnpm cli grab-task example-com-a1b2c3d4 \
  --file ./grab.txt \
  --instruction "Make this hero button closer to the target screenshot."

# 9. Codex/Cursor 读取生成的 task md 并修复
```

---

## 28. Success Criteria

MVP 成功标准：

- [ ] 可以输入任意 URL 初始化 session；
- [ ] 可以生成目标网站分析文件；
- [ ] 可以判断基本网站类型；
- [ ] 可以保存 screenshot 和 raw HTML；
- [ ] 可以创建 agent-memory；
- [ ] 可以导入 Open Lovable 版本；
- [ ] 可以准备 formal clone；
- [ ] 可以生成 AGENT_BRIEF.md；
- [ ] 可以把 React Grab context 转成 repair task；
- [ ] Codex 和 Cursor 能通过文件记录无缝接续；
- [ ] 最终项目能 build。

---

## 29. 当前不要做的事情

MVP 不要做：

- 不要一开始做完整 Web UI；
- 不要一开始深度 fork Open Lovable；
- 不要一开始做自动视觉 diff；
- 不要一开始做 browser extension；
- 不要尝试复刻真实后端；
- 不要绕过登录；
- 不要做多租户 SaaS；
- 不要做复杂数据库。

先把 CLI + session + agent-memory + integration pipeline 跑通。

---

## 30. 总结

本项目的核心不是重新发明 Open Lovable、ai-website-cloner-template 或 React Grab，而是把它们整合成一个稳定、可追踪、可被 Codex/Cursor 反复读取和接续的工作流。

最终架构：

```text
Target URL
  ↓
Crawler Analyzer
  ↓
Clone Session
  ↓
Open Lovable Quick Draft
  ↓
Formal Clone Template
  ↓
Codex/Cursor Implementation
  ↓
React Grab UI Repair Tasks
  ↓
Mock API / Interaction Completion
  ↓
Validation
  ↓
Final Next.js Project
```

本文件是所有 AI agent 的最高优先级执行文档。任何开发前，先读本文件。



---

# v0.2.0 Upgrade：GPT / Codex / Cursor 的工程协作模式

本节是对原执行文档的重要升级。新的核心思想是：

> GPT 写架构和 plans，Codex 做基础开发，Cursor Auto 在 Codex 输出的基础上做 TDD 后续开发；所有执行都被 harness engineering 和 git 版本管理约束，改毁了直接回退。

也就是说，本项目不应该让 Cursor 从零做高价值架构判断。Cursor Auto 更适合被当作一个“只会按脚本执行的小工”：

```text
GPT / Architect = 高价值架构、计划、接口、验收标准
Codex = 基础开发、核心模块、复杂实现、初始测试框架
Cursor Auto = 根据明确任务做 TDD、补测试、修局部 bug、修 UI
Harness + Git = 质量边界和回滚系统
```

---

## A. 新的 AI 分工原则

### A.1 GPT / Architect

GPT 负责最高价值的工作：

```text
1. 定义项目架构
2. 定义模块边界
3. 定义数据结构
4. 定义 task roadmap
5. 定义测试策略
6. 定义验收标准
7. 定义 AI 协作规则
8. 定义禁止事项
```

GPT 输出的文件包括：

```text
PROJECT_EXECUTION.md
ARCHITECTURE.md
TEST_PLAN.md
TASKS.md
AGENT_RULES.md
```

GPT 不负责大量机械式写代码，而是负责让 Codex 和 Cursor 不需要重新思考大方向。

---

### A.2 Codex

Codex 负责基础开发和核心实现：

```text
1. 创建 monorepo
2. 搭建 TypeScript / pnpm / package structure
3. 实现 CLI
4. 实现 Playwright crawler
5. 实现 CloneSession manager
6. 实现 Open Lovable import
7. 实现 formal clone preparation
8. 实现 React Grab bridge
9. 实现初始 test harness
10. 修复杂 bug
```

Codex 的目标不是一次写完所有功能，而是：

```text
把工程搭起来，写出清晰边界，让 Cursor Auto 后续可以低成本做 TDD 迭代。
```

---

### A.3 Cursor Auto / Cursor Agent

Cursor Auto 负责低价值、重复性、可测试的小步执行：

```text
1. 按 TDD 补测试
2. 修一个 failing test
3. 修一个 CLI edge case
4. 修一个 parser case
5. 修一个 UI component
6. 根据 React Grab context 精修样式
7. 补 mock data
8. 修 lint / typecheck
```

Cursor Auto 不允许做：

```text
1. 擅自重构整体架构
2. 擅自修改 CloneSession schema
3. 擅自替换 Playwright crawler 方案
4. 删除测试
5. 删除 agent-memory
6. 引入重型依赖
7. 修改 PROJECT_EXECUTION.md
8. 绕过 harness
```

---

## B. 新的主开发流程

升级后的流程如下：

```text
Step 1：GPT / Architect
  - 写架构
  - 写 plans
  - 写 test plan
  - 写 Cursor/Codex 执行规则

Step 2：Codex
  - 按 GPT 文档实现基础工程
  - 搭建核心模块
  - 搭建测试框架
  - 跑通第一版 CLI

Step 3：Git Checkpoint
  - commit baseline
  - 创建 feature branch
  - 确认可以回滚

Step 4：Cursor Auto
  - 按 TASKS.md 做 TDD
  - 一次只做一个小任务
  - 先写测试，再写实现
  - 跑 harness

Step 5：Harness
  - unit tests
  - integration tests
  - CLI smoke tests
  - Playwright tests
  - typecheck
  - lint
  - changed-files safety check

Step 6：Git
  - 通过则 commit
  - 失败则 rollback
  - 连续失败则交回 Codex
```

---

## C. TDD 执行规则

Cursor Auto 每次任务必须遵循：

```text
Red → Green → Refactor
```

具体要求：

```text
1. 先写失败测试
2. 确认测试失败
3. 写最小实现
4. 确认测试通过
5. 跑 typecheck / lint
6. 更新 CHANGELOG_AGENT.md
7. 提交 git diff 摘要
```

禁止：

```text
1. 不写测试直接大改
2. 一次修改多个无关模块
3. 为了通过测试而删除测试
4. 修改架构文件来绕过限制
5. 让 mock API 变成真实第三方 API
6. 擅自接入目标网站真实后端
```

---

## D. Harness Engineering 设计

本项目必须把 Cursor Auto 关在测试轨道里。

### D.1 Harness 分层

```text
1. Unit Harness
   测试纯函数、parser、classifier、session id。

2. Integration Harness
   测试 CLI init 是否生成正确文件结构。

3. Browser Harness
   用 Playwright 测试目标网站是否能打开、截图、抓 network。

4. Clone Validation Harness
   测试 formal-clone 是否能 lint/build。

5. Agent Safety Harness
   检查 AI 是否修改禁止文件、是否更新 changelog、是否删除测试。
```

---

### D.2 推荐测试技术栈

```json
{
  "unit": "vitest",
  "browser": "playwright",
  "cli": "execa + tmpdir",
  "visual": "playwright screenshot baseline, later pixelmatch",
  "safety": "custom git diff checker"
}
```

---

### D.3 package.json scripts 建议

```json
{
  "scripts": {
    "test": "pnpm -r test",
    "test:unit": "pnpm -r test:unit",
    "test:integration": "pnpm -r test:integration",
    "test:browser": "pnpm -r test:browser",
    "test:smoke": "tsx scripts/smoke-test.ts",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "check": "pnpm lint && pnpm typecheck && pnpm test && pnpm test:smoke",
    "check:changed": "tsx scripts/check-changed-files.ts",
    "safe:status": "git status --short && git diff --stat"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "@playwright/test": "^1.49.0",
    "tmp-promise": "^3.0.3"
  }
}
```

---

## E. Git 版本管理策略

### E.1 核心原则

```text
没有 git checkpoint，不允许让 Cursor Auto 大量修改。
```

所有 AI 任务都必须在 git 保护下执行。

---

### E.2 推荐分支

```text
main
  稳定主分支

dev
  日常开发分支

feature/session-analyzer
  Codex 实现 target analyzer

feature/formal-clone-prep
  Codex 实现 formal clone preparation

cursor/tdd-<task-id>
  Cursor Auto 小步 TDD 任务

cursor/ui-repair-<task-id>
  Cursor Auto 局部 UI 精修任务
```

---

### E.3 Cursor 任务前 checkpoint

```bash
git status
git add .
git commit -m "checkpoint: before cursor task <TASK_ID>"
git checkout -b cursor/tdd-<TASK_ID>
```

---

### E.4 Cursor 任务后检查

```bash
pnpm check
pnpm check:changed
git diff --stat
git diff --name-only
git add .
git commit -m "cursor: complete tdd task <TASK_ID>"
```

---

### E.5 改坏后的回滚

如果只是当前任务改坏：

```bash
git reset --hard HEAD
git clean -fd
```

如果整个 Cursor 分支废掉：

```bash
git checkout dev
git branch -D cursor/tdd-<TASK_ID>
```

---

## F. Agent Safety Checker

文件位置：

```text
scripts/check-changed-files.ts
```

作用：

```text
1. 检查是否修改禁止文件
2. 检查是否更新 CHANGELOG_AGENT.md
3. 检查是否删除测试文件
4. 检查是否误改 lockfile / schema / execution docs
```

关键代码：

```ts
import { execa } from "execa";

const forbiddenPatterns = [
  /^PROJECT_EXECUTION\.md$/,
  /^pnpm-lock\.yaml$/,
  /^workspace\/sessions\/.*\/clone-session\.json$/,
];

async function main() {
  const diff = await execa("git", ["diff", "--name-only"], {
    all: true,
  });

  const changedFiles = diff.stdout
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const forbidden = changedFiles.filter((file) =>
    forbiddenPatterns.some((pattern) => pattern.test(file))
  );

  if (forbidden.length > 0) {
    console.error("Forbidden files modified:");
    for (const file of forbidden) {
      console.error(`- ${file}`);
    }
    process.exit(1);
  }

  const changedChangelog = changedFiles.some((file) =>
    file.endsWith("CHANGELOG_AGENT.md")
  );

  if (!changedChangelog) {
    console.error("CHANGELOG_AGENT.md was not updated.");
    process.exit(1);
  }

  const deletedTests = await execa("git", ["diff", "--name-status"], {
    all: true,
  });

  const deletedTestFiles = deletedTests.stdout
    .split("\n")
    .filter((line) => line.startsWith("D"))
    .filter((line) => /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(line));

  if (deletedTestFiles.length > 0) {
    console.error("Test files were deleted:");
    for (const line of deletedTestFiles) console.error(line);
    process.exit(1);
  }

  console.log("Changed files safety check passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## G. CLI Smoke Test

文件位置：

```text
scripts/smoke-test.ts
```

作用：

```text
确保 pnpm cli init <url> 能生成完整 session。
```

关键代码：

```ts
import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import os from "os";

async function main() {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "clone-orch-"));
  const testUrl = "https://example.com";

  const result = await execa(
    "pnpm",
    ["cli", "init", testUrl, "--workspace", tmpRoot],
    {
      all: true,
      reject: false,
    }
  );

  if (result.exitCode !== 0) {
    console.error(result.all);
    process.exit(1);
  }

  const sessionsRoot = path.join(tmpRoot, "sessions");
  const sessions = await fs.readdir(sessionsRoot);

  if (sessions.length !== 1) {
    throw new Error(`Expected one session, got ${sessions.length}`);
  }

  const sessionRoot = path.join(sessionsRoot, sessions[0]);

  const requiredFiles = [
    "clone-session.json",
    "target-research/raw-html.html",
    "target-research/desktop.png",
    "agent-memory/TASKS.md",
    "agent-memory/DECISIONS.md",
    "agent-memory/CHANGELOG_AGENT.md",
  ];

  for (const file of requiredFiles) {
    await fs.stat(path.join(sessionRoot, file));
  }

  console.log("Smoke test passed:", sessionRoot);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## H. Cursor Auto Task 模板

每一个交给 Cursor Auto 的任务都必须用这个模板。

```md
# Cursor TDD Task: <TASK_ID>

## Context

Read first:
- PROJECT_EXECUTION.md
- clone-session.json
- agent-memory/TASKS.md
- agent-memory/DECISIONS.md
- agent-memory/CHANGELOG_AGENT.md

## Scope

Allowed files:
- <明确列出允许修改的文件>

Forbidden:
- Do not modify architecture.
- Do not edit unrelated packages.
- Do not change public types unless explicitly required.
- Do not delete tests.
- Do not edit PROJECT_EXECUTION.md.

## Goal

<明确说明要实现什么>

## TDD Steps

1. Add or update test first.
2. Run the relevant test and confirm it fails.
3. Implement the minimum code.
4. Run test again and confirm it passes.
5. Run typecheck.
6. Update CHANGELOG_AGENT.md.

## Commands

```bash
pnpm test
pnpm typecheck
pnpm check:changed
```

## Acceptance Criteria

- [ ] Test fails before implementation.
- [ ] Test passes after implementation.
- [ ] No unrelated files modified.
- [ ] Typecheck passes.
- [ ] CHANGELOG_AGENT.md updated.
```

---

## I. Codex 首轮开发 Prompt

```text
You are the core builder for AI Website Clone Orchestrator.

Read PROJECT_EXECUTION.md first.

Collaboration model:
- GPT/Architect defines architecture and plans.
- Codex implements core modules and harness.
- Cursor Auto will later do TDD iteration based on your output.
- Therefore your code must be modular, testable, and easy to extend.

Task:
Implement Phase 1 only.

Requirements:
1. Create pnpm monorepo structure.
2. Add package structure:
   - apps/orchestrator
   - packages/shared
   - packages/crawler
   - packages/generator
   - packages/react-grab-bridge
3. Implement shared CloneSession types.
4. Implement CLI command:
   pnpm cli init <url>
5. Implement Playwright target analyzer.
6. Implement session creation and agent-memory files.
7. Add Vitest unit test setup.
8. Add smoke test harness for CLI init.
9. Add check scripts:
   - pnpm typecheck
   - pnpm test
   - pnpm test:smoke
   - pnpm check
10. Add scripts/check-changed-files.ts.
11. Do not implement Open Lovable integration yet.
12. Do not implement React Grab bridge yet.
13. Make sure Cursor Auto can later add tests without changing architecture.
14. Run all validation commands.
15. Update CHANGELOG_AGENT.md or create ROOT_CHANGELOG.md if no session exists yet.

Acceptance:
- pnpm install works.
- pnpm cli init https://example.com works.
- clone-session.json is created.
- raw-html.html and desktop.png are created.
- agent-memory files are created.
- pnpm check passes.
```

---

## J. Cursor Auto 首轮 TDD Prompt

```text
You are the TDD executor for AI Website Clone Orchestrator.

Do not redesign architecture.
Do not modify PROJECT_EXECUTION.md.
Do not change public types unless necessary.

Read first:
1. PROJECT_EXECUTION.md
2. TASKS.md
3. CHANGELOG_AGENT.md
4. Relevant package files

Task:
Add TDD coverage for the existing Phase 1 implementation.

Scope:
Allowed:
- packages/shared/**/*.test.ts
- packages/crawler/**/*.test.ts
- apps/orchestrator/**/*.test.ts
- scripts/smoke-test.ts
- small bug fixes in directly tested files

Forbidden:
- package restructuring
- replacing Playwright analyzer
- changing session schema
- deleting tests
- removing safety checks

TDD requirements:
1. Write failing tests first.
2. Implement minimal fixes.
3. Run:
   pnpm test
   pnpm typecheck
   pnpm check:changed
4. Update CHANGELOG_AGENT.md.

Test cases to add:
1. createSessionId creates stable hostname-hash id.
2. classifySite returns static for content-heavy no-api page.
3. classifySite returns spa for root-only script-heavy page.
4. classifySite returns auth-gated when auth signals + API exist.
5. CLI init creates all required files.
6. check-changed-files fails if forbidden file changed.
7. check-changed-files fails if CHANGELOG_AGENT.md is not updated.

Output:
- Summary of tests added.
- Files changed.
- Validation result.
```

---

## K. Cursor Auto 失败处理协议

如果 Cursor Auto 连续两次无法通过测试，不允许继续自由修。

必须：

```text
1. 停止修改
2. 输出失败摘要
3. 输出当前 git diff
4. 标记 task blocked
5. 交回 Codex 或 GPT 重新规划
```

Blocked report 模板：

```md
# BLOCKED TASK REPORT

Task ID:
Agent: Cursor Auto

What failed:
- ...

Commands run:
- ...

Error output:

```text
...
```

Files modified:
- ...

Current hypothesis:
- ...

Suggested next step:
- Return to Codex for architectural fix / test harness adjustment.
```

---

## L. 修改后的阶段安排

### Phase 0：GPT Architecture & Plan

Owner：GPT / Architect

输出：

```text
PROJECT_EXECUTION.md
ARCHITECTURE.md
TEST_PLAN.md
TASKS.md
AGENT_RULES.md
```

---

### Phase 1：Codex 基础开发

Owner：Codex

目标：

```text
monorepo skeleton
shared types
CLI
crawler analyzer
session manager
initial test harness
smoke test
safety checker
```

验收：

```bash
pnpm typecheck
pnpm test
pnpm test:smoke
pnpm check
```

---

### Phase 2：Cursor TDD 补强

Owner：Cursor Auto

目标：

```text
补单元测试
补 CLI edge case
修 Codex 初始遗漏
验证 harness
```

---

### Phase 3：Codex 集成生成器

Owner：Codex

目标：

```text
Open Lovable import
formal clone preparation
AGENT_BRIEF.md
compareVersions
```

---

### Phase 4：Cursor TDD 修边界

Owner：Cursor Auto

目标：

```text
template 不存在
空目录导入
malformed session
comparison report
changelog enforcement
```

---

### Phase 5：React Grab Bridge

Owner：Codex + Cursor

Codex：

```text
实现 parser 和 task generator
```

Cursor：

```text
补不同 React Grab 输出格式的 parser tests
```

---

## M. 最终协作准则

一句话：

```text
GPT 负责想清楚，Codex 负责搭起来，Cursor 负责在测试轨道里便宜地磨细节，Git/Harness 负责防止一切改毁。
```

最终推荐操作方式：

```text
1. GPT 生成计划和任务
2. Codex 按计划开发一版
3. git commit baseline
4. Cursor Auto 按 TDD task 逐条补强
5. pnpm check
6. 失败 rollback
7. 复杂失败交回 Codex
8. 所有变更写入 CHANGELOG_AGENT.md
```

---
