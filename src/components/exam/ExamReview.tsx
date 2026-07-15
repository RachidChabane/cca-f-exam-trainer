import { useMemo, useState } from 'react'
import { Check, ChevronLeft, Flag, X } from 'lucide-react'
import { domainName } from '@/data/domains'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Markdown } from '@/components/ui/Markdown'
import { SCENARIO_BY_ID } from '@/scenarios'
import { isCorrect, type Answer } from '@/lib/scoring'
import { cn } from '@/lib/cn'
import { useLang, useT } from '@/lib/useT'
import { useExamStore } from '@/store/examStore'
import type { Question } from '@/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
type Filter = 'all' | 'incorrect' | 'flagged'

export function ExamReview() {
  const t = useT()
  const session = useExamStore((s) => s.session)
  const backToResults = useExamStore((s) => s.backToResults)
  const [filter, setFilter] = useState<Filter>('all')

  const items = useMemo(() => {
    if (!session) return []
    return session.questions
      .map((q, idx) => ({ q, idx, answer: session.answers[idx], flagged: session.flagged[idx] }))
      .filter((it) => {
        if (filter === 'incorrect') return !isCorrect(it.q, it.answer)
        if (filter === 'flagged') return it.flagged
        return true
      })
  }, [session, filter])

  if (!session) return null
  const total = session.questions.length

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t.filterAll },
    { key: 'incorrect', label: t.filterIncorrect },
    { key: 'flagged', label: t.filterFlagged },
  ]

  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-8 sm:px-6" data-testid="exam-review">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={backToResults}>
          <ChevronLeft className="h-4 w-4" />
          {t.backToResults}
        </Button>
        <h1 className="font-serif text-2xl font-semibold">{t.reviewTitle}</h1>
        <span className="ml-auto text-[12px] text-muted-foreground tabular-nums">
          {t.reviewCountOf(items.length, total)}
        </span>
      </div>

      <div className="sticky top-16 z-10 -mx-4 mt-4 bg-background/90 px-4 py-2 backdrop-blur-sm sm:mx-0 sm:px-0">
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'h-8 rounded-[5px] px-3 text-[13px] font-medium transition-colors duration-100',
                filter === f.key
                  ? 'bg-surface-hover text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">{t.noneMatch}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map((it) => (
            <ReviewCard
              key={it.q.id}
              q={it.q}
              number={it.idx + 1}
              userAnswer={it.answer}
              flagged={it.flagged}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewCard({
  q,
  number,
  userAnswer,
  flagged,
}: {
  q: Question
  number: number
  userAnswer: Answer
  flagged: boolean
}) {
  const t = useT()
  const lang = useLang()
  const picked = userAnswer ?? []
  const correct = isCorrect(q, userAnswer)

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-5 py-3">
        <span className="text-[13px] font-semibold tabular-nums text-muted-foreground">
          {String(number).padStart(2, '0')}
        </span>
        <Badge variant="secondary">{domainName(q.domain)[lang]}</Badge>
        {flagged && (
          <Badge variant="warning" className="gap-1">
            <Flag className="h-3 w-3 fill-warning text-warning" />
            {t.filterFlagged}
          </Badge>
        )}
        <span className="ml-auto">
          <Badge variant={correct ? 'success' : 'destructive'} className="gap-1">
            {correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {correct ? t.tagCorrect : t.tagIncorrect}
          </Badge>
        </span>
      </div>

      <div className="p-5">
        {/* Scenario framing exists only for CCA-F; CCA-P items are standalone. */}
        {q.theme && SCENARIO_BY_ID[q.theme] && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[11px]">
              {SCENARIO_BY_ID[q.theme].name[lang]}
            </Badge>
            {q.scenarioTitle && (
              <span className="text-[12.5px] font-medium text-muted-foreground">
                {q.scenarioTitle[lang]}
              </span>
            )}
          </div>
        )}
        {q.scenarioContext && (
          <details className="group mb-3">
            <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="transition-transform group-open:rotate-90">›</span>
                {t.scenarioContextToggle}
              </span>
            </summary>
            <div className="mt-2 rounded-md border border-border bg-surface px-4 py-3 text-[13px] leading-relaxed">
              <Markdown>{q.scenarioContext[lang]}</Markdown>
            </div>
          </details>
        )}
        <h3 className="text-[15.5px] font-semibold leading-snug">{q.stem[lang]}</h3>

        <ul className="mt-4 space-y-2">
          {q.options[lang].map((opt, idx) => {
            const isAns = q.correct.includes(idx)
            const isUser = picked.includes(idx)
            return (
              <li
                key={idx}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-[14px]',
                  isAns
                    ? 'border-success/50 bg-success/10'
                    : isUser
                      ? 'border-destructive/50 bg-destructive/10'
                      : 'border-border',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold',
                    isAns
                      ? 'bg-success text-success-foreground'
                      : isUser
                        ? 'bg-destructive text-destructive-foreground'
                        : 'border border-border-strong text-muted-foreground',
                  )}
                >
                  {LETTERS[idx]}
                </span>
                <span className="flex-1 leading-relaxed">{opt}</span>
                <span className="ml-1 mt-0.5 flex shrink-0 gap-1">
                  {isAns && (
                    <span className="text-[11px] font-medium text-success">{t.correctAnswer}</span>
                  )}
                  {isUser && !isAns && (
                    <span className="text-[11px] font-medium text-destructive">{t.yourAnswer}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>

        {userAnswer == null && (
          <p className="mt-3 text-[12.5px] italic text-muted-foreground">{t.notAnswered}</p>
        )}

        <div className="mt-4 rounded-md border border-border bg-surface p-4">
          <h4 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-primary">
            {t.whyCorrect}
          </h4>
          <p className="text-[13.5px] leading-relaxed text-foreground">{q.explanation[lang]}</p>
        </div>

        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-[12px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="transition-transform group-open:rotate-90">›</span>
              {t.whyOthers}
            </span>
          </summary>
          <ul className="mt-2 space-y-2">
            {q.options[lang].map((_, idx) =>
              // Skip every keyed option (all of them, for multiple-response) and
              // any option with no written rebuttal — the imported CCA-P set carries
              // one combined rationale instead of per-option ones.
              q.correct.includes(idx) || !q.distractor_explanations[lang][idx] ? null : (
                <li key={idx} className="flex gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{LETTERS[idx]}.</span>
                  <span>{q.distractor_explanations[lang][idx]}</span>
                </li>
              ),
            )}
          </ul>
        </details>
      </div>
    </Card>
  )
}
