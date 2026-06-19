/**
 * Merge AI-generated sibling questions into data/question_bank.json.
 *
 * Input: a JSON file (default /tmp/generated.json) — the `generated` array
 * returned by the generate-cca-f-siblings workflow. Each item:
 *   { siblingOf, scenarioId, domain, difficulty, topic, text,
 *     options: [{label,text,explanation}], correct, explanation, clean, repaired }
 *
 * Output: question_bank.json with `source: "official"` items untouched and the
 * `source: "ai_generated"` items replaced by this batch. Each generated question
 * gets a stable id (100000 + siblingOf) so it is traceable to its source sibling
 * and never collides with the source id space (599–864).
 *
 * Validates every generated item before writing: 4 options labelled A–D, a valid
 * correct letter that maps to one of them, and required fields present.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '..')
const BANK = resolve(REPO, 'data/question_bank.json')
const INPUT = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : '/tmp/generated.json'

const LETTERS = ['A', 'B', 'C', 'D']
const DOMAINS = new Set([
  'agentic_architecture',
  'tool_design_mcp',
  'claude_code',
  'prompt_engineering',
  'context_management',
])

const incoming = JSON.parse(readFileSync(INPUT, 'utf8'))
const list = Array.isArray(incoming) ? incoming : incoming.generated
if (!Array.isArray(list)) throw new Error('No generated array found in input')

const errors = []
const generated = list.map((g, i) => {
  const where = `gen[${i}] (siblingOf ${g.siblingOf})`
  if (!DOMAINS.has(g.domain)) errors.push(`${where}: bad domain "${g.domain}"`)
  if (!['easy', 'medium', 'hard'].includes(g.difficulty))
    errors.push(`${where}: bad difficulty "${g.difficulty}"`)
  if (!Array.isArray(g.options) || g.options.length !== 4)
    errors.push(`${where}: expected 4 options`)
  const labels = (g.options || []).map((o) => o.label).sort().join('')
  if (labels !== 'ABCD') errors.push(`${where}: option labels are "${labels}", expected ABCD`)
  if (!LETTERS.includes(g.correct)) errors.push(`${where}: bad correct "${g.correct}"`)
  for (const o of g.options || []) {
    if (!o.text || !o.explanation) errors.push(`${where}: option ${o.label} missing text/explanation`)
  }
  if (!g.text) errors.push(`${where}: missing stem text`)
  return {
    id: 100000 + Number(g.siblingOf),
    scenarioId: g.scenarioId,
    source: 'ai_generated',
    siblingOf: g.siblingOf,
    domain: g.domain,
    difficulty: g.difficulty,
    topic: g.topic,
    text: g.text,
    options: g.options.map((o) => ({ label: o.label, text: o.text, explanation: o.explanation })),
    correct: g.correct,
    explanation: g.explanation || '',
  }
})

// unique ids
const ids = new Set()
for (const q of generated) {
  if (ids.has(q.id)) errors.push(`duplicate generated id ${q.id} (siblingOf ${q.siblingOf})`)
  ids.add(q.id)
}

if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length}):`)
  for (const e of errors) console.error('  -', e)
  process.exit(1)
}

const bank = JSON.parse(readFileSync(BANK, 'utf8'))
const official = bank.questions.filter((q) => q.source === 'official')
bank.questions = [...official, ...generated]
bank.meta.counts = { official: official.length, ai_generated: generated.length }

writeFileSync(BANK, JSON.stringify(bank, null, 2) + '\n')
console.log(
  `merged ${generated.length} ai_generated questions into ${BANK} (official: ${official.length})`,
)

// summary
const byCorrect = {}
const byDomain = {}
for (const q of generated) {
  byCorrect[q.correct] = (byCorrect[q.correct] || 0) + 1
  byDomain[q.domain] = (byDomain[q.domain] || 0) + 1
}
console.log('correct-letter distribution:', byCorrect)
console.log('domain distribution:', byDomain)
