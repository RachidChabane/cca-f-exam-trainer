import bankRaw from '@data/question_bank.json'
import bankFrRaw from '@data/question_bank_fr.json'
import type { Bi, BiList, DomainKey, ScenarioSet } from '@/types'

/**
 * The imported source question bank + its AI-generated siblings, adapted into the
 * exam's `ScenarioSet` shape so the existing exam runner, scoring, navigator, and
 * review can present them with zero special-casing.
 *
 * Provenance is first-class: every bank question carries `source: "official"`
 * (imported verbatim from the source bank) or `source: "ai_generated"` (original
 * questions written to mimic the same concepts/traps — see
 * scripts/question-bank-taxonomy.md). The two provenances are exposed as separate
 * sittings (`OFFICIAL_BANK_SETS` / `GENERATED_BANK_SETS`) and never mixed, so a
 * candidate always knows which bank they are practising.
 *
 * Note on language: the bank is bilingual. The English in question_bank.json is
 * the verbatim source of truth; the natural (meaning-preserving, not word-for-word)
 * French lives in a separate overlay, question_bank_fr.json, keyed by id. The
 * adapter joins them — `fr` falls back to `en` for any key the overlay is missing —
 * so importing verbatim never required translating in place.
 */

export type BankSource = 'official' | 'ai_generated'

interface BankRawQuestion {
  id: number
  scenarioId: number
  source: BankSource
  domain: DomainKey
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  text: string
  options: { label: string; text: string; explanation: string }[]
  correct: string
  explanation: string
  siblingOf?: number
}

interface BankRawScenario {
  id: number
  name: string
  slug: string
  description: string
  source: string
}

interface BankRaw {
  meta: { description: string; counts: Record<string, number> }
  scenarios: BankRawScenario[]
  questions: BankRawQuestion[]
}

/** French overlay (question_bank_fr.json): natural translations keyed by id. */
interface BankFrQuestion {
  text: string
  options: { label: string; text: string; explanation: string }[]
  explanation: string
}
interface BankFr {
  scenarios: Record<string, { name: string; description: string }>
  questions: Record<string, BankFrQuestion>
}

const BANK = bankRaw as BankRaw
const BANK_FR = bankFrRaw as BankFr

/** Scenario id → the trainer's fixed scenario-theme id (see src/scenarios.ts).
 * 1/11/3/16 are the source bank's covered themes; 901/902 are the two invented
 * scenarios for the themes the source never covered (ai_generated only). */
const THEME_BY_SCENARIO_ID: Record<number, string> = {
  1: 'customer_support',
  11: 'code_generation',
  3: 'multi_agent_research',
  16: 'continuous_integration',
  901: 'developer_productivity',
  902: 'structured_extraction',
}

/** Stable presentation order; scenarios absent for a given provenance are skipped. */
const SCENARIO_ORDER = [1, 11, 3, 16, 901, 902]

const LETTERS = ['A', 'B', 'C', 'D']

/** Pair an English string with its French rendering (falling back to English). */
const bi = (en: string, fr?: string): Bi => ({ en, fr: fr && fr.length ? fr : en })
const biList = (en: string[], fr?: (string | undefined)[]): BiList => ({
  en,
  fr: en.map((s, i) => (fr && fr[i] && fr[i]!.length ? fr[i]! : s)),
})

/** Light HTML → markdown for the scenario descriptions (only <p>/<strong>/<code>
 * appear in the source), so the Markdown renderer shows them cleanly. */
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<\/?p>/gi, '')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<\/?b>/gi, '**')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<[^>]+>/g, '')
    .trim()
}

const SCENARIO_BY_RAW_ID = new Map(BANK.scenarios.map((s) => [s.id, s]))

/** Convert one bank question into a bilingual ScenarioSet question, joining the
 * verbatim English with the French overlay (per-field fallback to English). */
function toScenarioQuestion(q: BankRawQuestion) {
  // Options sorted by their A–D label so option order is deterministic.
  const opts = [...q.options].sort((a, b) => LETTERS.indexOf(a.label) - LETTERS.indexOf(b.label))
  const correctIdx = Math.max(0, LETTERS.indexOf(q.correct))
  const fr = BANK_FR.questions[String(q.id)]
  const frByLabel = new Map((fr?.options ?? []).map((o) => [o.label, o]))
  // distractor_explanations align by index; the correct slot is "" by convention
  // (the overall `explanation` covers the correct answer).
  const distractorsEn = opts.map((o, i) => (i === correctIdx ? '' : o.explanation))
  const distractorsFr = opts.map((o, i) =>
    i === correctIdx ? '' : frByLabel.get(o.label)?.explanation,
  )
  return {
    id: `${q.source === 'official' ? 'off' : 'gen'}-${q.id}`,
    domain: q.domain,
    stem: bi(q.text, fr?.text),
    options: biList(
      opts.map((o) => o.text),
      opts.map((o) => frByLabel.get(o.label)?.text),
    ),
    correct_index: correctIdx,
    explanation: bi(q.explanation, fr?.explanation),
    distractor_explanations: biList(distractorsEn, distractorsFr),
  }
}

/** Build the four ScenarioSets for one provenance, in source-scenario order. */
function buildSets(source: BankSource): ScenarioSet[] {
  const sets: ScenarioSet[] = []
  for (const rawId of SCENARIO_ORDER) {
    const scn = SCENARIO_BY_RAW_ID.get(rawId)
    if (!scn) continue
    const questions = BANK.questions
      .filter((q) => q.source === source && q.scenarioId === rawId)
      .sort((a, b) => a.id - b.id)
      .map(toScenarioQuestion)
    if (questions.length === 0) continue
    const domains = [...new Set(questions.map((q) => q.domain))] as DomainKey[]
    const frScn = BANK_FR.scenarios[String(rawId)]
    sets.push({
      id: `${source}-${scn.slug}`,
      theme: THEME_BY_SCENARIO_ID[rawId] ?? scn.slug,
      instance: source === 'official' ? 101 : 201,
      title: bi(scn.name, frScn?.name),
      // English description is HTML (→ markdown); the French overlay is authored
      // as markdown already, so it needs no conversion.
      context: bi(htmlToMarkdown(scn.description), frScn?.description),
      domains,
      questions,
    })
  }
  return sets
}

export const OFFICIAL_BANK_SETS: ScenarioSet[] = buildSets('official')
export const GENERATED_BANK_SETS: ScenarioSet[] = buildSets('ai_generated')

const poolStats = (sets: ScenarioSet[]) => ({
  questions: sets.reduce((n, s) => n + s.questions.length, 0),
  themes: sets.length,
})

export const BANK_COUNTS = {
  official: poolStats(OFFICIAL_BANK_SETS),
  ai_generated: poolStats(GENERATED_BANK_SETS),
}
