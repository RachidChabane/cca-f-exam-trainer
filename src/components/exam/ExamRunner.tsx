import { useMemo, useState } from 'react'
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Flag, LayoutGrid, Pause, Play, Timer, X } from 'lucide-react'
import { BLUEPRINT } from '@/data/blueprint'
import { domainName } from '@/data/domains'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Markdown } from '@/components/ui/Markdown'
import { Modal } from '@/components/ui/Modal'
import { QuestionGrid } from '@/components/exam/QuestionGrid'
import { SCENARIO_BY_ID } from '@/scenarios'
import { computeBlocks, isAnswerComplete, isCorrect } from '@/lib/scoring'
import { cn } from '@/lib/cn'
import { formatDuration, useCountdown } from '@/lib/useCountdown'
import { useLang, useT } from '@/lib/useT'
import { useExamStore } from '@/store/examStore'
import type { Lang, Question } from '@/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const WARN_MS = BLUEPRINT.session.soft_warning_remaining_minutes * 60 * 1000

/**
 * A scenario-matching item: several short scenarios ("rows"), each classified
 * against ONE shared option set. Options may key more than one row, so this is a
 * per-row choice rather than a permutation — the UI must not remove an option
 * once it has been used elsewhere.
 *
 * `answer[r]` is the option index picked for row r (-1 = not yet classified), and
 * `q.correct[r]` is the keyed one. The item locks only when every row is filled.
 */
function MatchingGrid({
  q,
  lang,
  answer,
  revealed,
  onPick,
  t,
}: {
  q: Question
  lang: Lang
  answer: number[]
  revealed: boolean
  onPick: (row: number, option: number) => void
  t: ReturnType<typeof useT>
}) {
  const rows = q.rows?.[lang] ?? []
  const options = q.options[lang]
  return (
    <div className="mt-5 space-y-3" data-testid="matching-grid">
      {rows.map((row, r) => {
        const picked = answer[r] ?? -1
        const keyed = q.correct[r]
        const rowRight = picked === keyed
        return (
          <div
            key={r}
            className={cn(
              'rounded-lg border p-3.5',
              revealed
                ? rowRight
                  ? 'border-success/60 bg-success/10'
                  : 'border-destructive/60 bg-destructive/10'
                : 'border-border bg-card',
            )}
            data-testid={`matching-row-${r}`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border-strong text-[12px] font-semibold text-muted-foreground">
                {revealed ? (
                  rowRight ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-destructive" />
                  )
                ) : (
                  r + 1
                )}
              </span>
              <p className="flex-1 text-[14.5px] leading-relaxed text-foreground">{row}</p>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2 pl-9">
              {options.map((opt, o) => {
                const isPicked = picked === o
                const isKeyed = keyed === o
                return (
                  <button
                    key={o}
                    role="radio"
                    aria-checked={isPicked}
                    aria-label={`${row}: ${opt}`}
                    disabled={revealed}
                    onClick={() => onPick(r, o)}
                    data-testid={`matching-${r}-${o}`}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-[12.5px] transition-colors duration-100',
                      revealed
                        ? isKeyed
                          ? 'border-success bg-success/20 font-semibold text-success'
                          : isPicked
                            ? 'border-destructive bg-destructive/20 text-destructive line-through'
                            : 'border-border text-muted-foreground opacity-60'
                        : isPicked
                          ? 'border-primary bg-primary/10 font-medium text-primary'
                          : 'border-border bg-card text-foreground hover:border-border-strong hover:bg-surface-hover',
                    )}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {revealed && !rowRight && (
              <p className="mt-2 pl-9 text-[12.5px] text-muted-foreground">
                {t.correctAnswer}: <span className="font-medium text-success">{options[keyed]}</span>
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ExamRunner() {
  const t = useT()
  const lang = useLang()
  const session = useExamStore((s) => s.session)
  const answer = useExamStore((s) => s.answer)
  const answerRow = useExamStore((s) => s.answerRow)
  const toggleFlag = useExamStore((s) => s.toggleFlag)
  const next = useExamStore((s) => s.next)
  const prev = useExamStore((s) => s.prev)
  const submit = useExamStore((s) => s.submit)

  const [gridOpen, setGridOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const blocks = useMemo(
    () => (session ? computeBlocks(session.questions, domainName) : []),
    [session],
  )

  const togglePause = useExamStore((s) => s.togglePause)

  const liveRemaining = useCountdown(
    session?.endsAt ?? 0,
    (session?.timed ?? false) && session?.status === 'active' && session?.pausedRemainingMs == null,
    () => submit(true),
  )

  if (!session) return null

  // The clock is frozen either for a manual break (`paused`, hides the question)
  // or automatically while reading the revealed explanations of an answered
  // question. Both stash the remaining ms in `pausedRemainingMs`.
  const manualPaused = session.timed && session.paused
  const timerFrozen = session.timed && session.pausedRemainingMs != null
  const readingPaused = timerFrozen && !manualPaused
  const remaining = timerFrozen ? (session.pausedRemainingMs as number) : liveRemaining

  const i = session.current
  const q = session.questions[i]
  const total = session.questions.length
  const selected = session.answers[i] ?? []
  // Revealed only once the answer is COMPLETE — a half-picked multiple-response
  // shows nothing yet, so the candidate can still change their mind.
  const revealed = isAnswerComplete(q, session.answers[i])
  const isSelected = (idx: number) => selected.includes(idx)
  const isKey = (idx: number) => q.correct.includes(idx)
  const isFlagged = session.flagged[i]
  // A question counts as answered only when complete, matching the reveal/lock
  // rule — so the progress count never claims a half-filled item is done.
  const answeredCount = session.questions.filter((qq, idx) =>
    isAnswerComplete(qq, session.answers[idx]),
  ).length
  const unanswered = total - answeredCount
  const warning = session.timed && remaining <= WARN_MS
  const domain = { name: domainName(q.domain) }
  const theme = q.theme ? SCENARIO_BY_ID[q.theme] : undefined
  const selectCount = q.select_count ?? q.correct.length
  const needed = q.format === 'mr' ? selectCount - selected.length : 0
  const hasContext = Boolean(q.scenarioContext)
  const answerCorrect = isCorrect(q, session.answers[i])

  const block = blocks.find((b) => i >= b.start && i < b.start + b.count)
  const posInScenario = block ? i - block.start + 1 : 1
  const scenarioCount = block ? block.count : total

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Status bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {theme && (
          <Badge variant="primary" className="font-medium" data-testid="scenario-tag">
            {t.scenarioTag}: {theme.name[lang]}
          </Badge>
        )}
        <Badge variant="secondary" className="font-medium">
          {domain.name[lang]}
        </Badge>
        <span className="text-[13px] text-muted-foreground tabular-nums" data-testid="question-counter">
          {t.questionOf(i + 1, total)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-[12px] text-muted-foreground tabular-nums sm:inline">
            {t.answeredCount(answeredCount, total)}
          </span>
          {session.timed ? (
            <div
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[13px] font-semibold tabular-nums',
                timerFrozen
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : warning
                    ? 'border-warning/50 bg-warning/10 text-warning'
                    : 'border-border bg-card text-foreground',
              )}
              aria-label={timerFrozen ? t.timerPaused : t.timeRemaining}
              title={timerFrozen ? t.timerPaused : t.timeRemaining}
              data-testid="exam-timer"
            >
              {timerFrozen ? <Pause className="h-3.5 w-3.5" /> : <Timer className="h-3.5 w-3.5" />}
              {formatDuration(remaining)}
            </div>
          ) : (
            <Badge variant="outline" className="font-medium" data-testid="untimed-badge">
              {t.untimed}
            </Badge>
          )}
          {session.timed && (
            <Button
              variant="secondary"
              size="iconSm"
              aria-label={manualPaused ? t.resumeExam : t.pauseExam}
              title={manualPaused ? t.resumeExam : t.pauseExam}
              onClick={togglePause}
              data-testid="pause-exam"
            >
              {manualPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          )}
          <Button
            variant="secondary"
            size="iconSm"
            aria-label={t.navigator}
            onClick={() => setGridOpen(true)}
            data-testid="open-navigator"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {warning && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-[13px] text-foreground animate-fade-in"
        >
          <AlertTriangle className="h-4 w-4 text-warning" />
          {t.timeAlmostUp}
        </div>
      )}

      {manualPaused ? (
        <Card className="mx-auto flex max-w-xl flex-col items-center gap-4 p-10 text-center animate-fade-in" data-testid="paused-overlay">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary">
            <Pause className="h-6 w-6" />
          </span>
          <h2 className="font-serif text-2xl font-semibold">{t.pausedTitle}</h2>
          <p className="max-w-sm text-[14px] leading-relaxed text-muted-foreground">{t.pausedBody}</p>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-semibold tabular-nums">
            <Timer className="h-3.5 w-3.5" />
            {formatDuration(remaining)} {t.timeRemaining}
          </div>
          <Button size="lg" onClick={togglePause} data-testid="resume-paused" className="mt-1">
            <Play className="h-4 w-4" />
            {t.resumeExam}
          </Button>
        </Card>
      ) : (
      <div
        className={cn(
          'grid gap-6 lg:items-start',
          // CCA-P items are standalone: with no shared context there is no left
          // panel, so the question takes the full width instead of leaving a hole.
          hasContext && 'lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]',
        )}
      >
        {/* Scenario context — sticky, stays visible across this scenario's whole set.
            Scenario-framed exams (CCA-F) only. */}
        {hasContext && (
        <aside className="lg:sticky lg:top-20" data-testid="scenario-context">
          <Card className="p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                {t.scenarioLabel}
              </span>
              {theme && <Badge variant="outline">{theme.name[lang]}</Badge>}
            </div>
            <h2 className="font-serif text-lg font-semibold leading-snug text-foreground">
              {q.scenarioTitle?.[lang]}
            </h2>
            {session.mode === 'exam' && (
              <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">
                {t.scenarioProgress(posInScenario, scenarioCount)}
              </p>
            )}
            <div className="mt-3 max-h-[42vh] overflow-auto rounded-md border border-border bg-surface px-4 py-3 text-[13.5px] leading-relaxed lg:max-h-[calc(100vh-12rem)]">
              <Markdown>{q.scenarioContext?.[lang] ?? ''}</Markdown>
            </div>
          </Card>
        </aside>
        )}

        {/* Question */}
        <div className="min-w-0">
          <Card className="p-6">
            <h2 className="text-[17px] font-semibold leading-snug text-foreground">
              {q.stem[lang]}
            </h2>

            {/* Multiple-response: the real exam states how many to select, and the
                item only locks once that many are chosen. Show the running count so
                the rule is visible rather than discovered. */}
            {q.format === 'mr' && (
              <p
                className={cn(
                  'mt-2 text-[13px] font-medium',
                  revealed ? 'text-muted-foreground' : 'text-primary',
                )}
                data-testid="mr-hint"
              >
                {t.selectExactly(selectCount)}
                {!revealed && needed > 0 && ` — ${t.selectRemaining(needed)}`}
              </p>
            )}

            {q.format === 'matching' ? (
              <MatchingGrid
                q={q}
                lang={lang}
                answer={selected}
                revealed={revealed}
                onPick={answerRow}
                t={t}
              />
            ) : (
            <div
              className="mt-5 space-y-2.5"
              role={q.format === 'mr' ? 'group' : 'radiogroup'}
              aria-label={q.stem[lang]}
            >
              {q.options[lang].map((opt, idx) => {
                const isSel = isSelected(idx)
                const isCorrectOpt = isKey(idx)
                const rationale = isCorrectOpt
                  ? q.explanation[lang]
                  : q.distractor_explanations[lang][idx]
                return (
                  <div key={idx}>
                    <button
                      role={q.format === 'mr' ? 'checkbox' : 'radio'}
                      aria-checked={isSel}
                      disabled={revealed}
                      onClick={() => answer(idx)}
                      data-testid={`option-${idx}`}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors duration-100',
                        revealed
                          ? isCorrectOpt
                            ? 'border-success/60 bg-success/10'
                            : isSel
                              ? 'border-destructive/60 bg-destructive/10'
                              : 'border-border opacity-70'
                          : isSel
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card hover:border-border-strong hover:bg-surface-hover',
                        revealed && 'cursor-default',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[12px] font-semibold',
                          revealed && isCorrectOpt
                            ? 'border-success bg-success text-success-foreground'
                            : revealed && isSel
                              ? 'border-destructive bg-destructive text-destructive-foreground'
                              : isSel
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border-strong text-muted-foreground',
                        )}
                      >
                        {revealed && isCorrectOpt ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : revealed && isSel ? (
                          <X className="h-3.5 w-3.5" />
                        ) : (
                          LETTERS[idx]
                        )}
                      </span>
                      <span className="flex-1 text-[14.5px] leading-relaxed text-foreground">{opt}</span>
                      {revealed && (isCorrectOpt || isSel) && (
                        <span
                          className={cn(
                            'ml-1 mt-0.5 shrink-0 text-[11px] font-medium',
                            isCorrectOpt ? 'text-success' : 'text-destructive',
                          )}
                        >
                          {isCorrectOpt ? t.correctAnswer : t.yourAnswer}
                        </span>
                      )}
                    </button>
                    {revealed && (
                      <p
                        data-testid={`rationale-${idx}`}
                        className={cn(
                          'mt-1.5 pl-9 pr-1 text-[13px] leading-relaxed',
                          isCorrectOpt ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        <span
                          className={cn(
                            'font-semibold uppercase tracking-wide text-[11px]',
                            isCorrectOpt ? 'text-success' : 'text-destructive/80',
                          )}
                        >
                          {isCorrectOpt ? t.whyCorrect : t.whyIncorrect}
                          {' · '}
                        </span>
                        {rationale}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
            )}
            {/* Matching keys per row, so its walkthrough lives in the overall
                explanation rather than in per-option rebuttals. */}
            {revealed && q.format === 'matching' && (
              <p className="mt-4 text-[13px] leading-relaxed text-foreground" data-testid="matching-rationale">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-success">
                  {t.whyCorrect}
                  {' · '}
                </span>
                {q.explanation[lang]}
              </p>
            )}
            {revealed && (
              <div
                data-testid="answer-feedback"
                className={cn(
                  'mt-4 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-semibold',
                  answerCorrect
                    ? 'border-success/40 bg-success/10 text-success'
                    : 'border-destructive/40 bg-destructive/10 text-destructive',
                )}
              >
                {answerCorrect ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                {answerCorrect ? t.tagCorrect : t.tagIncorrect}
              </div>
            )}
            {revealed && readingPaused && (
              <p
                data-testid="reading-paused-hint"
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-primary"
              >
                <Pause className="h-3.5 w-3.5" />
                {t.timerPausedReading}
              </p>
            )}
          </Card>

          {/* Footer nav */}
          <div className="mt-4 flex items-center gap-2">
            <Button variant="secondary" onClick={prev} disabled={i === 0} data-testid="prev-question">
              <ChevronLeft className="h-4 w-4" />
              {t.previous}
            </Button>
            <Button
              variant={isFlagged ? 'subtle' : 'outline'}
              onClick={toggleFlag}
              className={cn(isFlagged && 'text-warning')}
              data-testid="flag-question"
            >
              <Flag className={cn('h-4 w-4', isFlagged && 'fill-warning text-warning')} />
              {isFlagged ? t.flagged : t.flag}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              {i === total - 1 ? (
                <Button onClick={() => setConfirmOpen(true)} data-testid="submit-exam-last">
                  {t.submitExam}
                </Button>
              ) : (
                <Button onClick={next} data-testid="next-question">
                  {t.next}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setConfirmOpen(true)}
              data-testid="submit-exam"
              className="text-[13px] font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
            >
              {t.submitExam}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Navigator modal */}
      <Modal open={gridOpen} onClose={() => setGridOpen(false)} className="max-h-[80vh] overflow-y-auto">
        <QuestionGrid onNavigate={() => setGridOpen(false)} />
      </Modal>

      {/* Submit confirm */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} labelledBy="submit-title">
        <h2 id="submit-title" className="font-serif text-lg font-semibold">
          {t.submitTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {unanswered === 0 ? t.submitBodyAll : t.submitBodySome(unanswered)}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            {t.cancel}
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false)
              submit(false)
            }}
            data-testid="confirm-submit"
          >
            {t.confirmSubmit}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
