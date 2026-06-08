import questionsRaw from '@data/questions.json'
import coursesRaw from '@data/courses.json'
import blueprintRaw from '@resources/blueprint.json'
import type { Blueprint, Course, DomainKey, Question } from '@/types'

/** Canonical content, loaded from the JSON files at /data and /resources. */
export const QUESTIONS = questionsRaw as Question[]
export const COURSES = coursesRaw as Course[]
export const BLUEPRINT = blueprintRaw as Blueprint

export const DOMAIN_ORDER: DomainKey[] = [
  'agentic_architecture',
  'claude_code',
  'prompt_engineering',
  'tool_design_mcp',
  'context_management',
]

export const DOMAINS = BLUEPRINT.domains
export const DOMAIN_BY_KEY = Object.fromEntries(
  DOMAINS.map((d) => [d.key, d]),
) as Record<DomainKey, (typeof DOMAINS)[number]>
