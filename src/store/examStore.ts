import { create } from 'zustand'
import { DOMAIN_BY_KEY } from '@/data/blueprint'
import { QUESTIONS, SCENARIO_SETS } from '@/data/scenarioSets'
import { GENERATED_BANK_SETS, OFFICIAL_BANK_SETS, type BankSource } from '@/data/questionBank'
import { SCENARIOS_PRESENTED } from '@/scenarios'
import {
  buildSession,
  flattenScenarioSets,
  gradeSession,
  sampleDrill,
  sampleScenarioExam,
  type ExamSession,
} from '@/lib/scoring'
import {
  appendHistory,
  clearActive,
  clearHistory,
  loadActiveRaw,
  loadHistory,
  resolveSession,
  saveActive,
  type HistoryEntry,
} from '@/lib/persist'
import type { DomainKey, Question } from '@/types'

export type ExamPhase = 'intro' | 'active' | 'results' | 'review'

/** Default size of an untimed single-domain drill (capped by what's available). */
export const DRILL_COUNT = 15

interface ExamState {
  session: ExamSession | null
  phase: ExamPhase
  history: HistoryEntry[]
  start: () => void
  startScenario: () => void
  startBank: (source: BankSource) => void
  startDrill: (domain: DomainKey, count?: number) => void
  retryWrong: () => void
  answer: (optionIndex: number) => void
  toggleFlag: () => void
  goto: (index: number) => void
  next: () => void
  prev: () => void
  submit: (auto?: boolean) => void
  goToReview: () => void
  backToResults: () => void
  reset: () => void
  clearPastResults: () => void
}

/** Record a finished session into the cross-session history. */
function recordHistory(session: ExamSession): HistoryEntry[] {
  const r = gradeSession(session)
  return appendHistory({
    at: session.submittedAt ?? Date.now(),
    mode: session.mode,
    domain: session.domain ?? null,
    timed: session.timed,
    scaled: r.scaled,
    correct: r.correct,
    total: r.total,
    pass: r.pass,
    perDomain: r.perDomain.map((d) => ({ key: d.key, correct: d.correct, total: d.total })),
  })
}

// Resolve any stored in-progress session against the live pool. This lives here
// (the exam chunk) rather than in persist so the question data stays out of the
// always-loaded shell.
// Restore lookup spans the authored scenario pool AND both question-bank sittings,
// so an in-progress bank exam survives a refresh too.
const BANK_QUESTIONS = [
  ...flattenScenarioSets(OFFICIAL_BANK_SETS),
  ...flattenScenarioSets(GENERATED_BANK_SETS),
]
const QBY_ID = new Map<string, Question>(
  [...QUESTIONS, ...BANK_QUESTIONS].map((q) => [q.id, q]),
)
const restoredRaw = loadActiveRaw()
const restoredSession = restoredRaw ? resolveSession(restoredRaw.session, QBY_ID) : null
const restored = restoredSession ? { phase: restoredRaw!.phase, session: restoredSession } : null

export const useExamStore = create<ExamState>((set, get) => ({
  session: restored?.session ?? null,
  phase: restored?.phase ?? 'intro',
  history: loadHistory(),

  // The primary exam IS the scenario-set sitting now: 4 of the 6 fixed themes,
  // one random instance each, 15 linked questions per scenario (~60 total),
  // timed. `startScenario` is a preserved alias for the same structure.
  start: () => {
    const { questions } = sampleScenarioExam(SCENARIO_SETS)
    if (questions.length === 0) return
    set({ session: buildSession(questions, { mode: 'exam', timed: true }), phase: 'active' })
  },

  startScenario: () => {
    const { questions } = sampleScenarioExam(SCENARIO_SETS)
    if (questions.length === 0) return
    set({ session: buildSession(questions, { mode: 'exam', timed: true }), phase: 'active' })
  },

  // A timed sitting drawn from one provenance of the imported question bank: all
  // four bank scenarios, questions shuffled within each scenario block. Source
  // ('official' = imported verbatim) vs ('ai_generated' = original siblings) is
  // never mixed, so the candidate always knows which bank they are practising.
  startBank: (source) => {
    const sets = source === 'official' ? OFFICIAL_BANK_SETS : GENERATED_BANK_SETS
    // Draw a real-exam-shaped sitting: up to 4 of the available themes (one
    // instance each). The source bank has exactly 4 themes (all shown); the
    // AI-generated pool spans all 6, so it samples 4-of-6 like the real exam.
    const present = Math.min(SCENARIOS_PRESENTED, sets.length)
    const { questions } = sampleScenarioExam(sets, present)
    if (questions.length === 0) return
    set({ session: buildSession(questions, { mode: 'exam', timed: true }), phase: 'active' })
  },

  startDrill: (domain, count = DRILL_COUNT) => {
    const questions = sampleDrill(QUESTIONS, domain, count)
    if (questions.length === 0) return
    set({
      session: buildSession(questions, {
        mode: 'drill',
        timed: false,
        domain,
        label: DOMAIN_BY_KEY[domain].name,
      }),
      phase: 'active',
    })
  },

  retryWrong: () => {
    const s = get().session
    if (!s) return
    const wrong = s.questions.filter((q, i) => s.answers[i] !== q.correct_index)
    if (wrong.length === 0) return
    set({
      session: buildSession(wrong, { mode: 'drill', timed: false }),
      phase: 'active',
    })
  },

  answer: (optionIndex) => {
    const s = get().session
    if (!s || s.status !== 'active') return
    // Instant-feedback mode: selecting an option commits it and reveals the
    // answer immediately, so a question locks on first pick. Ignoring re-answers
    // keeps the score honest (you can't switch to the right option after seeing
    // it) and mirrors the reveal lock in Study-mode quizzes.
    if (s.answers[s.current] !== null) return
    const answers = s.answers.slice()
    answers[s.current] = optionIndex
    set({ session: { ...s, answers } })
  },

  toggleFlag: () => {
    const s = get().session
    if (!s) return
    const flagged = s.flagged.slice()
    flagged[s.current] = !flagged[s.current]
    set({ session: { ...s, flagged } })
  },

  goto: (index) => {
    const s = get().session
    if (!s) return
    const clamped = Math.max(0, Math.min(index, s.questions.length - 1))
    set({ session: { ...s, current: clamped } })
  },

  next: () => {
    const s = get().session
    if (!s) return
    if (s.current < s.questions.length - 1) set({ session: { ...s, current: s.current + 1 } })
  },

  prev: () => {
    const s = get().session
    if (!s) return
    if (s.current > 0) set({ session: { ...s, current: s.current - 1 } })
  },

  submit: (auto = false) => {
    const s = get().session
    if (!s || s.status !== 'active') return
    const submitted: ExamSession = {
      ...s,
      status: 'submitted',
      submittedAt: Date.now(),
      autoSubmitted: auto,
    }
    set({ session: submitted, phase: 'results', history: recordHistory(submitted) })
  },

  goToReview: () => set({ phase: 'review' }),
  backToResults: () => set({ phase: 'results' }),

  reset: () => set({ session: null, phase: 'intro' }),

  clearPastResults: () => {
    clearHistory()
    set({ history: [] })
  },
}))

// Persist the in-progress session + phase on every change so a refresh, tab-sleep,
// or crash during a timed mock can be resumed. localStorage only — nothing leaves
// the browser.
useExamStore.subscribe((state) => saveActive(state.phase, state.session))
if (restored == null) clearActive()
