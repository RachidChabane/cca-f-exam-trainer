#!/usr/bin/env node
/**
 * merge-generated-ccarp.mjs — validate the generated CCA-P questions and merge the
 * ones that pass into data/ccarp_bank.json as `source: "ai_generated"`.
 *
 * Two gates, and they are deliberately weighted differently — see the project's
 * llm-judge-needs-control-baseline lesson:
 *
 *  - **Blind expert cold-solve (BLOCKING).** An expert reasoning fully, with no
 *    sight of the key, must land on the assigned answer. This one is reliable: on
 *    the CCA-F bank it caught 8 genuine key-flips. A question its own writer's
 *    peer cannot solve is a broken question.
 *  - **"Guessable without knowledge" probe (ADVISORY).** Reported, never blocking.
 *    Run against the real-exam control it cracked 88% of GENUINE exam items vs 76%
 *    of hardened ones — it reasons from the stem and rationalises it as a surface
 *    cue. It cannot suppress its own knowledge, so its absolute rate is noise.
 *
 * The `unique_best_answer` critique IS blocking: two defensible options means the
 * item has no single best answer, which is a content defect, not a judgement call.
 *
 * Surface tells are NOT judged here at all — `npm run check:tells` measures them
 * across the whole bank, which is the only level at which a "tell" is even defined.
 *
 * Usage: node scripts/merge-generated-ccarp.mjs --result <workflow-result.json> [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
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
  console.error('usage: node scripts/merge-generated-ccarp.mjs --result <workflow-result.json>')
  process.exit(1)
}

const raw = JSON.parse(readFileSync(resultPath, 'utf8'))
const result = raw.result ?? raw
const items = result.items ?? []
if (!items.length) {
  console.error('x no items in the result payload')
  process.exit(1)
}

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const merged = []
const rejected = []
const advisory = []

for (const it of items) {
  const w = it.written
  const fail = (why) => rejected.push({ qid: it.qid, why })

  if (!w || !w.text) {
    fail('nothing written')
    continue
  }

  /* ------------------------------ structural ------------------------------ */
  if (it.format === 'matching') {
    const m = w.matching
    if (!m?.rows?.length || !m?.option_set?.length) {
      fail('matching item missing rows/option_set')
      continue
    }
    const bad = m.rows.filter((r) => !m.option_set.some((o) => norm(o) === norm(r.correct)))
    if (bad.length) {
      fail(`${bad.length} row(s) keyed to a value not in option_set`)
      continue
    }
    // The format's defining property: options repeat across rows. A one-to-one
    // mapping is a different (easier) puzzle and lets a candidate solve by
    // elimination rather than by classifying each row on its merits.
    const used = new Set(m.rows.map((r) => norm(r.correct)))
    if (used.size === m.rows.length) {
      fail('matching item is a 1:1 permutation — no option is reused')
      continue
    }
  } else {
    const opts = w.options ?? []
    if (opts.length !== it.assigned_correct.length + (it.format === 'mr' ? 3 : 3)) {
      // mc: 1 key + 3 distractors = 4; mr: 2 keys + 3 distractors = 5
      fail(`expected ${it.format === 'mr' ? 5 : 4} options, got ${opts.length}`)
      continue
    }
    if (new Set(opts.map((o) => norm(o.text))).size !== opts.length) {
      fail('duplicate option text')
      continue
    }
    if (opts.some((o) => !o.text?.trim() || !o.explanation?.trim())) {
      fail('an option is missing text or its rationale')
      continue
    }
    const labels = opts.map((o) => o.label).sort().join(',')
    const want = ['A', 'B', 'C', 'D', 'E'].slice(0, opts.length).join(',')
    if (labels !== want) {
      fail(`labels ${labels} != ${want}`)
      continue
    }
    if (!it.assigned_correct.every((c) => opts.some((o) => o.label === c))) {
      fail('assigned key is not among the options')
      continue
    }
  }
  if (!w.explanation?.trim()) {
    fail('no overall rationale')
    continue
  }

  /* -------------------------------- gates -------------------------------- */
  // Recompute agreement for matching items rather than trusting the workflow's
  // flag. When the item lists its option set as "A. …/B. …", the solver echoes the
  // label back ("A. HIPAA — …") while the key holds the bare text ("HIPAA — …"),
  // and an exact compare then rejects a question the expert actually got right.
  // A gate that fails good content is worse than no gate: it silently shrinks the
  // bank and looks like quality control while doing the opposite.
  let solverAgrees = it.solver_agrees
  if (it.format === 'matching' && Array.isArray(it.solver_answer)) {
    const label = (s) => String(s).replace(/^\s*[A-F][.)]\s*/, '')
    const expected = w.matching.rows.map((r) => norm(label(r.correct)))
    const got = it.solver_answer.map((a) => norm(label(a)))
    solverAgrees = expected.length === got.length && expected.every((e, i) => e === got[i])
  }
  if (solverAgrees === false) {
    fail(
      `BLIND SOLVE FAILED — assigned ${(it.assigned_correct ?? []).join('') || 'key'}, expert picked ${(it.solver_answer ?? []).join('') || '?'} (${it.solver_confidence ?? '?'})`,
    )
    continue
  }
  if (it.unique_best_answer === false) {
    fail(`no unique best answer: ${(it.issues ?? [])[0] ?? 'critique flagged competing options'}`)
    continue
  }

  // Advisory only — recorded so it can be reviewed, never blocking.
  if (it.guessable && it.surface_cue) {
    advisory.push({ qid: it.qid, cue: it.surface_cue })
  }

  merged.push(it)
}

/* --------------------------------- build --------------------------------- */

const bank = JSON.parse(readFileSync(BANK, 'utf8'))
const official = bank.questions.filter((q) => q.source === 'official')
// Upsert, don't replace: retry runs carry only the questions that failed the first
// pass, so overwriting the whole `ai_generated` set would silently drop everything
// that already passed.
const existing = new Map(
  bank.questions.filter((q) => q.source === 'ai_generated').map((q) => [q.id, q]),
)

const built = merged.map((it) => {
  const w = it.written
  const base = {
    id: it.qid,
    source: 'ai_generated',
    domain: it.domain,
    format: it.format,
    text: w.text.trim(),
    explanation: w.explanation.trim(),
    difficulty: w.difficulty ?? 'medium',
    topic: w.topic ?? it.objective,
    objective: it.objective,
  }
  if (it.format === 'matching') {
    return {
      ...base,
      select_count: w.matching.rows.length,
      options: [],
      correct: w.matching.rows.map((r) => r.correct),
      matching: w.matching,
    }
  }
  return {
    ...base,
    select_count: it.select_count ?? 1,
    options: w.options.map((o) => ({ label: o.label, text: o.text.trim(), explanation: o.explanation.trim() })),
    correct: it.assigned_correct,
  }
})

for (const q of built) existing.set(q.id, q)
const generated = [...existing.values()].sort((a, b) =>
  a.id.localeCompare(b.id, undefined, { numeric: true }),
)

const byDomain = (qs) =>
  qs.reduce((a, q) => ((a[q.domain] = (a[q.domain] ?? 0) + 1), a), {})
const byFormat = (qs) => qs.reduce((a, q) => ((a[q.format] = (a[q.format] ?? 0) + 1), a), {})

bank.questions = [...official, ...generated]
bank.meta.counts = { official: official.length, ai_generated: generated.length }
bank.meta.by_domain = { official: byDomain(official), ai_generated: byDomain(generated) }
bank.meta.by_format = { official: byFormat(official), ai_generated: byFormat(generated) }
bank.meta.generation = {
  note: 'Original questions written to the exam-guide blueprint. The answer key and the key\'s length rank among the options were assigned centrally BEFORE generation (balanced by construction, not sampled), so no surface tell can be introduced by the writer. Every item was blind cold-solved by an independent expert who had to land on the assigned key, and adversarially critiqued for a unique best answer.',
  accepted: generated.length,
  rejected: rejected.length,
}

if (!DRY) writeFileSync(BANK, JSON.stringify(bank, null, 2) + '\n')

/* -------------------------------- report --------------------------------- */

console.log(`${DRY ? '[dry-run] ' : ''}accepted ${merged.length}/${items.length} from this run; bank now holds ${generated.length} generated questions`)
console.log(`  by domain: ${JSON.stringify(byDomain(generated))}`)
console.log(`  by format: ${JSON.stringify(byFormat(generated))}`)

if (rejected.length) {
  console.log(`\n${rejected.length} REJECTED:`)
  for (const r of rejected) console.log(`  x ${r.qid}: ${r.why}`)
}
if (advisory.length) {
  console.log(`\n${advisory.length} advisory "guessable" flags (NOT blocking — this probe cracks 88% of real exam items too):`)
  for (const a of advisory) console.log(`  ? ${a.qid}: ${a.cue}`)
}
console.log(`\nNow run: npm run check:tells   (the only place surface tells are actually decided)`)
