import type { ExamSession, SessionMode } from '@/lib/scoring'
import type { Bi, DomainKey, Lang, Question, Theme } from '@/types'

/**
 * Local persistence (localStorage only — nothing leaves the browser).
 * Stores three things so a 3-day cram survives refreshes / tab-sleep / crashes:
 *  - the in-progress session (so a timed mock can be resumed),
 *  - a results history (so progress is visible across sessions),
 *  - UI prefs (language / theme / view).
 * The active session is stored by question *id* (not the full text), so it stays
 * small and self-heals if the question pool changes underneath it.
 */

const ACTIVE_KEY = 'ccaf:active:v2'
const HISTORY_KEY = 'ccaf:history:v1'
const UI_KEY = 'ccaf:ui:v1'
const HISTORY_MAX = 50

type ExamPhase = 'intro' | 'active' | 'results' | 'review'

function read(key: string): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, value: string): void {
  try {
    localStorage?.setItem(key, value)
  } catch {
    /* storage unavailable / full — degrade silently */
  }
}
function remove(key: string): void {
  try {
    localStorage?.removeItem(key)
  } catch {
    /* ignore */
  }
}

/* ----------------------------- active session ----------------------------- */

interface SerializedSession {
  questionIds: string[]
  answers: (number | null)[]
  flagged: boolean[]
  current: number
  startedAt: number
  endsAt: number
  durationMs: number
  status: 'active' | 'submitted'
  autoSubmitted: boolean
  submittedAt: number | null
  mode: SessionMode
  timed: boolean
  domain?: DomainKey
  label?: Bi
}

/** The stored active session, still serialized (question *ids*, not full text).
 * Resolving it into a live `ExamSession` needs the question pool, so that step is
 * deferred to the exam store — keeping the scenario data out of the app shell. */
export interface PersistedActiveRaw {
  phase: ExamPhase
  session: SerializedSession
}

export function saveActive(phase: ExamPhase, session: ExamSession | null): void {
  if (!session || phase === 'intro') {
    remove(ACTIVE_KEY)
    return
  }
  const payload: { phase: ExamPhase; session: SerializedSession } = {
    phase,
    session: {
      questionIds: session.questions.map((q) => q.id),
      answers: session.answers,
      flagged: session.flagged,
      current: session.current,
      startedAt: session.startedAt,
      endsAt: session.endsAt,
      durationMs: session.durationMs,
      status: session.status,
      autoSubmitted: session.autoSubmitted,
      submittedAt: session.submittedAt,
      mode: session.mode,
      timed: session.timed,
      domain: session.domain,
      label: session.label,
    },
  }
  write(ACTIVE_KEY, JSON.stringify(payload))
}

/** Read the stored active session without resolving its questions (cheap — needs
 * no scenario data). */
export function loadActiveRaw(): PersistedActiveRaw | null {
  const raw = read(ACTIVE_KEY)
  if (!raw) return null
  try {
    const p = JSON.parse(raw) as { phase: ExamPhase; session: SerializedSession }
    const s = p?.session
    if (!s || !Array.isArray(s.questionIds)) return null
    return { phase: p.phase, session: s }
  } catch {
    return null
  }
}

/** Rebuild a live session from its stored ids using the current question pool.
 * Returns null if the pool changed underneath it (any id no longer resolves), so
 * a stale saved session self-heals into a fresh start. */
export function resolveSession(
  s: SerializedSession,
  byId: Map<string, Question>,
): ExamSession | null {
  const questions = s.questionIds.map((id) => byId.get(id))
  if (questions.some((q) => q == null)) return null
  return {
    questions: questions as Question[],
    answers: s.answers,
    flagged: s.flagged,
    current: s.current,
    startedAt: s.startedAt,
    endsAt: s.endsAt,
    durationMs: s.durationMs,
    status: s.status,
    autoSubmitted: s.autoSubmitted,
    submittedAt: s.submittedAt,
    mode: s.mode,
    timed: s.timed,
    domain: s.domain,
    label: s.label,
  }
}

/** Whether a timed mock is mid-flight. Cheap (no scenario data), so the home
 * resume banner can decide without pulling the exam store + pool into its chunk. */
export function hasActiveExam(): boolean {
  const r = loadActiveRaw()
  return r?.session.status === 'active' && r.session.mode === 'exam'
}

export function clearActive(): void {
  remove(ACTIVE_KEY)
}

/* ------------------------------- history -------------------------------- */

export interface HistoryEntry {
  at: number
  mode: SessionMode
  domain: DomainKey | null
  timed: boolean
  scaled: number
  correct: number
  total: number
  pass: boolean
  perDomain: { key: DomainKey; correct: number; total: number }[]
}

export function loadHistory(): HistoryEntry[] {
  const raw = read(HISTORY_KEY)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, HISTORY_MAX)
  write(HISTORY_KEY, JSON.stringify(next))
  return next
}

export function clearHistory(): void {
  remove(HISTORY_KEY)
}

/* ------------------------------- ui prefs ------------------------------- */

export interface PersistedUi {
  lang?: Lang
  theme?: Theme
  view?: 'home' | 'exam' | 'study' | 'about'
}

export function loadUi(): PersistedUi {
  const raw = read(UI_KEY)
  if (!raw) return {}
  try {
    return (JSON.parse(raw) as PersistedUi) ?? {}
  } catch {
    return {}
  }
}

export function saveUi(ui: PersistedUi): void {
  write(UI_KEY, JSON.stringify(ui))
}
