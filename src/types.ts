/** Shared domain types for the Claude certification Exam Trainer. */

export type Lang = 'en' | 'fr'
export type Theme = 'dark' | 'light'

/** The trainer hosts two certifications. They share the runner, timer, scoring,
 * navigator and review; they differ in their domains, item formats and shape:
 *  - `ccaf`  — Claude Certified Architect – Foundations. Scenario-framed: 4 shared
 *              contexts x 15 linked single-answer questions.
 *  - `ccarp` — Claude Certified Architect – Professional. 63 standalone items over
 *              7 domains, mixing single-answer, multiple-response and matching. */
export type ExamKey = 'ccaf' | 'ccarp'

/** CCA-F domains (5). */
export type CcafDomainKey =
  | 'agentic_architecture'
  | 'claude_code'
  | 'prompt_engineering'
  | 'tool_design_mcp'
  | 'context_management'

/** CCA-P domains (7) — from the CCAR-P exam guide v1.0 blueprint. */
export type CcarpDomainKey =
  | 'solution_design'
  | 'models_prompting_context'
  | 'integration'
  | 'evaluation_testing'
  | 'governance_safety'
  | 'stakeholder_lifecycle'
  | 'developer_productivity'

/** Any domain across either exam. A given session only ever mixes domains from
 * its own exam; `session.exam` says which set applies. */
export type DomainKey = CcafDomainKey | CcarpDomainKey

/**
 * How an item is answered.
 *  - `mc`       — pick exactly one option.
 *  - `mr`       — pick exactly `select_count` options (the stem states how many).
 *                 Graded all-or-nothing: the selected set must equal the key.
 *  - `matching` — several short scenarios ("rows"), each classified against ONE
 *                 shared option set. Options may repeat across rows, so this is
 *                 not a permutation. Graded all-or-nothing across every row.
 */
export type QuestionFormat = 'mc' | 'mr' | 'matching'

export interface Bi {
  en: string
  fr: string
}
export interface BiList {
  en: string[]
  fr: string[]
}

/* --------------------------- scenario-set model --------------------------- */
// The real CCA-F exam is scenario-based: a sitting presents 4 scenarios drawn at
// random from a fixed pool of 6 themes, and EACH scenario frames a *set* of
// linked questions sharing one dense production context. The trainer models that
// directly: data/scenarios.json holds ScenarioSet[] (several instances per
// theme), and a sitting picks 4 themes × one instance each.

/** One question inside a scenario set. Its `stem` leans on the shared context
 * ("Given the architecture above…") instead of restating it. */
export interface ScenarioQuestion {
  id: string
  domain: DomainKey
  stem: Bi
  options: BiList
  correct_index: number
  explanation: Bi
  distractor_explanations: BiList
}

/** A dense, multi-paragraph production scenario plus its linked question set. */
export interface ScenarioSet {
  id: string
  /** One of the six fixed scenario-theme ids (see src/scenarios.ts). */
  theme: string
  /** 1-based instance number within its theme (themes have several instances). */
  instance: number
  title: Bi
  /** Dense markdown context (may include exhibits: code, configs, logs, tables). */
  context: Bi
  /** The domains this set's questions span (all five). */
  domains: DomainKey[]
  questions: ScenarioQuestion[]
}

/**
 * The runtime question shape used by the runner, drills, scoring and review —
 * the single currency both exams are flattened into.
 *
 * `correct` is an index list rather than a single index so that one code path
 * serves every format. Its meaning depends on `format`:
 *  - `mc`       — one index.        Graded as a set (trivially).
 *  - `mr`       — several indices.  Graded as a SET: order never matters.
 *  - `matching` — one index PER ROW, positionally aligned with `rows`, so
 *                 `correct[i]` is the chosen option for `rows[i]`. Graded as an
 *                 ORDERED list, and repeats are legal (two rows may share an
 *                 option).
 * A CCA-F question is just the `mc` case with a one-element `correct`.
 */
export interface Question {
  id: string
  exam: ExamKey
  domain: DomainKey
  format: QuestionFormat
  stem: Bi
  options: BiList
  correct: number[]
  explanation: Bi
  distractor_explanations: BiList
  /** `mr` only: how many options to select. The stem states it; the UI enforces it. */
  select_count?: number
  /** `matching` only: the row prompts, positionally aligned with `correct`. */
  rows?: BiList
  /** Scenario-framed exams (CCA-F) only — absent for CCA-P's standalone items.
   * When absent the navigator groups by domain instead of by scenario. */
  scenarioId?: string
  theme?: string
  scenarioTitle?: Bi
  scenarioContext?: Bi
}

export interface CheckQuestion {
  q: Bi
  a: Bi
}

/** A self-contained multiple-choice quiz question used by the Study-mode
 * mini-quizzes (per-course and per-theme). Unlike a ScenarioQuestion it does not
 * lean on a shared scenario context: the stem stands on its own. Same answer
 * model as the exam (1 correct + 3 distractors, each with a written rebuttal). */
export interface QuizQuestion {
  id: string
  /** Exam domain this question maps to (for labelling / filtering). */
  domain?: DomainKey
  q: Bi
  options: BiList
  correct_index: number
  /** Why the correct option is right. */
  explanation: Bi
  /** Per-option rebuttal, aligned by index; the correct slot holds "". */
  distractor_explanations: BiList
}

/** A classic exam trap: the tempting-but-wrong instinct, why it fails, and the
 * architecturally correct call. Grounded in first-party Anthropic guidance. */
export interface ExamTrap {
  id: string
  /** Exam domain the trap belongs to (always set for by-domain traps). */
  domain?: DomainKey
  /** Short headline naming the trap. */
  title: Bi
  /** The tempting-but-wrong move a candidate is likely to pick. */
  trap: Bi
  /** Why that move is wrong. */
  why_wrong: Bi
  /** The correct architectural approach. */
  right_approach: Bi
}

/** Study-mode mini-quizzes: one set per course (keyed by course id) and one set
 * per scenario theme (keyed by theme id from src/scenarios.ts). */
export interface QuizBank {
  by_course: Record<string, QuizQuestion[]>
  by_theme: Record<string, QuizQuestion[]>
}

/** Exam traps grouped two ways: by scenario theme and by exam domain. */
export interface TrapBank {
  by_theme: Record<string, ExamTrap[]>
  by_domain: Partial<Record<DomainKey, ExamTrap[]>>
}

export interface Course {
  id: string
  course_title: Bi
  source_url: string
  domain?: string
  summary: Bi
  key_concepts: BiList
  check_questions: CheckQuestion[]
}

export interface DomainBlueprint {
  key: CcafDomainKey
  name: Bi
  weight: number
  pool_target: number
  session_count: number
  covers: string
}

export interface Blueprint {
  exam: {
    code: string
    name: Bi
    provider: string
    program: string
    launched: string
    level: string
    format: string
    mechanics: {
      question_count: number
      time_limit_minutes: number
      options_per_question: number
      correct_answers_per_question: number
      scaled_score: { min: number; max: number; pass: number }
      fee_usd: number
    }
    scenarios: {
      count_presented: number
      pool: number
      instances_per_theme: number
      questions_per_scenario: number
      per_scenario_domain_split: Record<CcafDomainKey, number>
      note: string
      themes: string[]
    }
    scoring_model: {
      note: string
      formula: string
      pass_scaled: number
      pass_raw_equivalent: string
    }
  }
  domains: DomainBlueprint[]
  session: {
    question_count: number
    time_limit_minutes: number
    soft_warning_remaining_minutes: number
    sampling: string
    domain_session_counts: Record<CcafDomainKey, number>
  }
  pool: { total_target: number; rounding_rule: string }
  sources_note: string
}
