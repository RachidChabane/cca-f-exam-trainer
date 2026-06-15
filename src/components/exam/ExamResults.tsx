import { useMemo } from 'react'
import { Info, Repeat, RotateCcw, ScrollText } from 'lucide-react'
import { BLUEPRINT, DOMAIN_BY_KEY } from '@/data'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { gradeSession } from '@/lib/scoring'
import { useLang, useT } from '@/lib/useT'
import { useExamStore } from '@/store/examStore'
import { useUiStore } from '@/store/uiStore'

export function ExamResults() {
  const t = useT()
  const lang = useLang()
  const session = useExamStore((s) => s.session)
  const goToReview = useExamStore((s) => s.goToReview)
  const reset = useExamStore((s) => s.reset)
  const retryWrong = useExamStore((s) => s.retryWrong)
  const setView = useUiStore((s) => s.setView)

  const result = useMemo(() => (session ? gradeSession(session) : null), [session])
  if (!session || !result) return null

  const { scaled, pass, correct, total, perDomain, weakest } = result
  const isDrill = session.mode === 'drill'
  const wrong = total - correct
  const accPct = total ? Math.round((correct / total) * 100) : 0
  const passMark = BLUEPRINT.exam.mechanics.scaled_score.pass
  const scorePct = ((scaled - 100) / 900) * 100
  const passPct = ((passMark - 100) / 900) * 100

  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold">
        {isDrill ? t.drillResultsTitle : t.resultsTitle}
      </h1>

      {session.autoSubmitted && (
        <p className="mt-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-[13px] text-foreground">
          {t.autoSubmitNote}
        </p>
      )}

      {/* Score hero */}
      {isDrill ? (
        <Card className="mt-6 p-6">
          {session.label && (
            <Badge variant="secondary" className="mb-3 font-medium">
              {session.label[lang]}
            </Badge>
          )}
          <div className="flex items-baseline gap-2">
            <span
              data-testid="result-accuracy"
              className={cn(
                'font-serif text-5xl font-semibold tabular-nums',
                accPct >= 70 ? 'text-success' : 'text-foreground',
              )}
            >
              {accPct}%
            </span>
            <span className="text-sm text-muted-foreground">{t.drillScoreLine(correct, total)}</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full',
                accPct >= 70 ? 'bg-success' : accPct >= 50 ? 'bg-warning' : 'bg-destructive',
              )}
              style={{ width: `${accPct}%` }}
            />
          </div>
        </Card>
      ) : (
        <Card className="mt-6 p-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-baseline gap-1.5">
                <span
                  data-testid="result-scaled"
                  className={cn(
                    'font-serif text-5xl font-semibold tabular-nums',
                    pass ? 'text-success' : 'text-foreground',
                  )}
                >
                  {scaled}
                </span>
                <span className="text-sm text-muted-foreground">{t.outOf1000}</span>
              </div>
              <span className="mt-1 text-[13px] text-muted-foreground">
                {t.scaledScore} · {t.rawScore(correct, total)}
              </span>
            </div>
            <div className="sm:ml-auto">
              <Badge
                variant={pass ? 'success' : 'destructive'}
                className="px-3 py-1 text-[13px] font-semibold"
                data-testid="result-verdict"
              >
                {pass ? t.verdictPass : t.verdictFail}
              </Badge>
            </div>
          </div>

          {/* Score track with pass marker */}
          <div className="relative mt-6 h-2.5 rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full', pass ? 'bg-success' : 'bg-primary/70')}
              style={{ width: `${Math.max(0, Math.min(100, scorePct))}%` }}
            />
            <div
              className="absolute -top-1 bottom-[-4px] w-px bg-foreground/60"
              style={{ left: `${passPct}%` }}
              title={t.passLineLabel}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>100</span>
            <span style={{ marginLeft: `${passPct - 6}%` }}>{t.passLineLabel}</span>
            <span>1000</span>
          </div>

          <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">
            {pass ? t.passMessage : t.failMessage}
          </p>
        </Card>
      )}

      {/* Per-domain (only when it spans more than one domain) */}
      {perDomain.length > 1 && (
      <Card className="mt-5 p-6">
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t.byDomainHeading}
        </h2>
        <ul className="space-y-3.5">
          {perDomain.map((d) => {
            const pct = Math.round(d.accuracy * 100)
            const isWeak = weakest?.key === d.key && perDomain.length > 1
            return (
              <li key={d.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    {DOMAIN_BY_KEY[d.key].name[lang]}
                    {isWeak && (
                      <Badge variant="warning" className="text-[10px]">
                        {t.weakestDomain}
                      </Badge>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {d.correct}/{d.total} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      pct >= 70 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-destructive',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
      )}

      {/* Score note (full mock only — the linear scaling is for the 60Q exam) */}
      {!isDrill && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-surface px-3.5 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold text-foreground">{t.scoreNoteTitle}. </span>
            {t.scoreNote}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-7 flex flex-wrap gap-2">
        <Button onClick={goToReview} data-testid="review-answers">
          <ScrollText className="h-4 w-4" />
          {t.reviewAnswers}
        </Button>
        {wrong > 0 && (
          <Button variant="secondary" onClick={retryWrong} data-testid="retry-wrong">
            <Repeat className="h-4 w-4" />
            {t.retryWrongCount(wrong)}
          </Button>
        )}
        <Button variant="ghost" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          {isDrill ? t.backToPractice : t.newExam}
        </Button>
        <Button variant="ghost" onClick={() => setView('home')}>
          {t.backHome}
        </Button>
      </div>
    </div>
  )
}
