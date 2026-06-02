# Pipeline Run

Session: example-com-0f115db062
Target: https://example.com/
Classification: unknown
Status: complete
Started: 2026-06-01T19:57:47.072Z
Finished: 2026-06-01T19:57:48.369Z

## Options

- pageLimit: 2
- assetLimit: 0
- assetDryRun: false
- skipPageCapture: false
- skipScaffold: true
- runBuild: false
- refresh: false

## Steps

| Step | Status | Detail |
| --- | --- | --- |
| init | ok | Session example-com-0f115db062 |
| session-runbook | ok | RUNBOOK.md |
| discover-pages | ok | 1 page(s) |
| capture-pages | ok | 1 page(s) |
| asset-inventory | ok | references/ASSET_INVENTORY.md, references/VISUAL_PLAN.md |
| asset-download-plan | ok | G:\workspace\planarian\outputs\sessions\example-com-0f115db062\references\ASSET_DOWNLOAD_PLAN.md |
| asset-localize | skipped | Use --assets <count> to download public assets |
| formal-research | ok | 6 file(s) |
| formal-scaffold | skipped | Skipped by option |
| formal-validate | ok | G:\workspace\planarian\outputs\sessions\example-com-0f115db062\formal-clone\VALIDATION.md |

## Result

- Failed steps: 0
- Skipped steps: 2
- JSON report: pipeline-run.json

## Next Actions

- Review PIPELINE_RUN.md, target-research/PAGE_DISCOVERY.md, and formal-clone/docs/research/04-multi-page-map.md.
- Open formal-clone/ and start the visible UI reconstruction from captured reference materials.
- Use asset-localize with an explicit limit when public assets should be copied into formal-clone/public/assets.
- Run the pipeline again with --assets <count> when local public assets are needed.
