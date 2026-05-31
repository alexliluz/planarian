# Formal Clone Task Bundle

Session: kleinerperkins-com-b414a4e408
Target: https://www.kleinerperkins.com/
Classification: unknown
Clone mode: visual-plus-mock-api

## Goal

Rebuild the visible public UI of the target website as a clean, modern Next.js application inside this session's `formal-clone/` directory.

## Required Inputs

- `../clone-session.json`
- `../target-research/raw-html.html`
- `../target-research/desktop.png`
- `../target-research/network-analysis.json`
- `../agent-memory/PROMPTS.md`
- `../agent-memory/DECISIONS.md`

## Target Summary

- URL: https://www.kleinerperkins.com/
- Hostname: www.kleinerperkins.com
- Title: Home | Kleiner Perkins
- Classification: unknown
- Requires auth: false
- Has API requests: true
- Heavy client rendering: false
- Detected frameworks: react-root

## Asset Inventory

- Primary desktop screenshot: `../target-research/desktop.png`
- Raw HTML snapshot: `../target-research/raw-html.html`
- Network summary: `../target-research/network-analysis.json`
- Mock data directory: `../mock-data/`
- Reference directory: `../references/`

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

## Acceptance Criteria

- The first viewport visually matches the desktop screenshot at a practical engineering level.
- Major layout regions, typography scale, spacing, and color relationships are represented.
- Static content visible in the captured page is present in the formal clone.
- Dynamic/private sections use local mock data only.
- No real login, payment, trading, account, database, or private backend calls are implemented.
- The generated app has documented install, dev, build, and validation commands.
- The final agent updates `../agent-memory/CHANGELOG_AGENT.md`.

## Agent Instructions

1. Inspect the required inputs before writing code.
2. Create the smallest useful scaffold first.
3. Keep the implementation testable and easy for Cursor Auto to continue.
4. Preserve this task bundle as the source of truth for formal clone generation.

## Target Notes

- Signals were inconclusive; review raw HTML and network analysis.
