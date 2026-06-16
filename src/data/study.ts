import quizzesRaw from '@data/quizzes.json'
import trapsRaw from '@data/exam_traps.json'
import type { QuizBank, TrapBank } from '@/types'

/**
 * Study-mode mini-quizzes (per course + per scenario theme) and exam traps
 * (grouped by scenario theme and by exam domain). Loaded only by the Study chunk.
 */
export const QUIZZES = quizzesRaw as QuizBank
export const EXAM_TRAPS = trapsRaw as TrapBank
