# Phase 2 Plan

Phase 2 should integrate the formal clone workflow without deeply forking upstream projects.

## Goals

- Treat `formal-clone/` as the main generated codebase for each CloneSession.
- Use target research artifacts as inputs:
  - `clone-session.json`
  - `target-research/raw-html.html`
  - `target-research/desktop.png`
  - `target-research/network-analysis.json`
  - `agent-memory/PROMPTS.md`
- Generate a clean, testable Next.js scaffold in `formal-clone/`.
- Keep private backend, auth, payment, trading, database, and user-data behavior mocked.

## Non-Goals

- Do not deeply fork `firecrawl/open-lovable`.
- Do not deeply fork `JCodesMore/ai-website-cloner-template`.
- Do not wire React Grab into the formal clone yet.
- Do not build a web UI yet.

## Proposed Steps

1. Define the formal clone input contract.
2. Define expected `formal-clone/` output structure.
3. Add a generator command that writes a formal clone task bundle.
4. Add validation commands for the generated formal clone.
5. Add tests around task bundle generation.
6. Document how Codex and Cursor should continue from the task bundle.

## Acceptance Criteria

- `pnpm cli formal-task <session-id>` creates a deterministic task bundle.
- The task bundle references all required research artifacts.
- The task bundle includes safety constraints and mock-data requirements.
- Existing Phase 1 commands still pass.

