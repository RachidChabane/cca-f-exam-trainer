#!/usr/bin/env node
/**
 * gen-ccarp-retry.mjs — emit a Workflow script that REWRITES the CCA-P questions
 * the first pass rejected, feeding each writer the specific reason its predecessor
 * failed.
 *
 * The rejections are not noise — they are the two gates working:
 *  - a blind expert cold-solved the item and landed on a DIFFERENT answer than the
 *    assigned key (the item is wrong, or its key is), or
 *  - an adversarial critique found a second genuinely defensible option (the item
 *    has no single best answer).
 * A retry that isn't told what went wrong tends to reproduce it, so each prompt
 * carries the verbatim critique of the attempt it is replacing.
 *
 * Spec (domain / objective / format / assigned key / assigned length rank) is
 * inherited unchanged from the original plan, so the bank's balance survives.
 *
 * Usage: node scripts/gen-ccarp-retry.mjs --result <first-run.json> > <out.js>
 */

import { readFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const arg = (n) => {
  const i = argv.indexOf(n)
  return i >= 0 ? argv[i + 1] : undefined
}

const resultPath = arg('--result')
if (!resultPath || !existsSync(resultPath)) {
  console.error('usage: node scripts/gen-ccarp-retry.mjs --result <first-run.json> > out.js')
  process.exit(1)
}

const raw = JSON.parse(readFileSync(resultPath, 'utf8'))
const items = (raw.result ?? raw).items ?? []

const setEq = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && [...a].sort().join('|') === [...b].sort().join('|')

/** Rebuild the reject list with the SAME rules the merge script uses. */
const failures = []
for (const it of items) {
  const w = it.written
  let why = null
  if (!w || !w.text) why = 'the previous attempt produced nothing (an API error mid-generation)'
  else if (it.solver_agrees === false)
    why = `An independent expert cold-solved your predecessor BLIND and picked ${(it.solver_answer ?? []).join(', ') || '?'} — but the key was ${(it.assigned_correct ?? []).join(', ') || 'the assigned answer'}. Either the item did not actually make the keyed answer best, or a distractor was better than intended. Their reasoning: ${String(it.solver_reasoning ?? '').slice(0, 500) || '(not captured)'}`
  else if (it.unique_best_answer === false)
    why = `An adversarial critique found the item has NO single best answer: ${(it.issues ?? []).join(' | ').slice(0, 900)}`
  if (why) failures.push({ ...it, why })
}

if (!failures.length) {
  console.error('nothing to retry — every question passed')
  process.exit(1)
}

const taxonomy = readFileSync(join(ROOT, 'scripts/question-bank-taxonomy.md'), 'utf8')
  .split('## The recurring distractor strategies')[1]
  .split('## Generation rules')[0]
  .trim()

const spec = failures.map((f) => ({
  qid: f.qid,
  domain: f.domain,
  domain_name: f.domain,
  objective: f.objective,
  format: f.format,
  options_n: f.format === 'mr' ? 5 : 4,
  select_count: f.select_count,
  correct: f.assigned_correct,
  key_length_rank: f.key_length_rank,
  prior_stem: f.written?.text ?? '',
  why: f.why,
}))

process.stderr.write(`retrying ${spec.length}: ${spec.map((s) => s.qid).join(', ')}\n`)

const SCRIPT = `export const meta = {
  name: 'generate-ccarp-retry',
  description: 'Rewrite the CCA-P questions rejected by the blind cold-solve / unique-best-answer gates, each told exactly why its predecessor failed',
  phases: [
    { title: 'Rewrite', detail: 'fresh scenario for the same objective, avoiding the named defect' },
    { title: 'Solve', detail: 'independent expert cold-solves it blind — must land on the assigned key' },
    { title: 'Critique', detail: 'adversarial: exactly ONE best answer?' },
  ],
}

const SPEC = ${JSON.stringify(spec, null, 2)}
const TAXONOMY = ${JSON.stringify(taxonomy)}

const WRITE_SCHEMA = {
  type: 'object',
  required: ['qid', 'text', 'explanation'],
  properties: {
    qid: { type: 'string' },
    text: { type: 'string' },
    options: {
      type: 'array',
      items: {
        type: 'object',
        required: ['label', 'text', 'explanation'],
        properties: { label: { type: 'string' }, text: { type: 'string' }, explanation: { type: 'string' } },
      },
    },
    matching: {
      type: 'object',
      properties: {
        option_set: { type: 'array', items: { type: 'string' } },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            required: ['text', 'correct'],
            properties: { text: { type: 'string' }, correct: { type: 'string' } },
          },
        },
      },
    },
    explanation: { type: 'string' },
    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
    topic: { type: 'string' },
  },
}

const SOLVE_SCHEMA = {
  type: 'object',
  required: ['answer', 'confidence', 'reasoning'],
  properties: {
    answer: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reasoning: { type: 'string' },
  },
}

const CRITIQUE_SCHEMA = {
  type: 'object',
  required: ['unique_best_answer', 'guessable_without_knowledge', 'issues'],
  properties: {
    unique_best_answer: { type: 'boolean' },
    guessable_without_knowledge: { type: 'boolean' },
    surface_cue: { type: 'string' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

const rankWord = (r, n) =>
  r === 1 ? 'the LONGEST' : r === n ? 'the SHORTEST' : \`rank \${r} of \${n} by length (\${r - 1} longer, \${n - r} shorter)\`

phase('Rewrite')

const results = await pipeline(
  SPEC,

  (s) =>
    agent(
      s.format === 'matching'
        ? \`Write ONE original scenario-matching item for the CCA-P exam (Claude Certified Architect – Professional). This REPLACES a rejected attempt.

DOMAIN: \${s.domain}
OBJECTIVE IT MUST TEST: \${s.objective}
FORMAT: 5 short scenarios ("rows"), each classified against ONE shared option set of 4 choices.

**WHY THE PREVIOUS ATTEMPT WAS REJECTED — do not repeat this:**
\${s.why}

Use a DIFFERENT scenario setting from the rejected attempt (its stem opened: "\${String(s.prior_stem).slice(0, 160)}...").

RULES:
- Options MUST repeat across rows — at least one option keys two rows. A 1:1 permutation is rejected automatically, because it lets a candidate solve by elimination instead of classifying each row on its merits.
- **Each row must have ONE defensible classification.** The rejection above usually means a row was genuinely ambiguous — e.g. a symptom that a competent engineer could attribute to two different root causes. Make each row's decisive evidence explicit in the row itself, so the classification is forced rather than argued. If a row could be read as X or Y, add the detail that rules out Y.
- Do NOT echo an option's vocabulary in the row that keys to it — that hands it over for free.
- \\\`explanation\\\` walks EVERY row, naming the decisive evidence.
- Return \\\`qid\\\` exactly "\${s.qid}", the \\\`matching\\\` object (option_set + rows, each \\\`correct\\\` copied verbatim from option_set), and the stem in \\\`text\\\`.\`
        : \`Write ONE original question for the CCA-P exam (Claude Certified Architect – Professional). This REPLACES a rejected attempt.

DOMAIN: \${s.domain}
OBJECTIVE IT MUST TEST: \${s.objective}
FORMAT: \${s.format === 'mr' ? \`multiple response — 5 options (A-E), candidate selects exactly \${s.select_count}\` : 'multiple choice — 4 options (A-D), candidate selects ONE'}

**WHY THE PREVIOUS ATTEMPT WAS REJECTED — do not repeat this:**
\${s.why}

Use a DIFFERENT scenario from the rejected attempt (its stem opened: "\${String(s.prior_stem).slice(0, 160)}...").

**THE CORRECT ANSWER MUST BE: \${(s.correct ?? []).join(' and ')}.** Assigned centrally to keep the answer key balanced.

**LENGTH: the keyed option\${(s.correct ?? []).length > 1 ? 's' : ''} must end up \${rankWord(s.key_length_rank, s.options_n)}.** Assigned by hash so length is uncorrelated with correctness across the bank. The imported set for this exam keys the longest option 91% of the time and this trainer's other bank was at 97.6% — both written by capable models that thought they had balanced it. Count characters before returning. Keep the set within ~1.35x longest:shortest.

**THE BAR THAT FAILED LAST TIME — read carefully.** The rejection above means either the key wasn't actually best, or a distractor was ALSO defensible. Both come from the same root cause: the scenario did not pin down enough to force ONE answer.
- Put the decisive constraint IN THE STEM. If the key wins because of a hard requirement (an SLA, a regulation, a stated budget, an explicit "must never"), state that requirement plainly so the answer is forced by the scenario rather than by the reader's taste.
- Then check each distractor: "given THAT stated constraint, why is this now wrong?" If a distractor is still arguable, it is not a distractor — it is a second right answer. Fix the stem or change the distractor.
- Do NOT rely on an unstated preference (e.g. "the cheapest fix", "the minimal change") to knock out a rival unless the stem SAYS so. That was a repeat failure last round.

REMAINING RULES:
- **Ground the stem in a production observation** with a concrete number/tool/detail, then ask a superlative judgement question ("most effective", "most likely root cause", "which TWO most strongly…"). CCA-P tests judgement, not API trivia.
- **One BEST answer among plausible competitors, not one defensible answer.** 2-3 options should look reasonable to a knowledgeable reader who then has to reason about THIS scenario.
- Every distractor is something a competent engineer would actually propose, wrong only for a subtle scenario-specific reason. No strawmen. No self-incriminating words ("silently", "regardless", "always", "never", "ignore", "hard-code"). The key must not recite the rubric or be the most hedged option.
- Each option needs its own \\\`explanation\\\`; the overall \\\`explanation\\\` names every letter.

Distractor reasons to draw from (pick 2-3, vary them):
\${TAXONOMY}

Return \\\`qid\\\` exactly "\${s.qid}", all \${s.options_n} options labelled A-\${String.fromCharCode(64 + s.options_n)}, plus \\\`difficulty\\\` and \\\`topic\\\`.\`,
      { label: \`rewrite:\${s.qid}\`, phase: 'Rewrite', schema: WRITE_SCHEMA, model: 'sonnet' },
    ).then((w) => ({ s, written: w })),

  (prev) => {
    if (!prev.written) return prev
    const w = prev.written
    const s = prev.s
    if (s.format === 'matching') {
      const rows = (w.matching?.rows ?? []).map((r, i) => \`\${i + 1}. \${r.text}\`).join('\\n')
      const set = (w.matching?.option_set ?? []).join(' · ')
      return agent(
        \`Classify each scenario. Choose from: \${set}. An option may be used more than once.

\${w.text}

\${rows}

Answer as a Claude solutions architect on the engineering merits. Return \\\`answer\\\` as one entry per row, in order, copied verbatim from the option set.\`,
        { label: \`solve:\${s.qid}\`, phase: 'Solve', schema: SOLVE_SCHEMA, model: 'sonnet' },
      ).then((v) => ({ ...prev, solved: v }))
    }
    const opts = (w.options ?? []).map((o) => \`\${o.label}. \${o.text}\`).join('\\n')
    return agent(
      \`You are a Claude solutions architect sitting a certification exam. Answer on the engineering merits.

\${w.text}

\${opts}

\${s.format === 'mr' ? \`Select exactly \${s.select_count}.\` : 'Select ONE.'}

Reason from your own knowledge of Claude, the Anthropic API, agentic architecture, RAG, evaluation, safety, governance and delivery. Do NOT reason from test-taking cues (length, hedging) — judge the engineering.\`,
      { label: \`solve:\${s.qid}\`, phase: 'Solve', schema: SOLVE_SCHEMA, model: 'sonnet' },
    ).then((v) => ({ ...prev, solved: v }))
  },

  (prev) => {
    if (!prev.written) return prev
    const w = prev.written
    const s = prev.s
    const body =
      s.format === 'matching'
        ? \`OPTION SET: \${(w.matching?.option_set ?? []).join(' · ')}\\nROWS:\\n\${(w.matching?.rows ?? []).map((r, i) => \`\${i + 1}. \${r.text}  [keyed: \${r.correct}]\`).join('\\n')}\`
        : (w.options ?? [])
            .map((o) => \`\${o.label}. \${o.text}\${(s.correct ?? []).includes(o.label) ? '   <-- KEYED CORRECT' : ''}\`)
            .join('\\n')
    return agent(
      \`Adversarially critique this draft CCA-P exam question. Try to break it.

STEM: \${w.text}

\${body}

RATIONALE: \${w.explanation}

1. **unique_best_answer** — is exactly one option (or the keyed set) genuinely best? Set FALSE if a distractor is equally defensible, if two options are both correct, if the key is arguable, or if the rationale eliminates a rival using a criterion the STEM never states (e.g. "the cheapest option" when the stem never mentions cost). Be harsh — this is the check that matters.
2. **guessable_without_knowledge** — could a candidate with ZERO domain knowledge reliably pick the key from surface cues? Set TRUE **only if you can NAME the cue**. If you needed domain knowledge to find the answer, that is a PASS.

Also flag strawman distractors, a telegraphing stem, or a non-parallel option set.\`,
      { label: \`critique:\${s.qid}\`, phase: 'Critique', schema: CRITIQUE_SCHEMA, model: 'sonnet' },
    ).then((c) => ({ ...prev, critique: c }))
  },
)

const done = results.filter(Boolean)
const setEq = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && [...a].sort().join('|') === [...b].sort().join('|')

const out = done.map((r) => {
  const expected =
    r.s.format === 'matching' ? (r.written?.matching?.rows ?? []).map((x) => x.correct) : r.s.correct
  const solved = r.solved?.answer ?? null
  return {
    qid: r.s.qid,
    domain: r.s.domain,
    format: r.s.format,
    select_count: r.s.select_count ?? null,
    assigned_correct: r.s.correct ?? null,
    key_length_rank: r.s.key_length_rank ?? null,
    objective: r.s.objective,
    written: r.written ?? null,
    solver_answer: solved,
    solver_confidence: r.solved?.confidence ?? null,
    solver_reasoning: r.solved?.reasoning ?? null,
    solver_agrees:
      r.s.format === 'matching'
        ? Array.isArray(solved) &&
          solved.length === expected.length &&
          expected.every((e, i) => String(solved[i]).toLowerCase().trim() === String(e).toLowerCase().trim())
        : setEq(solved, expected),
    unique_best_answer: r.critique?.unique_best_answer ?? null,
    guessable: r.critique?.guessable_without_knowledge ?? null,
    surface_cue: r.critique?.surface_cue ?? '',
    issues: r.critique?.issues ?? [],
  }
})

log(\`retried \${out.length}; solver agreed \${out.filter((i) => i.solver_agrees).length}; unique-best \${out.filter((i) => i.unique_best_answer).length}\`)

return { count: out.length, items: out }
`

process.stdout.write(SCRIPT)
