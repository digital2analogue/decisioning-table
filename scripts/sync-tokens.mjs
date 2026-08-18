/**
 * scripts/sync-tokens.mjs
 *
 * Compares the published decision-engine brand CSS (imported at runtime by
 * src/index.css) against the src/tokens/variables.css overlay.
 *
 * Since #61, variables.css is an override layer rather than a hand-copy of the
 * brand, so this reports three things:
 *
 *   1. drift        — a token declared in both, with different resolved values.
 *                     Always a bug: the local copy silently wins at runtime.
 *   2. shadowed     — a token declared in both at the same value. Dead weight;
 *                     delete it and let the imported brand build supply it.
 *   3. local-only   — a token the brand does not name. Layout, stacking and
 *                     app-specific shadows live here by design; the parallel
 *                     vocabularies are migration debt tracked in #61.
 *
 * Pass --verbose to also list brand semantic tokens this app does not shadow.
 *
 * Usage:
 *   npm run sync-tokens
 *
 * This script does NOT auto-overwrite. Exits 1 if drift is found, 0 otherwise.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname   = path.dirname(fileURLToPath(import.meta.url))
const PKG         = '@digital2analogue2/parsimony'
const PKG_DIR     = path.join(__dirname, '..', 'node_modules', PKG)
const BRAND_CSS   = path.join(PKG_DIR, 'css', 'decision-engine.css')
const LOCAL_CSS   = path.join(__dirname, '../src/tokens/variables.css')

// ─── Locate the installed package ────────────────────────────────────────────────

if (!fs.existsSync(BRAND_CSS)) {
  console.error(`\n  ❌ ${PKG} is not installed (no decision-engine.css found).`)
  console.error(`     Run: npm install\n`)
  process.exit(1)
}

let installedVersion = 'unknown'
try {
  installedVersion = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8')).version
} catch { /* version is informational only */ }

console.log(`\n  Comparing variables.css against ${PKG}@${installedVersion} (decision-engine.css)`)

// ─── Parse + resolve ───────────────────────────────────────────────────────────

function parseTokens(css) {
  const tokens = {}
  // Strip comment blocks to avoid false matches inside comments
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(stripped)) !== null) {
    tokens[`--${m[1]}`] = m[2].trim()
  }
  return tokens
}

function resolveVar(value, tokens, depth = 0) {
  if (depth > 20) return value
  return value.replace(/var\(--([a-zA-Z0-9-]+)(?:[^)]*)\)/g, (_, name) => {
    const ref = `--${name}`
    return tokens[ref] ? resolveVar(tokens[ref], tokens, depth + 1) : value
  })
}

function resolveColorMix(value) {
  const re = /color-mix\(\s*in\s+srgb\s*,\s*(#[0-9a-fA-F]{6})\s+([\d.]+)%\s*,\s*(#[0-9a-fA-F]{6})\s*\)/
  const m  = value.match(re)
  if (!m) return value
  const p  = parseFloat(m[2]) / 100
  const c1 = [parseInt(m[1].slice(1,3),16), parseInt(m[1].slice(3,5),16), parseInt(m[1].slice(5,7),16)]
  const c2 = [parseInt(m[3].slice(1,3),16), parseInt(m[3].slice(3,5),16), parseInt(m[3].slice(5,7),16)]
  return '#' + c1.map((v, i) => Math.round(v*p + c2[i]*(1-p)).toString(16).padStart(2,'0')).join('')
}

function fullyResolve(tokens) {
  const out = {}
  for (const [k, raw] of Object.entries(tokens)) {
    let v = resolveVar(raw, tokens)
    if (v.includes('color-mix')) v = resolveColorMix(v)
    out[k] = v.toLowerCase()
  }
  return out
}

const brandCssRaw = fs.readFileSync(BRAND_CSS, 'utf8')
// Drop the trailing @media (prefers-reduced-motion) override — it deliberately
// re-declares --motion-duration-* as 0ms and would shadow the base values.
const rmIdx     = brandCssRaw.indexOf('@media (prefers-reduced-motion')
const brandRaw  = parseTokens(rmIdx === -1 ? brandCssRaw : brandCssRaw.slice(0, rmIdx))
const localRaw  = parseTokens(fs.readFileSync(LOCAL_CSS, 'utf8'))

// variables.css is an overlay on top of the imported brand build (see
// src/index.css), so resolve local var() chains against the merged cascade.
const brandFull = fullyResolve({ ...brandRaw })
const localFull = fullyResolve({ ...brandRaw, ...localRaw })

// Compare every token variables.css still declares, not just --color-*. Since
// #61 the local file is an override layer: anything it re-declares that the
// brand also names is a shadow, and a shadow with a different value is drift.
const shared    = Object.keys(localRaw).filter(k => k in brandRaw).sort()
const localOnly = Object.keys(localRaw).filter(k => !(k in brandRaw)).sort()

// Informational: brand tokens this app does not (yet) shadow. Now that colour
// comes from the package this is most of the brand, so only report the
// non-primitive semantic layer, and only when asked.
const VERBOSE = process.argv.includes('--verbose')
const missingLocal = VERBOSE
  ? Object.keys(brandRaw)
      .filter(k => !k.startsWith('--primitive-') && !(k in localRaw))
      .sort()
      .map(key => ({ key, value: brandFull[key] }))
  : []

const drifted = []
const shadowedInSync = []

for (const key of shared) {
  if (brandFull[key] !== localFull[key]) {
    drifted.push({ key, brand: brandFull[key], local: localFull[key] })
  } else {
    shadowedInSync.push({ key, value: brandFull[key] })
  }
}

// ─── Report ────────────────────────────────────────────────────────────────────

console.log('\n  Token sync report\n')

if (drifted.length === 0 && shadowedInSync.length === 0 && localOnly.length === 0) {
  console.log('  ✅ variables.css is empty of brand material — everything comes from the package.\n')
  process.exit(0)
}

if (drifted.length) {
  console.log(`  ⚠️  ${drifted.length} token(s) have drifted between ${PKG} and variables.css:\n`)
  for (const { key, brand, local } of drifted) {
    console.log(`    ${key}`)
    console.log(`      ${PKG} → ${brand}`)
    console.log(`      variables.css → ${local}`)
    console.log()
  }
  console.log('  Action: update the brand tokens upstream and publish a new parsimony version\n  (if variables.css is correct), or vice versa.\n')
}

if (shadowedInSync.length) {
  console.log(`  ℹ️  ${shadowedInSync.length} token(s) re-declared locally at the brand's own value:\n`)
  for (const { key, value } of shadowedInSync) {
    console.log(`    ${key}: ${value}`)
  }
  console.log('  Action: delete these from variables.css — the imported brand build already\n  supplies them, and a copy here can silently go stale.\n')
}

if (localOnly.length) {
  console.log(`  ℹ️  ${localOnly.length} local-only token(s) in variables.css, not named by the brand:\n`)
  for (const key of localOnly) {
    console.log(`    ${key}: ${localFull[key]}`)
  }
  console.log('  Layout, stacking and app-specific shadows stay here by design. Parallel\n  vocabularies (--space-*, --duration-*, --easing-*, --font-*, --shadow-sm/md/xl,\n  --radius-pill) are migration debt — see issue #61.\n')
}

if (missingLocal.length) {
  console.log(`  ℹ️  ${missingLocal.length} brand semantic token(s) not shadowed locally (informational):\n`)
  for (const { key, value } of missingLocal) {
    console.log(`    ${key}: ${value}`)
  }
  console.log()
}

if (drifted.length > 0) {
  process.exit(1)
}
