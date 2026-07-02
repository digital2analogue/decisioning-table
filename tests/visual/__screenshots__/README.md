# Visual Regression Baselines

Committed baseline screenshots, compared by `npm run test:visual` on every
CI run. **Baselines are generated on the CI runner** — font rendering
differs slightly between machines, so locally-generated baselines will
fail in CI.

## Updating baselines after an intentional visual change

1. Push your change.
2. Run the **"Update visual baselines"** workflow from the repo's Actions
   tab (pick your branch). It regenerates the screenshots on the CI runner
   and commits them to your branch.
3. Re-run CI if it doesn't retrigger automatically (bot commits don't).

`npm run test:visual:update` still works for local experimentation, but
don't commit locally-generated baselines.
