# Agent Changelog

Use this format for future Codex/Cursor changes:

## YYYY-MM-DD - Agent Name

- Summary:
- Files changed:
- Tests run:
- Notes:

## 2026-05-31 - Codex

- Summary: Created the initial real-site session for `https://www.kleinerperkins.com/` and generated the first agent-facing workflow files.
- Files changed: `clone-session.json`, `RUNBOOK.md`, `target-research/*`, `formal-clone/TASK_BUNDLE.md`, `formal-clone/docs/research/*.md`, `open-lovable-version/*`, `formal-clone/FORMAL_CLONE_PIPELINE.md`, `formal-clone/AGENTS.md`, `formal-clone/*`, `comparison/*`, `react-grab-repairs/INSTALL_REACT_GRAB.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm check`, `corepack pnpm cli init https://www.kleinerperkins.com --refresh`, `corepack pnpm cli session-runbook kleinerperkins-com-b414a4e408`, `corepack pnpm cli formal-task kleinerperkins-com-b414a4e408`, `corepack pnpm cli formal-research kleinerperkins-com-b414a4e408`, `corepack pnpm cli formal-scaffold kleinerperkins-com-b414a4e408`, `corepack pnpm cli integrate-upstreams kleinerperkins-com-b414a4e408`, `corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408`, `corepack pnpm cli formal-compare kleinerperkins-com-b414a4e408`, `corepack pnpm cli react-grab-install-task kleinerperkins-com-b414a4e408`
- Notes: The refreshed classification is `unknown`, which is more appropriate than the earlier telemetry-driven `auth-gated` result. The formal clone is still scaffold-level and should not be treated as a completed visual clone.

## 2026-06-01 - Codex

- Summary: Generated public asset inventory and visual planning notes for this real-site session.
- Files changed: `references/ASSET_INVENTORY.md`, `references/VISUAL_PLAN.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm check`, `corepack pnpm cli asset-inventory kleinerperkins-com-b414a4e408`
- Notes: Captured 65 image requests, 1 font, 1 stylesheet, 13 scripts, and 8 API candidates.

## 2026-06-01 - Codex

- Summary: Regenerated asset inventory and formal research after adding shared HTML text extraction.
- Files changed: `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm check`, `corepack pnpm cli asset-inventory kleinerperkins-com-b414a4e408`, `corepack pnpm cli formal-research kleinerperkins-com-b414a4e408`
- Notes: Node UTF-8 inspection confirmed the previously observed `鈥?` characters were a PowerShell display artifact; generated markdown contains proper Unicode punctuation.
