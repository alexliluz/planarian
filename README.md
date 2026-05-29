# Planarian

Planarian is an agent-friendly workflow foundation for website UI cloning and reconstruction.

Phase 1 provides:

- A pnpm TypeScript monorepo.
- A `pnpm cli init <url>` command that creates a CloneSession.
- Playwright target capture for raw HTML, desktop screenshot, and basic network summaries.
- Best-effort website classification.
- Agent-memory files for GPT, Codex, Cursor, and future repair workflows.
- Minimal integration points for Open Lovable, ai-website-cloner-template, and React Grab.

## Safety

Planarian only targets visible UI, public page structure, static assets, front-end interactions, and mock data. It must not bypass authentication, paywalls, private APIs, private data, or backend systems.

## Commands

```bash
pnpm install
pnpm cli init https://example.com
pnpm cli list
pnpm cli show example-com-0f115db062
pnpm cli doctor
pnpm typecheck
pnpm test
pnpm test:smoke
pnpm check
pnpm clean
pnpm safe:status
```

## AI Handoff

Future AI agents should read and update `AI_HANDOFF.md` before ending a task. It records the current project state, completed work, validation results, known limitations, and next plan.

## Session Layout

Each target creates a session under:

```text
workspace/sessions/<session-id>/
```

The `formal-clone/` folder is the final main codebase. The `open-lovable-version/` folder is only a quick visual reference.
