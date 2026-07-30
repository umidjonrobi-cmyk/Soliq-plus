import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { companies } from './data/mock'

type Theme = 'light' | 'dark'
type User = { name: string; email: string; company: string }

type Store = {
  user: User | null
  login: (u: User) => void
  logout: () => void
  theme: Theme
  toggleTheme: () => void
  companyId: string
  setCompanyId: (id: string) => void
  toast: string | null
  notify: (msg: string) => void
}

const Ctx = createContext<Store | null>(null)

const readLS = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const writeLS = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* ignore */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = readLS('uzb.user')
    return raw ? (JSON.parse(raw) as User) : null
  })
  const [theme, setTheme] = useState<Theme>(() => (readLS('uzb.theme') as Theme) || 'light')
  const [companyId, setCompanyIdState] = useState<string>(() => readLS('uzb.company') || companies[0].id)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    writeLS('uzb.theme', theme)
  }, [theme])

  const login = useCallback((u: User) => {
    setUser(u)
    writeLS('uzb.user', JSON.stringify(u))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try {
      localStorage.removeItem('uzb.user')
    } catch {
      /* ignore */
    }
  }, [])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), [])

  const setCompanyId = useCallback((id: string) => {
    setCompanyIdState(id)
    writeLS('uzb.company', id)
  }, [])

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  const value = useMemo(
    () => ({ user, login, logout, theme, toggleTheme, companyId, setCompanyId, toast, notify }),
    [user, login, logout, theme, toggleTheme, companyId, setCompanyId, toast, notify],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within <AppProvider>')
  return ctx
}
