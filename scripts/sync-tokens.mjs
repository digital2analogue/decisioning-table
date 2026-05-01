/**
 * scripts/sync-tokens.mjs
 *
 * Compares the brand-tokens build output against src/tokens/variables.css
 * and reports any drift in the --color-* namespace.
 *
 * Usage:
 *   npm run sync-tokens
 *
 * This script does NOT auto-overwrite. It shows you what's drifted so you
 * can decide whether to update brand-tokens or variables.css (or both).
 *
 * Exits 1 if drift is found, 0 if everything matches.
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname   = path.dirname(fileURLToPath(import.meta.url))
const BRAND_DIR   = path.join(__dirname, '../../brand-tokens')
const BRAND_CSS   = path.join(BRAND_DIR, 'build/css/decision-engine.css')
const LOCAL_CSS   = path.join(__dirname, '../src/tokens/variables.css')

// ─── Build brand-tokens ────────────────────────────────────────────────────────

console.log('\n  Building brand-tokens...\n')
try {
  execSync('node scripts/build-brands.mjs', { cwd: BRAND_DIR, stdio: 'inherit' })
} catch {
  console.error('\n  ❌ brand-tokens build failed — fix errors above first.\n')
  process.exit(1)
}

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
  console.log('  ✅ Perfect sync — variables.css matches brand-tokens exactly.\n')
  process.exit(0)
}

if (drifted.length) {
  console.log(`  ⚠️  ${drifted.length} token(s) have drifted between brand-tokens and variables.css:\n`)
  for (const { key, brand, local } of drifted) {
    console.log(`    ${key}`)
    console.log(`      brand-tokens  → ${brand}`)
    console.log(`      variables.css → ${local}`)
    console.log()
  }
  console.log('  Action: update brand-tokens (if variables.css is correct) or vice versa.\n')
}

if (missingLocal.length) {
  console.log(`  ℹ️  ${missingLocal.length} token(s) exist in brand-tokens but not in variables.css:\n`)
  for (const { key, value } of missingLocal) {
    console.log(`    ${key}: ${value}`)
  }
  console.log()
}

if (localOnly.length) {
  console.log(`  ℹ️  ${localOnly.length} local-only token(s) in variables.css not yet in brand-tokens:\n`)
  for (const { key, value } of localOnly) {
    console.log(`    ${key}: ${value}`)
  }
  console.log('  Action: move these into brand-tokens semantic or component tokens.\n')
}

if (drifted.length > 0) {
  process.exit(1)
}
