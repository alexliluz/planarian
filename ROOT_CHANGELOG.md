# Root Changelog

## 2026-05-29

- Created Phase 1 Planarian foundation.

## 2026-05-30

- Added fixed AI handoff log.
- Added Phase 1.5 stabilization improvements:
  - `.gitignore`
  - `docs/PHASE_2_PLAN.md`
  - `pnpm cli list`
  - `pnpm cli show <session-id>`
  - `pnpm cli doctor`
  - idempotent `pnpm cli init <url>` behavior
  - session repository utilities
  - additional unit tests
- Initialized git locally.
- Added testable changed-file safety checker core.
- Added doctor unit tests.
- Added `pnpm clean`.
- Added `docs/PHASE_1_5_CHECKLIST.md`.
- Prepared first GitHub checkpoint for `alexliluz/planarian`.
- Created local initial commit; GitHub push is pending due network connectivity failure.
- Added CLI command tests.
- Added injectable analyzer support for `initCloneSession`.
- Added init idempotency and refresh tests without launching Playwright.
- Added `pnpm cli formal-task <session-id>`.
- Generated the first formal clone task bundle for `example-com-0f115db062`.
- Allowed session `formal-clone/TASK_BUNDLE.md` files to be committed while keeping generated formal clone outputs ignored by default.
- Pushed merged local `main` to `alexliluz/planarian`.
- Added `pnpm cli formal-status <session-id>`.
- Expanded formal task bundles with target summary, asset inventory, and acceptance criteria.
- Expanded README with upstream project roles, usage workflow, and deployment guidance.
- Changed default CloneSession output location from `workspace/sessions/` to `outputs/sessions/`.
- Added `pnpm cli formal-scaffold <session-id>` to generate a minimal runnable Next.js work area.
- Added upstream integration task generators for Open Lovable, ai-website-cloner-template style formal clone work, comparison, and React Grab repair tasks.
- Added `docs/UPSTREAM_CODE_REVIEW.md` with source-level upstream workflow analysis.
- Added `pnpm cli formal-research <session-id>` to generate formal clone research notes from captured target analysis.
- Added `pnpm cli formal-compare <session-id>` to generate a comparison report and repair queue.
- Added `pnpm cli react-grab-install-task <session-id>` to create a React Grab setup task for formal clone repair.
- Added `pnpm cli formal-validate <session-id>` to validate formal clone structure and write `formal-clone/VALIDATION.md`.
- Added `pnpm cli formal-static-pass <session-id>` to generate a simple static formal clone from captured HTML.
- Added `pnpm cli session-runbook <session-id>` to generate per-session open/run/validate instructions.
- Added a real-site test session for `https://www.kleinerperkins.com/`.
- Improved site classification to avoid treating telemetry and consent requests as auth-gated app APIs.
- Added `pnpm cli asset-inventory <session-id>` to generate public asset inventory and visual planning notes.
- Added shared HTML text extraction and entity decoding for research, asset inventory, and static pass generation.
- Added `pnpm cli asset-download-plan <session-id>` to classify captured public assets as localize, reference, or ignore.
- Added `pnpm cli discover-pages <session-id>` and `pnpm cli capture-pages <session-id>` for conservative multi-page target research.
- Extended `pnpm cli formal-research <session-id>` to generate `04-multi-page-map.md` from discovered and captured pages.
- Implemented the first Kleiner Perkins formal clone homepage pass and fixed Windows build validation command handling.
- Added `pnpm cli asset-localize <session-id>` to download high-priority public assets into `formal-clone/public/assets/`.
- Added `pnpm cli pipeline <url>` as the first default staged workflow for testing new public websites.

## 2026-06-02

- Added persistent pipeline reports:
  - `outputs/sessions/<session-id>/PIPELINE_RUN.md`
  - `outputs/sessions/<session-id>/pipeline-run.json`
- Updated `pnpm cli pipeline <url>` output to print the generated report path.
- Updated the default formal clone scaffold Next.js config for nested `outputs/` build compatibility.
- Updated `pnpm cli formal-scaffold <session-id>` to generate basic Next.js route placeholders for captured non-home pages.
- Added `pnpm cli formal-routes-pass <session-id>` to generate content-aware first-pass pages for captured non-home routes.
- Added `formal-routes-pass` to the default pipeline when page capture is enabled.
