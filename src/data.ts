import scenariosRaw from '@data/scenarios.json'
import coursesRaw from '@data/courses.json'
import blueprintRaw from '@resources/blueprint.json'
import type { Blueprint, Course, DomainKey, Question, ScenarioSet } from '@/types'

/** Canonical content, loaded from the JSON files at /data and /resources. */
export const SCENARIO_SETS = scenariosRaw as ScenarioSet[]
export const COURSES = coursesRaw as Course[]
export const BLUEPRINT = blueprintRaw as Blueprint

/**
 * The flat question view. Every scenario question is flattened with its parent
 * scenario's shared context + identity, so the per-domain drills, scoring, the
 * navigator, and the answer review can all work question-by-question while the
 * full scenario sitting still groups them by scenario.
 */
export const QUESTIONS: Question[] = SCENARIO_SETS.flatMap((s) =>
  s.questions.map((q) => ({
    id: q.id,
    domain: q.domain,
    scenarioId: s.id,
    theme: s.theme,
    scenarioTitle: s.title,
    scenarioContext: s.context,
    stem: q.stem,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation,
    distractor_explanations: q.distractor_explanations,
  })),
)

/** Per-domain display order, matching the official CCA-F exam guide numbering
 * (Domain 1 Agentic, 2 Tool/MCP, 3 Claude Code, 4 Prompt Eng., 5 Context).
 * Used for the per-domain results breakdown and the intro distribution list. */
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
