#!/usr/bin/env node
/**
 * merge-hardened-ccarp.mjs — apply length-rebalanced option text to the CCA-P
 * bank's `official` questions.
 *
 * Context: the imported practice set keys the LONGEST option 90.9% of the time
 * (+57 chars avg), so a candidate who knows nothing scores ~90% by picking the
 * longest. Drilling it trains a reflex that scores ~35% on the real exam. The
 * hardening workflow rewrites option TEXT only — never the stem, never the key.
 *
 * This script is the gate between that workflow and the bank. It refuses to merge
 * anything that looks damaged:
 *
 *  - **regression** — the item was cold-solved correctly BEFORE hardening and not
 *    after. That before/after pairing is the whole point: a solver disagreeing with
 *    the key proves nothing on its own (the question may just be hard), but an item
 *    that was solvable and now isn't indicts OUR edit. Cf. the control-baseline
 *    lesson: never read an absolute pass rate without a control.
 *  - **meaning/key flags** — the independent auditor said a rewrite shifted a claim
 *    or made a distractor defensible.
 *  - **structural drift** — labels changed, options dropped, text emptied.
 *
 * Flagged items are SKIPPED (keeping their original text), never merged silently.
 * Re-run `npm run check:tells` afterwards: that is what decides whether the tell
 * actually died.
 *
 * Usage:
 *   node scripts/merge-hardened-ccarp.mjs --result <workflow-result.json> [--force-flagged]
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
const FORCE = argv.includes('--force-flagged')

const resultPath = arg('--result')
if (!resultPath || !existsSync(resultPath)) {
  console.error('usage: node scripts/merge-hardened-ccarp.mjs --result <workflow-result.json>')
  process.exit(1)
}

const raw = JSON.parse(readFileSync(resultPath, 'utf8'))
// The workflow's payload may be the bare return value or wrapped by the task file.
const result = raw.result ?? raw
const items = result.items ?? []
if (!items.length) {
  console.error('x no items in the result payload — nothing to merge')
  process.exit(1)
}

const bank = JSON.parse(readFileSync(BANK, 'utf8'))
const byId = new Map(bank.questions.map((q) => [q.id, q]))

const setEq = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && [...a].sort().join(',') === [...b].sort().join(',')

const merged = []
const skipped = []

for (const it of items) {
  const q = byId.get(it.id)
  if (!q) {
    skipped.push({ id: it.id, why: 'not in bank' })
    continue
  }

  // The agents were told to fail loudly rather than hunt for another source; treat
  // the sentinel (and any missing payload) as a hard skip.
  if (!it.options || !Array.isArray(it.options) || it.options.length === 0) {
    skipped.push({ id: it.id, why: 'no options returned' })
    continue
  }
  if (JSON.stringify(it).includes('FILE_MISSING')) {
    skipped.push({ id: it.id, why: 'agent reported FILE_MISSING — input never reached it' })
    continue
  }

  // Structural: same labels, same count, nothing emptied.
  const before = [...q.options].map((o) => o.label).sort().join(',')
  const after = [...it.options].map((o) => o.label).sort().join(',')
  if (before !== after) {
    skipped.push({ id: it.id, why: `labels changed (${before} -> ${after})` })
    continue
  }
  if (it.options.some((o) => !o.text || !o.text.trim())) {
    skipped.push({ id: it.id, why: 'an option came back empty' })
    continue
  }

  // Round-2 items carry `key_untouched`: that pass edits ONLY distractors, so the
  // keyed option must come back byte-identical. Verify it rather than trusting the
  // agent's self-report — this is the one claim that makes round 2 safe, and it is
  // cheap to check exactly.
  const isRound2 = it.key_untouched !== undefined
  if (isRound2) {
    const drift = q.correct
      .map((label) => {
        const before = q.options.find((o) => o.label === label)?.text ?? ''
        const after = it.options.find((o) => o.label === label)?.text ?? ''
        return before.trim() === after.trim() ? null : label
      })
      .filter(Boolean)
    if (drift.length) {
      skipped.push({ id: it.id, why: `KEY EDITED (${drift.join(',')}) — round 2 must leave the key verbatim` })
      continue
    }
    // Deliberately NOT asserting a per-item length shape here. Round 2 wanted the
    // key bracketed (a distractor longer AND shorter); round 3 wants the key to be
    // the shortest outright — because round 2's rule, applied to every item, made
    // "key is shortest" impossible and turned "discard the shortest" into its own
    // tell. Any per-item rule applied uniformly IS a tell. What has to hold is the
    // AGGREGATE distribution, and that is exactly what check-tells.mjs measures.
    // So the merge verifies the key is untouched (cheap, exact, and the thing that
    // makes these passes safe) and leaves the verdict to the gate.
  }

  // Correctness: solvable before but not after => our edit broke it.
  // (Round 2 has no cold-solve pair — it doesn't touch the key, so the auditor's
  // key_still_unique below is the correctness signal there.)
  const baseOk = setEq(it.baseline_answer, q.correct)
  const hardOk = setEq(it.hardened_answer, q.correct)
  if (baseOk && !hardOk) {
    skipped.push({
      id: it.id,
      why: `REGRESSION — cold-solved ${q.correct.join('')} before, ${(it.hardened_answer ?? []).join('') || '?'} after`,
    })
    continue
  }

  if (it.meaning_preserved === false || it.key_still_unique === false) {
    const why = it.meaning_preserved === false ? 'meaning changed' : 'key no longer unique'
    if (!FORCE) {
      skipped.push({ id: it.id, why: `auditor: ${why}` })
      continue
    }
  }

  q.options = it.options.map((o) => {
    const orig = q.options.find((x) => x.label === o.label)
    // Preserve any per-option rationale — hardening only touches option prose.
    return { ...orig, label: o.label, text: o.text.trim() }
  })
  q.hardened = true
  merged.push({ id: it.id, baseOk, hardOk })
}

/* -------------------------- report + length stats -------------------------- */

const lenStats = (questions) => {
  const qs = questions.filter((q) => q.format !== 'matching')
  const L = ['A', 'B', 'C', 'D', 'E', 'F']
  let keyIsLongest = 0
  let gap = 0
  for (const q of qs) {
    const opts = [...q.options].sort((a, b) => L.indexOf(a.label) - L.indexOf(b.label))
    const lens = opts.map((o) => o.text.length)
    const ci = q.correct.map((c) => opts.findIndex((o) => o.label === c))
    if (ci.some((i) => lens[i] === Math.max(...lens))) keyIsLongest++
    const corr = ci.map((i) => lens[i])
    const dist = lens.filter((_, i) => !ci.includes(i))
    gap += corr.reduce((a, b) => a + b, 0) / corr.length - dist.reduce((a, b) => a + b, 0) / dist.length
  }
  return { n: qs.length, keyIsLongest, pct: (100 * keyIsLongest) / qs.length, gap: gap / qs.length }
}

const after = lenStats(bank.questions.filter((q) => q.source === 'official'))

bank.meta.hardening = {
  note: 'Option text of the imported `official` questions was length-rebalanced to remove a 90.9% correct-is-longest tell. Stems and answer keys are untouched and still verify against the source PDF (see scripts/import-ccarp-bank.mjs). Items that failed a before/after cold-solve or a meaning audit were left at their original wording.',
  merged: merged.length,
  skipped: skipped.length,
  key_is_longest_pct: +after.pct.toFixed(1),
  avg_length_gap_chars: Math.round(after.gap),
}

writeFileSync(BANK, JSON.stringify(bank, null, 2) + '\n')

console.log(`merged ${merged.length}/${items.length} hardened questions into ccarp_bank.json`)
if (skipped.length) {
  console.log(`\n${skipped.length} SKIPPED (kept original wording):`)
  for (const s of skipped) console.log(`  ~ ${s.id}: ${s.why}`)
}
console.log(`\nofficial bank now: correct-is-longest ${after.pct.toFixed(1)}% (was 90.9%), avg gap ${Math.round(after.gap)} chars (was +57)`)
console.log('\nNow run: npm run check:tells   (that is what decides whether the tell is actually dead)')
