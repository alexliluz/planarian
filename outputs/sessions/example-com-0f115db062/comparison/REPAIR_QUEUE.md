# Repair Queue

Session: example-com-0f115db062
Target: https://example.com/

Use this file to queue formal clone repair work. Keep each item small enough for one Codex or Cursor pass.

## Blocking Inputs

- No blocking comparison inputs are currently missing.

## Visual Repair Items

- [ ] Compare first viewport against `../target-research/desktop.png`.
- [ ] Verify global typography and spacing.
- [ ] Verify header/navigation structure.
- [ ] Verify main content order.
- [ ] Verify dynamic sections use mock data when needed.

## React Grab Candidates

- [ ] Run the formal clone app locally.
- [ ] Select the most visibly mismatched component with React Grab.
- [ ] Create a task with `corepack pnpm cli react-grab-task example-com-0f115db062 --context <grab-context.json>`.

## Notes

- Keep `../agent-memory/CHANGELOG_AGENT.md` updated after repair work.
- Do not modify `../clone-session.json` during repair tasks.
