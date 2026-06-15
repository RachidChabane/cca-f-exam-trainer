import { useMemo, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, Flag, LayoutGrid, Timer } from 'lucide-react'
import { BLUEPRINT, DOMAIN_BY_KEY } from '@/data'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Markdown } from '@/components/ui/Markdown'
import { Modal } from '@/components/ui/Modal'
import { QuestionGrid } from '@/components/exam/QuestionGrid'
import { SCENARIO_BY_ID } from '@/scenarios'
import { computeBlocks } from '@/lib/scoring'
import { cn } from '@/lib/cn'
import { formatDuration, useCountdown } from '@/lib/useCountdown'
import { useLang, useT } from '@/lib/useT'
import { useExamStore } from '@/store/examStore'

const LETTERS = ['A', 'B', 'C', 'D']
const WARN_MS = BLUEPRINT.session.soft_warning_remaining_minutes * 60 * 1000

export function ExamRunner() {
  const t = useT()
  const lang = useLang()
  const session = useExamStore((s) => s.session)
  const answer = useExamStore((s) => s.answer)
  const toggleFlag = useExamStore((s) => s.toggleFlag)
  const next = useExamStore((s) => s.next)
  const prev = useExamStore((s) => s.prev)
  const submit = useExamStore((s) => s.submit)

  const [gridOpen, setGridOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const blocks = useMemo(() => (session ? computeBlocks(session.questions) : []), [session])

  const remaining = useCountdown(
    session?.endsAt ?? 0,
    (session?.timed ?? false) && session?.status === 'active',
    () => submit(true),
  )

  if (!session) return null

  const i = session.current
  const q = session.questions[i]
  const total = session.questions.length
  const selected = session.answers[i]
  const isFlagged = session.flagged[i]
  const answeredCount = session.answers.filter((a) => a !== null).length
  const unanswered = total - answeredCount
  const warning = session.timed && remaining <= WARN_MS
  const domain = DOMAIN_BY_KEY[q.domain]
  const theme = SCENARIO_BY_ID[q.theme]

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
        <span className="text-[13px] text-muted-foreground tabular-nums">
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
                warning
                  ? 'border-warning/50 bg-warning/10 text-warning'
                  : 'border-border bg-card text-foreground',
              )}
              aria-label={t.timeRemaining}
              title={t.timeRemaining}
              data-testid="exam-timer"
            >
              <Timer className="h-3.5 w-3.5" />
              {formatDuration(remaining)}
            </div>
          ) : (
            <Badge variant="outline" className="font-medium" data-testid="untimed-badge">
              {t.untimed}
            </Badge>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start">
        {/* Scenario context — sticky, stays visible across this scenario's whole set */}
        <aside className="lg:sticky lg:top-20" data-testid="scenario-context">
          <Card className="p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                {t.scenarioLabel}
              </span>
              {theme && <Badge variant="outline">{theme.name[lang]}</Badge>}
            </div>
            <h2 className="font-serif text-lg font-semibold leading-snug text-foreground">
              {q.scenarioTitle[lang]}
            </h2>
            {session.mode === 'exam' && (
              <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">
                {t.scenarioProgress(posInScenario, scenarioCount)}
              </p>
            )}
            <div className="mt-3 max-h-[42vh] overflow-auto rounded-md border border-border bg-surface px-4 py-3 text-[13.5px] leading-relaxed lg:max-h-[calc(100vh-12rem)]">
              <Markdown>{q.scenarioContext[lang]}</Markdown>
            </div>
          </Card>
        </aside>

        {/* Question */}
        <div className="min-w-0">
          <Card className="p-6">
            <h2 className="text-[17px] font-semibold leading-snug text-foreground">
              {q.stem[lang]}
            </h2>

            <div className="mt-5 space-y-2.5" role="radiogroup" aria-label={q.stem[lang]}>
              {q.options[lang].map((opt, idx) => {
                const isSel = selected === idx
                return (
                  <button
                    key={idx}
                    role="radio"
                    aria-checked={isSel}
                    onClick={() => answer(idx)}
                    data-testid={`option-${idx}`}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors duration-100',
                      isSel
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-border-strong hover:bg-surface-hover',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[12px] font-semibold',
                        isSel
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border-strong text-muted-foreground',
                      )}
                    >
                      {LETTERS[idx]}
                    </span>
                    <span className="text-[14.5px] leading-relaxed text-foreground">{opt}</span>
                  </button>
                )
              })}
            </div>
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
