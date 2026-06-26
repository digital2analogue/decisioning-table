/**
 * scripts/sync-tokens.mjs
 *
 * Compares the published decision-engine brand CSS against src/tokens/variables.css
 * and reports any drift in the --color-* namespace.
 *
 * The brand CSS now comes from the installed npm package
 * (@digital2analogue2/parsimony → decision-engine.css) instead of a sibling
 * ../brand-tokens checkout, so this runs without the design-system repo on disk.
 *
 * Usage:
 *   npm run sync-tokens
 *
 * This script does NOT auto-overwrite. It shows you what's drifted so you can
 * decide whether to update the brand tokens upstream (publish a new parsimony
 * version) or variables.css. The only expected drift is the documented
 * light-mode override set — see CLAUDE.md "Known intentional drifts".
 *
 * Exits 1 if drift is found, 0 if everything matches.
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

const brandRaw  = parseTokens(fs.readFileSync(BRAND_CSS, 'utf8'))
const localRaw  = parseTokens(fs.readFileSync(LOCAL_CSS, 'utf8'))

// Merge brand primitives + semantics so var() chains can fully resolve
const brandFull = fullyResolve({ ...brandRaw })
const localFull = fullyResolve({ ...localRaw })

// Only compare --color-* tokens (ignore primitives, spacing, typography, etc.)
const brandColors = Object.fromEntries(Object.entries(brandFull).filter(([k]) => k.match(/^--color-/)))
const localColors = Object.fromEntries(Object.entries(localFull).filter(([k]) => k.match(/^--color-/)))

const allKeys = new Set([...Object.keys(brandColors), ...Object.keys(localColors)])

const drifted    = []
const missingLocal = []
const localOnly  = []

for (const key of [...allKeys].sort()) {
  const inBrand = key in brandColors
  const inLocal = key in localColors

  if (inBrand && inLocal) {
    if (brandColors[key] !== localColors[key]) {
      drifted.push({ key, brand: brandColors[key], local: localColors[key] })
    }
  } else if (inBrand) {
    missingLocal.push({ key, value: brandColors[key] })
  } else {
    localOnly.push({ key, value: localColors[key] })
  }
}

// ─── Report ────────────────────────────────────────────────────────────────────

console.log('\n  Token sync report\n')

if (drifted.length === 0 && missingLocal.length === 0 && localOnly.length === 0) {
  console.log('  ✅ Perfect sync — variables.css matches the published brand exactly.\n')
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

if (missingLocal.length) {
  console.log(`  ℹ️  ${missingLocal.length} token(s) exist in the brand package but not in variables.css:\n`)
  for (const { key, value } of missingLocal) {
    console.log(`    ${key}: ${value}`)
  }
  console.log()
}

if (localOnly.length) {
  console.log(`  ℹ️  ${localOnly.length} local-only token(s) in variables.css not yet in the brand package:\n`)
  for (const { key, value } of localOnly) {
    console.log(`    ${key}: ${value}`)
  }
  console.log('  Action: move these into the brand tokens upstream (decision-engine.tokens.json).\n')
}

if (drifted.length > 0) {
  process.exit(1)
}
