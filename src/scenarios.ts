import type { Bi, DomainKey } from '@/types'

/**
 * The six fixed scenario themes of the real CCA-F exam, with the primary domains
 * each one draws from — taken verbatim from the official exam guide. The real
 * exam presents 4 of these 6 per sitting, each framing a set of questions.
 * Scenario mode mirrors that structure: it picks 4 themes and builds a block of
 * questions for each, sampled from that theme's primary domains.
 */
export interface ScenarioTheme {
  id: string
  name: Bi
  primaryDomains: DomainKey[]
}

export const SCENARIOS: ScenarioTheme[] = [
  {
    id: 'customer_support',
    name: { en: 'Customer Support Resolution Agent', fr: 'Agent de résolution du support client' },
    primaryDomains: ['agentic_architecture', 'tool_design_mcp', 'context_management'],
  },
  {
    id: 'code_generation',
    name: { en: 'Code Generation with Claude Code', fr: 'Génération de code avec Claude Code' },
    primaryDomains: ['claude_code', 'context_management'],
  },
  {
    id: 'multi_agent_research',
    name: { en: 'Multi-Agent Research System', fr: 'Système de recherche multi-agents' },
    primaryDomains: ['agentic_architecture', 'tool_design_mcp', 'context_management'],
  },
  {
    id: 'developer_productivity',
    name: { en: 'Developer Productivity with Claude', fr: 'Productivité des développeurs avec Claude' },
    primaryDomains: ['tool_design_mcp', 'claude_code', 'agentic_architecture'],
  },
  {
    id: 'continuous_integration',
    name: { en: 'Claude Code for Continuous Integration', fr: 'Claude Code pour l’intégration continue' },
    primaryDomains: ['claude_code', 'prompt_engineering'],
  },
  {
    id: 'structured_extraction',
    name: { en: 'Structured Data Extraction', fr: 'Extraction de données structurées' },
    primaryDomains: ['prompt_engineering', 'context_management'],
  },
]

export const SCENARIO_BY_ID = Object.fromEntries(SCENARIOS.map((s) => [s.id, s])) as Record<
  string,
  ScenarioTheme
>

/** Themes presented per scenario-mode session (the real exam shows 4 of 6). */
export const SCENARIOS_PRESENTED = 4
