import { Clock, ListChecks, Target } from 'lucide-react'
import { BLUEPRINT, DOMAINS, QUESTIONS } from '@/data'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useLang, useT } from '@/lib/useT'
import { useExamStore } from '@/store/examStore'

export function ExamIntro() {
  const t = useT()
  const lang = useLang()
  const start = useExamStore((s) => s.start)
  const mech = BLUEPRINT.exam.mechanics
  const need = BLUEPRINT.session.question_count
  const have = QUESTIONS.length
  const enough = have >= need

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

      <div className="mt-8 flex justify-center">
        <Button size="xl" onClick={start} className="px-8">
          {t.startExam}
        </Button>
      </div>
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
