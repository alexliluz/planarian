# Planarian

Planarian is an agent-friendly workflow foundation for repeatable website UI cloning and reconstruction.

It is not meant to be a random one-shot website cloner. Planarian creates a file-based engineering workflow where GPT, Codex, Cursor, and other coding agents can cooperate through stable session artifacts, task bundles, validation commands, and handoff notes.

## Project Role

Planarian is designed to coordinate three complementary open-source ideas without deeply forking them in the early phases:

- `firecrawl/open-lovable`: fast visual draft generator.
  In Planarian, this should create a quick visual reference under `open-lovable-version/`.

- `JCodesMore/ai-website-cloner-template`: formal engineering clone workflow.
  In Planarian, this is the main direction for the final clean codebase under `formal-clone/`.

- `aidenybai/react-grab`: component-level UI precision repair.
  In Planarian, this should be used after a formal clone exists, mainly to create focused repair tasks for selected UI elements.

Current status: Planarian has the monorepo foundation, CloneSession workflow, target capture, task-bundle generation, and readiness checks. It does not yet deeply integrate those upstream tools.

## Safety

Planarian only targets visible UI, public page structure, static assets, front-end interactions, and mock data.

Planarian must not:

- bypass authentication
- bypass paywalls
- access private APIs
- copy private data
- reproduce private backend systems
- implement real payment, trading, account, database, or user-data behavior without explicit ownership

If a target site has login, API, payment, dashboard, or private-data behavior, the clone should use local mock data and placeholder routes.

## Requirements

- Node.js 22 or newer
- Corepack
- pnpm 9.x
- Git
- Playwright-compatible Chromium

On this Windows environment, plain `pnpm` may not be available on `PATH`. Use `corepack pnpm ...` if needed.

## Install

```bash
git clone https://github.com/alexliluz/planarian.git
cd planarian
corepack pnpm install
```

If `pnpm` is available directly:

```bash
pnpm install
```

## Quick Start

Create or reuse a CloneSession:

```bash
corepack pnpm cli init https://example.com
```

List sessions:

```bash
corepack pnpm cli list
```

Show session metadata:

```bash
corepack pnpm cli show example-com-0f115db062
```

Create a session runbook with open/run/validate instructions:

```bash
corepack pnpm cli session-runbook example-com-0f115db062
```

Discover same-host public pages from captured homepage HTML:

```bash
corepack pnpm cli discover-pages example-com-0f115db062
```

Capture discovered pages for multi-page research:

```bash
corepack pnpm cli capture-pages example-com-0f115db062 --limit 10
```

Create a public asset inventory and visual plan:

```bash
corepack pnpm cli asset-inventory example-com-0f115db062
```

Create a public asset localization plan:

```bash
corepack pnpm cli asset-download-plan example-com-0f115db062
```

Create the formal clone task bundle:

```bash
corepack pnpm cli formal-task example-com-0f115db062
```

Create formal clone research notes:

```bash
corepack pnpm cli formal-research example-com-0f115db062
```

Create a comparison report and repair queue:

```bash
corepack pnpm cli formal-compare example-com-0f115db062
```

Create a React Grab install task for precision repair:

```bash
corepack pnpm cli react-grab-install-task example-com-0f115db062
```

Validate the formal clone app structure:

```bash
corepack pnpm cli formal-validate example-com-0f115db062
```

Generate a simple static first pass from captured HTML:

```bash
corepack pnpm cli formal-static-pass example-com-0f115db062
```

Check whether the session is ready for formal clone work:

```bash
corepack pnpm cli formal-status example-com-0f115db062
```

Create a minimal runnable formal clone scaffold:

```bash
corepack pnpm cli formal-scaffold example-com-0f115db062
```

Create upstream integration task files:

```bash
corepack pnpm cli integrate-upstreams example-com-0f115db062
```

Run project health checks:

```bash
corepack pnpm cli doctor
corepack pnpm check
```

## Workflow

1. Capture a target website.

```bash
corepack pnpm cli init https://target-site.example
```

This creates:

```text
outputs/sessions/<session-id>/
```

2. Review target research.

Important files:

```text
clone-session.json
RUNBOOK.md
target-research/raw-html.html
target-research/desktop.png
target-research/network-analysis.json
target-research/site-map.json
target-research/PAGE_DISCOVERY.md
agent-memory/TASKS.md
agent-memory/DECISIONS.md
agent-memory/PROMPTS.md
```

3. Discover and capture core pages for multi-page targets.

```bash
corepack pnpm cli discover-pages <session-id>
corepack pnpm cli capture-pages <session-id> --limit 10
```

This creates a conservative same-host page queue and saves captured page artifacts under:

```text
outputs/sessions/<session-id>/target-research/site-map.json
outputs/sessions/<session-id>/target-research/PAGE_DISCOVERY.md
outputs/sessions/<session-id>/target-research/pages/
```

For large sites, keep the first capture small. Start with 5-10 pages, inspect the queue, then increase the limit only when the scope is clear.

4. Generate a formal clone task bundle.

```bash
corepack pnpm cli formal-task <session-id>
```

This creates:

```text
outputs/sessions/<session-id>/formal-clone/TASK_BUNDLE.md
```

5. Check readiness.

```bash
corepack pnpm cli formal-status <session-id>
```

6. Generate formal clone research notes.

```bash
corepack pnpm cli formal-research <session-id>
```

This creates:

```text
outputs/sessions/<session-id>/formal-clone/docs/research/
```

When page discovery and page capture have been run, formal research also creates:

```text
outputs/sessions/<session-id>/formal-clone/docs/research/04-multi-page-map.md
```

7. Generate public asset inventory and localization planning.

```bash
corepack pnpm cli asset-inventory <session-id>
corepack pnpm cli asset-download-plan <session-id>
```

This creates:

```text
outputs/sessions/<session-id>/references/ASSET_INVENTORY.md
outputs/sessions/<session-id>/references/VISUAL_PLAN.md
outputs/sessions/<session-id>/references/ASSET_DOWNLOAD_PLAN.md
```

8. Create a comparison report and repair queue.

```bash
corepack pnpm cli formal-compare <session-id>
```

This creates:

```text
outputs/sessions/<session-id>/comparison/FORMAL_COMPARISON.md
outputs/sessions/<session-id>/comparison/REPAIR_QUEUE.md
```

9. Create the React Grab install task when the formal clone is ready for precision repair.

```bash
corepack pnpm cli react-grab-install-task <session-id>
```

This creates:

```text
outputs/sessions/<session-id>/react-grab-repairs/INSTALL_REACT_GRAB.md
```

10. Validate the formal clone app structure.

```bash
corepack pnpm cli formal-validate <session-id>
```

This creates:

```text
outputs/sessions/<session-id>/formal-clone/VALIDATION.md
```

When dependencies are installed inside `formal-clone/`, you can also run:

```bash
corepack pnpm cli formal-validate <session-id> --run-build
```

11. Let Codex or Cursor continue from `TASK_BUNDLE.md`, `docs/research/`, `references/ASSET_DOWNLOAD_PLAN.md`, `comparison/REPAIR_QUEUE.md`, `formal-clone/VALIDATION.md`, and `react-grab-repairs/INSTALL_REACT_GRAB.md`.

The formal clone should be built inside:

```text
outputs/sessions/<session-id>/formal-clone/
```

12. Generate a minimal runnable scaffold.

```bash
corepack pnpm cli formal-scaffold <session-id>
```

13. For simple static targets, generate a static first pass from captured HTML.

```bash
corepack pnpm cli formal-static-pass <session-id>
```

This updates the formal clone app files and creates:

```text
outputs/sessions/<session-id>/formal-clone/STATIC_IMPLEMENTATION.md
```

This creates a small Next.js work area inside `formal-clone/`.

14. Run the generated formal clone app.

```bash
cd outputs/sessions/<session-id>/formal-clone
pnpm install
pnpm dev
```

Then open:

```text
http://localhost:3000
```

## Session Layout

Each target website gets a CloneSession:

```text
outputs/sessions/<session-id>/
  clone-session.json
  target-research/
    raw-html.html
    desktop.png
    network-analysis.json
  open-lovable-version/
  formal-clone/
    TASK_BUNDLE.md
    package.json
    app/
    data/
  comparison/
  references/
  mock-data/
  agent-memory/
    TASKS.md
    DECISIONS.md
    CHANGELOG_AGENT.md
    PROMPTS.md
```

`formal-clone/` is the main final codebase for a session.

`open-lovable-version/` is only a quick visual reference.

`agent-memory/` is the handoff layer for AI agents.

## Commands

```bash
corepack pnpm cli init <url>
corepack pnpm cli init <url> --refresh
corepack pnpm cli list
corepack pnpm cli show <session-id>
corepack pnpm cli doctor
corepack pnpm cli session-runbook <session-id>
corepack pnpm cli discover-pages <session-id>
corepack pnpm cli discover-pages <session-id> --max 20
corepack pnpm cli capture-pages <session-id> --limit 10
corepack pnpm cli capture-pages <session-id> --limit 10 --refresh
corepack pnpm cli asset-inventory <session-id>
corepack pnpm cli asset-download-plan <session-id>
corepack pnpm cli formal-task <session-id>
corepack pnpm cli formal-compare <session-id>
corepack pnpm cli formal-research <session-id>
corepack pnpm cli formal-status <session-id>
corepack pnpm cli formal-validate <session-id>
corepack pnpm cli formal-validate <session-id> --run-build
corepack pnpm cli formal-scaffold <session-id>
corepack pnpm cli formal-scaffold <session-id> --force
corepack pnpm cli formal-static-pass <session-id>
corepack pnpm cli integrate-upstreams <session-id>
corepack pnpm cli react-grab-install-task <session-id>
corepack pnpm cli react-grab-task <session-id> --context ./grab-context.json
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:smoke
corepack pnpm check
corepack pnpm clean
corepack pnpm safe:status
```

## Deployment

Planarian currently ships as a local CLI-oriented monorepo. There is no web server or hosted app to deploy yet.

Recommended deployment model today:

1. Push the repository to GitHub.
2. Clone it on the workstation or agent runner that will perform clone work.
3. Install dependencies with `corepack pnpm install`.
4. Run Planarian commands locally from the repository root.
5. Commit session task bundles and agent-memory updates as workflow checkpoints.

For a fresh machine:

```bash
git clone https://github.com/alexliluz/planarian.git
cd planarian
corepack pnpm install
corepack pnpm check
```

For CI or an agent runner:

```bash
corepack pnpm install
corepack pnpm typecheck
corepack pnpm test
```

Future deployment targets may include:

- a packaged CLI
- GitHub Actions checks
- a local web UI
- a workspace runner for generated formal clone apps

## Development

Run all checks:

```bash
corepack pnpm check
```

Run the end-to-end smoke test:

```bash
corepack pnpm test:smoke
```

Clean TypeScript build outputs:

```bash
corepack pnpm clean
```

Check git status safely:

```bash
corepack pnpm safe:status
```

## AI Handoff

Future AI agents should read and update `AI_HANDOFF.md` before ending a task. It records the current project state, completed work, validation results, known limitations, and next plan.

For session-specific work, also update:

```text
outputs/sessions/<session-id>/agent-memory/CHANGELOG_AGENT.md
```
