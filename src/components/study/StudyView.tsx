import { useState } from 'react'
import { AlertTriangle, BookOpen, ListChecks } from 'lucide-react'
import { COURSES, DOMAINS, EXAM_TRAPS, QUIZZES } from '@/data'
import { SCENARIOS } from '@/scenarios'
import { Card } from '@/components/ui/Card'
import { CourseReader } from '@/components/study/CourseReader'
import { QuizList } from '@/components/study/QuizItem'
import { TrapList } from '@/components/study/TrapList'
import { cn } from '@/lib/cn'
import { useLang, useT } from '@/lib/useT'

type Tab = 'courses' | 'quiz' | 'traps'

/** A wrapping row of pill buttons used to pick a theme or a domain. */
function PillNav({
  items,
  active,
  onSelect,
  ariaLabel,
}: {
  items: { id: string; label: string }[]
  active: string
  onSelect: (id: string) => void
  ariaLabel: string
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={active === it.id}
          onClick={() => onSelect(it.id)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-100',
            active === it.id
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

function CoursesPanel() {
  const t = useT()
  const lang = useLang()
  const [index, setIndex] = useState(0)

  if (COURSES.length === 0) {
    return <div className="py-16 text-center text-muted-foreground">{t.selectCourse}</div>
  }

  const select = (i: number) => {
    setIndex(i)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const course = COURSES[Math.min(index, COURSES.length - 1)]

  return (
    <>
      {/* Mobile course picker */}
      <div className="mb-5 lg:hidden">
        <label className="sr-only" htmlFor="course-select">
          {t.coursesHeading}
        </label>
        <select
          id="course-select"
          value={index}
          onChange={(e) => select(Number(e.target.value))}
          className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring"
        >
          {COURSES.map((c, i) => (
            <option key={c.id} value={i}>
              {c.course_title[lang]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-7 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <h2 className="mb-2 flex items-center gap-1.5 px-1 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {t.coursesHeading} · {COURSES.length}
            </h2>
            <nav className="space-y-0.5">
              {COURSES.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => select(i)}
                  aria-current={i === index ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] leading-snug transition-colors duration-100',
                    i === index
                      ? 'bg-surface-hover font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
                  )}
                >
                  <span className="w-5 shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">{c.course_title[lang]}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <Card className="animate-fade-in p-6 sm:p-8">
          <CourseReader
            course={course}
            hasPrev={index > 0}
            hasNext={index < COURSES.length - 1}
            onPrev={() => select(index - 1)}
            onNext={() => select(index + 1)}
          />
        </Card>
      </div>
    </>
  )
}

function QuizPanel() {
  const t = useT()
  const lang = useLang()
  const [themeId, setThemeId] = useState(SCENARIOS[0].id)
  const items = QUIZZES.by_theme[themeId] ?? []

  return (
    <div className="animate-fade-in">
      <PillNav
        items={SCENARIOS.map((s) => ({ id: s.id, label: s.name[lang] }))}
        active={themeId}
        onSelect={setThemeId}
        ariaLabel={t.quizPickTheme}
      />
      <div className="mt-6">
        {items.length > 0 ? (
          <QuizList items={items} intro={t.quizThemeIntro} />
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-[13.5px] text-muted-foreground">
            {t.quizEmpty}
          </p>
        )}
      </div>
    </div>
  )
}

function TrapsPanel() {
  const t = useT()
  const lang = useLang()
  const [mode, setMode] = useState<'theme' | 'domain'>('theme')
  const [themeId, setThemeId] = useState(SCENARIOS[0].id)
  const [domainKey, setDomainKey] = useState<string>(DOMAINS[0].key)

  const traps =
    mode === 'theme' ? (EXAM_TRAPS.by_theme[themeId] ?? []) : (EXAM_TRAPS.by_domain[domainKey as keyof typeof EXAM_TRAPS.by_domain] ?? [])

  return (
    <div className="animate-fade-in">
      <p className="mb-4 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">{t.trapsIntro}</p>

      {/* By scenario / by domain toggle */}
      <div role="tablist" aria-label={t.studyTabsLabel} className="mb-4 inline-flex rounded-md border border-border bg-card p-0.5">
        {(['theme', 'domain'] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              'h-8 rounded-[5px] px-3 text-[12.5px] font-medium transition-colors duration-100',
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m === 'theme' ? t.trapsToggleTheme : t.trapsToggleDomain}
          </button>
        ))}
      </div>

      {mode === 'theme' ? (
        <PillNav
          items={SCENARIOS.map((s) => ({ id: s.id, label: s.name[lang] }))}
          active={themeId}
          onSelect={setThemeId}
          ariaLabel={t.trapPickTheme}
        />
      ) : (
        <PillNav
          items={DOMAINS.map((d) => ({ id: d.key, label: d.name[lang] }))}
          active={domainKey}
          onSelect={setDomainKey}
          ariaLabel={t.trapPickDomain}
        />
      )}

      <div className="mt-6">
        {traps.length > 0 ? (
          <TrapList traps={traps} />
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-[13.5px] text-muted-foreground">
            {t.trapsEmpty}
          </p>
        )}
      </div>
    </div>
  )
}

export function StudyView() {
  const t = useT()
  const [tab, setTab] = useState<Tab>('courses')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'courses', label: t.studyTabCourses, icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'quiz', label: t.studyTabQuiz, icon: <ListChecks className="h-3.5 w-3.5" /> },
    { id: 'traps', label: t.studyTabTraps, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-5">
        <h1 className="font-serif text-2xl font-semibold">{t.studyTitle}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">{t.studyIntro}</p>
      </header>

      {/* Section tabs */}
      <div
        role="tablist"
        aria-label={t.studyTabsLabel}
        className="mb-6 inline-flex flex-wrap gap-1 rounded-md border border-border bg-card p-0.5"
      >
        {tabs.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => setTab(tb.id)}
            data-testid={`study-tab-${tb.id}`}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-[5px] px-3 text-[13px] font-medium transition-colors duration-100',
              tab === tb.id
                ? 'bg-surface-hover text-foreground'
                : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
            )}
          >
            {tb.icon}
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'courses' && <CoursesPanel />}
      {tab === 'quiz' && <QuizPanel />}
      {tab === 'traps' && <TrapsPanel />}
    </div>
  )
}
