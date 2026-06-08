import { BLUEPRINT, DOMAIN_ORDER } from '@/data'
import type { DomainKey, Question } from '@/types'

export interface ExamSession {
  questions: Question[]
  answers: (number | null)[]
  flagged: boolean[]
  current: number
  startedAt: number
  endsAt: number
  durationMs: number
  status: 'active' | 'submitted'
  autoSubmitted: boolean
  submittedAt: number | null
}

export interface DomainResult {
  key: DomainKey
  correct: number
  total: number
  accuracy: number // 0..1
}

export interface ExamResult {
  correct: number
  total: number
  scaled: number
  pass: boolean
  perDomain: DomainResult[]
  weakest: DomainResult | null
  strongest: DomainResult | null
}

/** Fisher-Yates shuffle (non-mutating). */
export function shuffle<T>(input: readonly T[]): T[] {
  const a = input.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Build a session: sample per-domain counts from the pool without replacement,
 * respecting the blueprint distribution, then interleave the domains.
 * If a domain is short on questions, it contributes everything it has.
 */
export function sampleSession(pool: Question[]): Question[] {
  const counts = BLUEPRINT.session.domain_session_counts
  const picked: Question[] = []
  for (const d of DOMAIN_ORDER) {
    const inDomain = shuffle(pool.filter((q) => q.domain === d))
    picked.push(...inDomain.slice(0, Math.min(counts[d], inDomain.length)))
  }
  return shuffle(picked)
}

/** Scaled score: documented linear approximation 100 + (correct/total)*900. */
export function scaledScore(correct: number, total: number): number {
  if (total <= 0) return BLUEPRINT.exam.mechanics.scaled_score.min
  return Math.round(100 + (correct / total) * 900)
}

export function gradeSession(session: ExamSession): ExamResult {
  const { questions, answers } = session
  const total = questions.length
  const perDomainMap = new Map<DomainKey, { correct: number; total: number }>()

  let correct = 0
  questions.forEach((q, i) => {
    const isCorrect = answers[i] === q.correct_index
    if (isCorrect) correct++
    const bucket = perDomainMap.get(q.domain) ?? { correct: 0, total: 0 }
    bucket.total++
    if (isCorrect) bucket.correct++
    perDomainMap.set(q.domain, bucket)
  })

  const perDomain: DomainResult[] = DOMAIN_ORDER.filter((d) =>
    perDomainMap.has(d),
  ).map((key) => {
    const b = perDomainMap.get(key)!
    return { key, correct: b.correct, total: b.total, accuracy: b.total ? b.correct / b.total : 0 }
  })

  const scaled = scaledScore(correct, total)
  const sortedByAcc = [...perDomain].sort((a, b) => a.accuracy - b.accuracy)

  return {
    correct,
    total,
    scaled,
    pass: scaled >= BLUEPRINT.exam.mechanics.scaled_score.pass,
    perDomain,
    weakest: sortedByAcc[0] ?? null,
    strongest: sortedByAcc[sortedByAcc.length - 1] ?? null,
  }
}
