import { AlertTriangle } from 'lucide-react'
import { useLang, useT } from '@/lib/useT'
import type { ExamTrap } from '@/types'

/** A labelled line inside a trap card (the trap / why it fails / the right call). */
function TrapRow({ label, accent, text }: { label: string; accent: string; text: string }) {
  return (
    <div>
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${accent}`}>{label}</p>
      <p className="mt-0.5 text-[13.5px] leading-relaxed text-foreground">{text}</p>
    </div>
  )
}

/** Renders a list of exam traps, each as "the trap / why it's wrong / the right call". */
export function TrapList({ traps }: { traps: ExamTrap[] }) {
  const t = useT()
  const lang = useLang()
  return (
    <div className="space-y-3" data-testid="trap-list">
      {traps.map((tr) => (
        <div key={tr.id} className="rounded-lg border border-border bg-card p-4 sm:p-5" data-testid="trap-item">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <h3 className="font-serif text-[16px] font-semibold leading-snug text-foreground">
              {tr.title[lang]}
            </h3>
          </div>
          <div className="mt-3 space-y-2.5">
            <TrapRow label={t.trapThe} accent="text-destructive" text={tr.trap[lang]} />
            <TrapRow label={t.trapWhy} accent="text-muted-foreground" text={tr.why_wrong[lang]} />
            <TrapRow label={t.trapRight} accent="text-success" text={tr.right_approach[lang]} />
          </div>
        </div>
      ))}
    </div>
  )
}
