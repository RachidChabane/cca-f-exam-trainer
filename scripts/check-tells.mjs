#!/usr/bin/env node
/**
 * check-tells.mjs — deterministic surface-tell gate for every question bank.
 *
 * Why this exists: on 2026-06-17 the correct answer was the longest option in
 * 97.6% of 461 questions. It was fixed by hand. Nothing stopped it coming back,
 * and `check-data.mjs` only ever validated structure. This is the regression gate.
 *
 * How it works: instead of asking a model "is this too obvious?" (noisy without a
 * control — see the llm-judge-needs-control-baseline note), we *implement the
 * test-wise strategies a knowledge-free candidate would actually use* and measure
 * whether any of them beats chance. On a clean 4-option bank "always pick the
 * longest" scores ~25%. A strategy that scores far above chance IS the tell, and
 * the z-score says how blatant it is.
 *
 * Mixed single-/multi-answer banks are handled directly: per item the chance of a
 * blind pick landing in the key is |correct| / |options|, so the null is a
 * Poisson-binomial (sum of per-item probabilities) rather than a flat 1/4.
 *
 * Usage:
 *   node scripts/check-tells.mjs            # all banks, gate on generated content
 *   node scripts/check-tells.mjs --verbose  # per-strategy detail for every bank
 */

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'data')
const VERBOSE = process.argv.includes('--verbose')

/* ------------------------------- statistics ------------------------------- */

/** Normal CDF upper tail, via erfc. Good to ~1e-7 — plenty for a z we threshold at 3. */
function zTail(z) {
  // Abramowitz & Stegun 7.1.26 erfc approximation.
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2)
  const y =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  const erfc = y * Math.exp((-z * z) / 2)
  return z >= 0 ? erfc / 2 : 1 - erfc / 2
}

/**
 * Score one strategy against the Poisson-binomial null.
 * `hits` may be fractional (a strategy that ties across k options scores the
 * expected value of breaking the tie at random — keeps ties from biasing either way).
 */
function significance(hits, items) {
  const expected = items.reduce((s, it) => s + it.correct.length / it.options.length, 0)
  const variance = items.reduce((s, it) => {
    const p = it.correct.length / it.options.length
    return s + p * (1 - p)
  }, 0)
  const sd = Math.sqrt(variance)
  const z = sd > 0 ? (hits - expected) / sd : 0
  return {
    hits,
    n: items.length,
    rate: items.length ? hits / items.length : 0,
    chance: items.length ? expected / items.length : 0,
    z,
    p: zTail(Math.abs(z)),
  }
}

/**
 * Both tails leak. A strategy far ABOVE chance is "pick this and you're right";
 * one far BELOW chance is "eliminate this and you're right more often" — the
 * 2026-06-17 rewrite drove correct-is-longest to 0.8%, which handed a test-wise
 * reader a free 1-in-3 by discarding the longest option. Overcorrection is still
 * a pattern. We gate on |z|.
 */
const exploitability = (r) => Math.abs(r.z)
const direction = (r) => (r.z >= 0 ? 'pick' : 'eliminate')

/* ------------------------------- strategies ------------------------------- */

const HEDGE =
  /\b(typically|generally|usually|often|appropriate|appropriately|as needed|where relevant|based on|depending on|balance|trade-?off|ensure|ensuring|so that|in order to)\b/gi
const ABSOLUTE =
  /\b(always|never|all|every|only|any|none|must|cannot|guarantee[sd]?|entirely|completely|regardless|immediately|silently|hard-?code[sd]?|ignore[sd]?)\b/gi

const STOPWORDS = new Set(
  'the a an and or of to in for on with is are be by as at from that this it its which what when how why not no if then than each per use used using into over under more most best first second new'.split(
    ' ',
  ),
)

const words = (s) =>
  (s.toLowerCase().match(/[a-z][a-z0-9_-]{2,}/g) ?? []).filter((w) => !STOPWORDS.has(w))
const countMatches = (s, re) => (s.match(re) ?? []).length

/**
 * Each strategy scores every option; the strategy "picks" the argmax. Returns a
 * number per option — higher = more attractive to a knowledge-free test-wise reader.
 */
const STRATEGIES = [
  { key: 'longest', label: 'Pick the longest option', score: (o) => o.length },
  { key: 'shortest', label: 'Pick the shortest option', score: (o) => -o.length },
  {
    key: 'most_hedged',
    label: 'Pick the most hedged/qualified option',
    score: (o) => countMatches(o, HEDGE),
  },
  {
    key: 'avoids_absolutes',
    label: 'Pick the option with fewest absolutist words',
    score: (o) => -countMatches(o, ABSOLUTE),
  },
  {
    key: 'stem_overlap',
    label: 'Pick the option echoing the stem most',
    score: (o, item) => {
      const stem = new Set(words(item.stem))
      const ws = words(o)
      if (ws.length === 0) return 0
      return ws.filter((w) => stem.has(w)).length / Math.sqrt(ws.length)
    },
  },
  {
    key: 'most_specific',
    label: 'Pick the most technical-looking option (code/identifiers/numbers)',
    score: (o) => countMatches(o, /(`[^`]+`|\b[a-z_]+\([^)]*\)|\b[a-z]+_[a-z_]+\b|\b\d+\b)/gi),
  },
]

/** Fractional hits for one strategy: ties share credit, so ties never fake a signal. */
function runStrategy(strategy, items) {
  let hits = 0
  for (const item of items) {
    const scores = item.options.map((o) => strategy.score(o, item))
    const max = Math.max(...scores)
    const tied = scores.map((s, i) => (s === max ? i : -1)).filter((i) => i >= 0)
    const correctAmongTied = tied.filter((i) => item.correct.includes(i)).length
    hits += correctAmongTied / tied.length
  }
  return significance(hits, items)
}

/* --------------------------- per-item structural --------------------------- */

/** Length-balance rule from the 2026-06-17 rewrite: longest option <= 1.25x shortest. */
function lengthBalance(items) {
  const offenders = []
  for (const item of items) {
    const lens = item.options.map((o) => o.length)
    const lo = Math.min(...lens)
    const hi = Math.max(...lens)
    const ratio = lo > 0 ? hi / lo : Infinity
    if (ratio > 1.25) offenders.push({ id: item.id, ratio: +ratio.toFixed(2), lo, hi })
  }
  return offenders
}

/** Key-position distribution. A real source bank may legitimately skew; generated must not. */
function keyPositions(items) {
  const counts = {}
  for (const item of items) for (const i of item.correct) counts[i] = (counts[i] ?? 0) + 1
  return counts
}

/* -------------------------------- loaders --------------------------------- */
/* Each loader normalises to: { id, stem, options: string[], correct: number[] } */

const readJson = (f) => JSON.parse(readFileSync(join(DATA, f), 'utf8'))

function loadScenarios() {
  if (!existsSync(join(DATA, 'scenarios.json'))) return []
  const raw = readJson('scenarios.json')
  const sets = Array.isArray(raw) ? raw : (raw.scenarios ?? [])
  return sets.flatMap((s) =>
    (s.questions ?? []).map((q) => ({
      id: q.id,
      stem: q.stem?.en ?? '',
      options: q.options?.en ?? [],
      correct: [q.correct_index],
    })),
  )
}

function loadQuizzes() {
  if (!existsSync(join(DATA, 'quizzes.json'))) return []
  const raw = readJson('quizzes.json')
  const groups = [...Object.values(raw.by_course ?? {}), ...Object.values(raw.by_theme ?? {})]
  return groups.flat().map((q) => ({
    id: q.id,
    stem: q.q?.en ?? '',
    options: q.options?.en ?? [],
    correct: [q.correct_index],
  }))
}

/** question_bank.json — letter-keyed, split by provenance so `official` can act as the control. */
function loadQuestionBank(source) {
  if (!existsSync(join(DATA, 'question_bank.json'))) return []
  const raw = readJson('question_bank.json')
  const LETTERS = ['A', 'B', 'C', 'D', 'E']
  return raw.questions
    .filter((q) => q.source === source)
    .map((q) => {
      const opts = [...q.options].sort((a, b) => LETTERS.indexOf(a.label) - LETTERS.indexOf(b.label))
      const keys = Array.isArray(q.correct) ? q.correct : [q.correct]
      return {
        id: String(q.id),
        stem: q.text ?? '',
        options: opts.map((o) => o.text),
        correct: keys.map((k) => opts.findIndex((o) => o.label === k)).filter((i) => i >= 0),
      }
    })
}

/** ccarp_bank.json — the CCA-P bank; `correct` is an array of letters (multi-response). */
function loadCcarpBank(source) {
  if (!existsSync(join(DATA, 'ccarp_bank.json'))) return []
  const raw = readJson('ccarp_bank.json')
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
  return (raw.questions ?? [])
    .filter((q) => q.source === source && q.format !== 'matching')
    .map((q) => {
      const opts = [...q.options].sort((a, b) => LETTERS.indexOf(a.label) - LETTERS.indexOf(b.label))
      return {
        id: String(q.id),
        stem: q.text ?? '',
        options: opts.map((o) => o.text),
        correct: (q.correct ?? []).map((k) => opts.findIndex((o) => o.label === k)).filter((i) => i >= 0),
      }
    })
}

/* --------------------------------- report --------------------------------- */

/**
 * `gate: false` marks a bank we do NOT author and do NOT edit: its tells are the
 * source's problem, and it exists here as the calibration reference.
 *
 * There is exactly ONE such bank: `question_bank.json [official]` — 60 questions
 * imported verbatim from the real CCA-F exam. It is the only genuine sample of
 * what a real exam's surface statistics look like (worst |z| ~2.1), which is why
 * z≈2 is treated as the human floor rather than zero.
 *
 * `ccarp_bank.json [official]` is deliberately NOT a control. It is one
 * architect's practice set, not exam items, it arrived with a 90.9% correct-is-
 * longest tell, and we have since rewritten its option text — so it is our
 * content and is held to the full bar like anything else we author.
 */
const BANKS = [
  { name: 'scenarios.json', gate: true, load: loadScenarios },
  { name: 'quizzes.json', gate: true, load: loadQuizzes },
  { name: 'question_bank.json [official — REAL-EXAM CONTROL]', gate: false, load: () => loadQuestionBank('official') },
  { name: 'question_bank.json [ai_generated]', gate: true, load: () => loadQuestionBank('ai_generated') },
  { name: 'ccarp_bank.json [official — hardened]', gate: true, load: () => loadCcarpBank('official') },
  { name: 'ccarp_bank.json [ai_generated]', gate: true, load: () => loadCcarpBank('ai_generated') },
]

/** z above which a strategy counts as a real tell. 3.0 ~= p<0.002 one-sided. */
const Z_FAIL = 3.0
const Z_WARN = 2.0

/**
 * Known pre-existing tells, recorded so this gate can be adopted today without
 * rewriting the affected banks in the same change. This is a RATCHET, not an
 * excuse list: each entry pins the |z| measured when it was recorded, and the
 * gate still fails if the tell gets worse. New banks (ccarp_bank.json) carry no
 * debt and are held to the full bar.
 *
 * Recorded 2026-07-15, found by this script's first run:
 *  - scenarios.json most_specific: the 2026-06-17 hand-rewrite balanced option
 *    LENGTH but left the key correlated with code/identifier formatting.
 *  - scenarios.json / quizzes.json longest: that same rewrite OVERCORRECTED,
 *    driving correct-is-longest to ~1%, which makes "discard the longest option"
 *    a reliable elimination rule. Fixing means re-balancing, not re-inverting.
 *
 * To clear an entry: fix the content, re-run, delete the line.
 */
const KNOWN_DEBT = [
  { bank: 'scenarios.json', strategy: 'most_specific', z: 7.2 },
  { bank: 'scenarios.json', strategy: 'longest', z: 10.6 },
  { bank: 'quizzes.json', strategy: 'longest', z: 5.2 },
]
/** Slack so noise in a re-measure doesn't flap the build. */
const DEBT_TOLERANCE = 0.5

const debtFor = (bank, strategy) =>
  KNOWN_DEBT.find((d) => d.bank === bank.replace(/ \[.*/, '') && d.strategy === strategy)

const pct = (x) => `${(x * 100).toFixed(1)}%`
const errors = []
const warnings = []
const debts = []

console.log('Surface-tell gate — can a knowledge-free reader beat chance?\n')

const controls = {}

for (const bank of BANKS) {
  const items = bank.load().filter((i) => i.options.length >= 2 && i.correct.length > 0)
  if (items.length === 0) continue

  const results = STRATEGIES.map((s) => ({ strategy: s, ...runStrategy(s, items) }))
  const worst = results.reduce((a, b) => (exploitability(b) > exploitability(a) ? b : a))
  const balance = lengthBalance(items)
  const positions = keyPositions(items)

  if (!bank.gate) controls[bank.name] = results

  // Judge the verdict on strategies that aren't already accepted debt, so a bank
  // whose only sins are pinned in KNOWN_DEBT reads as 'debt', not 'FAIL'.
  const live = bank.gate ? results.filter((r) => !debtFor(bank.name, r.strategy.key)) : results
  const liveWorst = live.length ? live.reduce((a, b) => (exploitability(b) > exploitability(a) ? b : a)) : null
  const hasDebt = bank.gate && results.some((r) => debtFor(bank.name, r.strategy.key))

  const verdict = !bank.gate
    ? 'control'
    : liveWorst && exploitability(liveWorst) >= Z_FAIL
      ? 'FAIL'
      : hasDebt
        ? 'debt'
        : liveWorst && exploitability(liveWorst) >= Z_WARN
          ? 'warn'
          : 'ok'

  console.log(`${bank.name} — ${items.length} items  [${verdict}]`)
  console.log(
    `  worst: ${direction(worst)} "${worst.strategy.key}" — ${pct(worst.rate)} vs ${pct(worst.chance)} chance (z=${worst.z.toFixed(1)})`,
  )

  if (VERBOSE) {
    for (const r of [...results].sort((a, b) => exploitability(b) - exploitability(a))) {
      console.log(
        `    ${r.strategy.key.padEnd(18)} ${pct(r.rate).padStart(6)} vs ${pct(r.chance).padStart(6)}  z=${r.z.toFixed(1).padStart(5)}  ${exploitability(r) >= Z_WARN ? `<- ${direction(r)}` : ''}`,
      )
    }
    console.log(`    key positions: ${JSON.stringify(positions)}`)
    console.log(`    length-imbalanced items (>1.25x): ${balance.length}/${items.length}`)
  }

  if (bank.gate) {
    for (const r of results) {
      const how =
        r.z >= 0
          ? `"${r.strategy.label}" scores ${pct(r.rate)} vs ${pct(r.chance)} chance`
          : `"${r.strategy.label}" scores only ${pct(r.rate)} vs ${pct(r.chance)} chance — so ELIMINATING that option is a reliable rule`
      const debt = debtFor(bank.name, r.strategy.key)
      if (debt) {
        // Ratchet: accepted debt passes at or below its recorded level, fails above.
        if (exploitability(r) > debt.z + DEBT_TOLERANCE) {
          errors.push(
            `${bank.name}: ${how} (z=${r.z.toFixed(1)}) — WORSE than the recorded debt of |z|=${debt.z}. Known tells must not regress.`,
          )
        } else {
          debts.push(
            `${bank.name}: ${r.strategy.key} |z|=${exploitability(r).toFixed(1)} (accepted debt, was ${debt.z})`,
          )
        }
        continue
      }
      if (exploitability(r) >= Z_FAIL) {
        errors.push(`${bank.name}: ${how} (z=${r.z.toFixed(1)}) — that is a surface tell, not a question.`)
      } else if (exploitability(r) >= Z_WARN) {
        warnings.push(`${bank.name}: ${how} (z=${r.z.toFixed(1)}).`)
      }
    }
    // Length balance is informational, not a gate: 57% of the verbatim real-exam
    // control violates the 1.25x rule, so an absolute threshold here would hold
    // generated content to a stricter bar than the actual exam. The `longest`
    // strategy's z is the metric that matters — it measures whether the imbalance
    // is *correlated with the key*, which is the only part a candidate can exploit.
    if (VERBOSE) {
      console.log(
        `    (length imbalance is informational — the 'longest' z above is what gates)`,
      )
    }
  }
  console.log()
}

// Calibration note: the verbatim import is a real exam-style bank, so its tell
// profile is the realistic floor. Generated content beating the control is the
// thing that matters — an absolute threshold alone would be arbitrary.
if (Object.keys(controls).length && VERBOSE) {
  console.log('Control baselines (verbatim imports — what a real bank looks like):')
  for (const [name, results] of Object.entries(controls)) {
    // Rank by |z|, same as the gate — ranking by signed z here silently hid a
    // z=-3.8 elimination tell behind a z=1.6 "worst".
    const worst = results.reduce((a, b) => (exploitability(b) > exploitability(a) ? b : a))
    console.log(`  ${name}: worst |z|=${exploitability(worst).toFixed(1)} (${direction(worst)} ${worst.strategy.key})`)
  }
  console.log()
}

if (debts.length) {
  console.log(`${debts.length} ACCEPTED DEBT — pre-existing tells, not yet fixed:`)
  for (const d of debts) console.log(`  ~ ${d}`)
  console.log('  (see KNOWN_DEBT in this script; fix the content, then delete the entry)')
  console.log()
}

if (warnings.length) {
  console.log(`${warnings.length} WARNING(S):`)
  for (const w of warnings) console.log(`  ! ${w}`)
  console.log()
}

if (errors.length) {
  console.log(`${errors.length} ERROR(S):`)
  for (const e of errors) console.log(`  x ${e}`)
  process.exit(1)
}

console.log('No surface tells above threshold.')
