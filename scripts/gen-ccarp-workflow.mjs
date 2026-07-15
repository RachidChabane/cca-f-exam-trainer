#!/usr/bin/env node
/**
 * gen-ccarp-workflow.mjs — emit the CCA-P question-generation Workflow script with
 * its per-question spec baked in as literals.
 *
 * Why a generator instead of passing `args`: the Workflow harness does not deliver
 * `args` to the script (it arrives `undefined`), and agents then silently paper
 * over the gap by hunting the repo for a plausible input — which produced a
 * 226-agent run whose every verifier passed while none of them ever saw the
 * parameter the run existed to apply. Baking the spec in removes the failure mode.
 *
 * What the spec pins, per question, BEFORE any model sees it:
 *  - domain + which blueprint objective it must target (round-robin => coverage)
 *  - format / option count / select_count, mirroring the real mix
 *  - the correct letter(s), cycled so the answer key is balanced across positions
 *  - the key's LENGTH RANK among the options, assigned by a stable hash so it is
 *    uniform — the correct answer is the longest exactly 1/n of the time, and the
 *    shortest exactly 1/n of the time, like a real exam.
 *
 * That last one is the whole point. The imported bank keyed the longest option
 * 90.9% of the time; the CCA-F bank was at 97.6% before its rewrite. Both were
 * produced by capable models told to "balance option lengths" and neither did. So
 * the target is not left to the model's judgement: it is assigned centrally, and
 * scripts/check-tells.mjs measures whether it actually landed.
 *
 * Usage: node scripts/gen-ccarp-workflow.mjs > <out.js>
 */

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Per-domain item + format mix, mirroring the real blueprint and the source set. */
const PLAN = [
  { domain: 'solution_design', n: 1, mc: 8, mr: 2, matching: 1 },
  { domain: 'models_prompting_context', n: 2, mc: 6, mr: 2, matching: 0 },
  { domain: 'integration', n: 3, mc: 8, mr: 3, matching: 1 },
  { domain: 'evaluation_testing', n: 4, mc: 7, mr: 2, matching: 1 },
  { domain: 'governance_safety', n: 5, mc: 6, mr: 2, matching: 1 },
  { domain: 'stakeholder_lifecycle', n: 6, mc: 6, mr: 2, matching: 1 },
  { domain: 'developer_productivity', n: 7, mc: 3, mr: 1, matching: 0 },
]

/** Objectives + display names, lifted from the exam guide via the blueprint module. */
const bp = readFileSync(join(ROOT, 'src/data/ccarpBlueprint.ts'), 'utf8')
function objectivesFor(key) {
  // The blueprint is a TS module; pull the `en` objective list for this domain.
  const block = bp.split(`key: '${key}'`)[1]
  if (!block) throw new Error(`no blueprint block for ${key}`)
  const en = block.split('objectives:')[1]?.split('en: [')[1]?.split(']')[0]
  if (!en) throw new Error(`no objectives for ${key}`)
  return [...en.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"))
}
function nameFor(key) {
  const block = bp.split(`key: '${key}'`)[1]
  return block.split('name: {')[1].split("en: '")[1].split("'")[0]
}

const LETTERS = ['A', 'B', 'C', 'D', 'E']
const hash = (s) => parseInt(createHash('sha256').update(s).digest('hex').slice(0, 8), 16)

const spec = []
let mcCycle = 0
let mrCycle = 0

for (const d of PLAN) {
  const objectives = objectivesFor(d.domain)
  const name = nameFor(d.domain)
  let i = 0
  const push = (format) => {
    i++
    const qid = `gen-${d.n}.${i}`
    const objective = objectives[(i - 1) % objectives.length]
    const base = { qid, domain: d.domain, domain_name: name, objective, format }

    if (format === 'matching') {
      spec.push({ ...base, rows: 5, option_set_size: 4 })
      return
    }
    const optionsN = format === 'mr' ? 5 : 4
    let correct
    if (format === 'mc') {
      // Cycle A/B/C/D so the key is evenly spread across positions.
      correct = [LETTERS[mcCycle % 4]]
      mcCycle++
    } else {
      // Cycle the correct PAIR through the 10 combinations of 5 options.
      const pairs = []
      for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) pairs.push([LETTERS[a], LETTERS[b]])
      correct = pairs[mrCycle % pairs.length]
      mrCycle++
    }
    // key_length_rank is assigned after the loop — see assignRanks(). It must be
    // balanced by CONSTRUCTION, not sampled.
    spec.push({
      ...base,
      options_n: optionsN,
      select_count: format === 'mr' ? 2 : 1,
      correct,
    })
  }
  for (let k = 0; k < d.mc; k++) push('mc')
  for (let k = 0; k < d.mr; k++) push('mr')
  for (let k = 0; k < d.matching; k++) push('matching')
}

/**
 * Assign the key's length rank (1 = longest ... n = shortest), BALANCED BY
 * CONSTRUCTION rather than sampled.
 *
 * The obvious approach — `hash(qid) % optionsN` — is uniform in expectation but
 * not in any given draw. Over these 58 items it produced {1:22, 2:6, 3:9, 4:19}:
 * "the key is the longest" would have been true 37.9% of the time against a 24%
 * chance baseline, i.e. a real tell baked in at generation time by a "random"
 * assignment. n=58 is far too small to trust a draw.
 *
 * So: deal each rank an exactly equal number of times, then permute the deal by
 * hash. Permuting a balanced multiset keeps it balanced, while ensuring the rank
 * doesn't track question order.
 */
function assignRanks(items, optionsN) {
  const pool = []
  for (let i = 0; i < items.length; i++) pool.push((i % optionsN) + 1)
  // Deterministic shuffle: order the items by hash and hand out the balanced pool.
  const order = items
    .map((s, i) => ({ i, h: hash(`ccarp-gen-rank:${s.qid}`) }))
    .sort((a, b) => a.h - b.h)
  order.forEach((o, k) => {
    items[o.i].key_length_rank = pool[k]
  })
}
assignRanks(spec.filter((s) => s.format === 'mc'), 4)
assignRanks(spec.filter((s) => s.format === 'mr'), 5)

/* ----------------------------- sanity on the plan ---------------------------- */
const counts = spec.reduce((a, s) => ((a[s.format] = (a[s.format] ?? 0) + 1), a), {})
if (spec.length !== 63) throw new Error(`spec has ${spec.length} questions, expected 63`)
if (counts.mc !== 44 || counts.mr !== 14 || counts.matching !== 5)
  throw new Error(`format mix ${JSON.stringify(counts)} != 44/14/5`)

// The key's rank must be uniform, or we bake in the very tell we are removing.
const rankHits = spec
  .filter((s) => s.format !== 'matching')
  .reduce((a, s) => {
    const isLongest = s.key_length_rank === 1
    const isShortest = s.key_length_rank === s.options_n
    // For mr the assigned rank applies to the first keyed option; both keys share
    // the band, so count the item once.
    a.longest += isLongest ? 1 : 0
    a.shortest += isShortest ? 1 : 0
    a.n++
    return a
  }, { longest: 0, shortest: 0, n: 0 })

const taxonomy = readFileSync(join(ROOT, 'scripts/question-bank-taxonomy.md'), 'utf8')
  .split('## The recurring distractor strategies')[1]
  .split('## Generation rules')[0]
  .trim()

// Chance = sum over items of 1/optionsN. If the assigned plan itself deviates from
// chance, we would be generating the tell we are trying to prevent — so fail here
// rather than spend 190 agents writing a compromised bank.
const chance = spec.filter((s) => s.format !== 'matching').reduce((a, s) => a + 1 / s.options_n, 0)
for (const [what, got] of [
  ['longest', rankHits.longest],
  ['shortest', rankHits.shortest],
]) {
  if (Math.abs(got - chance) > 1.5) {
    throw new Error(
      `plan would key the ${what} option ${got}/${rankHits.n} times; chance is ${chance.toFixed(1)} — assignment is not balanced`,
    )
  }
}
process.stderr.write(
  `plan: 63 questions (${JSON.stringify(counts)}); key is longest on ${rankHits.longest}/${rankHits.n} ` +
    `(${((100 * rankHits.longest) / rankHits.n).toFixed(1)}%), shortest on ${rankHits.shortest}/${rankHits.n} ` +
    `(${((100 * rankHits.shortest) / rankHits.n).toFixed(1)}%); chance = ${chance.toFixed(1)} (${((100 * chance) / rankHits.n).toFixed(1)}%)\n`,
)

/* -------------------------------- emit script -------------------------------- */

const SCRIPT = `export const meta = {
  name: 'generate-ccarp-bank',
  description: 'Generate 63 original CCA-P questions at blueprint weights, with the answer key and its length rank pinned centrally, then verify each by blind expert cold-solve',
  phases: [
    { title: 'Write', detail: 'one agent per question, to an assigned objective/format/key/length-rank' },
    { title: 'Solve', detail: 'independent expert cold-solves it blind — must land on the assigned key' },
    { title: 'Critique', detail: 'adversarial check: is there exactly ONE best answer, and any surface tell?' },
  ],
}

// Baked in by scripts/gen-ccarp-workflow.mjs — NOT passed via args, which does not
// reach the script and which agents then silently paper over.
const SPEC = ${JSON.stringify(spec, null, 2)}

const TAXONOMY = ${JSON.stringify(taxonomy)}

const WRITE_SCHEMA = {
  type: 'object',
  required: ['qid', 'text', 'explanation'],
  properties: {
    qid: { type: 'string' },
    text: { type: 'string', description: 'the stem' },
    options: {
      type: 'array',
      description: 'mc/mr only',
      items: {
        type: 'object',
        required: ['label', 'text', 'explanation'],
        properties: {
          label: { type: 'string' },
          text: { type: 'string' },
          explanation: { type: 'string', description: 'why THIS option is right or wrong' },
        },
      },
    },
    matching: {
      type: 'object',
      description: 'matching only',
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
    explanation: { type: 'string', description: 'overall rationale naming why the key wins and why the others lose' },
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
    unique_best_answer: { type: 'boolean', description: 'exactly one option (or one keyed set) is best' },
    guessable_without_knowledge: {
      type: 'boolean',
      description: 'true only if a NAMEABLE surface cue gives it away',
    },
    surface_cue: { type: 'string', description: 'name the cue, or "" if none' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

const rankWord = (r, n) =>
  r === 1 ? 'the LONGEST' : r === n ? 'the SHORTEST' : \`rank \${r} of \${n} by length (\${r - 1} option(s) longer, \${n - r} shorter)\`

phase('Write')

const results = await pipeline(
  SPEC,

  (s) =>
    agent(
      s.format === 'matching'
        ? \`Write ONE original scenario-matching item for the CCA-P exam (Claude Certified Architect – Professional).

DOMAIN: \${s.domain_name}
OBJECTIVE IT MUST TEST: \${s.objective}
FORMAT: scenario matching — \${s.rows} short scenarios, each classified against ONE shared option set of \${s.option_set_size} choices.

THE FORMAT'S DEFINING PROPERTY: options may be used MORE THAN ONCE across rows. Do NOT make it a one-to-one mapping — at least one option must key two different rows, and it is fine if an option keys none. A candidate who assumes a permutation must get it wrong.

RULES:
- Each row is 1-2 sentences describing a concrete production situation, and must be classifiable on the engineering merits alone.
- The option set is a small, parallel taxonomy (e.g. "prompt failure · hallucination · model mismatch · retrieval failure"), stated in the stem.
- Rows must be discriminating: a reader who knows the domain lands on one answer; a reader who doesn't cannot pattern-match from wording. Do NOT echo an option's vocabulary in the row that keys to it — that is a giveaway.
- \\\`explanation\\\` walks EVERY row, saying why it lands where it does.
- Return \\\`qid\\\` exactly as "\${s.qid}", the \\\`matching\\\` object (option_set + rows, each row's \\\`correct\\\` copied VERBATIM from option_set), and the stem in \\\`text\\\`.\`
        : \`Write ONE original question for the CCA-P exam (Claude Certified Architect – Professional). It must read like a real exam item, not a quiz question.

DOMAIN: \${s.domain_name}
OBJECTIVE IT MUST TEST: \${s.objective}
FORMAT: \${s.format === 'mr' ? \`multiple response — \${s.options_n} options (A-\${String.fromCharCode(64 + s.options_n)}), the candidate selects exactly \${s.select_count}\` : \`multiple choice — \${s.options_n} options (A-D), the candidate selects ONE\`}

**THE CORRECT ANSWER MUST BE: \${s.correct.join(' and ')}.** Assigned centrally to keep the answer key balanced across positions. Write the item so that letter\${s.correct.length > 1 ? 's are' : ' is'} genuinely correct — do not renumber.

**LENGTH CONSTRAINT — read this twice.** The keyed option\${s.correct.length > 1 ? 's' : ''} must end up \${rankWord(s.key_length_rank, s.options_n)}.
This is assigned by hash, uniformly, and it is not negotiable. Here is why it matters more than it looks: the imported practice set for this exam keys the longest option **91% of the time**, and this trainer's other bank was at **97.6%** before it was rewritten. Both were written by capable models that were asked to "keep option lengths balanced" and believed they had. A knowledge-free candidate scores ~90% on such a bank by picking the longest option. **Count your characters before you return.** \${s.key_length_rank === 1 ? 'Here the key IS meant to be longest — that is fine, it happens at chance; keep it only slightly longest, not a beacon.' : 'Here the key must NOT be the longest — so a DISTRACTOR carries the most detail.'}
Keep the whole set inside a natural band: longest <= ~1.35x shortest.

STEM RULES:
- **Ground it in a production observation** before asking anything: "Production logs show…", "After the third sprint…", "In 12% of cases…", "The client's security review flagged…". Include a concrete number, tool, or detail.
- Ask for a superlative judgement: "most effective", "most likely root cause", "best first step", "which TWO most strongly…". CCA-P is about judgement — which pattern, which trade-off, which control, and why — not API trivia.
- Do NOT telegraph ("Following Anthropic's guidance on X…"). Do not name the principle you want back.

OPTION RULES — this is what separates a real exam item from a quiz:
- **One BEST answer among plausible competitors — NOT one defensible answer.** 2-3 options should look reasonable, and a knowledgeable reader must reason about THIS scenario to pick the best. "Only one option is even defensible" is the definition of an obvious question.
- Every distractor must be **something a competent engineer would actually propose here**, wrong only for a subtle, scenario-specific reason. If you cannot write a convincing one-sentence "why a smart person would pick this", it is a strawman — rewrite it.
- **No tells.** Ban self-incriminating phrasing ("silently", "as if it succeeded", "regardless", "hard-code", "ignore", "always", "never"). The key must not recite the rubric or name the principle. Do not make the key the most hedged or most qualified option. Options must be grammatically parallel and comparable in specificity — a distractor should carry code/identifiers/numbers just as readily as the key.
- Each option needs its own \\\`explanation\\\`: for the key, why it wins; for a distractor, the specific reason it loses. The overall \\\`explanation\\\` names every letter.

Pick 2-3 of these documented reasons a distractor can be wrong — vary them, don't reuse the same ones:
\${TAXONOMY}

Return \\\`qid\\\` exactly as "\${s.qid}", all \${s.options_n} options with labels A-\${String.fromCharCode(64 + s.options_n)}, and a \\\`difficulty\\\` + short \\\`topic\\\`.\`,
      { label: \`write:\${s.qid}\`, phase: 'Write', schema: WRITE_SCHEMA, model: 'sonnet' },
    ).then((w) => ({ s, written: w })),

  // Blind cold-solve. Per the project's own hard-won rule, this is the reliable
  // gate: an expert reasoning fully, with no sight of the key, must land on it.
  // (The "can a naive reader guess it" probe is advisory — it cannot suppress its
  // own knowledge and over-flags.)
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

Answer as a Claude solutions architect on the engineering merits. Return \\\`answer\\\` as one array entry per row, in order, each copied verbatim from the option set.\`,
        { label: \`solve:\${s.qid}\`, phase: 'Solve', schema: SOLVE_SCHEMA, model: 'sonnet' },
      ).then((v) => ({ ...prev, solved: v }))
    }
    const opts = (w.options ?? []).map((o) => \`\${o.label}. \${o.text}\`).join('\\n')
    return agent(
      \`You are a Claude solutions architect sitting a certification exam. Answer on the engineering merits.

\${w.text}

\${opts}

\${s.format === 'mr' ? \`Select exactly \${s.select_count}.\` : 'Select ONE.'}

Reason from your own knowledge of Claude, the Anthropic API, agentic architecture, RAG, evaluation, safety, governance and delivery practice. Do NOT reason from test-taking cues (length, hedging, which sounds most "best-practice") — judge the engineering.\`,
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
            .map((o) => \`\${o.label}. \${o.text}\${s.correct.includes(o.label) ? '   <-- KEYED CORRECT' : ''}\`)
            .join('\\n')
    return agent(
      \`Adversarially critique this draft CCA-P exam question. Try to break it.

STEM: \${w.text}

\${body}

RATIONALE: \${w.explanation}

Judge two things:
1. **unique_best_answer** — is exactly one option (or, for multiple-response, exactly the keyed set) genuinely the best? Set FALSE if a distractor is equally defensible, if two options are both correct, if the key is arguable, or if a keyed option is actually wrong. Be harsh: this is the check that matters.
2. **guessable_without_knowledge** — could a test-wise candidate with ZERO domain knowledge reliably pick the key from surface cues alone? Set TRUE **only if you can NAME the specific cue** (e.g. "the key is the only option that isn't absolutist", "the key is 40 chars longer than every distractor", "the key is the only one echoing the stem's vocabulary", "every distractor contains a self-incriminating word"). If you had to use domain knowledge to find the answer, that is a PASS — set FALSE. Do not flag a question merely for being answerable by someone who knows the material; that is what an exam is.

Also flag: strawman distractors a competent engineer would never propose, a stem that telegraphs its answer, or an option set that isn't grammatically parallel.\`,
      { label: \`critique:\${s.qid}\`, phase: 'Critique', schema: CRITIQUE_SCHEMA, model: 'sonnet' },
    ).then((c) => ({ ...prev, critique: c }))
  },
)

const done = results.filter(Boolean)
const setEq = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && [...a].sort().join('|') === [...b].sort().join('|')

const items = done.map((r) => {
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
    // Ordered compare for matching (position = row); set compare for mc/mr.
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

log(
  \`wrote \${items.filter((i) => i.written).length}/63; solver agreed \${items.filter((i) => i.solver_agrees).length}; unique-best \${items.filter((i) => i.unique_best_answer).length}; flagged guessable \${items.filter((i) => i.guessable).length}\`,
)

return { count: items.length, items }
`

process.stdout.write(SCRIPT)
