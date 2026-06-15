#!/usr/bin/env node
/**
 * Validates data/scenarios.json and data/courses.json against the schema
 * invariants required by the CCA-F Exam Trainer's scenario-set model.
 *
 *   node scripts/check-data.mjs
 *
 * The exam is scenario-based: a fixed pool of 6 themes, several instances each,
 * every scenario framing a SET of linked questions that share one dense context.
 * A sitting draws 4 of the 6 themes (one instance each) → ~60 questions.
 *
 * Exits non-zero if any invariant is violated. Safe to run after adding your own
 * scenarios or courses.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const DOMAINS = [
  'agentic_architecture',
  'claude_code',
  'prompt_engineering',
  'tool_design_mcp',
  'context_management',
]
// The six fixed scenario themes (ids) of the official exam.
const THEMES = [
  'customer_support',
  'code_generation',
  'multi_agent_research',
  'developer_productivity',
  'continuous_integration',
  'structured_extraction',
]
// Every scenario's 15 questions follow this per-domain split — the largest-
// remainder rounding of the 27/18/20/20/15 weights to 15 — so any 4-of-6 sitting
// lands on the same ~60-question, weight-matched distribution.
const PER_SCENARIO_SPLIT = {
  agentic_architecture: 4,
  tool_design_mcp: 3,
  claude_code: 3,
  prompt_engineering: 3,
  context_management: 2,
}
const QUESTIONS_PER_SCENARIO = 15
const INSTANCES_PER_THEME = 4
const POOL_TARGET = {
  agentic_architecture: 81,
  claude_code: 60,
  prompt_engineering: 60,
  tool_design_mcp: 54,
  context_management: 45,
}

const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(join(root, rel), 'utf8'))
  } catch (e) {
    err(`Cannot read/parse ${rel}: ${e.message}`)
    return null
  }
}

function isFilledStr(v) {
  return typeof v === 'string' && v.trim().length > 0
}
function isBiStr(v) {
  return v && typeof v === 'object' && isFilledStr(v.en) && isFilledStr(v.fr)
}

// ---------- scenarios.json ----------
const scenarios = readJson('data/scenarios.json')
const domainCounts = Object.fromEntries(DOMAINS.map((d) => [d, 0]))
const themeInstances = Object.fromEntries(THEMES.map((t) => [t, 0]))
let totalQuestions = 0

if (scenarios != null) {
  if (!Array.isArray(scenarios)) {
    err('scenarios.json must be an array')
  } else {
    const scenarioIds = new Set()
    const questionIds = new Set()
    const stems = new Map() // normalized stem -> first id (near-duplicate detector)
    const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ')

    scenarios.forEach((s, i) => {
      const at = `scenarios[${i}]${s && s.id ? ` (id=${s.id})` : ''}`
      if (!s || typeof s !== 'object') return err(`${at}: not an object`)
      if (!isFilledStr(s.id)) err(`${at}: missing id`)
      else if (scenarioIds.has(s.id)) err(`${at}: duplicate scenario id`)
      else scenarioIds.add(s.id)
      if (!THEMES.includes(s.theme)) err(`${at}: invalid theme "${s.theme}"`)
      else themeInstances[s.theme]++
      if (!Number.isInteger(s.instance) || s.instance < 1) err(`${at}: instance must be a positive integer`)
      if (!isBiStr(s.title)) err(`${at}: title must have non-empty en & fr`)
      if (!isBiStr(s.context)) err(`${at}: context must have non-empty en & fr`)
      else if (s.context.en.length < 120 || s.context.fr.length < 120)
        warn(`${at}: context looks thin (<120 chars) — scenarios should be dense`)
      if (!Array.isArray(s.domains) || s.domains.length === 0 || !s.domains.every((d) => DOMAINS.includes(d)))
        err(`${at}: domains must be a non-empty array of valid domain keys`)

      if (!Array.isArray(s.questions)) {
        err(`${at}: questions must be an array`)
        return
      }
      if (s.questions.length !== QUESTIONS_PER_SCENARIO)
        err(`${at}: must have exactly ${QUESTIONS_PER_SCENARIO} questions (has ${s.questions.length})`)

      const split = Object.fromEntries(DOMAINS.map((d) => [d, 0]))
      s.questions.forEach((q, j) => {
        const qat = `${at}.questions[${j}]${q && q.id ? ` (id=${q.id})` : ''}`
        if (!q || typeof q !== 'object') return err(`${qat}: not an object`)
        if (!isFilledStr(q.id)) err(`${qat}: missing id`)
        else if (questionIds.has(q.id)) err(`${qat}: duplicate question id`)
        else questionIds.add(q.id)
        if (!DOMAINS.includes(q.domain)) err(`${qat}: invalid domain "${q.domain}"`)
        else {
          split[q.domain]++
          domainCounts[q.domain]++
          totalQuestions++
        }
        if (!isBiStr(q.stem)) err(`${qat}: stem must have non-empty en & fr`)
        for (const lang of ['en', 'fr']) {
          const opts = q.options && q.options[lang]
          if (!Array.isArray(opts) || opts.length !== 4 || !opts.every(isFilledStr))
            err(`${qat}: options.${lang} must be 4 non-empty strings`)
          else if (new Set(opts.map(norm)).size !== opts.length)
            err(`${qat}: options.${lang} has duplicate option text`)
          const de = q.distractor_explanations && q.distractor_explanations[lang]
          if (!Array.isArray(de) || de.length !== 4 || !de.every(isFilledStr))
            err(`${qat}: distractor_explanations.${lang} must be 4 non-empty strings`)
        }
        if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3)
          err(`${qat}: correct_index must be an integer in [0,3]`)
        if (!isBiStr(q.explanation)) err(`${qat}: explanation must have non-empty en & fr`)
        // Near-duplicate detector across all questions (by stem).
        if (isBiStr(q.stem)) {
          const key = norm(q.stem.en)
          if (stems.has(key)) warn(`${qat}: near-duplicate stem of ${stems.get(key)}`)
          else stems.set(key, q.id)
        }
      })

      // Per-scenario domain split must match exactly, so every 4-of-6 sitting is weight-correct.
      for (const d of DOMAINS) {
        if (split[d] !== PER_SCENARIO_SPLIT[d])
          err(`${at}: domain split for ${d} is ${split[d]}, expected ${PER_SCENARIO_SPLIT[d]}`)
      }
    })

    console.log(`scenarios.json: ${scenarios.length} scenarios, ${totalQuestions} questions`)
    for (const t of THEMES) {
      const got = themeInstances[t]
      const flag = got === INSTANCES_PER_THEME ? 'ok' : got >= 1 ? `${got} instance(s)` : 'MISSING'
      const line = `  ${t.padEnd(24)} ${String(got).padStart(2)} instance(s)  ${flag}`
      if (got < 1) err(`theme "${t}" has no scenarios`)
      else if (got !== INSTANCES_PER_THEME) warn(line.trim())
      console.log(line)
    }
    console.log('  per-domain pool (flattened):')
    for (const d of DOMAINS) {
      const got = domainCounts[d]
      const target = POOL_TARGET[d]
      const flag = got >= target ? 'ok (>= target)' : 'BELOW target'
      const line = `    ${d.padEnd(22)} ${String(got).padStart(4)} / ${target}  ${flag}`
      if (got < target) warn(line.trim())
      console.log(line)
    }
    if (scenarios.length < THEMES.length) warn(`only ${scenarios.length} scenarios — fewer than the 6 themes`)
  }
}

// ---------- courses.json ----------
const courses = readJson('data/courses.json')
if (courses != null) {
  if (!Array.isArray(courses)) {
    err('courses.json must be an array')
  } else {
    const ids = new Set()
    courses.forEach((c, i) => {
      const at = `courses[${i}]${c && c.id ? ` (id=${c.id})` : ''}`
      if (!c || typeof c !== 'object') return err(`${at}: not an object`)
      if (!isFilledStr(c.id)) err(`${at}: missing id`)
      else if (ids.has(c.id)) err(`${at}: duplicate id`)
      else ids.add(c.id)
      if (!isBiStr(c.course_title)) err(`${at}: course_title must have en & fr`)
      if (!isFilledStr(c.source_url)) err(`${at}: missing source_url`)
      if (!isBiStr(c.summary)) err(`${at}: summary must have non-empty en & fr`)
      const kcEn = c.key_concepts && c.key_concepts.en
      const kcFr = c.key_concepts && c.key_concepts.fr
      if (!Array.isArray(kcEn) || !Array.isArray(kcFr) || kcEn.length === 0)
        err(`${at}: key_concepts.en/fr must be non-empty arrays`)
      else if (kcEn.length !== kcFr.length)
        err(`${at}: key_concepts en/fr length mismatch (${kcEn.length} vs ${kcFr.length})`)
      if (!Array.isArray(c.check_questions) || c.check_questions.length < 3)
        err(`${at}: need >= 3 check_questions`)
      else
        c.check_questions.forEach((cq, j) => {
          if (!isBiStr(cq.q)) err(`${at}.check_questions[${j}]: q must have en & fr`)
          if (!isBiStr(cq.a)) err(`${at}.check_questions[${j}]: a must have en & fr`)
        })
    })
    console.log(`courses.json: ${courses.length} courses`)
  }
}

// ---------- quizzes.json + exam_traps.json ----------
const courseIds = new Set(Array.isArray(courses) ? courses.map((c) => c && c.id).filter(Boolean) : [])
const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ')
const quizIds = new Set()

/** Validate one multiple-choice quiz question (same answer model as the exam). */
function checkQuiz(q, at) {
  if (!q || typeof q !== 'object') return err(`${at}: not an object`)
  if (!isFilledStr(q.id)) err(`${at}: missing id`)
  else if (quizIds.has(q.id)) err(`${at}: duplicate quiz id "${q.id}"`)
  else quizIds.add(q.id)
  if (q.domain != null && !DOMAINS.includes(q.domain)) err(`${at}: invalid domain "${q.domain}"`)
  if (!isBiStr(q.q)) err(`${at}: q must have non-empty en & fr`)
  if (!isBiStr(q.explanation)) err(`${at}: explanation must have non-empty en & fr`)
  const ci = q.correct_index
  if (!Number.isInteger(ci) || ci < 0 || ci > 3) err(`${at}: correct_index must be an integer in [0,3]`)
  for (const lang of ['en', 'fr']) {
    const opts = q.options && q.options[lang]
    if (!Array.isArray(opts) || opts.length !== 4 || !opts.every(isFilledStr))
      err(`${at}: options.${lang} must be 4 non-empty strings`)
    else if (new Set(opts.map(norm)).size !== opts.length)
      err(`${at}: options.${lang} has duplicate option text`)
    const de = q.distractor_explanations && q.distractor_explanations[lang]
    if (!Array.isArray(de) || de.length !== 4) err(`${at}: distractor_explanations.${lang} must be 4 strings`)
    else if (Number.isInteger(ci) && ci >= 0 && ci <= 3) {
      // The correct slot must be empty; the 3 distractor slots must each be filled.
      de.forEach((d, k) => {
        if (k === ci && isFilledStr(d)) err(`${at}: distractor_explanations.${lang}[${k}] (correct slot) must be empty`)
        if (k !== ci && !isFilledStr(d)) err(`${at}: distractor_explanations.${lang}[${k}] must explain why that option is wrong`)
      })
    }
  }
}

const quizzes = readJson('data/quizzes.json')
if (quizzes != null) {
  let nCourseQuiz = 0
  let nThemeQuiz = 0
  const byCourse = quizzes.by_course || {}
  const byTheme = quizzes.by_theme || {}
  for (const [cid, arr] of Object.entries(byCourse)) {
    if (courseIds.size && !courseIds.has(cid)) err(`quizzes.by_course: unknown course id "${cid}"`)
    if (!Array.isArray(arr)) err(`quizzes.by_course["${cid}"] must be an array`)
    else arr.forEach((q, i) => { checkQuiz(q, `quizzes.by_course["${cid}"][${i}]`); nCourseQuiz++ })
  }
  for (const [tid, arr] of Object.entries(byTheme)) {
    if (!THEMES.includes(tid)) err(`quizzes.by_theme: unknown theme id "${tid}"`)
    if (!Array.isArray(arr)) err(`quizzes.by_theme["${tid}"] must be an array`)
    else arr.forEach((q, i) => { checkQuiz(q, `quizzes.by_theme["${tid}"][${i}]`); nThemeQuiz++ })
  }
  console.log(`quizzes.json: ${nCourseQuiz} course quiz Q (${Object.keys(byCourse).length}/${courseIds.size || '?'} courses), ${nThemeQuiz} theme quiz Q (${Object.keys(byTheme).length}/${THEMES.length} themes)`)
}

const traps = readJson('data/exam_traps.json')
if (traps != null) {
  const trapIds = new Set()
  const checkTrap = (tr, at, domainRequired) => {
    if (!tr || typeof tr !== 'object') return err(`${at}: not an object`)
    if (!isFilledStr(tr.id)) err(`${at}: missing id`)
    else if (trapIds.has(tr.id)) err(`${at}: duplicate trap id "${tr.id}"`)
    else trapIds.add(tr.id)
    if (domainRequired && !DOMAINS.includes(tr.domain)) err(`${at}: domain must be a valid domain key`)
    else if (tr.domain != null && !DOMAINS.includes(tr.domain)) err(`${at}: invalid domain "${tr.domain}"`)
    for (const f of ['title', 'trap', 'why_wrong', 'right_approach'])
      if (!isBiStr(tr[f])) err(`${at}: ${f} must have non-empty en & fr`)
  }
  let nThemeTrap = 0
  let nDomainTrap = 0
  const tByTheme = traps.by_theme || {}
  const tByDomain = traps.by_domain || {}
  for (const [tid, arr] of Object.entries(tByTheme)) {
    if (!THEMES.includes(tid)) err(`exam_traps.by_theme: unknown theme id "${tid}"`)
    if (!Array.isArray(arr)) err(`exam_traps.by_theme["${tid}"] must be an array`)
    else arr.forEach((tr, i) => { checkTrap(tr, `exam_traps.by_theme["${tid}"][${i}]`, false); nThemeTrap++ })
  }
  for (const [did, arr] of Object.entries(tByDomain)) {
    if (!DOMAINS.includes(did)) err(`exam_traps.by_domain: unknown domain key "${did}"`)
    if (!Array.isArray(arr)) err(`exam_traps.by_domain["${did}"] must be an array`)
    else arr.forEach((tr, i) => { checkTrap(tr, `exam_traps.by_domain["${did}"][${i}]`, true); nDomainTrap++ })
  }
  console.log(`exam_traps.json: ${nThemeTrap} theme traps (${Object.keys(tByTheme).length}/${THEMES.length} themes), ${nDomainTrap} domain traps (${Object.keys(tByDomain).length}/${DOMAINS.length} domains)`)
}

// ---------- report ----------
if (warnings.length) {
  console.log('\nWarnings:')
  warnings.forEach((w) => console.log(`  ! ${w}`))
}
if (errors.length) {
  console.log(`\n${errors.length} ERROR(S):`)
  errors.forEach((e) => console.log(`  x ${e}`))
  process.exit(1)
}
console.log('\nAll data invariants OK.')
