#!/usr/bin/env node
/**
 * Optional AI-powered fact-check (layer 2).
 *
 *   ANTHROPIC_API_KEY=sk-... node scripts/fact-check-llm.mjs
 *
 * Samples questions from the bank and asks Claude to flag any whose MARKED-correct
 * answer is factually wrong, or whose explanation states a clear factual error
 * about Claude / the API / MCP / Claude Code. This complements the deterministic
 * scripts/fact-check.mjs (which pins exam *parameters*) by sanity-checking the
 * *answer keys* themselves.
 *
 * Behaviour:
 *   - No ANTHROPIC_API_KEY  → prints a notice and exits 0 (CI stays green).
 *   - Findings, default     → prints them as suggestions for human review, exits 0.
 *   - FACT_CHECK_STRICT=1    → exits 1 when anything is flagged (gate mode).
 *
 * Tunables: FACT_CHECK_SAMPLE (default 16), FACT_CHECK_MODEL (default
 * claude-opus-4-8). AI output is advisory — verify against primary sources before
 * editing content.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const KEY = process.env.ANTHROPIC_API_KEY?.trim()
const SAMPLE = Number(process.env.FACT_CHECK_SAMPLE ?? 16)
const MODEL = process.env.FACT_CHECK_MODEL ?? 'claude-opus-4-8'
const STRICT = process.env.FACT_CHECK_STRICT === '1'

if (!KEY) {
  console.log('fact-check:llm — ANTHROPIC_API_KEY not set; skipping the AI fact-check (this is expected).')
  console.log('  Add the secret in CI (or export it locally) to enable an LLM review of the answer keys.')
  process.exit(0)
}

let Anthropic
try {
  ;({ default: Anthropic } = await import('@anthropic-ai/sdk'))
} catch {
  console.log('fact-check:llm — @anthropic-ai/sdk is not installed; skipping. (`npm i -D @anthropic-ai/sdk`)')
  process.exit(0)
}

const LETTERS = ['A', 'B', 'C', 'D']
const questions = JSON.parse(readFileSync(join(root, 'data/questions.json'), 'utf8'))

// Deterministic, even spread across the pool so the same sample re-checks each run.
function sample(arr, n) {
  if (arr.length <= n) return arr.slice()
  const step = arr.length / n
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)])
}
const picked = sample(questions, SAMPLE)

const items = picked.map((q) => ({
  id: q.id,
  domain: q.domain,
  scenario: q.scenario.en,
  question: q.question.en,
  options: q.options.en.map((o, i) => `${LETTERS[i]}. ${o}`),
  marked_correct: `${LETTERS[q.correct_index]}. ${q.options.en[q.correct_index]}`,
  explanation: q.explanation.en,
}))

const tool = {
  name: 'report_fact_check',
  description: 'Report the fact-check verdict for the reviewed questions.',
  input_schema: {
    type: 'object',
    properties: {
      reviewed: { type: 'number', description: 'How many questions you reviewed.' },
      findings: {
        type: 'array',
        description:
          'One entry per question whose MARKED-correct answer is factually wrong, or whose explanation states a clear factual error. Omit questions that are correct.',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            severity: { type: 'string', enum: ['wrong_answer', 'misleading_explanation'] },
            issue: { type: 'string', description: 'What is factually wrong, in one or two sentences.' },
            suggested_correct: {
              type: 'string',
              description: 'Which option (A–D) is actually correct, if the marked one is wrong.',
            },
          },
          required: ['id', 'severity', 'issue'],
        },
      },
    },
    required: ['reviewed', 'findings'],
  },
}

const system =
  'You are a meticulous technical fact-checker for a Claude Certified Architect — Foundations (CCA-F) ' +
  'practice-exam bank. You know Anthropic\'s Claude models, the Messages API, tool use, MCP, Claude Code, ' +
  'prompt engineering, and context management. For each question you are given the options and the answer ' +
  'the bank marks as correct. Flag ONLY questions where the marked answer is factually wrong, or the ' +
  'explanation contains a clear factual error — not stylistic nitpicks or arguable preferences. When in ' +
  'doubt, do not flag. Call the report_fact_check tool exactly once with your verdict.'

console.log(`fact-check:llm — reviewing ${items.length} sampled questions with ${MODEL}…`)

const client = new Anthropic({ apiKey: KEY })

// Stream to avoid request timeouts on longer adaptive-thinking turns.
const stream = client.messages.stream({
  model: MODEL,
  // Generous budget so adaptive thinking can't exhaust the limit before the
  // report_fact_check tool_use is emitted on a long, thinking-heavy turn.
  max_tokens: 16000,
  thinking: { type: 'adaptive' },
  system,
  tools: [tool],
  messages: [
    {
      role: 'user',
      content:
        'Fact-check these CCA-F practice questions. Call report_fact_check with any problems you find.\n\n' +
        JSON.stringify(items, null, 2),
    },
  ],
})

let final
try {
  final = await stream.finalMessage()
} catch (e) {
  console.log(`fact-check:llm — API error (${e?.message ?? e}); skipping without failing the build.`)
  process.exit(0)
}

if (final.stop_reason === 'max_tokens') {
  console.log('fact-check:llm — warning: response hit max_tokens; the verdict may be truncated/incomplete.')
}

const toolUse = final.content.find((b) => b.type === 'tool_use')
if (!toolUse) {
  console.log('fact-check:llm — no structured verdict returned; treating as inconclusive (not failing the build).')
  process.exit(0)
}

const input = toolUse.input ?? {}
const findings = Array.isArray(input.findings) ? input.findings : []
const reviewed = input.reviewed ?? items.length
console.log(`fact-check:llm — model reviewed ${reviewed} questions, ${findings.length} potential issue(s).`)

if (findings.length === 0) {
  console.log('No factual problems flagged by the model. ✓')
  process.exit(0)
}
for (const f of findings) {
  console.log(`\n  • [${f.id}] ${f.severity}`)
  console.log(`    ${f.issue}`)
  if (f.suggested_correct) console.log(`    → suggested correct: ${f.suggested_correct}`)
}
console.log(
  `\nfact-check:llm — ${findings.length} item(s) flagged for HUMAN review. These are AI suggestions, ` +
    'not ground truth; verify against primary sources before changing any answer key.',
)
process.exit(STRICT && findings.length > 0 ? 1 : 0)
