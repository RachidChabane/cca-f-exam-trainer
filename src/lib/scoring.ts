import { BLUEPRINT, DOMAIN_ORDER } from '@/data/blueprint'
import { CCARP_DOMAIN_ORDER } from '@/data/ccarpBlueprint'
import { SCENARIOS_PRESENTED } from '@/scenarios'
import type { Bi, DomainKey, ExamKey, Question, ScenarioSet } from '@/types'

/** A full timed scenario mock, or an untimed practice drill (single domain / retry-wrong). */
export type SessionMode = 'exam' | 'drill'

/**
 * One answer. `null` = unanswered. Otherwise an index list mirroring the
 * question's `correct`:
 *  - mc       — `[i]`
 *  - mr       — the selected indices, in click order (graded as a set)
 *  - matching — one option index per row, positionally aligned with `rows`;
 *               a row not yet classified holds -1.
 */
export type Answer = number[] | null

export interface ExamSession {
  questions: Question[]
  answers: Answer[]
  flagged: boolean[]
  current: number
  startedAt: number
  endsAt: number
  durationMs: number
  status: 'active' | 'submitted'
  autoSubmitted: boolean
  submittedAt: number | null
  /** 'exam' = the weighted timed mock; 'drill' = untimed practice. */
  mode: SessionMode
  /** Which certification this sitting is for — selects the domain order used in
   * the per-domain breakdown, and the pass mark / scaling. */
  exam: ExamKey
  /** Whether a countdown applies (true for exam, false for drills). */
  timed: boolean
  /** For single-domain drills: which domain it targets. */
  domain?: DomainKey
  /** Optional bilingual label shown in the runner/results (e.g. drill name). */
  label?: Bi
  /** Whether the countdown is paused. Only meaningful for timed sessions. */
  paused: boolean
  /** Remaining ms captured at the moment of pausing — freezes the display and is
   * used to recompute `endsAt` on resume so paused time isn't counted. */
  pausedRemainingMs?: number
}

/** A contiguous run of questions belonging to one scenario, for the grouped navigator. */
export interface ScenarioBlock {
  scenarioId: string
  theme: string
  title: Bi
  start: number
  count: number
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

/** Flatten one scenario question with its parent scenario's shared context.
 * CCA-F items are all single-answer, so they become the one-element `mc` case. */
function flatten(set: ScenarioSet, q: ScenarioSet['questions'][number]): Question {
  return {
    id: q.id,
    exam: 'ccaf',
    domain: q.domain,
    format: 'mc',
    scenarioId: set.id,
    theme: set.theme,
    scenarioTitle: set.title,
    scenarioContext: set.context,
    stem: q.stem,
    options: q.options,
    correct: [q.correct_index],
    explanation: q.explanation,
    distractor_explanations: q.distractor_explanations,
  }
}

/**
 * Is an answer correct? All-or-nothing for every format — no partial credit.
 *
 * The CCAR-P exam guide reports a scaled score plus per-domain percentages and
 * never defines partial credit for a multiple-response item; Pearson VUE-delivered
 * certifications score such items as a single unit. Mirroring that is also the
 * conservative choice: a partial-credit trainer would flatter a practice score
 * against a real 720 cut.
 *
 * `mr` compares as a SET (click order is irrelevant). `matching` compares as an
 * ORDERED list (position = row) and tolerates repeats, since the same option may
 * legitimately key two different rows.
 */
export function isCorrect(q: Question, answer: Answer): boolean {
  if (answer == null) return false
  if (q.format === 'matching') {
    if (answer.length !== q.correct.length) return false
    return q.correct.every((c, i) => answer[i] === c)
  }
  if (answer.length !== q.correct.length) return false
  const a = [...answer].sort((x, y) => x - y)
  const b = [...q.correct].sort((x, y) => x - y)
  return a.every((v, i) => v === b[i])
}

/** Whether an answer is complete enough to submit/lock (used by the runner to
 * decide when to reveal). mc: one pick. mr: exactly select_count. matching: every
 * row classified. */
export function isAnswerComplete(q: Question, answer: Answer): boolean {
  if (answer == null) return false
  if (q.format === 'matching') return answer.length === (q.rows?.en.length ?? 0) && answer.every((v) => v >= 0)
  if (q.format === 'mr') return answer.length === (q.select_count ?? q.correct.length)
  return answer.length === 1
}

/**
 * Build a scenario-set sitting, exactly like the real exam: pick `present` of the
 * fixed scenario themes at random, take ONE random instance of each, and lay the
 * chosen scenarios out as contiguous blocks (so the shared context stays stable
 * while the candidate works through that scenario's question set). Questions are
 * shuffled *within* each block; the blocks themselves are in random order.
 *
 * Because every scenario set carries the same per-domain split (4/3/3/3/2), any
 * 4-of-6 sitting lands on the same ~60-question, weight-matched distribution.
 */
export function sampleScenarioExam(
  sets: ScenarioSet[],
  present = SCENARIOS_PRESENTED,
): { questions: Question[] } {
  const byTheme = new Map<string, ScenarioSet[]>()
  for (const s of sets) {
    const list = byTheme.get(s.theme) ?? []
    list.push(s)
    byTheme.set(s.theme, list)
  }
  const themes = shuffle([...byTheme.keys()]).slice(0, present)
  const questions: Question[] = []
  for (const theme of themes) {
    const instances = byTheme.get(theme) ?? []
    if (instances.length === 0) continue
    const chosen = shuffle(instances)[0]
    for (const q of shuffle(chosen.questions)) questions.push(flatten(chosen, q))
  }
  return { questions }
}

/** Flatten every question of every set with its parent scenario's context. Used
 * to register the question-bank sittings in the session-restore lookup. */
export function flattenScenarioSets(sets: ScenarioSet[]): Question[] {
  return sets.flatMap((s) => s.questions.map((q) => flatten(s, q)))
}

/**
 * Group a question list into contiguous blocks for the navigator.
 *
 * Scenario-framed sittings (CCA-F) group by scenario — the shared context is what
 * makes a run of questions one unit. CCA-P items are standalone, so there is no
 * scenario to group by and we fall back to the domain, which is the only grouping
 * its blueprint actually gives the candidate.
 */
export function computeBlocks(questions: Question[], domainName?: (d: DomainKey) => Bi): ScenarioBlock[] {
  const blocks: ScenarioBlock[] = []
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const groupId = q.scenarioId ?? `domain:${q.domain}`
    const last = blocks[blocks.length - 1]
    if (last && last.scenarioId === groupId) {
      last.count++
    } else {
      blocks.push({
        scenarioId: groupId,
        theme: q.theme ?? q.domain,
        title: q.scenarioTitle ?? domainName?.(q.domain) ?? { en: q.domain, fr: q.domain },
        start: i,
        count: 1,
      })
    }
  }
  return blocks
}

/**
 * Build a CCA-P sitting: 63 standalone items drawn at the blueprint's per-domain
 * weights (12 Integration / 11 Solution Design / 10 Evaluation / 9 Governance /
 * 9 Stakeholder / 8 Models-Prompting / 4 Dev Productivity), laid out in domain
 * order so the navigator can group by domain.
 *
 * If a domain is short of its quota the sitting simply carries fewer of that
 * domain — the caller reports the shortfall rather than silently padding from
 * elsewhere, which would misrepresent the weighting.
 */
export function sampleCcarpExam(
  pool: Question[],
  counts: Record<string, number>,
  order: readonly string[],
): { questions: Question[]; shortfall: Record<string, number> } {
  const questions: Question[] = []
  const shortfall: Record<string, number> = {}
  for (const domain of order) {
    const want = counts[domain] ?? 0
    const available = pool.filter((q) => q.domain === domain)
    const take = shuffle(available).slice(0, want)
    if (take.length < want) shortfall[domain] = want - take.length
    questions.push(...take)
  }
  return { questions, shortfall }
}

/** Sample up to `count` questions from one domain, shuffled, without replacement. */
export function sampleDrill(pool: Question[], domain: DomainKey, count: number): Question[] {
  return shuffle(pool.filter((q) => q.domain === domain)).slice(0, Math.max(1, count))
}

/**
 * Construct a session from a fixed list of questions. `timed` sessions get the
 * blueprint's countdown; untimed drills carry no deadline (endsAt = 0).
 */
export function buildSession(
  questions: Question[],
  opts: {
    mode: SessionMode
    timed: boolean
    domain?: DomainKey
    label?: Bi
    exam?: ExamKey
    /** Overrides the CCA-F blueprint countdown (CCA-P is also 120 min, but say so
     * explicitly rather than inheriting it by coincidence). */
    minutes?: number
  },
): ExamSession {
  const exam = opts.exam ?? 'ccaf'
  const minutes = opts.minutes ?? BLUEPRINT.session.time_limit_minutes
  const durationMs = opts.timed ? minutes * 60 * 1000 : 0
  const startedAt = Date.now()
  return {
    questions,
    exam,
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
    paused: false,
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
    const ok = isCorrect(q, answers[i])
    if (ok) correct++
    const bucket = perDomainMap.get(q.domain) ?? { correct: 0, total: 0 }
    bucket.total++
    if (ok) bucket.correct++
    perDomainMap.set(q.domain, bucket)
  })

  // Report domains in their own exam's guide order.
  const order: DomainKey[] = session.exam === 'ccarp' ? CCARP_DOMAIN_ORDER : DOMAIN_ORDER
  const perDomain: DomainResult[] = order
    .filter((d) => perDomainMap.has(d))
    .map((key) => {
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
