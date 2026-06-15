import { useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Eye, EyeOff, Sparkles } from 'lucide-react'
import { DOMAIN_BY_KEY } from '@/data'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/ui/Markdown'
import { cn } from '@/lib/cn'
import { useLang, useT } from '@/lib/useT'
import type { Course, CheckQuestion, DomainKey } from '@/types'

export function CourseReader({
  course,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  course: Course
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  const t = useT()
  const lang = useLang()
  const domainName =
    course.domain && course.domain in DOMAIN_BY_KEY
      ? DOMAIN_BY_KEY[course.domain as DomainKey].name[lang]
      : null

  return (
    <article className="min-w-0" data-testid="course-reader">
      <header>
        {domainName && (
          <Badge variant="primary" className="mb-3">
            {t.mapsToDomain}: {domainName}
          </Badge>
        )}
        <h1 className="text-balance font-serif text-3xl font-semibold leading-tight">
          {course.course_title[lang]}
        </h1>
        <a
          href={course.source_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t.officialSource}
        </a>
      </header>

      {/* Key concepts */}
      {course.key_concepts[lang]?.length > 0 && (
        <section className="mt-6 rounded-lg border border-primary/25 bg-primary/[0.06] p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {t.keyConcepts}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {course.key_concepts[lang].map((c, i) => (
              <li
                key={i}
                className="rounded-md border border-border bg-card px-2.5 py-1 text-[12.5px] font-medium text-foreground"
              >
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Summary */}
      <section className="mt-7">
        <Markdown>{course.summary[lang]}</Markdown>
      </section>

      {/* Check questions */}
      {course.check_questions?.length > 0 && (
        <section className="mt-9">
          <h2 className="mb-4 font-serif text-xl font-semibold">{t.checkUnderstanding}</h2>
          <div className="space-y-3">
            {course.check_questions.map((cq, i) => (
              <CheckItem key={i} item={cq} number={i + 1} total={course.check_questions.length} />
            ))}
          </div>
        </section>
      )}

      {/* Course nav */}
      <nav className="mt-10 flex items-center justify-between gap-2 border-t border-border pt-5">
        <Button variant="secondary" onClick={onPrev} disabled={!hasPrev}>
          <ChevronLeft className="h-4 w-4" />
          {t.prevCourse}
        </Button>
        <Button variant="secondary" onClick={onNext} disabled={!hasNext}>
          {t.nextCourse}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </article>
  )
}

function CheckItem({ item, number, total }: { item: CheckQuestion; number: number; total: number }) {
  const t = useT()
  const lang = useLang()
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground tabular-nums">
            {t.checkOf(number, total)}
          </span>
          <p className="mt-1 text-[14.5px] font-medium leading-snug text-foreground">{item.q[lang]}</p>
        </div>
        <Button
          variant={open ? 'subtle' : 'outline'}
          size="sm"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0"
          data-testid="reveal-answer"
          aria-expanded={open}
        >
          {open ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {open ? t.hideAnswer : t.showAnswer}
        </Button>
      </div>
      <div
        className={cn(
          'grid transition-all duration-200',
          open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <p
            data-testid="check-answer"
            className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-[13.5px] leading-relaxed text-foreground"
          >
            {item.a[lang]}
          </p>
        </div>
      </div>
    </div>
  )
}
