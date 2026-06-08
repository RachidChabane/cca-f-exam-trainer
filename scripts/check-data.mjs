#!/usr/bin/env node
/**
 * Validates data/questions.json and data/courses.json against the schema
 * invariants required by the CCA-F Exam Trainer.
 *
 *   node scripts/check-data.mjs
 *
 * Exits non-zero if any invariant is violated. Safe to run after appending
 * your own questions or courses.
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

// ---------- questions.json ----------
const questions = readJson('data/questions.json')
const counts = Object.fromEntries(DOMAINS.map((d) => [d, 0]))
if (questions != null) {
  if (!Array.isArray(questions)) {
    err('questions.json must be an array')
  } else {
    const ids = new Set()
    questions.forEach((q, i) => {
      const at = `questions[${i}]${q && q.id ? ` (id=${q.id})` : ''}`
      if (!q || typeof q !== 'object') return err(`${at}: not an object`)
      if (!isFilledStr(q.id)) err(`${at}: missing id`)
      else if (ids.has(q.id)) err(`${at}: duplicate id`)
      else ids.add(q.id)
      if (!DOMAINS.includes(q.domain)) err(`${at}: invalid domain "${q.domain}"`)
      else counts[q.domain]++
      if (!isBiStr(q.scenario)) err(`${at}: scenario must have non-empty en & fr`)
      if (!isBiStr(q.question)) err(`${at}: question must have non-empty en & fr`)
      for (const lang of ['en', 'fr']) {
        const opts = q.options && q.options[lang]
        if (!Array.isArray(opts) || opts.length !== 4 || !opts.every(isFilledStr))
          err(`${at}: options.${lang} must be 4 non-empty strings`)
        const de = q.distractor_explanations && q.distractor_explanations[lang]
        if (!Array.isArray(de) || de.length !== 4 || !de.every(isFilledStr))
          err(`${at}: distractor_explanations.${lang} must be 4 non-empty strings`)
      }
      if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3)
        err(`${at}: correct_index must be an integer in [0,3]`)
      if (!isBiStr(q.explanation)) err(`${at}: explanation must have non-empty en & fr`)
    })

    console.log(`questions.json: ${questions.length} items`)
    for (const d of DOMAINS) {
      const got = counts[d]
      const target = POOL_TARGET[d]
      const flag = got === target ? 'ok' : got >= target ? 'ok (>= target)' : 'BELOW target'
      const line = `  ${d.padEnd(22)} ${String(got).padStart(4)} / ${target}  ${flag}`
      if (got < target) warn(line.trim())
      console.log(line)
    }
    if (questions.length < 300) warn(`pool has ${questions.length} questions (< 300 target)`)
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
