/** Shared domain types for the CCA-F Exam Trainer. */

export type Lang = 'en' | 'fr'
export type Theme = 'dark' | 'light'

export type DomainKey =
  | 'agentic_architecture'
  | 'claude_code'
  | 'prompt_engineering'
  | 'tool_design_mcp'
  | 'context_management'

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

/** A scenario question flattened with its parent scenario's context, used by the
 * runner, the per-domain drills, scoring, and the answer review. */
export interface Question {
  id: string
  domain: DomainKey
  /** Parent scenario identity (for navigator grouping + the scenario tag). */
  scenarioId: string
  theme: string
  scenarioTitle: Bi
  scenarioContext: Bi
  stem: Bi
  options: BiList
  correct_index: number
  explanation: Bi
  distractor_explanations: BiList
}

export interface CheckQuestion {
  q: Bi
  a: Bi
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
  key: DomainKey
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
      per_scenario_domain_split: Record<DomainKey, number>
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
    domain_session_counts: Record<DomainKey, number>
  }
  pool: { total_target: number; rounding_rule: string }
  sources_note: string
}
