# Upstream Code Review

This document records Planarian's current source-level understanding of the three upstream projects it coordinates.

## Scope

This is not a vendoring decision. Planarian should not blindly copy these repositories into the monorepo. The goal is to understand their workflows, define integration boundaries, and build stable adapters around Planarian's `outputs/sessions/<session-id>/` file system.

Reviewed sources:

- `firecrawl/open-lovable`
- `JCodesMore/ai-website-cloner-template`
- `aidenybai/react-grab`

## firecrawl/open-lovable

Repository: `https://github.com/firecrawl/open-lovable`

### Observed Structure

The repository is a Next.js app with folders such as:

- `app/`
- `app/api/`
- `components/`
- `hooks/`
- `lib/`
- `packages/create-open-lovable`
- `types/`
- `utils/`

Its `app/api/` tree includes many operational endpoints, including sandbox creation, website scraping, screenshot scraping, code generation, code application, Vite error monitoring, package installation, command execution, and zip creation.

The root `package.json` shows a Next.js 15 / React 19 app with AI SDK providers, Firecrawl, sandbox dependencies, and code execution tooling. Key dependencies include:

- `@mendable/firecrawl-js`
- `@vercel/sandbox`
- `@e2b/code-interpreter`
- AI provider packages for Anthropic, Google, OpenAI, and Groq
- `ai`
- `next`
- `react`

### Workflow Understanding

Open Lovable is an interactive visual app builder:

1. User provides a target URL or prompt.
2. Firecrawl/scraping endpoints capture website content and screenshots.
3. AI generation endpoints produce or modify React code.
4. Sandbox endpoints run generated code.
5. Vite monitoring endpoints report runtime/build errors.
6. Apply-code endpoints iterate on the generated app.

### Planarian Mapping

Planarian should treat Open Lovable as a visual draft engine, not as the final formal codebase.

Current Planarian mapping:

- `outputs/sessions/<session-id>/open-lovable-version/OPEN_LOVABLE_TASK.md`
- `outputs/sessions/<session-id>/open-lovable-version/.env.example`

Recommended next adapter:

- `open-lovable-runner` should be optional.
- It should require explicit environment configuration.
- It should output only into `open-lovable-version/`.
- It should never overwrite `formal-clone/`.

### Integration Boundary

Do not vendor the full app by default. It contains its own UI, sandbox lifecycle, package installation, and AI apply loop. Planarian should call it as a separate tool or generate a task bundle for an agent to run it.

## JCodesMore/ai-website-cloner-template

Repository: `https://github.com/JCodesMore/ai-website-cloner-template`

### Observed Structure

The repository is a Next.js template with broad agent support:

- `.claude/skills/clone-website`
- `.codex/skills/clone-website`
- `.cursor`
- `.gemini/commands`
- `.opencode/commands`
- `.windsurf/workflows`
- `AGENTS.md`
- `docs/research/`
- `scripts/`
- `src/`
- `public/`

Its `package.json` describes a Next.js 16 / React 19 / Tailwind CSS v4 / shadcn-style stack with commands:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run check`

### Workflow Understanding

The upstream README and agent instructions define a multi-phase agent workflow:

1. Reconnaissance: screenshots, design tokens, interaction sweep, responsive states.
2. Foundation: fonts, colors, globals, asset downloads.
3. Component specs: structured specs under `docs/research/components/`.
4. Parallel build: section/component builders, often in worktrees.
5. Assembly and QA: merge outputs, wire the page, run validation and visual comparison.

The inspection guide emphasizes:

- visual audit
- design tokens
- component inventory
- layout architecture
- tech stack analysis
- documentation output under `docs/research/`

### Planarian Mapping

Planarian should use this as the formal clone pipeline model.

Current Planarian mapping:

- `outputs/sessions/<session-id>/formal-clone/TASK_BUNDLE.md`
- `outputs/sessions/<session-id>/formal-clone/FORMAL_CLONE_PIPELINE.md`
- `outputs/sessions/<session-id>/formal-clone/AGENTS.md`
- `corepack pnpm cli formal-scaffold <session-id>`
- `corepack pnpm cli formal-status <session-id>`

Recommended next adapter:

- Add a formal clone research writer:
  - `docs/research/DESIGN_TOKENS.md`
  - `docs/research/COMPONENT_INVENTORY.md`
  - `docs/research/LAYOUT_ARCHITECTURE.md`
  - `docs/research/INTERACTION_PATTERNS.md`
  - `docs/research/TECH_STACK_ANALYSIS.md`
- Add a command such as:
  - `corepack pnpm cli formal-research <session-id>`

### Integration Boundary

Do not run `/clone-website` blindly inside Planarian yet. First, Planarian should generate the same durable research and task artifacts that the upstream template expects. Once the contract is stable, a runner can either:

- scaffold from the template,
- copy selected template files into `formal-clone/`,
- or instruct an agent to run the upstream skill.

## aidenybai/react-grab

Repository: `https://github.com/aidenybai/react-grab`

### Observed Structure

The repository is a pnpm workspace with:

- `apps/`
- `packages/cli`
- `packages/grab`
- `packages/mcp`
- `packages/react-grab`
- `skills/react-grab`

Its root package scripts use Turbo and publish multiple packages. The README describes CLI install via:

```bash
npx grab@latest init
```

Manual installation includes adding `react-grab` scripts/imports to a React framework, including Next.js App Router, Next.js Pages Router, Vite, and Webpack.

The `packages/react-grab/src/types.ts` file exposes concepts such as:

- `ActionContext`
- `AgentContext`
- `Plugin`
- `PluginHooks`
- `ReactGrabAPI`
- element source information
- file path, line number, component name

### Workflow Understanding

React Grab is a local UI precision tool:

1. Developer runs the app locally.
2. React Grab is active only in development.
3. User hovers/selects an element.
4. React Grab copies selected element context.
5. The copied context includes source location, nearby code, component stack, and HTML context.
6. The context is pasted into an agent for focused repair.

### Planarian Mapping

Planarian should not use React Grab before a formal clone exists. It belongs after `formal-clone/` has a runnable React/Next app.

Current Planarian mapping:

- `packages/react-grab-bridge`
- `corepack pnpm cli react-grab-task <session-id> --context <path>`
- `outputs/sessions/<session-id>/react-grab-repairs/*.md`

Recommended next adapter:

- Add `react-grab-install-task <session-id>` to write instructions for adding React Grab to the generated formal clone.
- Later, add a mode that modifies `formal-clone/app/layout.tsx` or equivalent only after the formal clone app exists and the user approves.

### Integration Boundary

Do not permanently ship React Grab in production clone builds. React Grab should be development-only and used for repair tasks.

## Current Planarian Integration Status

Implemented:

- `integrate-upstreams <session-id>`
- Open Lovable task file generation
- formal clone pipeline and AGENTS generation
- comparison checklist generation
- React Grab context parsing
- React Grab repair task generation
- tests for all above

Not implemented yet:

- actual Open Lovable runner
- automatic upstream template copy/scaffold
- `/clone-website` skill execution
- React Grab installation into generated formal clone app
- visual diff automation

## Recommended Next Steps

1. Add `formal-research <session-id>`.
2. Generate upstream-style `docs/research/*` files inside `formal-clone/`.
3. Add `react-grab-install-task <session-id>`.
4. Add a configurable runner interface:
   - `manual`
   - `task-only`
   - `external-command`
5. Keep all external command execution behind explicit user approval and environment checks.

