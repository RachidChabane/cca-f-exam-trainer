import { create } from 'zustand'
import type { Lang, Theme } from '@/types'

export type View = 'home' | 'exam' | 'study'

/**
 * UI session state — language, theme, and the active top-level view.
 * Deliberately in-memory only: nothing is written to localStorage or any
 * browser storage, per the app's session-only requirement.
 */
interface UiState {
  lang: Lang
  theme: Theme
  view: View
  setLang: (lang: Lang) => void
  toggleLang: () => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setView: (view: View) => void
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('light', theme === 'light')
}

// Apply the initial (dark) theme as soon as the module loads.
applyTheme('dark')

export const useUiStore = create<UiState>((set, get) => ({
  lang: 'en',
  theme: 'dark',
  view: 'home',
  setLang: (lang) => set({ lang }),
  toggleLang: () => set({ lang: get().lang === 'en' ? 'fr' : 'en' }),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },
  setView: (view) => set({ view }),
}))
