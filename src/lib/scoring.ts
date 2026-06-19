import { BLUEPRINT, DOMAIN_ORDER } from '@/data/blueprint'
import { SCENARIOS_PRESENTED } from '@/scenarios'
import type { Bi, DomainKey, Question, ScenarioSet } from '@/types'

/** A full timed scenario mock, or an untimed practice drill (single domain / retry-wrong). */
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
  /** 'exam' = the weighted scenario-set timed mock; 'drill' = untimed practice. */
  mode: SessionMode
  /** Whether a countdown applies (true for exam, false for drills). */
  timed: boolean
  /** For single-domain drills: which domain it targets. */
  domain?: DomainKey
  /** Optional bilingual label shown in the runner/results (e.g. drill name). */
  label?: Bi
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

/** Flatten one scenario question with its parent scenario's shared context. */
function flatten(set: ScenarioSet, q: ScenarioSet['questions'][number]): Question {
  return {
    id: q.id,
    domain: q.domain,
    scenarioId: set.id,
    theme: set.theme,
    scenarioTitle: set.title,
    scenarioContext: set.context,
    stem: q.stem,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation,
    distractor_explanations: q.distractor_explanations,
  }
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

/** Group a question list into contiguous per-scenario blocks (for the navigator). */
export function computeBlocks(questions: Question[]): ScenarioBlock[] {
  const blocks: ScenarioBlock[] = []
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const last = blocks[blocks.length - 1]
    if (last && last.scenarioId === q.scenarioId) {
      last.count++
    } else {
      blocks.push({ scenarioId: q.scenarioId, theme: q.theme, title: q.scenarioTitle, start: i, count: 1 })
    }
  }
  return blocks
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
  opts: { mode: SessionMode; timed: boolean; domain?: DomainKey; label?: Bi },
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
