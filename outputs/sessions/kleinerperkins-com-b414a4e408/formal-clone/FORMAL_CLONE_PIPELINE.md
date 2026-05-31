# Formal Clone Pipeline

Target: https://www.kleinerperkins.com/
Session: kleinerperkins-com-b414a4e408

## Role

Use the ai-website-cloner-template approach as the formal engineering workflow for the final clone codebase.

## Upstream Reference

- Repository: `JCodesMore/ai-website-cloner-template`
- Purpose in Planarian: clean, agent-driven Next.js reconstruction workflow.

## Planarian Inputs

- `../clone-session.json`
- `../target-research/raw-html.html`
- `../target-research/desktop.png`
- `../target-research/network-analysis.json`
- `TASK_BUNDLE.md`

## Formal Build Stages

1. Inspect target research and safety constraints.
2. Create or update the local Next.js scaffold.
3. Rebuild visible layout and static content first.
4. Add mock data for dynamic sections.
5. Compare against `../target-research/desktop.png`.
6. Run lint/build validation.
7. Update `../agent-memory/CHANGELOG_AGENT.md`.

## Safety

- Do not call private APIs.
- Do not bypass auth or paywalls.
- Use mock data for private, authenticated, payment, trading, database, or user-data behavior.
