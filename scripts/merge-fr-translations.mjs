/**
 * Build data/question_bank_fr.json — the French overlay for the question bank.
 *
 * Input: a JSON file (default /tmp/fr_translations.json) with the translate
 * workflow's `{ questions: [...], scenarios: [...] }` result. Output is keyed by
 * id so the adapter can look up a French rendering per question/scenario and
 * fall back to English when a key is missing.
 *
 * The English in question_bank.json is the verbatim source of truth and is never
 * touched; this overlay only adds the `fr` side. Validates that every bank
 * question (and all 4 scenarios) has a translation with 4 A–D options.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '..')
const BANK = resolve(REPO, 'data/question_bank.json')
const OUT = resolve(REPO, 'data/question_bank_fr.json')
const INPUT = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : '/tmp/fr_translations.json'

const LETTERS = ['A', 'B', 'C', 'D']
const bank = JSON.parse(readFileSync(BANK, 'utf8'))
const incoming = JSON.parse(readFileSync(INPUT, 'utf8'))
const trQuestions = incoming.questions || []
const trScenarios = incoming.scenarios || []

// Additive: keep any previously-translated entries and overlay the incoming ones,
// so a partial translation run (e.g. only newly-added questions) still produces a
// complete overlay covering the whole bank.
const prior = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { questions: {}, scenarios: {} }

const errors = []

const questions = {}
const trById = new Map(trQuestions.map((q) => [q.id, q]))
for (const q of bank.questions) {
  let tr = trById.get(q.id)
  if (!tr && prior.questions?.[q.id]) {
    // already translated in a prior run — carry it over
    questions[q.id] = prior.questions[q.id]
    continue
  }
  if (!tr) {
    errors.push(`missing FR for question id ${q.id}`)
    continue
  }
  const labels = (tr.options || []).map((o) => o.label).sort().join('')
  if (labels !== 'ABCD') errors.push(`question ${q.id}: FR option labels "${labels}" != ABCD`)
  if (!tr.text) errors.push(`question ${q.id}: empty FR stem`)
  // align options to A–D order so indexes match the English side
  const opts = [...(tr.options || [])].sort((a, b) => LETTERS.indexOf(a.label) - LETTERS.indexOf(b.label))
  for (const o of opts) if (!o.text || !o.explanation) errors.push(`question ${q.id} option ${o.label}: empty FR text/explanation`)
  questions[q.id] = {
    text: tr.text,
    options: opts.map((o) => ({ label: o.label, text: o.text, explanation: o.explanation })),
    explanation: tr.explanation || '',
  }
}

const scenarios = {}
const sById = new Map(trScenarios.map((s) => [s.id, s]))
for (const s of bank.scenarios) {
  const tr = sById.get(s.id)
  if (!tr && prior.scenarios?.[s.id]) {
    scenarios[s.id] = prior.scenarios[s.id]
    continue
  }
  if (!tr) {
    errors.push(`missing FR for scenario id ${s.id}`)
    continue
  }
  if (!tr.name || !tr.description) errors.push(`scenario ${s.id}: empty FR name/description`)
  scenarios[s.id] = { name: tr.name, description: tr.description }
}

if (errors.length) {
  console.error(`FR MERGE VALIDATION FAILED (${errors.length}):`)
  for (const e of errors.slice(0, 40)) console.error('  -', e)
  process.exit(1)
}

const out = {
  meta: { description: 'French overlay for question_bank.json (natural, meaning-preserving translations). English remains the verbatim source of truth; keys missing here fall back to English in the adapter.' },
  scenarios,
  questions,
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
console.log(`wrote ${OUT}: ${Object.keys(questions).length} questions + ${Object.keys(scenarios).length} scenarios translated`)
