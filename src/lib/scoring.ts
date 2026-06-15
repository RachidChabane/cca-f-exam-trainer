import { BLUEPRINT, DOMAIN_ORDER } from '@/data'
import { SCENARIOS, SCENARIOS_PRESENTED } from '@/scenarios'
import type { Bi, DomainKey, Question } from '@/types'

/** A full timed mock, or an untimed practice drill (single domain / retry-wrong). */
export type SessionMode = 'exam' | 'drill'

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
  /** 'exam' = the weighted 60Q timed mock; 'drill' = untimed practice. */
  mode: SessionMode
  /** Whether a countdown applies (true for exam, false for drills). */
  timed: boolean
  /** For single-domain drills: which domain it targets. */
  domain?: DomainKey
  /** Optional bilingual label shown in the runner/results (e.g. drill name). */
  label?: Bi
  /** Scenario-mode only: the scenario-theme id for each question (aligned by index). */
  themes?: string[]
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

/** Sample up to `count` questions from one domain, shuffled, without replacement. */
export function sampleDrill(pool: Question[], domain: DomainKey, count: number): Question[] {
  return shuffle(pool.filter((q) => q.domain === domain)).slice(0, Math.max(1, count))
}

/**
 * Build a scenario-mode session: pick `present` of the six fixed scenario themes
 * and assemble a contiguous block of `perTheme` questions for each, round-robin
 * across that theme's primary domains, globally without replacement. Mirrors the
 * real exam's "4 of 6 scenarios, each framing a set of questions" structure.
 */
export function sampleScenario(
  pool: Question[],
  perTheme = 15,
  present = SCENARIOS_PRESENTED,
): { questions: Question[]; themes: string[] } {
  const chosen = shuffle(SCENARIOS).slice(0, Math.min(present, SCENARIOS.length))
  const used = new Set<string>()
  const questions: Question[] = []
  const themes: string[] = []
  for (const sc of chosen) {
    const buckets = sc.primaryDomains.map((d) =>
      shuffle(pool.filter((q) => q.domain === d && !used.has(q.id))),
    )
    let added = 0
    let progressed = true
    while (added < perTheme && progressed) {
      progressed = false
      for (const b of buckets) {
        if (added >= perTheme) break
        const q = b.pop()
        if (q) {
          used.add(q.id)
          questions.push(q)
          themes.push(sc.id)
          added++
          progressed = true
        }
      }
    }
  }
  return { questions, themes }
}

/**
 * Construct a session from a fixed list of questions. `timed` sessions get the
 * blueprint's countdown; untimed drills carry no deadline (endsAt = 0).
 */
export function buildSession(
  questions: Question[],
  opts: { mode: SessionMode; timed: boolean; domain?: DomainKey; label?: Bi; themes?: string[] },
): ExamSession {
  const durationMs = opts.timed ? BLUEPRINT.session.time_limit_minutes * 60 * 1000 : 0
  const startedAt = Date.now()
  return {
    questions,
    answers: questions.map(() => null),
    flagged: questions.map(() => false),
    current: 0,
    startedAt,
    endsAt: opts.timed ? startedAt + durationMs : 0,
    durationMs,
    status: 'active',
    autoSubmitted: false,
    submittedAt: null,
    mode: opts.mode,
    timed: opts.timed,
    domain: opts.domain,
    label: opts.label,
    themes: opts.themes,
  }
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
