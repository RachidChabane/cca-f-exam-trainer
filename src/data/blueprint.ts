import blueprintRaw from '@resources/blueprint.json'
import type { Blueprint, DomainKey } from '@/types'

/**
 * The exam blueprint (domains, weights, mechanics). This is small and shared by
 * almost every view, so it lives on its own — importing it never pulls in the
 * multi-megabyte scenario / course / quiz JSON.
 */
export const BLUEPRINT = blueprintRaw as Blueprint

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
