import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { COURSE_COUNT, QUESTION_COUNT } from 'virtual:content-stats'
import { AppHeader } from '@/components/AppHeader'
import { useT } from '@/lib/useT'
import { useUiStore } from '@/store/uiStore'

// Each top-level view is its own chunk, so a screen's (sometimes heavy) data only
// loads when that screen is opened — the exam scenario pool in particular stays
// out of the initial download.
const HomeView = lazy(() => import('@/components/HomeView').then((m) => ({ default: m.HomeView })))
const ExamView = lazy(() =>
  import('@/components/exam/ExamView').then((m) => ({ default: m.ExamView })),
)
const StudyView = lazy(() =>
  import('@/components/study/StudyView').then((m) => ({ default: m.StudyView })),
)
const AboutView = lazy(() =>
  import('@/components/AboutView').then((m) => ({ default: m.AboutView })),
)

export function App() {
  const t = useT()
  const view = useUiStore((s) => s.view)
  const setView = useUiStore((s) => s.setView)

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div
              className="flex min-h-[60vh] items-center justify-center"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">{t.loading}</span>
            </div>
          }
        >
          {view === 'home' && <HomeView />}
          {view === 'exam' && <ExamView />}
          {view === 'study' && <StudyView />}
          {view === 'about' && <AboutView />}
        </Suspense>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-6 text-center text-[12px] text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
            <span>
              {t.appFull} · {t.tagline}
            </span>
            <button
              onClick={() => setView('about')}
              data-testid="footer-about"
              className="font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
            >
              {t.navAbout}
            </button>
          </span>
          <span className="tabular-nums">
            {t.poolStatus(QUESTION_COUNT)} · {t.coursesStatus(COURSE_COUNT)}
          </span>
        </div>
      </footer>
    </div>
  )
}
