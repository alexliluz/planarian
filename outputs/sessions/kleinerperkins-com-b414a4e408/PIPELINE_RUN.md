# Pipeline Run

Session: kleinerperkins-com-b414a4e408
Target: https://www.kleinerperkins.com/
Classification: unknown
Status: complete
Started: 2026-06-02T12:11:06.594Z
Finished: 2026-06-02T12:11:31.738Z

## Options

- pageLimit: 4
- assetLimit: 0
- assetDryRun: false
- skipPageCapture: false
- skipScaffold: true
- skipRoutesPass: false
- browserSmoke: true
- browserSmokePort: 3224
- runBuild: false
- refresh: false

## Steps

| Step | Status | Detail |
| --- | --- | --- |
| init | ok | Session kleinerperkins-com-b414a4e408 |
| session-runbook | ok | RUNBOOK.md |
| discover-pages | ok | 40 page(s) |
| capture-pages | ok | 4 page(s) |
| asset-inventory | ok | references/ASSET_INVENTORY.md, references/VISUAL_PLAN.md |
| asset-download-plan | ok | G:\workspace\planarian\outputs\sessions\kleinerperkins-com-b414a4e408\references\ASSET_DOWNLOAD_PLAN.md |
| asset-localize | skipped | Use --assets <count> to download public assets |
| formal-research | ok | 6 file(s) |
| formal-scaffold | skipped | Skipped by option |
| formal-routes-pass | ok | 5 file(s) |
| formal-validate | ok | G:\workspace\planarian\outputs\sessions\kleinerperkins-com-b414a4e408\formal-clone\VALIDATION.md |
| formal-route-smoke | ok | browser mode, 3 route(s) |

## Result

- Failed steps: 0
- Skipped steps: 2
- JSON report: pipeline-run.json

## Next Actions

- Review PIPELINE_RUN.md, target-research/PAGE_DISCOVERY.md, and formal-clone/docs/research/04-multi-page-map.md.
- Open formal-clone/ and start the visible UI reconstruction from captured reference materials.
- Use asset-localize with an explicit limit when public assets should be copied into formal-clone/public/assets.
- Run the pipeline again with --assets <count> when local public assets are needed.
