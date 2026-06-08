import { DICT, type Dict } from '@/i18n'
import { useUiStore } from '@/store/uiStore'
import type { Lang } from '@/types'

/** Current-language UI dictionary. Re-renders when the language toggles. */
export function useT(): Dict {
  return DICT[useUiStore((s) => s.lang)]
}

/** Current language code. */
export function useLang(): Lang {
  return useUiStore((s) => s.lang)
}
