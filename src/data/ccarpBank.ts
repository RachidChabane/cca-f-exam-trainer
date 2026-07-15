import bankRaw from '@data/ccarp_bank.json'
import { CCARP_DOMAINS } from '@/data/ccarpBlueprint'
import type { BiList, CcarpDomainKey, Question, QuestionFormat } from '@/types'

/**
 * The CCA-P question bank, adapted into the runtime `Question` shape so the exam
 * runner, timer, scoring, navigator and review present it with no special-casing.
 *
 * Provenance is first-class, exactly as in the CCA-F bank:
 *  - `official`     — the 63 questions of the imported practice set. Note these
 *                     are one architect's originals written against the public
 *                     exam guide, NOT live exam items, and their answer options
 *                     have been length-rebalanced (see scripts/import-ccarp-bank.mjs
 *                     and the hardening note below).
 *  - `ai_generated` — original questions written to the same blueprint weights and
 *                     the trap taxonomy, gated by scripts/check-tells.mjs.
 * The two are exposed as separate sittings and never mixed, so you always know
 * which bank you are practising.
 *
 * Language: the source is English-only. `fr` mirrors `en` for now rather than
 * shipping a machine translation that would drift from the technical vocabulary;
 * a French overlay can join here later exactly as question_bank_fr.json does.
 */

export type CcarpSource = 'official' | 'ai_generated'

interface RawOption {
  label: string
  text: string
  explanation?: string
}

interface RawMatching {
  option_set: string[]
  rows: { text: string; correct: string }[]
}

interface RawQuestion {
  id: string
  srcId?: string
  source: CcarpSource
  domain: CcarpDomainKey
  format: QuestionFormat
  select_count: number
  text: string
  options: RawOption[]
  correct: string[]
  matching?: RawMatching
  explanation: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface RawBank {
  meta: { counts: Record<string, number> }
  questions: RawQuestion[]
}

const BANK = bankRaw as unknown as RawBank
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** en/fr both hold the English source — see the language note above. */
const mono = (s: string) => ({ en: s, fr: s })
const monoList = (xs: string[]): BiList => ({ en: xs, fr: xs })

const DOMAIN_NAME = Object.fromEntries(CCARP_DOMAINS.map((d) => [d.key, d.name])) as Record<
  CcarpDomainKey,
  { en: string; fr: string }
>

function toQuestion(q: RawQuestion): Question {
  if (q.format === 'matching' && q.matching) {
    // A matching item's "options" ARE the shared option set, and `correct` holds
    // one option index per row — positionally aligned with `rows`. Values repeat
    // when two rows key to the same option, which the real format allows.
    const optionSet = q.matching.option_set
    const byText = new Map(optionSet.map((t, i) => [t.toLowerCase().trim(), i]))
    return {
      id: q.id,
      exam: 'ccarp',
      domain: q.domain,
      format: 'matching',
      stem: mono(q.text),
      options: monoList(optionSet),
      rows: monoList(q.matching.rows.map((r) => r.text)),
      correct: q.matching.rows.map((r) => byText.get(r.correct.toLowerCase().trim()) ?? -1),
      explanation: mono(q.explanation),
      // Matching items key per row, so there is no per-option rebuttal to show;
      // the overall explanation walks every row.
      distractor_explanations: monoList(optionSet.map(() => '')),
      scenarioTitle: DOMAIN_NAME[q.domain],
    }
  }

  const opts = [...q.options].sort((a, b) => LETTERS.indexOf(a.label) - LETTERS.indexOf(b.label))
  const correct = q.correct.map((c) => opts.findIndex((o) => o.label === c)).filter((i) => i >= 0)
  return {
    id: q.id,
    exam: 'ccarp',
    domain: q.domain,
    format: q.format,
    select_count: q.format === 'mr' ? q.select_count : 1,
    stem: mono(q.text),
    options: monoList(opts.map((o) => o.text)),
    correct,
    explanation: mono(q.explanation),
    // The imported set carries one combined rationale ("...Why not the others: A
    // ..., B ...") rather than a rebuttal per option, so the per-option slots stay
    // empty and the runner falls back to the overall explanation. Generated items
    // fill these in.
    distractor_explanations: monoList(opts.map((o, i) => (correct.includes(i) ? '' : (o.explanation ?? '')))),
    scenarioTitle: DOMAIN_NAME[q.domain],
  }
}

const build = (source: CcarpSource): Question[] =>
  BANK.questions.filter((q) => q.source === source).map(toQuestion)

export const CCARP_OFFICIAL: Question[] = build('official')
export const CCARP_GENERATED: Question[] = build('ai_generated')

export const CCARP_COUNTS = {
  official: CCARP_OFFICIAL.length,
  ai_generated: CCARP_GENERATED.length,
}

/** Item-format mix across the whole bank — shown on the intro card so the three
 * formats (and that this exam has multi-answer items at all) are visible before
 * you start, not discovered mid-sitting. */
export const CCARP_FORMAT_COUNTS = [...CCARP_OFFICIAL, ...CCARP_GENERATED].reduce(
  (acc, q) => {
    acc[q.format]++
    return acc
  },
  { mc: 0, mr: 0, matching: 0 } as Record<QuestionFormat, number>,
)
