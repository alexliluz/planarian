# Formal Clone Task Bundle

Session: example-com-0f115db062
Target: https://example.com/
Classification: unknown
Clone mode: visual-plus-interactions

## Goal

Rebuild the visible public UI of the target website as a clean, modern Next.js application inside this session's `formal-clone/` directory.

## Required Inputs

- `../clone-session.json`
- `../target-research/raw-html.html`
- `../target-research/desktop.png`
- `../target-research/network-analysis.json`
- `../agent-memory/PROMPTS.md`
- `../agent-memory/DECISIONS.md`

## Safety Constraints

- Do not bypass authentication, paywalls, private APIs, private data, or backend systems.
- Do not call private backend endpoints discovered during analysis.
- Use mock data for authenticated, payment, trading, database, user-data, or private API behavior.
- Rebuild only visible UI, public page structure, static assets, front-end interactions, and mock-data flows.

## Expected Output

- A maintainable Next.js codebase in `formal-clone/`.
- Mock data for dynamic or private sections.
- Clear component boundaries.
- Validation scripts documented in the generated app README.
- Changes recorded in `../agent-memory/CHANGELOG_AGENT.md`.

## Agent Instructions

1. Inspect the required inputs before writing code.
2. Create the smallest useful scaffold first.
3. Keep the implementation testable and easy for Cursor Auto to continue.
4. Preserve this task bundle as the source of truth for formal clone generation.

## Target Notes

- Signals were inconclusive; review raw HTML and network analysis.
