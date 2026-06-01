# Visual Plan

Session: example-com-0f115db062
Target: https://example.com/

## Page Identity

- Title: Example Domain
- Description: Unknown
- Classification: unknown
- Detected frameworks: none

## Visual Signals

- HTML classes: none
- Body classes: none
- Image count: 0
- Font count: 0
- Stylesheet count: 0

## Navigation Labels

- Learn more

## Headings

- Example Domain

## Text Excerpt

```text
Example Domain Example Domain This domain is for use in documentation examples without needing permission. Avoid use in operations. Learn more
```

## Implementation Guidance

- Use `../target-research/desktop.png` as the first visual baseline.
- Treat `ASSET_INVENTORY.md` as the source for public visual asset references.
- Recreate the first viewport before deeper page sections.
- Prefer local mock data for dynamic sections.
- Do not implement real analytics, consent logging, personalization, tracking, private API, account, payment, or backend calls.
- For this type of media-heavy marketing site, do not rely on `formal-static-pass` as the final clone. Use research, assets, and visual comparison instead.

## Suggested First Clone Pass

1. Build the global shell: theme, background, header/nav, and typography.
2. Recreate the first hero section using public image references or local placeholders.
3. Add portfolio/story tiles from visible page text and captured asset URLs.
4. Run `corepack pnpm cli formal-validate example-com-0f115db062`.
5. Run `corepack pnpm cli formal-compare example-com-0f115db062`.
6. Use React Grab repair tasks for component-level visual mismatches.
