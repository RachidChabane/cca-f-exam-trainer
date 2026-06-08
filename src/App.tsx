import { AppHeader } from '@/components/AppHeader'
import { HomeView } from '@/components/HomeView'
import { ExamView } from '@/components/exam/ExamView'
import { StudyView } from '@/components/study/StudyView'
import { COURSES, QUESTIONS } from '@/data'
import { useT } from '@/lib/useT'
import { useUiStore } from '@/store/uiStore'

export function App() {
  const t = useT()
  const view = useUiStore((s) => s.view)

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex-1">
        {view === 'home' && <HomeView />}
        {view === 'exam' && <ExamView />}
        {view === 'study' && <StudyView />}
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-6 text-center text-[12px] text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <span>
            {t.appFull} · {t.tagline}
          </span>
          <span className="tabular-nums">
            {t.poolStatus(QUESTIONS.length)} · {t.coursesStatus(COURSES.length)}
          </span>
        </div>
      </footer>
    </div>
  )
}
