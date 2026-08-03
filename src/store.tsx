import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { companies as mockCompanies } from './data/mock'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { listCompanies, seedIfNeeded } from './lib/db'
import type { UiCompany } from './lib/db'

type Theme = 'light' | 'dark'
type User = { name: string; email: string; company: string }

/** Demo/offline companies mapped to the unified UI shape (latin strings). */
const mockUi: UiCompany[] = mockCompanies.map((c) => ({
  id: c.id,
  name: c.name,
  inn: c.inn,
  oked: c.oked,
  director: c.director,
  accountant: c.accountant,
  address: c.address[0],
  taxMode: c.taxMode,
  bankAccount: c.bankAccount,
  bankName: c.bankName[0],
  mfo: c.mfo,
}))

type Store = {
  user: User | null
  authReady: boolean
  /** Reflect a locally-authenticated user (demo / offline fallback). */
  login: (u: User) => void
  logout: () => void
  theme: Theme
  toggleTheme: () => void
  companies: UiCompany[]
  currentCompany: UiCompany | null
  companyId: string
  setCompanyId: (id: string) => void
  reloadCompanies: () => Promise<void>
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

/** Map a Supabase session to our lightweight User shape. */
function userFromSession(session: Session | null): User | null {
  const u = session?.user
  if (!u) return null
  const meta = (u.user_metadata || {}) as { full_name?: string; company_name?: string }
  return {
    name: meta.full_name || u.email?.split('@')[0] || 'Foydalanuvchi',
    email: u.email || '',
    company: meta.company_name || '',
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (isSupabaseConfigured) return null // hydrated from the session below
    const raw = readLS('uzb.user')
    return raw ? (JSON.parse(raw) as User) : null
  })
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [theme, setTheme] = useState<Theme>(() => (readLS('uzb.theme') as Theme) || 'light')
  const [companies, setCompanies] = useState<UiCompany[]>(isSupabaseConfigured ? [] : mockUi)
  const [companyId, setCompanyIdState] = useState<string>(() => readLS('uzb.company') || mockCompanies[0].id)
  const [toast, setToast] = useState<string | null>(null)

  // Sync auth state from Supabase when configured.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(userFromSession(data.session))
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(userFromSession(session))
      setAuthReady(true)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const loadCompanies = useCallback(async () => {
    const list = await listCompanies()
    setCompanies(list)
    setCompanyIdState((prev) => (list.some((c) => c.id === prev) ? prev : list[0]?.id ?? ''))
  }, [])

  // Load the signed-in user's own companies from Supabase (seed on first login).
  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!user) {
      setCompanies([])
      return
    }
    let active = true
    ;(async () => {
      try {
        await seedIfNeeded()
        if (!active) return
        await loadCompanies()
      } catch (e) {
        console.error('[UZBalance] company load failed', e)
      }
    })()
    return () => {
      active = false
    }
  }, [user?.email, loadCompanies])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    writeLS('uzb.theme', theme)
  }, [theme])

  const login = useCallback((u: User) => {
    setUser(u)
    writeLS('uzb.user', JSON.stringify(u))
  }, [])

  const logout = useCallback(() => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut()
      // onAuthStateChange will clear the user
    }
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

  const reloadCompanies = useCallback(async () => {
    if (isSupabaseConfigured) await loadCompanies()
  }, [loadCompanies])

  const currentCompany = useMemo(
    () => companies.find((c) => c.id === companyId) ?? companies[0] ?? null,
    [companies, companyId],
  )

  const value = useMemo(
    () => ({
      user, authReady, login, logout, theme, toggleTheme,
      companies, currentCompany, companyId, setCompanyId, reloadCompanies,
      toast, notify,
    }),
    [user, authReady, login, logout, theme, toggleTheme, companies, currentCompany, companyId, setCompanyId, reloadCompanies, toast, notify],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within <AppProvider>')
  return ctx
}
