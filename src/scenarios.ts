import type { Bi } from '@/types'

/**
 * The six fixed scenario themes of the real CCA-F exam, taken verbatim from the
 * official exam guide. A sitting presents 4 of these 6, each framing a *set* of
 * linked questions that share one dense production context. The content for each
 * theme lives in data/scenarios.json as several distinct instances; a sitting
 * picks 4 themes and one random instance of each.
 */
export interface ScenarioTheme {
  id: string
  name: Bi
}

export const SCENARIOS: ScenarioTheme[] = [
  {
    id: 'customer_support',
    name: { en: 'Customer Support Resolution Agent', fr: 'Agent de résolution du support client' },
  },
  {
    id: 'code_generation',
    name: { en: 'Code Generation with Claude Code', fr: 'Génération de code avec Claude Code' },
  },
  {
    id: 'multi_agent_research',
    name: { en: 'Multi-Agent Research System', fr: 'Système de recherche multi-agents' },
  },
  {
    id: 'developer_productivity',
    name: { en: 'Developer Productivity with Claude', fr: 'Productivité des développeurs avec Claude' },
  },
  {
    id: 'continuous_integration',
    name: { en: 'Claude Code for Continuous Integration', fr: 'Claude Code pour l’intégration continue' },
  },
  {
    id: 'structured_extraction',
    name: { en: 'Structured Data Extraction', fr: 'Extraction de données structurées' },
  },
]

export const SCENARIO_BY_ID = Object.fromEntries(SCENARIOS.map((s) => [s.id, s])) as Record<
  string,
  ScenarioTheme
>

/** Scenarios presented per sitting (the real exam shows 4 of the 6 themes). */
export const SCENARIOS_PRESENTED = 4

/** Linked questions per scenario set (4 scenarios × 15 = a 60-question sitting). */
export const QUESTIONS_PER_SCENARIO = 15
