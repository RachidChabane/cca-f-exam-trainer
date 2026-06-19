/**
 * Import the source question bank (dev-env/3-formations/claude-CA-F/sources/bank.json)
 * into data/question_bank.json VERBATIM, tagging every imported item with
 * `source: "official"`. No text is altered: question text, every option's text,
 * each option's explanation, the overall explanation, the correct letter,
 * difficulty and topic are all carried across byte-for-byte.
 *
 * The output file is the single home for both the imported ("official") questions
 * and the later AI-generated ("ai_generated") ones — a `source` field on each
 * question keeps the two provenances cleanly distinguished. This script only
 * writes the official import; generated questions are merged in separately so a
 * re-run of the import never clobbers them.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '..')
const SRC = resolve(REPO, '../../3-formations/claude-CA-F/sources/bank.json')
const OUT = resolve(REPO, 'data/question_bank.json')

const src = JSON.parse(readFileSync(SRC, 'utf8'))

// The source carries a free-text `topic`, not the exam's DomainKey. The exam
// runner/scoring/review need a valid DomainKey on every question (they group and
// label by domain), so map each source topic to one of the five domains. This is
// derived metadata — it does not alter any question text.
const TOPIC_TO_DOMAIN = {
  // agentic_architecture — loops, workflows vs agents, orchestration, subagents, escalation
  'Multi-step Workflow Enforcement': 'agentic_architecture',
  'Multi-step Workflow Orchestration': 'agentic_architecture',
  'Agentic Loop Fundamentals': 'agentic_architecture',
  'Agent SDK Hook Patterns': 'agentic_architecture',
  'Self-Evaluation Patterns': 'agentic_architecture',
  'Ambiguous Result Handling': 'agentic_architecture',
  'Escalation Decisions': 'agentic_architecture',
  'Error Propagation': 'agentic_architecture',
  'Multi-Agent Orchestration': 'agentic_architecture',
  'Subagent Delegation Strategy': 'agentic_architecture',
  'Task Decomposition': 'agentic_architecture',
  // tool_design_mcp — tool defs/descriptions, selection, parallel calls, MCP
  'Tool Interface Design': 'tool_design_mcp',
  'Parallel Tool Execution': 'tool_design_mcp',
  'Tool Selection Reliability': 'tool_design_mcp',
  'Tool Distribution': 'tool_design_mcp',
  'MCP Server Integration': 'tool_design_mcp',
  // claude_code — CLAUDE.md, slash commands, skills, plan mode, CI
  'Custom Slash Commands': 'claude_code',
  'Path-Specific Rule Configuration': 'claude_code',
  'CLAUDE.md Configuration Hierarchy': 'claude_code',
  'CLAUDE.md Modular Organization': 'claude_code',
  'Skills vs CLAUDE.md Scope': 'claude_code',
  'Plan Mode vs Direct Execution': 'claude_code',
  'CI/CD Integration': 'claude_code',
  // prompt_engineering — instructions, few-shot, structured output, grading
  'Iterative Refinement': 'prompt_engineering',
  'False Positive Reduction': 'prompt_engineering',
  'Multi-Instance Verification': 'prompt_engineering',
  'Classification Consistency': 'prompt_engineering',
  'Structured Output': 'prompt_engineering',
  'Prompt Specificity': 'prompt_engineering',
  'Few-Shot Prompting': 'prompt_engineering',
  // context_management — context window, caching, batching, long-context effects
  'Conversation Context Management': 'context_management',
  'Long Context Position Effects': 'context_management',
  'Context Provision Methods': 'context_management',
  'Batch Processing': 'context_management',
}

function domainForTopic(topic) {
  const d = TOPIC_TO_DOMAIN[topic]
  if (!d) throw new Error(`Unmapped topic → domain: "${topic}"`)
  return d
}

// Scenarios: carry name/slug/description verbatim, tag provenance.
const scenarios = src.scenarios.map((s) => ({
  id: s.id,
  name: s.name,
  slug: s.slug,
  description: s.description,
  source: 'official',
}))

// Questions: carry every field verbatim, add `source`. Sorted by id for stable diffs.
const official = Object.values(src.questions)
  .map((q) => ({
    id: q.id,
    scenarioId: q.scenarioId,
    source: 'official',
    domain: domainForTopic(q.topic),
    difficulty: q.difficulty,
    topic: q.topic,
    text: q.text,
    options: q.options.map((o) => ({
      label: o.label,
      text: o.text,
      explanation: o.explanation,
    })),
    correct: q.correct,
    explanation: q.explanation,
  }))
  .sort((a, b) => a.id - b.id)

// Preserve any previously-merged AI-generated questions across re-runs.
let generated = []
if (existsSync(OUT)) {
  try {
    const prev = JSON.parse(readFileSync(OUT, 'utf8'))
    generated = (prev.questions || []).filter((q) => q.source === 'ai_generated')
  } catch {
    /* fresh write */
  }
}

const out = {
  meta: {
    description:
      'CCA-F practice question bank. `source: "official"` items are imported verbatim from the source bank; `source: "ai_generated"` items are original questions written to mimic the same concepts, traps, and style.',
    counts: { official: official.length, ai_generated: generated.length },
  },
  scenarios,
  questions: [...official, ...generated],
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
console.log(
  `wrote ${OUT}: ${scenarios.length} scenarios, ${official.length} official + ${generated.length} ai_generated questions`,
)
