# React Grab Install Task

Session: example-com-0f115db062
Target: https://example.com/

## Goal

Prepare the generated formal clone app for component-level UI repair with React Grab.

## Scope

- Work inside `formal-clone/`.
- Keep React Grab setup local to the formal clone app.
- Do not modify `../clone-session.json`.
- Do not call or reproduce private backend systems.

## Preconditions

- `formal-clone/package.json` exists.
- The formal clone app can run locally with its documented dev command.
- `../comparison/REPAIR_QUEUE.md` has at least one visual repair candidate.

## Suggested Steps

1. Open `formal-clone/package.json` and confirm the React/Next.js version.
2. Install the React Grab package or follow the current upstream setup instructions for the app framework.
3. Add the smallest possible React Grab provider/client wiring required by the upstream package.
4. Start the formal clone app locally.
5. Select one mismatched component from `../comparison/REPAIR_QUEUE.md`.
6. Export or save the selected element context as JSON.
7. Convert that context into a Planarian repair task:

```bash
corepack pnpm cli react-grab-task example-com-0f115db062 --context <grab-context.json>
```

## Expected Output

- React Grab can inspect elements in the running formal clone app.
- A selected element context can be saved as JSON.
- Planarian can convert that context into `../react-grab-repairs/*.md`.

## Validation

- Run the formal clone app.
- Confirm React Grab selection UI is available.
- Generate one repair task from a saved context.
- Update `../agent-memory/CHANGELOG_AGENT.md`.

## Notes

- React Grab is a precision repair layer, not the first-pass clone generator.
- Use it after the formal clone has a runnable UI.
- Keep repairs scoped to the selected component or nearest owning component.
