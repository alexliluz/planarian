# Asset Download Plan

Session: example-com-0f115db062
Target: https://example.com/

This plan decides which public visual assets are worth localizing into `formal-clone/public/`, which should remain references, and which should be ignored.

## Policy

- Localize public visual assets needed for stable first-viewport or component rendering.
- Keep large long-tail image galleries as references until a specific section needs them.
- Ignore analytics, consent, tracking, telemetry, and private/backend-like endpoints.
- Do not download or call private APIs.
- Preserve source URLs in comments or data files when localizing public assets.

## Summary

- Localize: 0
- Reference: 0
- Ignore: 0

## Localize First

- None.

## Keep As References

- None.

## Ignore

- None.

## Suggested Next Steps

1. Create `formal-clone/public/assets/`.
2. Localize only the assets listed in "Localize First".
3. Keep filenames stable and descriptive.
4. Update formal clone data/components to reference local assets.
5. Re-run `corepack pnpm cli formal-validate example-com-0f115db062`.
6. Re-run `corepack pnpm cli formal-compare example-com-0f115db062`.
