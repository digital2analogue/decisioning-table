/**
 * scripts/check-contrast.mjs
 *
 * Validates every text/background color pairing in the UI against WCAG AA (4.5:1).
 * Wired into `npm run build` — the build fails if any pair fails.
 *
 * To add a new check: add an entry to PAIRINGS at the bottom of this file.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSS_FILE = path.join(__dirname, '../src/tokens/variables.css')

// ─── Token resolution ──────────────────────────────────────────────────────────

function parseTokens(css) {
  const tokens = {}
  const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(css)) !== null) {
    tokens[`--${m[1]}`] = m[2].trim()
  }
  return tokens
}

function resolveVar(value, tokens, depth = 0) {
  if (depth > 20) return value
  return value.replace(/var\(--([a-zA-Z0-9-]+)\)/g, (_, name) => {
    const ref = `--${name}`
    return tokens[ref] ? resolveVar(tokens[ref], tokens, depth + 1) : value
  })
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
}

/**
 * Resolves a single color-mix(in srgb, hexA pct%, hexB) expression.
 * Returns a hex string, or null if the pattern doesn't match.
 */
function resolveColorMix(value) {
  const re = /color-mix\(\s*in\s+srgb\s*,\s*(#[0-9a-fA-F]{6})\s+([\d.]+)%\s*,\s*(#[0-9a-fA-F]{6})\s*\)/
  const m = value.match(re)
  if (!m) return null
  const p = parseFloat(m[2]) / 100
  const [r1, g1, b1] = hexToRgb(m[1])
  const [r2, g2, b2] = hexToRgb(m[3])
  return rgbToHex([r1 * p + r2 * (1 - p), g1 * p + g2 * (1 - p), b1 * p + b2 * (1 - p)])
}

/**
 * Fully resolves a token name to a hex color string, or null if unresolvable.
 */
function resolve(name, tokens) {
  if (name.startsWith('#')) return name
  let v = tokens[name]
  if (!v) return null
  v = resolveVar(v, tokens)
  if (v.includes('color-mix')) {
    v = resolveColorMix(v) ?? v
  }
  return /^#[0-9a-fA-F]{6}$/i.test(v) ? v : null
}

// ─── WCAG contrast ─────────────────────────────────────────────────────────────

function linearize(c) {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

function contrastRatio(a, b) {
  const la = luminance(a), lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

// ─── Load tokens ───────────────────────────────────────────────────────────────

const css = fs.readFileSync(CSS_FILE, 'utf8')
const tokens = parseTokens(css)
const tok = name => resolve(name, tokens)

// Frequently used resolved values
const WHITE      = tok('--color-background-elevated')
const BG_ALT     = tok('--color-background-alt')
const BG_ACTION  = tok('--color-background-action')
const SUCCESS    = tok('--color-feedback-success')
const ERROR      = tok('--color-foreground-danger')

// Computed backgrounds: derived from CSS color-mix() expressions in index.css
const ROW_HOVER    = resolveColorMix(`color-mix(in srgb, ${WHITE} 94%, ${BG_ACTION})`)
const ROW_SELECTED = resolveColorMix(`color-mix(in srgb, ${WHITE} 82%, ${BG_ACTION})`)
const APPROVE_BG   = resolveColorMix(`color-mix(in srgb, ${WHITE} 88%, ${SUCCESS})`)
const DENY_BG      = resolveColorMix(`color-mix(in srgb, ${WHITE} 92%, ${ERROR})`)

// Approve text is color-mix(in srgb, success 75%, black 25%)
const APPROVE_TEXT = resolveColorMix(`color-mix(in srgb, ${SUCCESS} 75%, #000000)`)

// AND/OR logic chip bg matches the tree connector: foreground-action 40% + border-elevated 60%
const LOGIC_CHIP_BG = resolveColorMix(`color-mix(in srgb, ${tok('--color-foreground-action')} 30%, ${tok('--color-border-elevated')})`)

// ─── Pairings manifest ─────────────────────────────────────────────────────────
//
// Add a new entry here whenever you introduce a new text/background combination
// to the UI. Format: { text, bg, label }
// Use token names (--color-*) or resolved hex strings directly.

const PAIRINGS = [
  // Page header
  { text: '--color-foreground-default',   bg: WHITE,        label: 'Page title' },
  { text: '--color-foreground-secondary', bg: WHITE,        label: 'Buttons / menu items / empty state title' },
  { text: '--color-foreground-muted',     bg: WHITE,        label: 'Page subtitle / amount prefix / empty state subtitle' },
  { text: '--color-foreground-muted',     bg: BG_ALT,       label: 'Table col headers / tab inactive / rule count badge' },
  // Row states
  { text: '--color-foreground-alt',       bg: WHITE,        label: 'Row numbers (default)' },
  { text: '--color-foreground-alt',       bg: ROW_HOVER,    label: 'Row numbers (hover row)' },
  { text: '--color-foreground-alt',       bg: ROW_SELECTED, label: 'Row numbers (selected row)' },
  // Interactive / action
  { text: '--color-foreground-action',    bg: WHITE,        label: 'Action links / tab active / unselect-all' },
  { text: '--color-foreground-on-action', bg: BG_ACTION,    label: 'Primary button text (white on blue)' },
  // Danger
  { text: '--color-foreground-danger',    bg: WHITE,        label: 'Delete selected / danger menu items' },
  // Attribute chips (monochrome Pebble — fg-default on white)
  { text: '--color-foreground-default',   bg: WHITE,        label: 'Attribute chip (monochrome Pebble)' },
  // Outcome segments (Claude-desktop style — active segment lifts on bg-elevated; semantic color on label/icon)
  { text: '--color-foreground-success',   bg: WHITE,        label: 'Outcome: Approve segment label (active)' },
  { text: '--color-foreground-danger',    bg: WHITE,        label: 'Outcome: Deny segment label (active)' },
  // Outcome cell pending hint (italic muted text on default row backgrounds)
  { text: '--color-foreground-muted',     bg: WHITE,        label: 'Outcome: pending hint (parent row)' },
  { text: '--color-foreground-muted',     bg: '--color-background-alt', label: 'Outcome: pending hint (child row)' },
  // Toast (dark notification with inverse text + Undo action)
  { text: '--color-foreground-inverse',   bg: '--color-foreground-default', label: 'Toast: message + Undo action' },
  // Dropdown items — active (currently selected) state
  { text: '--color-foreground-action',    bg: '--color-background-accent-blue', label: 'Dropdown: active item' },
  // Onboarding flow
  { text: '--color-foreground-action',    bg: WHITE,        label: 'Onboarding: nav + CTA links' },
  { text: '--color-foreground-default',   bg: WHITE,        label: 'Onboarding: element labels' },
  { text: '--color-foreground-secondary', bg: '--color-background-alt', label: 'Onboarding: category headers' },
  // Nested rules — parent affordances (both now use fg-muted, no chrome)
  { text: '--color-foreground-muted',     bg: WHITE,                    label: 'Nested: IF prefix + sub-count' },
  // Nested rules — child rows (bg-alt is the child row background)
  { text: '--color-foreground-default',   bg: '--color-background-alt', label: 'Nested: child rule name input' },
  { text: '--color-foreground-muted',     bg: '--color-background-alt', label: 'Nested: child amount prefix / connector' },
  // Chromeless add-rule row affordance (default + hover)
  { text: '--color-foreground-muted',         bg: '--color-background-elevated',       label: 'Add-rule row btn (default)' },
  { text: '--color-foreground-default',        bg: '--color-background-hover',          label: 'Add-rule row btn (hover)' },
  // Row-level warning indicator — icon + number sit on normal row background (no tint)
  { text: '--color-foreground-warning-icon',  bg: WHITE,                               label: 'Invalid-row warning icon (amber-700)' },
  { text: '--color-foreground-warning',       bg: WHITE,                               label: 'Invalid-row warning number' },
  // Validation banner — vivid amber strip (#1A1A2E on #FCD34D ≈ 9.5:1)
  { text: '--color-foreground-default',       bg: '--color-background-warning-vivid',  label: 'Validation banner text + CTA on amber-300' },
  // AND/OR logic chip — dark navy text on light slate (--color-background-inverted)
  { text: '--color-foreground-on-inverted', bg: '--color-background-inverted',          label: 'AND/OR logic chip text' },
  // Conditional operator chip — dark navy text on very light gray bg
  { text: '--color-foreground-on-inverted', bg: '--color-background-hover',             label: 'Conditional operator chip text' },
  // Avatar stack — white initials on each accent-bold background (from brand-tokens)
  { text: '--color-foreground-accent-on-indigo', bg: '--color-background-accent-indigo-bold', label: 'Avatar: indigo (JT)' },
  { text: '--color-foreground-accent-on-sky',    bg: '--color-background-accent-sky-bold',    label: 'Avatar: sky (MR)' },
  { text: '--color-foreground-accent-on-green',  bg: '--color-background-accent-green-bold',  label: 'Avatar: emerald (AS)' },
  { text: '#ffffff',                             bg: '--color-background-accent-amber-bold',  label: 'Avatar: amber (DK)' }, /* DS-debt: accent-on-amber is dark for tints; hardcode white for bold fill */
]

// ─── Run ───────────────────────────────────────────────────────────────────────

const MIN_RATIO = 4.5
let failed = 0
let unresolved = 0

console.log('\n  Contrast check — WCAG AA (4.5:1 minimum)\n')
console.log(`  ${'Pair'.padEnd(52)} ${'Ratio'.padStart(7)}  Status`)
console.log(`  ${'─'.repeat(72)}`)

for (const { text, bg, label } of PAIRINGS) {
  const textHex = typeof text === 'string' && text.startsWith('--') ? tok(text) : text
  const bgHex   = typeof bg   === 'string' && bg.startsWith('--')   ? tok(bg)   : bg

  if (!textHex || !bgHex) {
    const missing = []
    if (!textHex) missing.push(`text=${text}`)
    if (!bgHex)   missing.push(`bg=${bg}`)
    unresolved++
    console.log(`  ${label.padEnd(52)} ${'—'.padStart(7)}    ❌ UNRESOLVED (${missing.join(', ')})`)
    continue
  }

  const ratio = contrastRatio(textHex, bgHex)
  const pass  = ratio >= MIN_RATIO
  if (!pass) failed++
  console.log(`  ${label.padEnd(52)} ${ratio.toFixed(2).padStart(7)}:1  ${pass ? '✅' : '❌ FAIL'}`)
}

console.log()

const totalProblems = failed + unresolved

if (totalProblems > 0) {
  const parts = []
  if (failed > 0)     parts.push(`${failed} contrast failure(s)`)
  if (unresolved > 0) parts.push(`${unresolved} unresolved pairing(s)`)
  console.error(`  ❌ ${parts.join(' + ')}. Fix token values, pairing CSS, or manifest references before shipping.\n`)
  process.exit(1)
} else {
  console.log(`  ✅ All ${PAIRINGS.length} pairs pass WCAG AA\n`)
}
