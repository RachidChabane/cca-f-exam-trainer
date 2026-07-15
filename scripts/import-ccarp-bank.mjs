#!/usr/bin/env node
/**
 * import-ccarp-bank.mjs — build data/ccarp_bank.json from the parsed CCAR-P
 * practice set, and re-verify every answer key against the source PDF text.
 *
 * The 63 source questions come from Matthew Purcell's free CCAR-P practice set
 * (data/ccar-p-practice-questions.pdf, CC-by-the-author, published on LinkedIn).
 * They are imported VERBATIM as `source: "official"` and must never be edited in
 * place — same convention as the CCA-F bank (see scripts/import-question-bank.mjs).
 *
 * "official" here means "verbatim from the imported set", NOT "from Anthropic".
 * These are one architect's originals written against the public exam guide; they
 * are not live exam items. The label marks provenance, not authority.
 *
 * Re-running preserves any `source: "ai_generated"` questions already in the bank.
 *
 * Usage:
 *   node scripts/import-ccarp-bank.mjs --parsed <parsed63.json> [--pdf-text <ccarp.txt>]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'data')
const BANK = join(DATA, 'ccarp_bank.json')
const PDF = join(DATA, 'ccar-p-practice-questions.pdf')

const argv = process.argv.slice(2)
const arg = (name) => {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : undefined
}

const DOMAINS = {
  solution_design: { name: 'Solution Design & Architecture', weight: 17, items: 11 },
  models_prompting_context: { name: 'Claude Models, Prompting & Context Engineering', weight: 13, items: 8 },
  integration: { name: 'Integration', weight: 19, items: 12 },
  evaluation_testing: { name: 'Evaluation, Testing & Optimization', weight: 16, items: 10 },
  governance_safety: { name: 'Governance, Safety & Risk Management', weight: 14, items: 9 },
  stakeholder_lifecycle: { name: 'Stakeholder Communication & Lifecycle Management', weight: 14, items: 9 },
  developer_productivity: { name: 'Developer Productivity & Operational Enablement', weight: 7, items: 4 },
}

/* ---------------------------- source-of-truth text ---------------------------- */

/** Re-extract the PDF text so the key check runs against the PDF, not a stale dump. */
function pdfText() {
  const override = arg('--pdf-text')
  if (override) return readFileSync(override, 'utf8')
  if (!existsSync(PDF)) {
    console.error(`x ${PDF} not found — cannot verify keys against source.`)
    process.exit(1)
  }
  try {
    return execFileSync('pdftotext', ['-layout', PDF, '-'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  } catch {
    console.error('x `pdftotext` (poppler) is required to verify keys. brew install poppler')
    process.exit(1)
  }
}

/* ------------------------------- verification ------------------------------- */

const strip = (s) => s.replace(/​/g, '').replace(/\r/g, '')
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** Verify every parsed key against the answer-key section. Returns error strings. */
function verifyKeys(questions, txt) {
  const errors = []
  const src = strip(txt)

  // Single/multi-response: "1.1 — Correct: B" / "7.4 — Correct: C, D"
  const keyed = new Map()
  for (const m of src.matchAll(/^\s*(\d+\.\d+)\s*[—-]\s*Correct:\s*([^\n]+)$/gm)) {
    keyed.set(m[1], m[2].trim())
  }

  for (const q of questions) {
    if (q.format === 'matching') {
      // "1.11 — 1 → single augmented LLM call; 2 → fixed workflow; ..."
      const i = src.indexOf(`\n${q.srcId} — `)
      if (i < 0) {
        errors.push(`${q.id}: no answer-key block found in source`)
        continue
      }
      const block = src.slice(i, i + 700).replace(/\n/g, ' ')
      const pairs = new Map(
        [...block.matchAll(/(\d+)\s*→\s*([^;\n]+?)(?=\s*;|\s*\d+\s*→|\s{2,}|$)/g)].map((p) => [
          +p[1],
          norm(p[2]),
        ]),
      )
      q.matching.rows.forEach((r, idx) => {
        const want = pairs.get(idx + 1)
        const got = norm(r.correct)
        if (!want) errors.push(`${q.id} row ${idx + 1}: no key in source`)
        else if (!want.startsWith(got) && !got.startsWith(want))
          errors.push(`${q.id} row ${idx + 1}: parsed "${got}" != source "${want}"`)
        if (!q.matching.option_set.some((o) => norm(o) === got))
          errors.push(`${q.id} row ${idx + 1}: keyed value not present in option_set`)
      })
      continue
    }

    const line = keyed.get(q.srcId)
    if (!line) {
      errors.push(`${q.id}: no "Correct:" line in source answer key`)
      continue
    }
    const want = [...new Set(line.match(/\b[A-E]\b/g) ?? [])].sort().join(',')
    const got = [...q.correct].sort().join(',')
    if (want !== got) errors.push(`${q.id}: parsed [${got}] != source [${want}] ("${line}")`)
    if (q.correct.length !== q.select_count)
      errors.push(`${q.id}: correct has ${q.correct.length} but select_count is ${q.select_count}`)
  }
  return errors
}

/* --------------------------------- build ---------------------------------- */

const parsedPath = arg('--parsed')
if (!parsedPath || !existsSync(parsedPath)) {
  console.error('usage: node scripts/import-ccarp-bank.mjs --parsed <parsed63.json>')
  process.exit(1)
}

const parsed = JSON.parse(readFileSync(parsedPath, 'utf8'))

const official = parsed.map((q) => ({
  id: `off-${q.id}`,
  srcId: q.id,
  source: 'official',
  domain: q.domain,
  format: q.format,
  select_count: q.format === 'matching' ? q.matching.rows.length : q.select_count,
  text: strip(q.text).trim(),
  options: (q.options ?? []).map((o) => ({ label: o.label, text: strip(o.text).trim() })),
  correct: q.correct,
  ...(q.matching ? { matching: q.matching } : {}),
  explanation: strip(q.explanation).trim(),
}))

const keyErrors = verifyKeys(official, pdfText())
if (keyErrors.length) {
  console.error(`x ${keyErrors.length} key verification error(s) — refusing to write the bank:`)
  for (const e of keyErrors) console.error(`   ${e}`)
  process.exit(1)
}

// Structural checks the parse must satisfy before it becomes the seed bank.
const structural = []
for (const q of official) {
  if (q.format === 'matching') {
    if (!q.matching?.rows?.length) structural.push(`${q.id}: matching with no rows`)
  } else {
    if (q.options.length < 4) structural.push(`${q.id}: only ${q.options.length} options`)
    if (new Set(q.options.map((o) => norm(o.text))).size !== q.options.length)
      structural.push(`${q.id}: duplicate option text`)
    if (q.format === 'mr' && q.correct.length < 2)
      structural.push(`${q.id}: multiple-response with ${q.correct.length} correct`)
    if (q.format === 'mc' && q.correct.length !== 1)
      structural.push(`${q.id}: multiple-choice with ${q.correct.length} correct`)
  }
  if (!DOMAINS[q.domain]) structural.push(`${q.id}: unknown domain "${q.domain}"`)
  if (!q.explanation) structural.push(`${q.id}: empty explanation`)
}
if (structural.length) {
  console.error(`x ${structural.length} structural error(s):`)
  for (const e of structural) console.error(`   ${e}`)
  process.exit(1)
}

// Preserve generated questions across re-runs — the verbatim import is the only
// thing this script owns.
let generated = []
if (existsSync(BANK)) {
  const prev = JSON.parse(readFileSync(BANK, 'utf8'))
  generated = (prev.questions ?? []).filter((q) => q.source === 'ai_generated')
}

const byDomain = (src) =>
  Object.fromEntries(
    Object.keys(DOMAINS).map((d) => [d, [...official, ...generated].filter((q) => q.source === src && q.domain === d).length]),
  )
const byFormat = (src) =>
  ['mc', 'mr', 'matching'].reduce((acc, f) => {
    acc[f] = [...official, ...generated].filter((q) => q.source === src && q.format === f).length
    return acc
  }, {})

const bank = {
  meta: {
    exam: 'CCAR-P',
    exam_name: 'Claude Certified Architect – Professional',
    description:
      'CCAR-P question bank. `official` = the 63 questions of Matthew Purcell\'s free practice set, imported verbatim (originals written against the public exam guide — NOT live exam items). `ai_generated` = original questions written to the same blueprint and trap taxonomy.',
    source_document: 'data/ccar-p-practice-questions.pdf',
    source_credit: 'Matthew Purcell — linkedin.com/in/purcellmatthew',
    exam_guide: 'data/CCA-P-exam-guide.pdf (v1.0, July 2026)',
    mechanics: { question_count: 63, time_limit_minutes: 120, scaled: { min: 100, max: 1000, pass: 720 } },
    counts: { official: official.length, ai_generated: generated.length },
    by_domain: { official: byDomain('official'), ai_generated: byDomain('ai_generated') },
    by_format: { official: byFormat('official'), ai_generated: byFormat('ai_generated') },
  },
  domains: Object.entries(DOMAINS).map(([key, d]) => ({ key, ...d })),
  questions: [...official, ...generated],
}

writeFileSync(BANK, JSON.stringify(bank, null, 2) + '\n')

console.log(`ccarp_bank.json written`)
console.log(`  official:     ${official.length} (all keys verified against the PDF)`)
console.log(`  ai_generated: ${generated.length} (preserved)`)
console.log(`  by format:    ${JSON.stringify(byFormat('official'))}`)
console.log(`  by domain:    ${JSON.stringify(byDomain('official'))}`)
