import { DOMAIN_BY_KEY } from '@/data/blueprint'
import { CCARP_DOMAIN_BY_KEY } from '@/data/ccarpBlueprint'
import type { Bi, CcafDomainKey, CcarpDomainKey, DomainKey } from '@/types'

/**
 * Cross-exam domain lookup. The two certifications have disjoint domain sets, so
 * a key resolves in exactly one registry — which lets the runner, results and
 * review label a domain without first knowing which exam they are rendering.
 *
 * Both registries are tiny (names + weights, no question data), so importing this
 * never pulls a bank into the chunk.
 */
export function domainName(key: DomainKey): Bi {
  const ccaf = DOMAIN_BY_KEY[key as CcafDomainKey]
  if (ccaf) return ccaf.name
  const ccarp = CCARP_DOMAIN_BY_KEY[key as CcarpDomainKey]
  if (ccarp) return ccarp.name
  // Unknown key: show the raw key rather than crashing the runner mid-exam.
  return { en: key, fr: key }
}
