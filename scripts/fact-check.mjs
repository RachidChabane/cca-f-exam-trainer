#!/usr/bin/env node
/**
 * Automated fact-check for the CCA-F Exam Trainer.
 *
 *   node scripts/fact-check.mjs
 *
 * Where check-data.mjs validates the *schema* of the content, this validates the
 * *facts*: it pins the authoritative, first-party CCA-F exam parameters (verified
 * against Anthropic's official "Claude Certified Architect — Foundations
 * Certification Exam Guide") and fails the build if the blueprint, the app's
 * scenario data, or the README drift away from them — including the scenario-set
 * structure (4 of 6 themes per sitting, each framing a 15-question set).
 *
 * It also enforces the trainer's honesty guarantee: the soft, community-reported
 * numbers (60 questions, 120 min, $99, "301") must stay *labeled* as
 * community-reported and never be presented as first-party fact.
 *
 * Exits non-zero on any violation. No network, no secrets — pure and
 * deterministic, so it is safe to run on every CI build.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/* ----------------------- authoritative (first-party) ----------------------- */
// Verified June 2026 against the official CCA-F exam guide. Editing these numbers
// should be a deliberate act backed by a primary source — that is the point of
// this gate.
const OFFICIAL = {
  // The five domains, in the official exam-guide order, with their exact weights.
  domainOrder: [
    'agentic_architecture',
    'tool_design_mcp',
    'claude_code',
    'prompt_engineering',
    'context_management',
  ],
  weightPct: {
    agentic_architecture: 27,
    tool_design_mcp: 18,
    claude_code: 20,
    prompt_engineering: 20,
    context_management: 15,
  },
  scaledScore: { min: 100, max: 1000, pass: 720 },
  optionsPerQuestion: 4,
  correctAnswersPerQuestion: 1,
  scenarios: { countPresented: 4, pool: 6 },
  scenarioThemes: [
    'Customer Support Resolution Agent',
    'Code Generation with Claude Code',
    'Multi-Agent Research System',
    'Developer Productivity with Claude',
    'Claude Code for Continuous Integration',
    'Structured Data Extraction',
  ],
  // The trainer's faithful reconstruction of the scenario-set structure. The
  // per-scenario split is the largest-remainder rounding of the weights to 15;
  // it is a simulation choice (documented), not an official number — but it must
  // stay internally consistent, which is what these checks enforce.
  perScenarioSplit: {
    agentic_architecture: 4,
    tool_design_mcp: 3,
    claude_code: 3,
    prompt_engineering: 3,
    context_management: 2,
  },
  questionsPerScenario: 15,
  instancesPerTheme: 4,
  // Theme ids used in data/scenarios.json (must match src/scenarios.ts).
  themeIds: [
    'customer_support',
    'code_generation',
    'multi_agent_research',
    'developer_productivity',
    'continuous_integration',
    'structured_extraction',
  ],
  // Numbers that are NOT in the official guide and must stay labeled as such.
  communityReportedKeywords: ['question_count', 'time_limit_minutes', 'fee_usd', 'proctored', 'level'],
}

const errors = []
const passed = []
const err = (m) => errors.push(m)
const ok = (m) => passed.push(m)
function check(cond, msg) {
  if (cond) ok(msg)
  else err(msg)
}

function readJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'))
}
function readText(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

let blueprint, scenarios, scenariosSrc, readme
try {
  blueprint = readJson('resources/blueprint.json')
  scenarios = readJson('data/scenarios.json')
  scenariosSrc = readText('src/scenarios.ts')
  readme = readText('README.md')
} catch (e) {
  console.error(`fact-check: cannot read inputs — ${e.message}`)
  process.exit(1)
}

const exam = blueprint.exam ?? {}
const mech = exam.mechanics ?? {}

/* ------------------------- 1. mechanics / scoring -------------------------- */
check(mech.options_per_question === OFFICIAL.optionsPerQuestion, `mechanics: 4 options per question`)
check(
  mech.correct_answers_per_question === OFFICIAL.correctAnswersPerQuestion,
  `mechanics: exactly 1 correct answer per question`,
)
check(mech.scaled_score?.min === OFFICIAL.scaledScore.min, `scoring: scaled-score floor is 100`)
check(mech.scaled_score?.max === OFFICIAL.scaledScore.max, `scoring: scaled-score ceiling is 1000`)
check(mech.scaled_score?.pass === OFFICIAL.scaledScore.pass, `scoring: pass mark is 720`)
check(
  exam.scoring_model?.pass_scaled === OFFICIAL.scaledScore.pass,
  `scoring: scoring_model.pass_scaled agrees (720)`,
)

/* ------------------------------ 2. domains -------------------------------- */
const domains = Array.isArray(blueprint.domains) ? blueprint.domains : []
const keysInOrder = domains.map((d) => d.key)
check(
  JSON.stringify(keysInOrder) === JSON.stringify(OFFICIAL.domainOrder),
  `domains: 5 keys present in the official order [${OFFICIAL.domainOrder.join(', ')}]`,
)
let weightSum = 0
for (const key of OFFICIAL.domainOrder) {
  const d = domains.find((x) => x.key === key)
  if (!d) {
    err(`domains: "${key}" missing from blueprint`)
    continue
  }
  const pct = Math.round(d.weight * 100)
  weightSum += pct
  check(pct === OFFICIAL.weightPct[key], `domains: ${key} weight is ${OFFICIAL.weightPct[key]}%`)
}
check(weightSum === 100, `domains: weights sum to 100% (got ${weightSum}%)`)

/* --------------------------- 3. scenario structure ------------------------ */
const sc = exam.scenarios ?? {}
check(sc.count_presented === OFFICIAL.scenarios.countPresented, `scenarios: 4 presented per sitting`)
check(sc.pool === OFFICIAL.scenarios.pool, `scenarios: fixed pool of 6 themes`)
check(sc.instances_per_theme === OFFICIAL.instancesPerTheme, `scenarios: ${OFFICIAL.instancesPerTheme} instances per theme`)
check(sc.questions_per_scenario === OFFICIAL.questionsPerScenario, `scenarios: ${OFFICIAL.questionsPerScenario} questions per scenario`)
check(
  Array.isArray(sc.themes) && sc.themes.length === OFFICIAL.scenarios.pool,
  `scenarios: blueprint lists exactly 6 themes`,
)
for (const theme of OFFICIAL.scenarioThemes) {
  check(Array.isArray(sc.themes) && sc.themes.includes(theme), `scenarios: blueprint includes theme "${theme}"`)
  check(scenariosSrc.includes(theme), `scenarios: src/scenarios.ts carries theme "${theme}"`)
}
// The per-scenario split must equal the official weights' largest-remainder
// rounding to 15, and a 4-scenario sitting must hit the question_count.
const split = sc.per_scenario_domain_split ?? {}
let splitSum = 0
for (const key of OFFICIAL.domainOrder) {
  splitSum += split[key] ?? 0
  check(split[key] === OFFICIAL.perScenarioSplit[key], `scenarios: per-scenario split for ${key} is ${OFFICIAL.perScenarioSplit[key]}`)
}
check(splitSum === OFFICIAL.questionsPerScenario, `scenarios: per-scenario split sums to 15 (got ${splitSum})`)
check(
  sc.count_presented * sc.questions_per_scenario === mech.question_count,
  `scenarios: 4 scenarios × 15 = question_count (${sc.count_presented * sc.questions_per_scenario} vs ${mech.question_count})`,
)

/* --------------- 4. honesty: community-reported stays labeled --------------- */
const msrc = exam.mechanics_source ?? {}
const community = Array.isArray(msrc.community_reported) ? msrc.community_reported.join(' | ').toLowerCase() : ''
const firstParty = Array.isArray(msrc.first_party) ? msrc.first_party.join(' | ').toLowerCase() : ''
check(community.length > 0, `honesty: mechanics_source.community_reported is present`)
check(firstParty.length > 0, `honesty: mechanics_source.first_party is present`)
for (const kw of OFFICIAL.communityReportedKeywords) {
  check(community.includes(kw), `honesty: "${kw}" is labeled community-reported`)
  check(!firstParty.includes(kw), `honesty: "${kw}" is NOT claimed as first-party`)
}
check(
  firstParty.includes('scaled') && firstParty.includes('720'),
  `honesty: scaled scoring + 720 pass mark claimed as first-party`,
)
check(/community-reported/i.test(readme), `honesty: README keeps the EN community-reported disclaimer`)
check(/rapport[eé]s? par la communaut[eé]/i.test(readme), `honesty: README keeps the FR community-reported disclaimer`)

/* --------------------- 5. data ↔ blueprint consistency -------------------- */
const counts = blueprint.session?.domain_session_counts ?? {}
const sessionSum = OFFICIAL.domainOrder.reduce((s, k) => s + (counts[k] ?? 0), 0)
check(
  sessionSum === mech.question_count,
  `consistency: per-domain session counts sum to question_count (${sessionSum} vs ${mech.question_count})`,
)

// scenarios.json must realise the structure the blueprint describes.
if (!Array.isArray(scenarios)) {
  err('consistency: data/scenarios.json is not an array')
} else {
  const byTheme = {}
  const poolByDomain = {}
  let badSplits = 0
  for (const s of scenarios) {
    byTheme[s.theme] = (byTheme[s.theme] ?? 0) + 1
    const sp = {}
    for (const q of s.questions ?? []) {
      poolByDomain[q.domain] = (poolByDomain[q.domain] ?? 0) + 1
      sp[q.domain] = (sp[q.domain] ?? 0) + 1
    }
    for (const key of OFFICIAL.domainOrder) {
      if ((sp[key] ?? 0) !== OFFICIAL.perScenarioSplit[key]) badSplits++
    }
  }
  check(
    scenarios.length === OFFICIAL.scenarios.pool * OFFICIAL.instancesPerTheme,
    `consistency: scenarios.json has ${OFFICIAL.scenarios.pool * OFFICIAL.instancesPerTheme} scenarios (got ${scenarios.length})`,
  )
  for (const t of OFFICIAL.themeIds) {
    check(byTheme[t] === OFFICIAL.instancesPerTheme, `consistency: theme "${t}" has ${OFFICIAL.instancesPerTheme} instances (got ${byTheme[t] ?? 0})`)
  }
  check(badSplits === 0, `consistency: every scenario follows the 4/3/3/3/2 domain split`)
  // Every domain's flattened pool must clear its weighted target.
  for (const d of domains) {
    const have = poolByDomain[d.key] ?? 0
    check(have >= (d.pool_target ?? 0), `consistency: ${d.key} pool ${have} ≥ target ${d.pool_target}`)
  }
}

/* ------------------------------- report ----------------------------------- */
console.log(`fact-check: ${passed.length} checks passed`)
if (errors.length) {
  console.log(`\n${errors.length} FACT-CHECK FAILURE(S):`)
  for (const e of errors) console.log(`  ✗ ${e}`)
  process.exit(1)
}
console.log('All CCA-F facts verified against the official exam guide. ✓')
