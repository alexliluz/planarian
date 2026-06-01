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

## 2026-06-01 - Codex

- Summary: Generated an asset download plan for the Kleiner Perkins session.
- Files changed: `references/ASSET_DOWNLOAD_PLAN.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm check`, `corepack pnpm cli asset-download-plan kleinerperkins-com-b414a4e408`
- Notes: The plan marks primary hero/logo/font assets for localization, keeps long-tail public images as references, and ignores original scripts, analytics, consent, and telemetry assets.

## 2026-06-01 - Codex

- Summary: Added multi-page discovery and captured the first core Kleiner Perkins pages.
- Files changed: `target-research/site-map.json`, `target-research/PAGE_DISCOVERY.md`, `target-research/pages/capture-manifest.json`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm check`, `corepack pnpm cli discover-pages kleinerperkins-com-b414a4e408 --max 25`, `corepack pnpm cli capture-pages kleinerperkins-com-b414a4e408 --limit 4`
- Notes: The first queue now prioritizes `/`, `/about`, `/people`, and `/perspectives` before section detail pages. Captured page directories are generated under `target-research/pages/`; heavy page artifacts are ignored by git except the capture manifest.

## 2026-06-01 - Codex

- Summary: Regenerated formal research with a multi-page map.
- Files changed: `formal-clone/docs/research/README.md`, `formal-clone/docs/research/01-page-structure.md`, `formal-clone/docs/research/04-multi-page-map.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm check`, `corepack pnpm cli formal-research kleinerperkins-com-b414a4e408`
- Notes: The multi-page map summarizes 25 discovered pages, 4 captured core pages, headings, text lengths, network counts, API candidate counts, and pending route queue.

## 2026-06-01 - Codex

- Summary: Implemented the first formal clone homepage pass for the Kleiner Perkins session.
- Files changed: `formal-clone/app/page.tsx`, `formal-clone/app/globals.css`, `formal-clone/next.config.mjs`, `formal-clone/next-env.d.ts`, `formal-clone/VALIDATION.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm check`, `corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408`, `corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408 --run-build`, `corepack pnpm --dir outputs/sessions/kleinerperkins-com-b414a4e408/formal-clone exec next build`
- Notes: The homepage now has a first-viewport implementation with navigation, hero background, feature messaging, story cards, cookie banner mock, and footer. Visual smoke check confirmed hero text, brand text, hero dimensions, CSS background reference, and non-empty screenshot buffer. Public visual assets are still remote references and should be localized next.
