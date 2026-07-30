import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LANGS, MONTHS, translate } from './dict'
import type { Key, Lang } from './dict'

export { LANGS, MONTHS }
export type { Lang }

const STORAGE_KEY = 'uzb.lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved && ['uz', 'cy', 'ru'].includes(saved)) return saved
  } catch {
    /* storage unavailable — fall through to default */
  }
  return navigator.language?.startsWith('ru') ? 'ru' : 'uz'
}

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: Key) => string
  months: string[]
}

const LangContext = createContext<Ctx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l === 'ru' ? 'ru' : 'uz'
  }, [])

  const t = useCallback((key: Key) => translate(lang, key), [lang])

  const value = useMemo(
    () => ({ lang, setLang, t, months: MONTHS[lang] }),
    [lang, setLang, t],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useT() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useT must be used inside <LangProvider>')
  return ctx
}
