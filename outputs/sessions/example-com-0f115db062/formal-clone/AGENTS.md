# Formal Clone Agent Instructions

Target: https://example.com/

## Agent Contract

- Work inside this `formal-clone/` directory.
- Treat `TASK_BUNDLE.md` and `FORMAL_CLONE_PIPELINE.md` as the local source of truth.
- Keep changes scoped and testable.
- Prefer small commits/checkpoints.
- Update `../agent-memory/CHANGELOG_AGENT.md` after meaningful changes.

## Cursor Auto Tasks

- Add tests for generated components.
- Refine UI differences found by screenshot comparison.
- Keep dynamic sections backed by local mock data.

## Codex Tasks

- Maintain scaffolding, CLI integration, and safety checks.
- Add deterministic generators before adding upstream automation.
