import scenariosRaw from '@data/scenarios.json'
import type { Question, ScenarioSet } from '@/types'

/**
 * The scenario sitting content — by far the largest data file (~1.7 MB). It is
 * imported ONLY by the exam store and exam-view components, so it ships in the
 * exam chunk and never weighs down the shell, home, study, or about screens.
 */
export const SCENARIO_SETS = scenariosRaw as ScenarioSet[]

/**
 * The flat question view. Every scenario question is flattened with its parent
 * scenario's shared context + identity, so the per-domain drills, scoring, the
 * navigator, and the answer review can all work question-by-question while the
 * full scenario sitting still groups them by scenario.
 */
export const QUESTIONS: Question[] = SCENARIO_SETS.flatMap((s) =>
  s.questions.map((q) => ({
    id: q.id,
    domain: q.domain,
    scenarioId: s.id,
    theme: s.theme,
    scenarioTitle: s.title,
    scenarioContext: s.context,
    stem: q.stem,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation,
    distractor_explanations: q.distractor_explanations,
  })),
)
