import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

/**
 * Exposes a couple of cheap content counts (question-pool size, course count) as a
 * virtual module, so the always-loaded app shell and the home screen can show them
 * WITHOUT importing the multi-megabyte scenario / course JSON. The numbers are read
 * from the source data at build time, so they can never drift from the content.
 */
function contentStats(): Plugin {
  const VIRTUAL_ID = 'virtual:content-stats'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const read = (rel: string): unknown =>
    JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8'))
  return {
    name: 'content-stats',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      const scenarios = read('./data/scenarios.json') as { questions: unknown[] }[]
      const courses = read('./data/courses.json') as unknown[]
      const questionCount = scenarios.reduce((n, s) => n + s.questions.length, 0)
      return [
        `export const QUESTION_COUNT = ${questionCount}`,
        `export const COURSE_COUNT = ${courses.length}`,
        '',
      ].join('\n')
    },
  }
}

// https://vite.dev/config/
// `base` is '/' for local dev / preview / E2E, and is overridden to the GitHub
// Pages project path (e.g. '/cca-f-exam-trainer/') via VITE_BASE in the deploy job.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [contentStats(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@data': fileURLToPath(new URL('./data', import.meta.url)),
      '@resources': fileURLToPath(new URL('./resources', import.meta.url)),
    },
  },
  build: {
    // The views are code-split (React.lazy), so each screen's data loads with its
    // own chunk. The scenario pool (scenarios.json, ~1.7 MB) is one inherently
    // large JSON that can't be split further; it loads lazily with the exam chunk,
    // so we lift the warning ceiling above it rather than ship it up front.
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 5173,
    open: false,
  },
})
