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

export interface Question {
  id: string
  domain: DomainKey
  scenario: Bi
  question: Bi
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
