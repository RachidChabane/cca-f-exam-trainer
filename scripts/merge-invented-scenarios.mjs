/**
 * Add the 2 invented-theme scenarios (developer_productivity, structured_extraction)
 * and their 30 AI-generated questions into data/question_bank.json, WITHOUT
 * touching the 60 verbatim `official` questions or the 60 `ai_generated` siblings.
 *
 * These invented questions are `source: "ai_generated"` like the siblings, but
 * carry NO `siblingOf` (they have no official counterpart) — that absence is how
 * they are distinguished from the sibling set.
 *
 *   node scripts/merge-invented-scenarios.mjs [generated.json] [scenarios.json]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '..')
const BANK = resolve(REPO, 'data/question_bank.json')
const GEN = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : '/tmp/invented.json'
const SCN = process.argv[3] ? resolve(process.cwd(), process.argv[3]) : '/tmp/new_scenarios.json'

const LETTERS = ['A', 'B', 'C', 'D']
const DOMAINS = new Set(['agentic_architecture', 'tool_design_mcp', 'claude_code', 'prompt_engineering', 'context_management'])

const incoming = JSON.parse(readFileSync(GEN, 'utf8'))
const list = Array.isArray(incoming) ? incoming : incoming.generated
const scnRaw = JSON.parse(readFileSync(SCN, 'utf8'))
const bank = JSON.parse(readFileSync(BANK, 'utf8'))

const errors = []

// Build the 2 new scenario records (provenance = ai_generated).
const newScenarios = Object.entries(scnRaw).map(([id, s]) => ({
  id: Number(id),
  name: s.name,
  slug: s.slug,
  description: s.description,
  theme: s.theme,
  source: 'ai_generated',
}))
const newScenarioIds = new Set(newScenarios.map((s) => s.id))

const invented = list.map((g, i) => {
  const where = `invented[${i}] (id ${g.id})`
  if (!Number.isInteger(g.id)) errors.push(`${where}: missing integer id`)
  if (!newScenarioIds.has(g.scenarioId)) errors.push(`${where}: scenarioId ${g.scenarioId} not one of the new scenarios`)
  if (!DOMAINS.has(g.domain)) errors.push(`${where}: bad domain "${g.domain}"`)
  if (!['easy', 'medium', 'hard'].includes(g.difficulty)) errors.push(`${where}: bad difficulty`)
  const labels = (g.options || []).map((o) => o.label).sort().join('')
  if (labels !== 'ABCD') errors.push(`${where}: option labels "${labels}" != ABCD`)
  if (!LETTERS.includes(g.correct)) errors.push(`${where}: bad correct "${g.correct}"`)
  for (const o of g.options || []) if (!o.text || !o.explanation) errors.push(`${where}: option ${o.label} empty`)
  if (!g.text) errors.push(`${where}: empty stem`)
  return {
    id: g.id,
    scenarioId: g.scenarioId,
    source: 'ai_generated',
    domain: g.domain,
    difficulty: g.difficulty,
    topic: g.topic,
    text: g.text,
    options: g.options.map((o) => ({ label: o.label, text: o.text, explanation: o.explanation })),
    correct: g.correct,
    explanation: g.explanation || '',
  }
})

// id uniqueness across the whole bank
const allIds = new Set(bank.questions.map((q) => q.id))
for (const q of invented) {
  if (allIds.has(q.id)) errors.push(`duplicate question id ${q.id}`)
  allIds.add(q.id)
}
const existingScnIds = new Set(bank.scenarios.map((s) => s.id))
for (const s of newScenarios) if (existingScnIds.has(s.id)) errors.push(`duplicate scenario id ${s.id}`)

if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length}):`)
  for (const e of errors.slice(0, 40)) console.error('  -', e)
  process.exit(1)
}

bank.scenarios = [...bank.scenarios, ...newScenarios]
bank.questions = [...bank.questions, ...invented]
const official = bank.questions.filter((q) => q.source === 'official').length
const aigen = bank.questions.filter((q) => q.source === 'ai_generated').length
bank.meta.counts = { official, ai_generated: aigen }

writeFileSync(BANK, JSON.stringify(bank, null, 2) + '\n')
console.log(`added ${newScenarios.length} scenarios + ${invented.length} invented questions`)
console.log(`bank now: ${official} official + ${aigen} ai_generated; scenarios: ${bank.scenarios.length}`)
import { default as assert } from 'node:assert'
assert(official === 60, 'official count changed!')
