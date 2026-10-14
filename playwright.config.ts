import { defineConfig, devices } from '@playwright/test'

// Visual regression tests. Screenshots are compared against committed
// baselines in tests/visual/__screenshots__/ (linux baselines, matching CI).
// Regenerate after intentional visual changes:
//   npm run test:visual:update
export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}-{platform}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      // ABSOLUTE, not a ratio (parsimony#235, ported here 2026-09-09).
      // maxDiffPixelRatio is a fraction of the WHOLE image: at 1440x900 that
      // is 25,920 px, a 160x160 block, which is larger than most of the
      // controls on the page.
      //
      // Measured ON THE RUNNER at the first run under this setting, all
      // three baselines had drifted and were passing inside the old
      // allowance:
      //
      //   onboarding        21,644 px  (83% of the 25,920 px allowance)
      //   table-demo           479 px
      //   table-validation     342 px
      //
      // The two table numbers held identical across all three retries in
      // that run, so they are deterministic drift against the baseline
      // rather than run-to-run noise.
      //
      // Those baselines were last regenerated 2026-07-02, before the whole
      // five-family token migration (#61) and the dnd-kit rewrite (#35). The
      // reason they were never re-recorded is the tolerance itself:
      // `--update-snapshots` only rewrites a baseline whose comparison
      // FAILED, so a change absorbed here is one the update flag declines to
      // record. The PNG stops describing the code and the next real
      // regression is measured against a stale reference.
      //
      // 200 matches the constant parsimony settled on against measured
      // run-to-run drift. It only holds while every baseline is
      // runner-native — regenerate via the "Update visual baselines"
      // workflow, never locally. That rule is not fussiness: the numbers
      // above were first measured in a dev container and every one of them
      // was wrong. That run reported onboarding at 0 px and the two table
      // captures at ~23,000 px each — almost exactly inverted from what the
      // runner reports. A local screenshot comparison here is not evidence.
      maxDiffPixels: 200,
      threshold: 0.2,
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
      : {}),
    baseURL: 'http://localhost:4173',
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  },
  webServer: {
    // Production bundle via vite preview — same pixels as a deploy,
    // no dev-server overlays.
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
