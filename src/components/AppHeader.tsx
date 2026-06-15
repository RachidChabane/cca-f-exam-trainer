import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/useT'
import { useUiStore, type View } from '@/store/uiStore'
import type { Lang } from '@/types'

function BrandMark() {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-border-strong font-serif text-[12px] font-semibold tracking-tight text-foreground select-none"
      aria-hidden="true"
    >
      cca
    </span>
  )
}

function NavTab({ view, label }: { view: View; label: string }) {
  const active = useUiStore((s) => s.view === view)
  const setView = useUiStore((s) => s.setView)
  return (
    <button
      onClick={() => setView(view)}
      aria-current={active ? 'page' : undefined}
      data-testid={`nav-${view}`}
      className={cn(
        'h-8 rounded-md px-3 text-[13px] font-medium transition-colors duration-150',
        active
          ? 'bg-surface-hover text-foreground'
          : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

function LanguageToggle() {
  const lang = useUiStore((s) => s.lang)
  const setLang = useUiStore((s) => s.setLang)
  const options: Lang[] = ['en', 'fr']
  return (
    <div
      role="group"
      aria-label="Language / Langue"
      className="inline-flex items-center rounded-md border border-border bg-card p-0.5"
    >
      {options.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          data-testid={`lang-${l}`}
          className={cn(
            'h-7 rounded-[5px] px-2.5 text-[12px] font-semibold uppercase tracking-wide transition-colors duration-150',
            lang === l
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function ThemeToggle() {
  const t = useT()
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? t.themeToLight : t.themeToDark}
      data-testid="theme-toggle"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function AppHeader() {
  const t = useT()
  const setView = useUiStore((s) => s.setView)
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2.5 text-left"
          aria-label={t.appName}
        >
          <BrandMark />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[13px] font-semibold text-foreground">{t.appName}</span>
            <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {t.tagline}
            </span>
          </span>
        </button>

        <nav className="ml-2 flex items-center gap-1">
          <NavTab view="home" label={t.navHome} />
          <NavTab view="exam" label={t.navExam} />
          <NavTab view="study" label={t.navStudy} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
