#!/usr/bin/env node
/**
 * merge-deecho-ccarp.mjs — apply the stem-echo fix to the generated CCA-P bank.
 *
 * The generated bank killed the length tell by construction (key-is-longest 24.5%
 * vs 28.4% chance) but grew a different one: the keyed option was the one echoing
 * the stem's own vocabulary — `stem_overlap` 49.0% vs 28.4%, z=3.2. That lets a
 * candidate with zero domain knowledge string-match their way to the answer.
 *
 * This merge is deliberately picky, because the fix has a specific way of going
 * wrong: lending a distractor the stem's vocabulary can accidentally lend it the
 * stem's *solution*, turning it into a second right answer. So an item is dropped
 * unless the auditor confirms the key is still uniquely best AND meaning survived.
 *
 * It also verifies, deterministically, that the echo actually broke — the auditor's
 * `echo_broken` is an opinion; the overlap score is a measurement.
 *
 * Usage: node scripts/merge-deecho-ccarp.mjs --result <workflow-result.json> [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BANK = join(ROOT, 'data', 'ccarp_bank.json')

const argv = process.argv.slice(2)
const arg = (n) => {
  const i = argv.indexOf(n)
  return i >= 0 ? argv[i + 1] : undefined
}
const DRY = argv.includes('--dry-run')

const resultPath = arg('--result')
if (!resultPath || !existsSync(resultPath)) {
  console.error('usage: node scripts/merge-deecho-ccarp.mjs --result <workflow-result.json>')
  process.exit(1)
}

const items = ((JSON.parse(readFileSync(resultPath, 'utf8')).result ?? {}).items) ?? []
if (!items.length) {
  console.error('x no items in the result payload')
  process.exit(1)
}

const bank = JSON.parse(readFileSync(BANK, 'utf8'))
const byId = new Map(bank.questions.map((q) => [q.id, q]))

/* ---- the same overlap metric check-tells.mjs gates on, so we can verify ---- */
const STOP = new Set(
  'the a an and or of to in for on with is are be by as at from that this it its which what when how why not no if then than each per use used using into over under more most best first second new every all any'.split(
    ' ',
  ),
)
const words = (s) =>
  (String(s).toLowerCase().match(/[a-z][a-z0-9_-]{2,}/g) ?? []).filter((w) => !STOP.has(w))
const overlap = (stem, opt) => {
  const set = new Set(words(stem))
  const w = words(opt)
  return w.length ? w.filter((t) => set.has(t)).length / Math.sqrt(w.length) : 0
}
/** Is a keyed option the top lexical match to the stem? */
const keyEchoes = (stem, options, correct) => {
  const scores = options.map((o) => overlap(stem, o.text))
  const max = Math.max(...scores)
  return options.some((o, i) => scores[i] === max && correct.includes(o.label))
}

const merged = []
const skipped = []

for (const it of items) {
  const q = byId.get(it.id)
  if (!q) {
    skipped.push({ id: it.id, why: 'not in bank' })
    continue
  }
  if (!it.options?.length || String(it.notes ?? '').includes('FILE_MISSING')) {
    skipped.push({ id: it.id, why: 'no options returned' })
    continue
  }
  const labels = it.options.map((o) => o.label).sort().join(',')
  const before = q.options.map((o) => o.label).sort().join(',')
  if (labels !== before) {
    skipped.push({ id: it.id, why: `labels changed (${before} -> ${labels})` })
    continue
  }
  if (it.options.some((o) => !o.text?.trim() || !o.explanation?.trim())) {
    skipped.push({ id: it.id, why: 'an option came back empty' })
    continue
  }
  // The risk this edit carries: a distractor that gained the stem's vocabulary may
  // have gained its merit too. Trust the auditor to refuse those.
  if (it.key_still_unique === false) {
    skipped.push({ id: it.id, why: `key no longer unique: ${(it.issues ?? [])[0] ?? 'auditor flagged it'}` })
    continue
  }
  if (it.meaning_preserved === false) {
    skipped.push({ id: it.id, why: `meaning changed: ${(it.issues ?? [])[0] ?? 'auditor flagged it'}` })
    continue
  }

  const stem = (it.text ?? q.text).trim()
  // Measure, don't ask: did the echo actually break?
  if (keyEchoes(stem, it.options, q.correct)) {
    skipped.push({ id: it.id, why: 'echo NOT broken — a keyed option is still the top lexical match' })
    continue
  }

  q.text = stem
  q.options = it.options.map((o) => ({
    label: o.label,
    text: o.text.trim(),
    explanation: o.explanation.trim(),
  }))
  q.de_echoed = true
  merged.push(it.id)
}

if (!DRY) writeFileSync(BANK, JSON.stringify(bank, null, 2) + '\n')

/* --------------------------- report the aggregate --------------------------- */
const gen = bank.questions.filter((q) => q.source === 'ai_generated' && q.format !== 'matching')
const stillEchoing = gen.filter((q) => keyEchoes(q.text, q.options, q.correct))

console.log(`${DRY ? '[dry-run] ' : ''}applied de-echo to ${merged.length}/${items.length} questions`)
if (skipped.length) {
  console.log(`\n${skipped.length} SKIPPED (kept previous wording):`)
  for (const s of skipped) console.log(`  ~ ${s.id}: ${s.why}`)
}
console.log(
  `\ngenerated bank: a keyed option is the top stem-echoer in ${stillEchoing.length}/${gen.length} (${((100 * stillEchoing.length) / gen.length).toFixed(1)}%) — was 31/58 (53.4%)`,
)
console.log('\nNow run: npm run check:tells')
