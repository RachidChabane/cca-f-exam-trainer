import questionsRaw from '@data/questions.json'
import coursesRaw from '@data/courses.json'
import blueprintRaw from '@resources/blueprint.json'
import type { Blueprint, Course, DomainKey, Question } from '@/types'

/** Canonical content, loaded from the JSON files at /data and /resources. */
export const QUESTIONS = questionsRaw as Question[]
export const COURSES = coursesRaw as Course[]
export const BLUEPRINT = blueprintRaw as Blueprint

/** Per-domain display order, matching the official CCA-F exam guide numbering
 * (Domain 1 Agentic, 2 Tool/MCP, 3 Claude Code, 4 Prompt Eng., 5 Context).
 * Used for the per-domain results breakdown and the intro distribution list;
 * session sampling re-shuffles, so order here is presentation only. */
export const DOMAIN_ORDER: DomainKey[] = [
  'agentic_architecture',
  'tool_design_mcp',
  'claude_code',
  'prompt_engineering',
  'context_management',
]

export const DOMAINS = BLUEPRINT.domains
export const DOMAIN_BY_KEY = Object.fromEntries(
  DOMAINS.map((d) => [d.key, d]),
) as Record<DomainKey, (typeof DOMAINS)[number]>
