# Page Discovery

Session: example-com-0f115db062
Target: https://example.com/

This file is the first multi-page capture queue for the target site. It is intentionally conservative: start with high-priority navigation and overview pages before capturing deep archive pages.

## Summary

- Discovered pages: 1
- Source: homepage HTML links
- Scope: same-host public URLs only

## Capture Queue

### 1. /

- URL: https://example.com/
- Priority: 0
- Reason: Homepage is always the root capture target.
- Label: Example Domain

## Suggested Command

```bash
corepack pnpm cli capture-pages example-com-0f115db062 --limit 10
```
