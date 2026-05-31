# Open Lovable Visual Draft Task

Target: https://www.kleinerperkins.com/
Session: kleinerperkins-com-b414a4e408

## Role

Use Open Lovable as a fast visual draft generator only. Its output belongs in `open-lovable-version/` and must not be treated as the production codebase.

## Upstream Reference

- Repository: `firecrawl/open-lovable`
- Purpose in Planarian: quick visual reference generation from a public URL.

## Inputs

- Target URL: https://www.kleinerperkins.com/
- Desktop screenshot: `../target-research/desktop.png`
- Raw HTML: `../target-research/raw-html.html`
- Network summary: `../target-research/network-analysis.json`

## Expected Output

- A quick React visual draft under this directory.
- Notes about visual mismatches and missing dynamic sections.
- No private backend calls.
- No auth, payment, account, database, or trading behavior except local mock placeholders.

## Suggested Agent Steps

1. Set up Open Lovable separately if needed.
2. Use the target URL as the visual draft source.
3. Export or copy the generated draft into `open-lovable-version/`.
4. Compare the draft against `../target-research/desktop.png`.
5. Record useful visual observations in `../comparison/open-lovable-notes.md`.
