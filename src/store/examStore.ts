import { create } from 'zustand'
import { BLUEPRINT, QUESTIONS } from '@/data'
import { sampleSession, type ExamSession } from '@/lib/scoring'

export type ExamPhase = 'intro' | 'active' | 'results' | 'review'

interface ExamState {
  session: ExamSession | null
  phase: ExamPhase
  start: () => void
  answer: (optionIndex: number) => void
  toggleFlag: () => void
  goto: (index: number) => void
  next: () => void
  prev: () => void
  submit: (auto?: boolean) => void
  goToReview: () => void
  backToResults: () => void
  reset: () => void
}

function newSession(): ExamSession {
  const questions = sampleSession(QUESTIONS)
  const durationMs = BLUEPRINT.session.time_limit_minutes * 60 * 1000
  const startedAt = Date.now()
  return {
    questions,
    answers: questions.map(() => null),
    flagged: questions.map(() => false),
    current: 0,
    startedAt,
    endsAt: startedAt + durationMs,
    durationMs,
    status: 'active',
    autoSubmitted: false,
    submittedAt: null,
  }
}

export const useExamStore = create<ExamState>((set, get) => ({
  session: null,
  phase: 'intro',

  start: () => set({ session: newSession(), phase: 'active' }),

  answer: (optionIndex) => {
    const s = get().session
    if (!s || s.status !== 'active') return
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
    set({
      session: { ...s, status: 'submitted', submittedAt: Date.now(), autoSubmitted: auto },
      phase: 'results',
    })
  },

  goToReview: () => set({ phase: 'review' }),
  backToResults: () => set({ phase: 'results' }),

  reset: () => set({ session: null, phase: 'intro' }),
}))
