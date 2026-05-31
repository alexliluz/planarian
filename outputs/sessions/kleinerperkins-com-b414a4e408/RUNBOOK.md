# Planarian Session Runbook

Session: kleinerperkins-com-b414a4e408
Target: https://www.kleinerperkins.com/
Classification: unknown

## Open The Captured Target

- Screenshot: `target-research/desktop.png`
- Raw HTML: `target-research/raw-html.html`
- Network summary: `target-research/network-analysis.json`

## Run The Formal Clone App

```bash
cd G:\workspace\planarian\outputs\sessions\kleinerperkins-com-b414a4e408\formal-clone
corepack pnpm install
corepack pnpm dev
```

Then open:

```text
http://localhost:3000
```

## Validate The Formal Clone

From the Planarian repository root:

```bash
corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408
corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408 --run-build
```

Use `--run-build` after dependencies have been installed inside `formal-clone/`.

## Continue The Workflow

```bash
corepack pnpm cli formal-task kleinerperkins-com-b414a4e408
corepack pnpm cli formal-research kleinerperkins-com-b414a4e408
corepack pnpm cli formal-scaffold kleinerperkins-com-b414a4e408
corepack pnpm cli formal-static-pass kleinerperkins-com-b414a4e408
corepack pnpm cli formal-compare kleinerperkins-com-b414a4e408
corepack pnpm cli react-grab-install-task kleinerperkins-com-b414a4e408
```

## Key Files

- `clone-session.json`
- `formal-clone/TASK_BUNDLE.md`
- `formal-clone/docs/research/README.md`
- `formal-clone/STATIC_IMPLEMENTATION.md`
- `formal-clone/VALIDATION.md`
- `comparison/FORMAL_COMPARISON.md`
- `comparison/REPAIR_QUEUE.md`
- `react-grab-repairs/INSTALL_REACT_GRAB.md`
- `agent-memory/CHANGELOG_AGENT.md`

## Safety

- Rebuild visible public UI only.
- Do not bypass authentication, paywalls, private APIs, or private backend systems.
- Use local mock data for dynamic or private behavior.
