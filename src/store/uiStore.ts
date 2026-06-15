import { create } from 'zustand'
import { loadUi, saveUi } from '@/lib/persist'
import type { Lang, Theme } from '@/types'

export type View = 'home' | 'exam' | 'study'

/**
 * UI session state — language, theme, and the active top-level view.
 * Persisted to localStorage (local only, nothing sent anywhere) so a refresh
 * keeps your language/theme and drops you back where you were — important when
 * resuming an in-progress exam.
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

const saved = loadUi()
const initialTheme: Theme = saved.theme ?? 'dark'
const initialLang: Lang = saved.lang ?? 'en'
const initialView: View = saved.view ?? 'home'

// Apply the persisted (or default) theme as soon as the module loads.
applyTheme(initialTheme)

export const useUiStore = create<UiState>((set, get) => ({
  lang: initialLang,
  theme: initialTheme,
  view: initialView,
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

useUiStore.subscribe((s) => saveUi({ lang: s.lang, theme: s.theme, view: s.view }))
