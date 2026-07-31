import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  ListTree,
  ArrowLeftRight,
  Wallet,
  Landmark,
  ShoppingCart,
  Package,
  Truck,
  Users,
  FileBarChart,
  ShieldCheck,
  Plug,
  Settings,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Check,
  ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useT, LANGS } from '../i18n'
import type { Key } from '../i18n/dict'
import { useStore } from '../store'
import { companies } from '../data/mock'
import { Toast } from './ui'

type NavItem = { to: string; icon: LucideIcon; key: Key }
type NavGroup = { titleKey: Key; items: NavItem[] }

const GROUPS: NavGroup[] = [
  {
    titleKey: 'nav.group.main',
    items: [
      { to: '/app', icon: LayoutDashboard, key: 'nav.dashboard' },
      { to: '/app/companies', icon: Building2, key: 'nav.companies' },
      { to: '/app/accounts', icon: ListTree, key: 'nav.accounts' },
    ],
  },
  {
    titleKey: 'nav.group.ops',
    items: [
      { to: '/app/entries', icon: ArrowLeftRight, key: 'nav.entries' },
      { to: '/app/cash', icon: Wallet, key: 'nav.cash' },
      { to: '/app/bank', icon: Landmark, key: 'nav.bank' },
      { to: '/app/trade', icon: ShoppingCart, key: 'nav.trade' },
    ],
  },
  {
    titleKey: 'nav.group.acct',
    items: [
      { to: '/app/inventory', icon: Package, key: 'nav.inventory' },
      { to: '/app/assets', icon: Truck, key: 'nav.assets' },
      { to: '/app/payroll', icon: Users, key: 'nav.payroll' },
      { to: '/app/reports', icon: FileBarChart, key: 'nav.reports' },
    ],
  },
  {
    titleKey: 'nav.group.other',
    items: [
      { to: '/app/eimzo', icon: ShieldCheck, key: 'nav.eimzo' },
      { to: '/app/integrations', icon: Plug, key: 'nav.integrations' },
      { to: '/app/settings', icon: Settings, key: 'nav.settings' },
    ],
  },
]

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: '#2a78d6' }}>
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
          <path d="M8 22h16" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M11 18v-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M16 18v-4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M21 18v-9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        UZBalance
      </span>
    </div>
  )
}

function LangSwitch() {
  const { lang, setLang } = useT()
  return (
    <div className="inline-flex rounded-lg p-0.5" style={{ background: 'var(--surface-3)' }}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className="rounded-md px-2 py-1 text-xs font-semibold transition-colors"
          style={
            lang === l.code
              ? { background: 'var(--surface-1)', color: 'var(--text-primary)' }
              : { color: 'var(--text-secondary)' }
          }
          title={l.label}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}

function CompanyPicker() {
  const { companyId, setCompanyId } = useStore()
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const current = companies.find((c) => c.id === companyId) ?? companies[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--surface-2)]"
        style={{ borderColor: 'var(--border-1)', background: 'var(--surface-1)' }}
      >
        <span className="min-w-0">
          <span className="block truncate font-medium" style={{ color: 'var(--text-primary)' }}>
            {current.name}
          </span>
          <span className="block truncate text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('co.inn')}: {current.inn}
          </span>
        </span>
        <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border shadow-lg"
            style={{ borderColor: 'var(--border-1)', background: 'var(--surface-1)' }}
          >
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCompanyId(c.id)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--surface-2)]"
              >
                <span className="min-w-0">
                  <span className="block truncate" style={{ color: 'var(--text-primary)' }}>
                    {c.name}
                  </span>
                  <span className="block truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                    {c.inn}
                  </span>
                </span>
                {c.id === companyId && <Check size={16} style={{ color: '#2a78d6' }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useT()
  const { theme, toggleTheme, user, logout, toast } = useStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-4 py-4">
        <Logo />
      </div>
      <div className="px-3 pb-3">
        <CompanyPicker />
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2">
        {GROUPS.map((g) => (
          <div key={g.titleKey}>
            <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {t(g.titleKey)}
            </div>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = it.icon
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.to === '/app'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors"
                    style={({ isActive }) =>
                      isActive
                        ? { background: 'rgba(42,120,214,0.12)', color: '#1c5cab' }
                        : { color: 'var(--text-secondary)' }
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} style={{ color: isActive ? '#2a78d6' : 'var(--text-muted)' }} />
                        {t(it.key)}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t px-3 py-3" style={{ borderColor: 'var(--border-1)' }}>
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut size={18} style={{ color: 'var(--text-muted)' }} />
          {t('auth.logout')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface-2)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden w-64 shrink-0 border-r lg:block"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border-1)' }}
      >
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 h-full w-72 border-r"
            style={{ background: 'var(--surface-1)', borderColor: 'var(--border-1)' }}
          >
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header
          className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--border-1)' }}
        >
          <button
            className="rounded-lg p-2 hover:bg-[var(--surface-2)] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="menu"
          >
            <Menu size={20} style={{ color: 'var(--text-primary)' }} />
          </button>
          <div className="hidden text-sm sm:block" style={{ color: 'var(--text-secondary)' }}>
            {t('dash.hello')}, <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name ?? 'Demo'}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LangSwitch />
            <button
              onClick={toggleTheme}
              className="rounded-lg border p-2 transition-colors hover:bg-[var(--surface-2)]"
              style={{ borderColor: 'var(--border-1)' }}
              aria-label="theme"
            >
              {theme === 'light' ? (
                <Moon size={18} style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Sun size={18} style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {toast && <Toast message={toast} />}
      {mobileOpen && (
        <button className="sr-only" onClick={() => setMobileOpen(false)}>
          <X />
        </button>
      )}
    </div>
  )
}
