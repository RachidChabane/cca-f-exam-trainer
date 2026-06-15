import { AppHeader } from '@/components/AppHeader'
import { AboutView } from '@/components/AboutView'
import { HomeView } from '@/components/HomeView'
import { ExamView } from '@/components/exam/ExamView'
import { StudyView } from '@/components/study/StudyView'
import { COURSES, QUESTIONS } from '@/data'
import { useT } from '@/lib/useT'
import { useUiStore } from '@/store/uiStore'

export function App() {
  const t = useT()
  const view = useUiStore((s) => s.view)
  const setView = useUiStore((s) => s.setView)

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex-1">
        {view === 'home' && <HomeView />}
        {view === 'exam' && <ExamView />}
        {view === 'study' && <StudyView />}
        {view === 'about' && <AboutView />}
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
            {t.poolStatus(QUESTIONS.length)} · {t.coursesStatus(COURSES.length)}
          </span>
        </div>
      </footer>
    </div>
  )
}
