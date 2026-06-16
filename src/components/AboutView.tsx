import { useMemo } from 'react'
import { ArrowUpRight, CheckCircle2, CircleHelp } from 'lucide-react'
import { ABOUT } from '@/content/about'
import { DOMAINS } from '@/data/blueprint'
import { SCENARIOS } from '@/scenarios'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Markdown } from '@/components/ui/Markdown'
import { useLang } from '@/lib/useT'

/** In-page anchor list. Plain hash links; the app keeps no route, so these only
 * scroll within the page; section headings carry scroll-margin for the header. */
function TableOfContents({
  label,
  items,
}: {
  label: string
  items: { id: string; title: string }[]
}) {
  return (
    <nav aria-label={label} className="lg:sticky lg:top-20">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-1.5 border-l border-border">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="-ml-px block border-l-2 border-transparent py-0.5 pl-3 text-[13px] leading-snug text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {it.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function SectionHeading({ id, n, title }: { id: string; n: number; title: string }) {
  return (
    <h2 id={id} className="scroll-mt-24 font-serif text-2xl font-semibold leading-tight">
      <span className="mr-2 text-primary tabular-nums">{n}.</span>
      {title}
    </h2>
  )
}

export function AboutView() {
  const lang = useLang()
  const a = ABOUT[lang]

  const toc = useMemo(
    () => a.sections.map((s) => ({ id: s.id, title: s.title })),
    [a.sections],
  )

  // Quick lookup so each section's prose can be followed by the right extra block.
  const body = (id: string) => a.sections.find((s) => s.id === id)?.body ?? ''

  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <header className="max-w-3xl">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">
          {a.kicker}
        </span>
        <h1 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight sm:text-[2.5rem]">
          {a.title}
        </h1>
        <p className="mt-4 text-balance text-[15px] leading-relaxed text-muted-foreground">
          {a.lead}
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
        {/* Table of contents */}
        <aside className="hidden lg:block">
          <TableOfContents label={a.tocLabel} items={toc} />
        </aside>

        {/* Body */}
        <div className="min-w-0 space-y-14">
          {/* 1. How the real exam is built */}
          <section className="space-y-4">
            <SectionHeading id="how-real" n={1} title={a.sections[0].title} />
            <Markdown className="max-w-none text-[15px]">
              {body('how-real')}
            </Markdown>

            <Card className="mt-2 p-5">
              <p className="text-sm text-muted-foreground">{a.themesIntro}</p>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                {SCENARIOS.map((s, i) => (
                  <li key={s.id} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-strong text-[11px] font-semibold tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="leading-snug text-foreground">{s.name[lang]}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-muted-foreground">{a.domainsIntro}</p>
              <ul className="mt-3 space-y-3">
                {DOMAINS.map((d) => (
                  <li key={d.key} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium">{d.name[lang]}</span>
                      <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                        {Math.round(d.weight * 100)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.round(d.weight * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* 2. How a scenario connects to its questions */}
          <section className="space-y-4">
            <SectionHeading id="scenario-questions" n={2} title={a.sections[1].title} />
            <Markdown className="max-w-none text-[15px]">
              {body('scenario-questions')}
            </Markdown>
          </section>

          {/* 3. How this trainer mirrors it */}
          <section className="space-y-4">
            <SectionHeading id="how-we-mirror" n={3} title={a.sections[2].title} />
            <Markdown className="max-w-none text-[15px]">
              {body('how-we-mirror')}
            </Markdown>

            <Card className="overflow-hidden p-0">
              <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
                <div className="bg-surface px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {a.mirrorRealHead}
                </div>
                <div className="hidden bg-surface px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-primary sm:block">
                  {a.mirrorOursHead}
                </div>
                {a.mirror.map((row, i) => (
                  <div key={i} className="contents">
                    <div className="bg-card px-4 py-3 text-[13.5px] leading-relaxed text-muted-foreground">
                      {row.real}
                    </div>
                    <div className="bg-card px-4 py-3 text-[13.5px] leading-relaxed text-foreground">
                      <span className="mr-1.5 font-semibold text-primary sm:hidden">→</span>
                      {row.ours}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* 4. Confirmed vs. inferred */}
          <section className="space-y-4">
            <SectionHeading id="confirmed-inferred" n={4} title={a.sections[3].title} />
            <Markdown className="max-w-none text-[15px]">
              {body('confirmed-inferred')}
            </Markdown>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-success/30 p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <h3 className="text-sm font-semibold">{a.confirmedTitle}</h3>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">{a.confirmedNote}</p>
                <ul className="mt-3 space-y-2">
                  {a.confirmed.map((c, i) => (
                    <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed">
                      <span className="mt-0.5 text-success">✓</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="border-warning/30 p-5">
                <div className="flex items-center gap-2">
                  <CircleHelp className="h-4 w-4 text-warning" />
                  <h3 className="text-sm font-semibold">{a.inferredTitle}</h3>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">{a.inferredNote}</p>
                <ul className="mt-3 space-y-2">
                  {a.inferred.map((c, i) => (
                    <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed">
                      <span className="mt-0.5 text-warning">≈</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>

          {/* Sources */}
          <section className="space-y-4">
            <h2 id="sources" className="scroll-mt-24 font-serif text-2xl font-semibold leading-tight">
              <span className="mr-2 text-primary tabular-nums">5.</span>
              {a.sourcesTitle}
            </h2>
            <p className="max-w-none text-[15px] leading-relaxed text-muted-foreground">
              {a.sourcesNote}
            </p>

            {(['first-party', 'community'] as const).map((kind) => {
              const items = a.sources.filter((s) => s.kind === kind)
              if (!items.length) return null
              return (
                <div key={kind} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={kind === 'first-party' ? 'primary' : 'outline'}>
                      {kind === 'first-party' ? a.firstPartyLabel : a.communityLabel}
                    </Badge>
                  </div>
                  <ul className="space-y-2">
                    {items.map((s) => (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-2 rounded-md border border-border bg-card p-3 transition-colors hover:border-border-strong hover:bg-surface-hover"
                        >
                          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-medium text-foreground">
                              {s.label}
                            </span>
                            <span className="block text-[13px] leading-relaxed text-muted-foreground">
                              {s.detail}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}

            <p className="pt-2 text-[12px] italic text-muted-foreground">{a.updated}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
