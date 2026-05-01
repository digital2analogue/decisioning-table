/**
 * Regenerate ALL Decision Engine case-study screenshots.
 *
 * Spins up a Vite dev server inline, drives headless Chrome via Puppeteer
 * to capture the live app + render standalone mockup pages for the
 * onboarding flow, before/after, and anatomy diagram.
 *
 * Usage:
 *   npm run screenshots
 *
 * Output (./screenshots/):
 *   01_hero_dark.png              — main table, dark-framed
 *   c1-decision-engine-before-after.png
 *   c1-decision-engine-onboarding-step1.png
 *   c1-decision-engine-onboarding-step2.png
 *   c1-decision-engine-onboarding-step3.png
 *   c1-decision-engine-onboarding-full.png
 *   c1-decision-engine-rule-row-anatomy.png
 *   c1-decision-engine-data-element-selector.png
 *
 * Set PORTFOLIO_IMAGES env var to auto-copy to the portfolio repo.
 */

import { createServer } from 'vite'
import puppeteer from 'puppeteer'
import sharp from 'sharp'
import { mkdirSync, writeFileSync, existsSync, cpSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

const DEFAULT_OUTPUT = resolve(PROJECT_ROOT, 'screenshots')
const OUTPUT_DIR = process.env.PORTFOLIO_IMAGES ?? DEFAULT_OUTPUT
const PORTFOLIO_DIR = resolve(PROJECT_ROOT, '..', 'portfolio-vercel', 'public', 'projects', 'images')

// Design tokens (from variables.css)
const T = {
  bgDefault: '#F7F9FC',
  bgAlt: '#EFF1F8',
  bgElevated: '#FFFFFF',
  bgAction: '#2456E4',
  fgPrimary: '#0F1A2E',
  fgSecondary: '#3A4663',
  fgMuted: '#8492A6',
  fgAccent: '#2456E4',
  fgDanger: '#C8002E',
  fgSuccess: '#00875A',
  fgOnAction: '#FFFFFF',
  borderDefault: '#DDE1EC',
  borderMuted: '#ECEEF5',
  frameBg: '#0A0D0A',
  fontSans: "'Plus Jakarta Sans', sans-serif",
  fontMono: "'DM Mono', 'JetBrains Mono', monospace",
}

const VIEWPORT = { width: 1440, height: 860, deviceScaleFactor: 2 }
const FRAME_PAD = 96

// ── Helpers ──────────────────────────────────────────────

async function frameOnDark(rawBuffer) {
  const meta = await sharp(rawBuffer).metadata()
  const W = meta.width, H = meta.height
  return sharp({
    create: { width: W + FRAME_PAD * 2, height: H + FRAME_PAD * 2, channels: 3, background: { r: 10, g: 13, b: 10 } },
  })
    .composite([{ input: rawBuffer, top: FRAME_PAD, left: FRAME_PAD }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function screenshotPage(page, url, opts = {}) {
  await page.goto(url, { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 800))
  return page.screenshot({ type: 'png', fullPage: opts.fullPage ?? false })
}

async function renderHTML(page, html, viewport = { width: 1440, height: 880 }) {
  await page.setViewport({ ...viewport, deviceScaleFactor: 2 })
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts?.ready)
  await new Promise(r => setTimeout(r, 600))
  return page.screenshot({ type: 'png', fullPage: false })
}

function savePng(name, buffer) {
  const path = resolve(OUTPUT_DIR, name)
  writeFileSync(path, buffer)
  process.stdout.write(`  ✓ ${name}\n`)
}

// ── Google Fonts link for all mockup pages ───────────────
const FONTS_LINK = `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">`

const BASE_STYLE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${T.fontSans}; background: ${T.bgDefault}; color: ${T.fgPrimary}; -webkit-font-smoothing: antialiased; }
`

// ── Before / After ───────────────────────────────────────

function beforeAfterHTML() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS_LINK}
<style>
  ${BASE_STYLE}
  body { display: flex; align-items: stretch; gap: 32px; padding: 32px 48px; height: 100vh; }
  .panel { flex: 1; background: ${T.bgElevated}; border: 1px solid ${T.borderDefault}; border-radius: 10px; padding: 0; overflow: hidden; display: flex; flex-direction: column; }
  .panel-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${T.fgMuted}; padding: 20px 24px 12px; }
  .panel-label span { color: ${T.fgAccent}; }
  /* Before: messy spreadsheet */
  .before-table { margin: 0 24px 24px; border-collapse: collapse; font-size: 13px; flex: 1; }
  .before-table th, .before-table td { border: 1px solid ${T.borderDefault}; padding: 8px 12px; text-align: left; }
  .before-table th { background: ${T.bgAlt}; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: ${T.fgMuted}; }
  .before-table td { color: ${T.fgSecondary}; font-family: ${T.fontMono}; font-size: 12px; }
  .before-table tr:nth-child(odd) td { background: ${T.bgDefault}; }
  .before-table .err { color: ${T.fgDanger}; font-weight: 600; }
  .before-table .warn { color: #B8860B; }
  .before-table .muted { color: ${T.fgMuted}; font-style: italic; }
  /* After: clean structured table */
  .after-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid ${T.borderDefault}; }
  .after-title { font-size: 16px; font-weight: 500; color: ${T.fgPrimary}; }
  .after-badge { font-size: 11px; font-weight: 500; background: ${T.bgAction}; color: ${T.fgOnAction}; padding: 4px 10px; border-radius: 9999px; }
  .after-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .after-table th { background: ${T.bgAlt}; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: ${T.fgMuted}; padding: 10px 16px; text-align: left; border-bottom: 1px solid ${T.borderDefault}; }
  .after-table td { padding: 12px 16px; border-bottom: 1px solid ${T.borderMuted}; color: ${T.fgPrimary}; }
  .attr-badge { display: inline-block; font-size: 12px; font-weight: 500; color: ${T.fgAccent}; background: #EEF2FF; padding: 3px 10px; border-radius: 9999px; }
  .outcome-approve { color: ${T.fgSuccess}; font-weight: 600; }
  .outcome-decline { color: ${T.fgDanger}; font-weight: 600; }
  .outcome-review { color: #B8860B; font-weight: 600; }
  .op { font-family: ${T.fontMono}; font-size: 12px; color: ${T.fgMuted}; }
  .val { font-family: ${T.fontMono}; font-size: 13px; }
</style></head><body>
  <div class="panel">
    <div class="panel-label"><span>BEFORE</span> — Spreadsheet-driven</div>
    <table class="before-table">
      <tr><th>Condition</th><th>Operator</th><th>Value</th><th>Action</th></tr>
      <tr><td>Credit > 700</td><td>AND</td><td>$50,000</td><td>Accept</td></tr>
      <tr><td>History OK</td><td>IF</td><td class="muted">—</td><td>Accept</td></tr>
      <tr><td>Age >21</td><td>OR</td><td class="err">Decline</td><td class="err">???</td></tr>
      <tr><td class="warn">Income?</td><td class="warn">THEN?</td><td class="warn">???</td><td class="warn">???</td></tr>
      <tr><td>DTI < 0.4</td><td>AND</td><td>0.40</td><td>Review</td></tr>
      <tr><td class="muted">???</td><td class="muted">—</td><td class="muted">—</td><td class="muted">—</td></tr>
    </table>
  </div>
  <div class="panel">
    <div class="panel-label"><span>AFTER</span> — Structured interface</div>
    <div class="after-header">
      <span class="after-title">Rule Definitions</span>
      <span class="after-badge">5 rules</span>
    </div>
    <table class="after-table">
      <tr><th>#</th><th>Data Attribute</th><th>Operator</th><th>Value</th><th>Outcome</th></tr>
      <tr><td>1</td><td><span class="attr-badge">Credit Score</span></td><td class="op">&gt;</td><td class="val">700</td><td class="outcome-approve">Approve</td></tr>
      <tr><td>2</td><td><span class="attr-badge">Annual Income</span></td><td class="op">&gt;=</td><td class="val">$50,000</td><td class="outcome-approve">Increase Limit</td></tr>
      <tr><td>3</td><td><span class="attr-badge">Employment</span></td><td class="op">IS</td><td class="val">Full-Time</td><td class="outcome-approve">Eligible</td></tr>
      <tr><td>4</td><td><span class="attr-badge">DTI Ratio</span></td><td class="op">&lt;</td><td class="val">0.40</td><td class="outcome-review">Review</td></tr>
      <tr><td>5</td><td><span class="attr-badge">Age</span></td><td class="op">&lt;</td><td class="val">21</td><td class="outcome-decline">Decline</td></tr>
    </table>
  </div>
</body></html>`
}

// ── Onboarding Steps ────────────────────────────────────

function onboardingStepHTML(step, total, title, content) {
  const pct = Math.round((step / total) * 100)
  const btnLabel = step === total ? 'Create' : 'Next'
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS_LINK}
<style>
  ${BASE_STYLE}
  body { display: flex; align-items: center; justify-content: center; height: 100vh; background: ${T.bgDefault}; }
  .card { width: 560px; background: ${T.bgElevated}; border: 1px solid ${T.borderDefault}; border-radius: 10px; padding: 32px 36px; box-shadow: 0 2px 8px rgba(15,26,46,0.07); display: flex; flex-direction: column; }
  .step-label { font-size: 12px; font-weight: 500; color: ${T.fgAccent}; margin-bottom: 8px; }
  .progress { height: 3px; background: ${T.bgAlt}; border-radius: 9999px; margin-bottom: 28px; overflow: hidden; }
  .progress-fill { height: 100%; width: ${pct}%; background: ${T.fgAccent}; border-radius: 9999px; }
  .step-title { font-size: 20px; font-weight: 600; color: ${T.fgPrimary}; margin-bottom: 20px; }
  .content { flex: 1; margin-bottom: 28px; }
  .option { padding: 12px 16px; border: 1px solid ${T.borderDefault}; border-radius: 6px; margin-bottom: 8px; font-size: 14px; color: ${T.fgPrimary}; cursor: pointer; transition: border-color 0.12s; }
  .option:hover { border-color: ${T.fgAccent}; }
  .option.selected { border-color: ${T.fgAccent}; background: #EEF2FF; }
  .input-field { width: 100%; padding: 12px 16px; border: 1px solid ${T.borderDefault}; border-radius: 6px; font-size: 14px; color: ${T.fgPrimary}; font-family: ${T.fontSans}; outline: none; margin-bottom: 8px; }
  .input-field::placeholder { color: ${T.fgMuted}; }
  .btn { display: block; width: 100%; padding: 12px; font-size: 14px; font-weight: 600; color: ${T.fgOnAction}; background: ${T.bgAction}; border: none; border-radius: 6px; cursor: pointer; text-align: center; letter-spacing: 0.01em; }
</style></head><body>
  <div class="card">
    <div class="step-label">Step ${step} of ${total}</div>
    <div class="progress"><div class="progress-fill"></div></div>
    <div class="step-title">${title}</div>
    <div class="content">${content}</div>
    <button class="btn">${btnLabel}</button>
  </div>
</body></html>`
}

function step1HTML() {
  return onboardingStepHTML(1, 3, 'Select Outcome Type', `
    <div class="option selected">Decline</div>
    <div class="option">Assign Credit Limit</div>
    <div class="option">Require Action</div>
    <div class="option">Award Rewards</div>
  `)
}

function step2HTML() {
  return onboardingStepHTML(2, 3, 'Name the Model', `
    <input class="input-field" type="text" placeholder="Model Name" value="Credit Line Decisioning v2" />
    <input class="input-field" type="text" placeholder="Add Description (optional)" value="" />
  `)
}

function step3HTML() {
  return onboardingStepHTML(3, 3, 'Select Data Elements', `
    <input class="input-field" type="text" placeholder="Search data elements..." value="" />
    <div class="option selected">Credit Score</div>
    <div class="option selected">Annual Income</div>
    <div class="option">Employment Type</div>
    <div class="option">Debt-to-Income Ratio</div>
  `)
}

// ── Full Onboarding (vertical stack) ────────────────────

function onboardingFullHTML() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS_LINK}
<style>
  ${BASE_STYLE}
  body { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 40px; background: ${T.bgDefault}; }
  .step { width: 480px; background: ${T.bgElevated}; border: 1px solid ${T.borderDefault}; border-radius: 10px; padding: 24px 28px; box-shadow: 0 2px 8px rgba(15,26,46,0.07); }
  .step-label { font-size: 11px; font-weight: 600; color: ${T.fgAccent}; letter-spacing: 0.04em; margin-bottom: 6px; }
  .step-title { font-size: 16px; font-weight: 600; color: ${T.fgPrimary}; margin-bottom: 14px; }
  .option { padding: 10px 14px; border: 1px solid ${T.borderDefault}; border-radius: 6px; margin-bottom: 6px; font-size: 13px; color: ${T.fgPrimary}; }
  .option.selected { border-color: ${T.fgAccent}; background: #EEF2FF; }
  .input-field { width: 100%; padding: 10px 14px; border: 1px solid ${T.borderDefault}; border-radius: 6px; font-size: 13px; color: ${T.fgPrimary}; font-family: ${T.fontSans}; margin-bottom: 6px; }
  .connector { width: 2px; height: 24px; background: ${T.borderDefault}; margin: 0 auto; }
</style></head><body>
  <div class="step">
    <div class="step-label">STEP 1</div>
    <div class="step-title">Select Outcome Type</div>
    <div class="option selected">Decline</div>
    <div class="option">Assign Credit Limit</div>
    <div class="option">Require Action</div>
  </div>
  <div class="connector"></div>
  <div class="step">
    <div class="step-label">STEP 2</div>
    <div class="step-title">Name the Model</div>
    <input class="input-field" type="text" value="Credit Line Decisioning v2" />
    <input class="input-field" type="text" placeholder="Add Description" />
  </div>
  <div class="connector"></div>
  <div class="step">
    <div class="step-label">STEP 3</div>
    <div class="step-title">Select Data Elements</div>
    <div class="option selected">Credit Score</div>
    <div class="option selected">Annual Income</div>
    <div class="option">Employment Type</div>
  </div>
</body></html>`
}

// ── Anatomy Diagram ─────────────────────────────────────

function anatomyHTML() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS_LINK}
<style>
  ${BASE_STYLE}
  body { padding: 48px 64px; background: ${T.bgDefault}; }
  h2 { font-size: 20px; font-weight: 600; color: ${T.fgPrimary}; margin-bottom: 32px; }
  .rule-row-container { background: ${T.bgElevated}; border: 1px solid ${T.borderDefault}; border-radius: 10px; padding: 0; overflow: visible; position: relative; margin-bottom: 120px; }
  .rule-row { display: grid; grid-template-columns: 60px 200px 80px 120px 140px; align-items: center; padding: 16px 24px; gap: 16px; }
  .cell { font-size: 14px; }
  .cell-index { font-family: ${T.fontMono}; font-size: 13px; color: ${T.fgMuted}; }
  .cell-attr { display: inline-block; font-size: 13px; font-weight: 500; color: ${T.fgAccent}; background: #EEF2FF; padding: 4px 12px; border-radius: 9999px; }
  .cell-op { font-family: ${T.fontMono}; font-size: 14px; color: ${T.fgMuted}; }
  .cell-val { font-family: ${T.fontMono}; font-size: 14px; color: ${T.fgPrimary}; }
  .cell-outcome { font-size: 14px; font-weight: 600; color: ${T.fgSuccess}; }
  /* Annotations */
  .annotations { display: grid; grid-template-columns: 60px 200px 80px 120px 140px; gap: 16px; padding: 0 24px; margin-top: 16px; }
  .annotation { display: flex; flex-direction: column; align-items: center; }
  .ann-line { width: 2px; height: 32px; background: ${T.fgAccent}; }
  .ann-label { background: ${T.fgPrimary}; color: ${T.fgOnAction}; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; padding: 5px 12px; border-radius: 4px; white-space: nowrap; text-align: center; }
  .ann-desc { font-size: 11px; color: ${T.fgMuted}; text-align: center; margin-top: 6px; line-height: 1.4; max-width: 140px; }
</style></head><body>
  <h2>Rule Row Anatomy</h2>
  <div class="rule-row-container">
    <div class="rule-row">
      <span class="cell cell-index">Rule #1</span>
      <span class="cell"><span class="cell-attr">Credit Score</span></span>
      <span class="cell cell-op">&gt;</span>
      <span class="cell cell-val">700</span>
      <span class="cell cell-outcome">Approve</span>
    </div>
  </div>
  <div class="annotations">
    <div class="annotation">
      <div class="ann-line"></div>
      <div class="ann-label">Row Index</div>
      <div class="ann-desc">Unique identifier for drag-reorder</div>
    </div>
    <div class="annotation">
      <div class="ann-line"></div>
      <div class="ann-label">Data Attribute</div>
      <div class="ann-desc">The data point being evaluated</div>
    </div>
    <div class="annotation">
      <div class="ann-line"></div>
      <div class="ann-label">Operator</div>
      <div class="ann-desc">Comparison logic</div>
    </div>
    <div class="annotation">
      <div class="ann-line"></div>
      <div class="ann-label">Threshold Value</div>
      <div class="ann-desc">The criterion to compare against</div>
    </div>
    <div class="annotation">
      <div class="ann-line"></div>
      <div class="ann-label">Decision Outcome</div>
      <div class="ann-desc">Action when condition is true</div>
    </div>
  </div>
</body></html>`
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  // 1. Start Vite
  process.stdout.write('→ starting vite dev server…\n')
  const server = await createServer({
    configFile: resolve(PROJECT_ROOT, 'vite.config.ts'),
    root: PROJECT_ROOT,
    server: { port: 5179, host: 'localhost' },
    logLevel: 'warn',
  })
  await server.listen()
  const url = server.resolvedUrls?.local?.[0] ?? 'http://localhost:5179/'

  // 2. Launch browser
  process.stdout.write('→ launching headless chrome…\n')
  const browser = await puppeteer.launch({ headless: true, defaultViewport: VIEWPORT })
  const page = await browser.newPage()

  // ── Hero (live prototype) ──────────────────────────────
  process.stdout.write('\n📸 Hero (live prototype)\n')
  const heroRaw = await screenshotPage(page, url)
  const heroFramed = await frameOnDark(heroRaw)
  savePng('01_hero_dark.png', heroFramed)

  // ── Before / After ─────────────────────────────────────
  process.stdout.write('\n📸 Before / After\n')
  const baBuffer = await renderHTML(page, beforeAfterHTML(), { width: 1440, height: 880 })
  savePng('c1-decision-engine-before-after.png', baBuffer)

  // ── Onboarding Steps ───────────────────────────────────
  process.stdout.write('\n📸 Onboarding Steps\n')
  const stepVP = { width: 832, height: 600 }
  savePng('c1-decision-engine-onboarding-step1.png', await renderHTML(page, step1HTML(), stepVP))
  savePng('c1-decision-engine-onboarding-step2.png', await renderHTML(page, step2HTML(), stepVP))
  savePng('c1-decision-engine-onboarding-step3.png', await renderHTML(page, step3HTML(), stepVP))

  // ── Full Onboarding ────────────────────────────────────
  process.stdout.write('\n📸 Onboarding Full\n')
  await page.setViewport({ width: 600, height: 1024, deviceScaleFactor: 2 })
  await page.setContent(onboardingFullHTML(), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts?.ready)
  await new Promise(r => setTimeout(r, 600))
  savePng('c1-decision-engine-onboarding-full.png', await page.screenshot({ type: 'png', fullPage: true }))

  // ── Rule Row Anatomy ───────────────────────────────────
  process.stdout.write('\n📸 Rule Row Anatomy\n')
  savePng('c1-decision-engine-rule-row-anatomy.png', await renderHTML(page, anatomyHTML(), { width: 1440, height: 720 }))

  // ── Data Element Selector (live prototype — same view) ─
  // The data-element-selector image re-uses the hero view
  // since the prototype shows the table with attribute badges.
  // If you add a /selector route later, update this.
  process.stdout.write('\n📸 Data Element Selector (from prototype)\n')
  await page.setViewport({ ...VIEWPORT })
  const selectorRaw = await screenshotPage(page, url)
  savePng('c1-decision-engine-data-element-selector.png', selectorRaw)

  await browser.close()
  await server.close()

  // ── Copy to portfolio if it exists ─────────────────────
  if (existsSync(PORTFOLIO_DIR)) {
    process.stdout.write(`\n→ copying to portfolio (${PORTFOLIO_DIR})…\n`)
    const files = [
      '01_hero_dark.png',
      'c1-decision-engine-before-after.png',
      'c1-decision-engine-onboarding-step1.png',
      'c1-decision-engine-onboarding-step2.png',
      'c1-decision-engine-onboarding-step3.png',
      'c1-decision-engine-onboarding-full.png',
      'c1-decision-engine-rule-row-anatomy.png',
      'c1-decision-engine-data-element-selector.png',
    ]
    for (const f of files) {
      const src = resolve(OUTPUT_DIR, f)
      const dst = resolve(PORTFOLIO_DIR, f)
      if (existsSync(src)) {
        cpSync(src, dst)
        process.stdout.write(`  → ${f}\n`)
      }
    }
  }

  process.stdout.write('\n✅ done. All case-study images regenerated.\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
