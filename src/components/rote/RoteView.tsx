import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ROTE_COUNTS, ROTE_ITEMS, ROTE_MODULES, type RoteItem, type RoteModuleKey } from '@/data/ccapRote'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/useT'

/** Exact terms get monospace so they read as API/product surface, not prose. */
const CODE_RE = /((?:[A-Za-z][A-Za-z0-9]*_)+[A-Za-z0-9]+|CLAUDE\.md|\.claude\/[\w./-]+|`[^`]+`)/g

function FactText({ text }: { text: string }) {
  const parts = text.split(CODE_RE)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] font-medium"
          >
            {p.replaceAll('`', '')}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

function Chip({
  label,
  pressed,
  onClick,
  tone = 'primary',
  testid,
}: {
  label: string
  pressed: boolean
  onClick: () => void
  tone?: 'primary' | 'trap'
  testid?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={pressed}
      data-testid={testid}
      className={cn(
        'h-8 rounded-full border px-3 text-[13px] font-medium transition-colors duration-150',
        pressed
          ? tone === 'trap'
            ? 'border-destructive/60 bg-destructive/10 text-foreground'
            : 'border-primary/60 bg-primary/10 text-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

function RoteCard({
  item,
  recall,
  revealed,
  onReveal,
  labels,
}: {
  item: RoteItem
  recall: boolean
  revealed: boolean
  onReveal: () => void
  labels: { trap: string; logicSays: string; courseSays: string }
}) {
  const hidden = recall && !revealed
  const isTrap = item.kind === 'counterintuitive'
  const factCls = cn(
    'text-sm leading-relaxed',
    hidden && 'cursor-pointer select-none blur-[6px] transition-[filter] duration-150 motion-reduce:transition-none',
  )
  return (
    <Card
      onClick={recall ? onReveal : undefined}
      className={cn('p-4', isTrap && 'border-destructive/30 bg-destructive/5', recall && 'cursor-pointer')}
    >
      <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
        {isTrap && (
          <span className="rounded border border-destructive px-1.5 py-px font-mono text-[10px] font-medium uppercase tracking-wide text-destructive">
            {labels.trap}
          </span>
        )}
        {item.topic}
      </h3>
      {isTrap && item.intuitionTrap && (
        <div className="mb-2">
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            {labels.logicSays}
          </span>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            <FactText text={item.intuitionTrap} />
          </p>
        </div>
      )}
      {isTrap && (
        <span className="font-mono text-[11px] uppercase tracking-wide text-destructive">
          {labels.courseSays}
        </span>
      )}
      <p className={cn(factCls, isTrap && 'mt-0.5')}>
        <FactText text={item.fact} />
      </p>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        {item.sourceSection}
      </p>
    </Card>
  )
}

export function RoteView() {
  const t = useT()
  const [query, setQuery] = useState('')
  const [mods, setMods] = useState<Set<RoteModuleKey>>(new Set())
  const [trapsOnly, setTrapsOnly] = useState(false)
  const [recall, setRecall] = useState(false)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return ROTE_ITEMS.filter(
      (it) =>
        (mods.size === 0 || mods.has(it.module)) &&
        (!trapsOnly || it.kind === 'counterintuitive') &&
        (needle === '' ||
          `${it.topic} ${it.fact} ${it.intuitionTrap ?? ''} ${it.sourceSection}`
            .toLowerCase()
            .includes(needle)),
    )
  }, [query, mods, trapsOnly])

  const toggleModule = (key: RoteModuleKey) =>
    setMods((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

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

  const labels = { trap: t.roteTrapBadge, logicSays: t.roteLogicSays, courseSays: t.roteCourseSays }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-12 sm:px-6">
      <section className="text-center">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">
          {t.roteKicker}
        </span>
        <h1 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight">
          {t.roteTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-[15px] leading-relaxed text-muted-foreground">
          {t.roteSubtitle}
        </p>
        <div className="mt-6 flex justify-center gap-8">
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-semibold tabular-nums">{ROTE_COUNTS.mustKnow}</span>
            <span className="text-[12px] uppercase tracking-wide text-muted-foreground">{t.roteFactsStat}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-semibold tabular-nums text-destructive">
              {ROTE_COUNTS.traps}
            </span>
            <span className="text-[12px] uppercase tracking-wide text-muted-foreground">{t.roteTrapsStat}</span>
          </div>
        </div>
      </section>

      <section className="sticky top-14 z-20 -mx-4 mt-8 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-40 flex-1">
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
          {ROTE_MODULES.map((m) => (
            <Chip
              key={m.key}
              label={m.key}
              pressed={mods.has(m.key)}
              onClick={() => toggleModule(m.key)}
              testid={`rote-mod-${m.key}`}
            />
          ))}
          <Chip label={t.roteTrapsOnly} pressed={trapsOnly} onClick={() => setTrapsOnly((v) => !v)} tone="trap" testid="rote-traps" />
          <Chip label={t.roteRecallMode} pressed={recall} onClick={toggleRecall} testid="rote-recall" />
        </div>
        <p className="mt-1.5 text-[12px] tabular-nums text-muted-foreground">
          {recall ? t.roteRecallHint : t.roteShown(shown.length, ROTE_ITEMS.length)}
        </p>
      </section>

      <main className="mt-6">
        {ROTE_MODULES.map((m) => {
          const items = shown.filter((it) => it.module === m.key)
          if (items.length === 0) return null
          return (
            <section key={m.key} className="mb-8">
              <header className="mb-3 flex items-baseline gap-2.5 border-b border-border-strong pb-2">
                <span className="font-mono text-sm text-primary">{m.key}</span>
                <h2 className="font-serif text-lg font-semibold">{m.title}</h2>
                <span className="ml-auto whitespace-nowrap text-[12px] tabular-nums text-muted-foreground">
                  {items.length}
                </span>
              </header>
              <div className="space-y-2.5">
                {items.map((it) => (
                  <RoteCard
                    key={it.id}
                    item={it}
                    recall={recall}
                    revealed={revealed.has(it.id)}
                    onReveal={() => reveal(it.id)}
                    labels={labels}
                  />
                ))}
              </div>
            </section>
          )
        })}
        {shown.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">{t.roteEmpty}</p>
        )}
      </main>
    </div>
  )
}
