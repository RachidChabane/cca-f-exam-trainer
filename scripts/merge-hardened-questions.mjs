/**
 * Apply hardened (de-obviousified) generated questions back into
 * data/question_bank.json, in place by id. Only the wording changes — text,
 * the four options (text + explanation), the overall explanation, and topic.
 * id / source / siblingOf / scenarioId / domain / difficulty are preserved, and
 * the correct LETTER must be unchanged (the harden pass keeps every key).
 *
 * The 60 `official` questions are never touched.
 *
 *   node scripts/merge-hardened-questions.mjs [hardened.json]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '..')
const BANK = resolve(REPO, 'data/question_bank.json')
const INPUT = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : '/tmp/hardened.json'

const incoming = JSON.parse(readFileSync(INPUT, 'utf8'))
const list = Array.isArray(incoming) ? incoming : incoming.questions
const bank = JSON.parse(readFileSync(BANK, 'utf8'))
const byId = new Map(bank.questions.map((q) => [q.id, q]))

const errors = []
let applied = 0

for (const h of list) {
  const q = byId.get(h.id)
  if (!q) { errors.push(`id ${h.id} not in bank`); continue }
  if (q.source !== 'ai_generated') { errors.push(`id ${h.id} is ${q.source}, refusing to edit`); continue }
  const labels = (h.options || []).map((o) => o.label).sort().join('')
  if (labels !== 'ABCD') { errors.push(`id ${h.id}: option labels "${labels}" != ABCD`); continue }
  if (h.correct !== q.correct) { errors.push(`id ${h.id}: correct changed ${q.correct} -> ${h.correct} (key must be preserved)`); continue }
  for (const o of h.options) if (!o.text || !o.explanation) errors.push(`id ${h.id} option ${o.label}: empty text/explanation`)
  if (!h.text || !h.explanation) errors.push(`id ${h.id}: empty stem/explanation`)
  const blob = h.text + h.explanation + h.options.map((o) => o.text + o.explanation).join(' ')
  if (/taxonomy\s*#?\d|piège taxonomique/i.test(blob)) errors.push(`id ${h.id}: taxonomy-label leak remains`)
}
if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length}):`)
  for (const e of errors.slice(0, 50)) console.error('  -', e)
  process.exit(1)
}

const order = ['A', 'B', 'C', 'D']
for (const h of list) {
  const q = byId.get(h.id)
  const opts = [...h.options].sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))
  q.text = h.text
  q.options = opts.map((o) => ({ label: o.label, text: o.text, explanation: o.explanation }))
  q.explanation = h.explanation
  if (h.topic) q.topic = h.topic
  applied++
}

const official = bank.questions.filter((q) => q.source === 'official').length
writeFileSync(BANK, JSON.stringify(bank, null, 2) + '\n')
console.log(`hardened ${applied} questions in place; official untouched (${official}); total ${bank.questions.length}`)
import { default as assert } from 'node:assert'
assert(official === 60, 'official count changed!')
