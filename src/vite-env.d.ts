/// <reference types="vite/client" />

declare module 'virtual:content-stats' {
  /** Total questions across all scenario sets (the practice pool size). */
  export const QUESTION_COUNT: number
  /** Number of course summaries. */
  export const COURSE_COUNT: number
}
