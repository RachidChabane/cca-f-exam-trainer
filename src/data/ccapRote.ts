import bankRaw from '@data/ccap_rote.json'

/**
 * The CCA-P rote-memorization bank: knowledge from the five official prep
 * courses that cannot be derived by reasoning — exact API behaviors, named
 * taxonomies with their members, course-reserved vocabulary — plus the
 * counter-intuitive rules where the course's answer beats engineering instinct.
 * Content is English-only, like the CCA-P question bank.
 */

export type RoteKind = 'must-know' | 'counterintuitive'
export type RoteModuleKey = '01' | '02' | '03' | '04' | '05'

export interface RoteItem {
  id: string
  module: RoteModuleKey
  kind: RoteKind
  topic: string
  fact: string
  sourceSection: string
  intuitionTrap?: string
}

interface RoteBank {
  meta: { modules: Record<RoteModuleKey, string> }
  items: RoteItem[]
}

const BANK = bankRaw as unknown as RoteBank

export const ROTE_ITEMS: RoteItem[] = BANK.items

export const ROTE_MODULES: { key: RoteModuleKey; title: string }[] = (
  Object.entries(BANK.meta.modules) as [RoteModuleKey, string][]
).map(([key, title]) => ({ key, title }))

export const ROTE_COUNTS = {
  mustKnow: ROTE_ITEMS.filter((i) => i.kind === 'must-know').length,
  traps: ROTE_ITEMS.filter((i) => i.kind === 'counterintuitive').length,
}
