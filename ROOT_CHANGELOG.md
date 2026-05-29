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
