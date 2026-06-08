import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { COURSES } from '@/data'
import { Card } from '@/components/ui/Card'
import { CourseReader } from '@/components/study/CourseReader'
import { cn } from '@/lib/cn'
import { useLang, useT } from '@/lib/useT'

export function StudyView() {
  const t = useT()
  const lang = useLang()
  const [index, setIndex] = useState(0)

  if (COURSES.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        {t.selectCourse}
      </div>
    )
  }

  const select = (i: number) => {
    setIndex(i)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const course = COURSES[Math.min(index, COURSES.length - 1)]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-semibold">{t.studyTitle}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
          {t.studyIntro}
        </p>
      </header>

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
        {/* Sidebar index */}
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

        {/* Reader */}
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
    </div>
  )
}
