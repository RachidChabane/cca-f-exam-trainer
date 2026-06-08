import { Flag } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/useT'
import { useExamStore } from '@/store/examStore'

export function QuestionGrid({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT()
  const session = useExamStore((s) => s.session)
  const goto = useExamStore((s) => s.goto)
  if (!session) return null

  return (
    <div>
      <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
        {t.navigator}
      </h3>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-5">
        {session.questions.map((_, i) => {
          const answered = session.answers[i] !== null
          const flagged = session.flagged[i]
          const current = session.current === i
          return (
            <button
              key={i}
              onClick={() => {
                goto(i)
                onNavigate?.()
              }}
              aria-current={current ? 'true' : undefined}
              className={cn(
                'relative flex h-8 items-center justify-center rounded-md border text-[12px] font-medium tabular-nums transition-colors duration-100',
                answered
                  ? 'border-primary/40 bg-primary/15 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-surface-hover',
                current && 'ring-[1.5px] ring-ring ring-offset-1 ring-offset-background',
              )}
            >
              {i + 1}
              {flagged && (
                <Flag className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 fill-warning text-warning" />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-3 space-y-1.5 text-[12px] text-muted-foreground">
        <Legend className="border-primary/40 bg-primary/15" label={t.legendAnswered} />
        <Legend className="border-border bg-card" label={t.legendUnanswered} />
        <Legend flag label={t.legendFlagged} />
      </div>
    </div>
  )
}

function Legend({ className, label, flag }: { className?: string; label: string; flag?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'relative inline-flex h-4 w-4 items-center justify-center rounded border',
          className ?? 'border-border bg-card',
        )}
      >
        {flag && <Flag className="h-2.5 w-2.5 fill-warning text-warning" />}
      </span>
      <span>{label}</span>
    </div>
  )
}
