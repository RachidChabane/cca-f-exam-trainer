import { useMemo } from 'react'
import { Clock, Dumbbell, History, Layers, ListChecks, Target, Trash2 } from 'lucide-react'
import { BLUEPRINT, DOMAINS, DOMAIN_BY_KEY } from '@/data/blueprint'
import { QUESTIONS } from '@/data/scenarioSets'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { useLang, useT } from '@/lib/useT'
import { useExamStore } from '@/store/examStore'

export function ExamIntro() {
  const t = useT()
  const lang = useLang()
  const start = useExamStore((s) => s.start)
  const startScenario = useExamStore((s) => s.startScenario)
  const startDrill = useExamStore((s) => s.startDrill)
  const history = useExamStore((s) => s.history)
  const clearPastResults = useExamStore((s) => s.clearPastResults)
  const mech = BLUEPRINT.exam.mechanics
  const need = BLUEPRINT.session.question_count
  const have = QUESTIONS.length
  const enough = have >= need

  const poolByDomain = useMemo(() => {
    const m = {} as Record<string, number>
    for (const q of QUESTIONS) m[q.domain] = (m[q.domain] ?? 0) + 1
    return m
  }, [])

  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold">{t.examIntroTitle}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        {t.examIntroDesc}
      </p>

      <Card className="mt-8 p-6">
        <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t.examFormatHeading}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Feature icon={<ListChecks />} value={`${enough ? need : have}`} label={t.questionsUnit} />
          <Feature icon={<Clock />} value={`${mech.time_limit_minutes}`} label={t.minutesUnit} />
          <Feature icon={<Target />} value={`${mech.scaled_score.pass} / 1000`} label={t.mechPass} />
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t.distributionHeading}
          </h3>
          <ul className="space-y-2">
            {DOMAINS.map((d) => (
              <li key={d.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{d.name[lang]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {BLUEPRINT.session.domain_session_counts[d.key]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {!enough && (
          <div className="mt-5 rounded-md border border-warning/40 bg-warning/10 p-3 text-[13px] text-foreground">
            <span className="font-semibold">{t.notEnoughTitle}. </span>
            {t.notEnoughBody(have, need)}
          </div>
        )}
      </Card>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Button size="xl" onClick={start} className="px-8" data-testid="start-exam">
          {t.startExam}
        </Button>
        <Button variant="outline" onClick={startScenario} data-testid="start-scenario">
          <Layers className="h-4 w-4" />
          {t.scenarioStart}
        </Button>
        <p className="max-w-md text-center text-[12.5px] leading-relaxed text-muted-foreground">
          {t.scenarioDesc}
        </p>
      </div>

      {/* Practice by domain (untimed drills) */}
      <Card className="mt-8 p-6">
        <div className="mb-1 flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t.practiceHeading}
          </h2>
        </div>
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">{t.practiceDesc}</p>
        <ul className="space-y-2">
          {DOMAINS.map((d) => (
            <li
              key={d.key}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{d.name[lang]}</div>
                <div className="text-[12px] text-muted-foreground tabular-nums">
                  {t.poolCountLabel(poolByDomain[d.key] ?? 0)}
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => startDrill(d.key)}
                disabled={(poolByDomain[d.key] ?? 0) === 0}
                data-testid={`drill-${d.key}`}
              >
                {t.drillButton}
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Recent attempts (cross-session history) */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t.recentAttempts}
            </h2>
          </div>
          {history.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearPastResults}>
              <Trash2 className="h-3.5 w-3.5" />
              {t.clearHistoryAction}
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-muted-foreground">{t.recentNone}</p>
        ) : (
          <ul className="space-y-2">
            {history.slice(0, 8).map((h, idx) => {
              const accPct = h.total ? Math.round((h.correct / h.total) * 100) : 0
              const when = new Date(h.at).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              return (
                <li
                  key={`${h.at}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge variant={h.mode === 'exam' ? 'primary' : 'secondary'} className="shrink-0">
                      {h.mode === 'exam' ? t.attemptFull : t.attemptDrill}
                    </Badge>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {h.domain ? DOMAIN_BY_KEY[h.domain].name[lang] : when}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    {h.mode === 'exam' ? (
                      <span
                        className={cn(
                          'font-serif text-base font-semibold tabular-nums',
                          h.pass ? 'text-success' : 'text-foreground',
                        )}
                      >
                        {h.scaled}
                        <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                          {t.outOf1000}
                        </span>
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'font-serif text-base font-semibold tabular-nums',
                          accPct >= 70 ? 'text-success' : 'text-foreground',
                        )}
                      >
                        {accPct}%
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Feature({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3">
      <span className="text-primary [&_svg]:size-5">{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="font-serif text-xl font-semibold tabular-nums">{value}</span>
        <span className="text-[12px] uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}
