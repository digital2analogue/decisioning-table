# Visual Regression Test Baselines

Baseline screenshots are stored in this directory and used by Playwright to detect visual regressions in future test runs.

## Generating Baselines

To generate or update baseline screenshots:

```bash
npm run test:visual -- --update-snapshots
```

This will:
1. Start the dev server (if configured)
2. Capture screenshots of all pages/components
3. Store them as baseline images in this directory

## Workflow

1. **First time**: Run `--update-snapshots` to create initial baselines
2. **After changes**: Run `npm run test:visual` to compare against baselines
3. **Review changes**: If screenshots differ, review them in `test-results/` and decide if the change is intentional
4. **Update baselines**: If the change is intentional, run `--update-snapshots` again

## Committing Baselines

Baseline images should be committed to git so the team has a shared source of truth for what the UI should look like.

```bash
git add tests/visual/__screenshots__/
git commit -m "Add visual regression test baselines"
```
