import { useState } from 'react'
import { ArrowRight, BookOpen, GraduationCap, PlayCircle } from 'lucide-react'
import { COURSE_COUNT, QUESTION_COUNT } from 'virtual:content-stats'
import { BLUEPRINT, DOMAINS } from '@/data/blueprint'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useLang, useT } from '@/lib/useT'
import { hasActiveExam } from '@/lib/persist'
import { useUiStore } from '@/store/uiStore'

function ModeCard({
  icon,
  title,
  desc,
  cta,
  onClick,
  testid,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  cta: string
  onClick: () => void
  testid?: string
}) {
  return (
    <button onClick={onClick} className="group text-left" data-testid={testid}>
      <Card className="flex h-full flex-col gap-4 p-6 transition-colors duration-150 hover:border-border-strong hover:bg-surface-hover">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-primary [&_svg]:size-5">
          {icon}
        </span>
        <div className="space-y-1.5">
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
        </div>
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </Card>
    </button>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-serif text-2xl font-semibold tabular-nums">{value}</span>
      <span className="text-[12px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  )
}

export function HomeView() {
  const t = useT()
  const lang = useLang()
  const setView = useUiStore((s) => s.setView)
  const mech = BLUEPRINT.exam.mechanics
  // Read once at mount from localStorage — switching views remounts Home, so this
  // stays in sync without subscribing to (and thus loading) the exam store/data.
  const [examInProgress] = useState(hasActiveExam)

  return (
    <div className="mx-auto max-w-5xl animate-fade-in px-4 py-12 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">
          {t.homeKicker}
        </span>
        <h1 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight sm:text-[2.6rem]">
          {t.homeTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-[15px] leading-relaxed text-muted-foreground">
          {t.homeSubtitle}
        </p>
      </section>

      {examInProgress && (
        <section className="mx-auto mt-8 max-w-3xl">
          <Card className="flex flex-col items-start gap-3 border-primary/40 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <PlayCircle className="h-4 w-4 text-primary" />
              {t.resumeInProgress}
            </span>
            <Button size="sm" onClick={() => setView('exam')} data-testid="resume-exam">
              {t.resumeExam}
            </Button>
          </Card>
        </section>
      )}

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <ModeCard
          icon={<GraduationCap />}
          title={t.examCardTitle}
          desc={t.examCardDesc}
          cta={t.examCardCta}
          onClick={() => setView('exam')}
          testid="home-exam-card"
        />
        <ModeCard
          icon={<BookOpen />}
          title={t.studyCardTitle}
          desc={t.studyCardDesc}
          cta={t.studyCardCta}
          onClick={() => setView('study')}
          testid="home-study-card"
        />
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-lg font-semibold">{t.blueprintTitle}</h2>
          <span className="text-[12px] text-muted-foreground">
            {t.poolStatus(QUESTION_COUNT)} · {t.coursesStatus(COURSE_COUNT)}
          </span>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat value={mech.question_count} label={t.mechQuestions} />
            <Stat value={mech.time_limit_minutes} label={t.mechMinutes} />
            <Stat value={`${mech.scaled_score.pass}`} label={t.mechPass} />
            <Stat value={mech.options_per_question} label={t.mechOptions} />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t.domainsHeading}
            </h3>
            <ul className="space-y-3">
              {DOMAINS.map((d) => (
                <li key={d.key} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium">{d.name[lang]}</span>
                      <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                        {Math.round(d.weight * 100)}% · {t.poolCountLabel(d.pool_target)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.round(d.weight * 100)}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>
    </div>
  )
}
