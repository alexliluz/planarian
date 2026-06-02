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

## 2026-06-01 - Codex

- Summary: Re-ran the Kleiner Perkins formal clone validation and production-page smoke check.
- Files changed: `formal-clone/VALIDATION.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm check`, `corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408 --run-build`, production `next start` smoke check on local port `3215`
- Notes: Validation is ready and `corepack pnpm build` passes. Browser smoke check confirmed brand text, hero text, Read More, footer links, 3 story cards, `.hero` at 1440 x 760, fixed header at 1440 x 56, hero background asset reference, and a non-empty screenshot buffer. The next highest-value work is asset localization, then visual spacing/typography repair, then multi-page route implementation.

## 2026-06-01 - Codex

- Summary: Added asset localization workflow and localized the first Kleiner Perkins hero assets.
- Files changed: `formal-clone/public/assets/ASSET_MANIFEST.json`, `formal-clone/public/assets/images/*`, `formal-clone/app/globals.css`, `formal-clone/VALIDATION.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm check`, `corepack pnpm cli asset-localize kleinerperkins-com-b414a4e408 --dry-run --limit 4`, `corepack pnpm cli asset-localize kleinerperkins-com-b414a4e408 --limit 4`, `corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408 --run-build`
- Notes: Downloaded the first 4 high-priority public assets and switched the hero background to `/assets/images/alkira-x-lumen-home-takeover-opt-04-1.jpg`. The workflow should stay staged: discover pages, capture a small priority set, localize a small asset batch, then repair visually.

## 2026-06-02 - Codex

- Summary: Generated route-aware formal clone placeholders from captured multi-page research.
- Files changed: `formal-clone/app/about/page.tsx`, `formal-clone/app/people/page.tsx`, `formal-clone/app/perspectives/page.tsx`, `formal-clone/data/formal-routes.json`, `formal-clone/VALIDATION.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm cli formal-scaffold kleinerperkins-com-b414a4e408`, `corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408 --run-build`, `corepack pnpm check`
- Notes: Existing homepage implementation was preserved. New route placeholders point future agents to each route's captured HTML and screenshot. Build validation passed after adding `/about`, `/people`, and `/perspectives`. Full project check passed with 24 test files and 87 tests.

## 2026-06-02 - Codex

- Summary: Replaced route placeholders with content-aware first-pass route pages from captured HTML.
- Files changed: `formal-clone/app/about/page.tsx`, `formal-clone/app/people/page.tsx`, `formal-clone/app/perspectives/page.tsx`, `formal-clone/app/globals.css`, `formal-clone/data/route-content.json`, `formal-clone/ROUTE_IMPLEMENTATION.md`, `formal-clone/VALIDATION.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm cli formal-routes-pass kleinerperkins-com-b414a4e408`, `corepack pnpm cli formal-validate kleinerperkins-com-b414a4e408 --run-build`, `corepack pnpm check`
- Notes: `/about`, `/people`, and `/perspectives` now render extracted public page titles, section headings, paragraphs, and filtered public links. This is still a first-pass reconstruction and should be visually repaired against captured route screenshots. Full project check passed with 25 test files and 91 tests.

## 2026-06-02 - Codex

- Summary: Added static route smoke validation for generated formal clone routes.
- Files changed: `formal-clone/ROUTE_SMOKE.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm cli formal-route-smoke kleinerperkins-com-b414a4e408`, `corepack pnpm check`
- Notes: Route smoke passed for `/about`, `/people`, and `/perspectives`. Each route has a page file, rendered title signal, `route-shell` layout usage, content signal, and route CSS. Full project check passed with 26 test files and 94 tests.

## 2026-06-02 - Codex

- Summary: Ran browser-backed route smoke against the generated formal clone routes.
- Files changed: `formal-clone/ROUTE_SMOKE.md`, `agent-memory/CHANGELOG_AGENT.md`
- Tests run: `corepack pnpm cli formal-route-smoke kleinerperkins-com-b414a4e408 --browser --start-server --port 3222`, `corepack pnpm check`
- Notes: Browser-backed route smoke passed for `/about`, `/people`, and `/perspectives`. Each route returned HTTP 200, rendered its title text, and had a visible `.route-shell`. Port `3222` had no remaining listener after the run. Full project check passed with 26 test files and 95 tests.
