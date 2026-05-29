# Phase 1.5 Stabilization Checklist

Use this checklist before starting Phase 2 integrations.

## Repository Safety

- [x] Add `.gitignore`.
- [x] Initialize git locally.
- [ ] Create the first git commit.
- [ ] Decide whether `workspace/sessions/example-com-0f115db062` should stay as a committed fixture.

## CLI Foundation

- [x] Add `cli list`.
- [x] Add `cli show <session-id>`.
- [x] Add `cli doctor`.
- [x] Make `cli init <url>` idempotent by default.
- [x] Add `cli init <url> --refresh`.
- [x] Add CLI output snapshot tests or command-level integration tests.

## Test Coverage

- [x] Test URL normalization.
- [x] Test stable session ids.
- [x] Test site classification basics.
- [x] Test session repository utilities.
- [x] Test doctor checks.
- [x] Test changed-file safety rules.
- [x] Test init idempotency without launching Playwright by injecting analyzer behavior.

## Maintenance

- [x] Add `clean` script.
- [x] Add `AI_HANDOFF.md` and update rules.
- [x] Add `docs/PHASE_2_PLAN.md`.
- [ ] Review generated artifacts before first commit.

## Phase 2 Readiness

- [ ] Define formal clone task bundle format.
- [ ] Add `pnpm cli formal-task <session-id>`.
- [ ] Add tests for formal clone task bundle generation.
- [ ] Keep Open Lovable and React Grab as later integration layers.
