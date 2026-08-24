import { useMemo, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { ROTE_ITEMS, ROTE_MODULES, type RoteItem, type RoteModuleKey, type RoteQuiz } from '@/data/ccapRote'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/useT'

/** Exact terms get monospace so they read as API/product surface, not prose. */
const CODE_RE = /((?:[A-Za-z][A-Za-z0-9]*_)+[A-Za-z0-9]+|CLAUDE\.md|\.claude\/[\w./-]+|`[^`]+`)/g

function CodeText({ text }: { text: string }) {
  const parts = text.split(CODE_RE)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] font-medium">
            {p.replaceAll('`', '')}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

function PointRow({ point }: { point: RoteItem['points'][number] }) {
  return (
    <li className="flex gap-2 py-1 text-[13.5px] leading-snug">
      <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
      <span className="min-w-0">
        {point.k && <span className="mr-1.5 font-mono text-[12.5px] font-semibold text-primary">{point.k}</span>}
        <span className="text-foreground/90">
          <CodeText text={point.v} />
        </span>
      </span>
    </li>
  )
}

function QuizBlock({ quiz }: { quiz: RoteQuiz }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  return (
    // Sits outside recall-mode blur and must not toggle the entry's reveal.
    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-testid="rote-quiz-toggle"
        className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
      >
        <ChevronRight
          className={cn('h-3.5 w-3.5 transition-transform duration-100 motion-reduce:transition-none', open && 'rotate-90')}
        />
        {t.roteQuizLabel}
      </button>
      {open && (
        <div className="mt-2 rounded-md border border-border bg-surface p-3">
          <p className="text-[13px] leading-snug">{quiz.q}</p>
          <div className="mt-2 space-y-1.5">
            {quiz.options.map((opt, i) => {
              const answered = picked !== null
              const isCorrect = i === quiz.answer
              const isPicked = i === picked
              return (
                <button
                  key={i}
                  onClick={() => picked === null && setPicked(i)}
                  disabled={answered}
                  data-testid={`rote-quiz-option-${i}`}
                  className={cn(
                    'block w-full rounded border px-2.5 py-1.5 text-left text-[12.5px] leading-snug transition-colors duration-100',
                    !answered && 'border-border bg-card hover:border-border-strong',
                    answered && isCorrect && 'border-success/70 bg-success/10',
                    answered && isPicked && !isCorrect && 'border-destructive/70 bg-destructive/10',
                    answered && !isPicked && !isCorrect && 'border-border text-muted-foreground',
                  )}
                >
                  {opt}
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <p className="mt-2 text-[12.5px] leading-snug text-muted-foreground" data-testid="rote-quiz-why">
              <span className={cn('font-semibold', picked === quiz.answer ? 'text-success' : 'text-destructive')}>
                {picked === quiz.answer ? t.roteQuizCorrect : t.roteQuizIncorrect}
              </span>{' '}
              {quiz.why}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function RoteEntry({
  item,
  recall,
  revealed,
  onReveal,
}: {
  item: RoteItem
  recall: boolean
  revealed: boolean
  onReveal: () => void
}) {
  const t = useT()
  const isTrap = item.kind === 'counterintuitive'
  const hidden = recall && !revealed
  return (
    <div
      onClick={recall ? onReveal : undefined}
      className={cn(
        'border-b border-border py-3',
        isTrap && 'border-l-2 border-l-destructive/50 pl-3',
        recall && 'cursor-pointer',
      )}
    >
      <h4 className="flex items-center gap-2 text-[13.5px] font-semibold">
        {isTrap && (
          <span className="rounded border border-destructive px-1.5 py-px font-mono text-[10px] font-medium uppercase tracking-wide text-destructive">
            {t.roteTrapBadge}
          </span>
        )}
        {item.topic}
      </h4>
      {isTrap && item.logic && (
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          <span className="font-mono text-[11px] uppercase tracking-wide">{t.roteLogicSays}</span>{' '}
          <CodeText text={item.logic} />
        </p>
      )}
      <div
        className={cn(
          hidden &&
            'select-none blur-[6px] transition-[filter] duration-150 motion-reduce:transition-none',
        )}
      >
        {item.lead && (
          <p className="mt-1 text-[13px] italic leading-snug text-muted-foreground">
            <CodeText text={item.lead} />
          </p>
        )}
        <ul className="mt-1">
          {item.points.map((p, i) => (
            <PointRow key={i} point={p} />
          ))}
        </ul>
      </div>
      {item.quiz && <QuizBlock quiz={item.quiz} />}
      <p className="mt-1 text-[10.5px] uppercase tracking-wide text-muted-foreground/70">
        {item.sourceSection}
      </p>
    </div>
  )
}

export function RotePanel() {
  const t = useT()
  const [query, setQuery] = useState('')
  const [moduleKey, setModuleKey] = useState<RoteModuleKey | 'all'>('all')
  const [trapsOnly, setTrapsOnly] = useState(false)
  const [recall, setRecall] = useState(false)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return ROTE_ITEMS.filter(
      (it) =>
        (moduleKey === 'all' || it.module === moduleKey) &&
        (!trapsOnly || it.kind === 'counterintuitive') &&
        (needle === '' ||
          [it.topic, it.lead ?? '', it.logic ?? '', ...it.points.map((p) => `${p.k ?? ''} ${p.v}`)]
            .join(' ')
            .toLowerCase()
            .includes(needle)),
    )
  }, [query, moduleKey, trapsOnly])

  const toggleRecall = () => {
    setRecall((r) => !r)
    setRevealed(new Set())
  }

  const reveal = (id: string) =>
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="animate-fade-in">
      <p className="mb-4 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
        {t.roteIntro}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-44 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.roteSearchPlaceholder}
            aria-label={t.roteSearchPlaceholder}
            data-testid="rote-search"
            className="h-8 w-full rounded-md border border-border bg-card pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <button
          onClick={() => setTrapsOnly((v) => !v)}
          aria-pressed={trapsOnly}
          data-testid="rote-traps"
          className={cn(
            'h-8 rounded-full border px-3 text-[12.5px] font-medium transition-colors duration-100',
            trapsOnly
              ? 'border-destructive/60 bg-destructive/10 text-foreground'
              : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
          )}
        >
          {t.roteTrapsOnly}
        </button>
        <button
          onClick={toggleRecall}
          aria-pressed={recall}
          data-testid="rote-recall"
          className={cn(
            'h-8 rounded-full border px-3 text-[12.5px] font-medium transition-colors duration-100',
            recall
              ? 'border-primary/60 bg-primary/10 text-foreground'
              : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
          )}
        >
          {t.roteRecallMode}
        </button>
      </div>

      <div className="mt-3" role="tablist" aria-label={t.rotePickModule}>
        <div className="flex flex-wrap gap-2">
          {[{ key: 'all' as const, title: t.roteAllModules }, ...ROTE_MODULES].map((m) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={moduleKey === m.key}
              onClick={() => setModuleKey(m.key)}
              data-testid={`rote-mod-${m.key}`}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-100',
                moduleKey === m.key
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {m.key === 'all' ? m.title : `${m.key} · ${m.title}`}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[12px] tabular-nums text-muted-foreground">
        {recall ? t.roteRecallHint : t.roteShown(shown.length, ROTE_ITEMS.length)}
      </p>

      <div className="mt-2">
        {ROTE_MODULES.map((m) => {
          const items = shown.filter((it) => it.module === m.key)
          if (items.length === 0) return null
          return (
            <section key={m.key} className="mb-6">
              <header className="flex items-baseline gap-2 border-b border-border-strong pb-1.5 pt-2">
                <span className="font-mono text-[12.5px] text-primary">{m.key}</span>
                <h3 className="font-serif text-[15px] font-semibold">{m.title}</h3>
                <span className="ml-auto text-[11.5px] tabular-nums text-muted-foreground">
                  {items.length}
                </span>
              </header>
              {items.map((it) => (
                <RoteEntry
                  key={it.id}
                  item={it}
                  recall={recall}
                  revealed={revealed.has(it.id)}
                  onReveal={() => reveal(it.id)}
                />
              ))}
            </section>
          )
        })}
        {shown.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-[13.5px] text-muted-foreground">
            {t.roteEmpty}
          </p>
        )}
      </div>
    </div>
  )
}
