import { Link } from 'react-router-dom'
import { ListTree, FileBarChart, ShieldCheck, ArrowRight } from 'lucide-react'
import { useT, LANGS } from '../i18n'
import { useStore } from '../store'
import { Sun, Moon } from 'lucide-react'

export default function Landing() {
  const { t, lang, setLang } = useT()
  const { theme, toggleTheme } = useStore()

  const features = [
    { icon: ListTree, t: t('mk.f1.t'), d: t('mk.f1.d') },
    { icon: FileBarChart, t: t('mk.f2.t'), d: t('mk.f2.d') },
    { icon: ShieldCheck, t: t('mk.f3.t'), d: t('mk.f3.d') },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: '#2a78d6' }}>
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
              <path d="M8 22h16" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M11 18v-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M16 18v-4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M21 18v-9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            UZBalance
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg p-0.5" style={{ background: 'var(--surface-3)' }}>
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className="rounded-md px-2 py-1 text-xs font-semibold"
                style={lang === l.code ? { background: 'var(--surface-1)', color: 'var(--text-primary)' } : { color: 'var(--text-secondary)' }}
              >
                {l.short}
              </button>
            ))}
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg border p-2"
            style={{ borderColor: 'var(--border-1)' }}
            aria-label="theme"
          >
            {theme === 'light' ? <Moon size={18} style={{ color: 'var(--text-secondary)' }} /> : <Sun size={18} style={{ color: 'var(--text-secondary)' }} />}
          </button>
          <Link
            to="/login"
            className="rounded-lg px-3.5 py-2 text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('auth.login')}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        {/* Hero */}
        <section className="py-14 sm:py-20 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: 'rgba(42,120,214,0.12)', color: '#1c5cab' }}
          >
            {t('app.tagline')}
          </span>
          <h1
            className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('mk.heroTitle')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            {t('mk.heroSub')}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: '#2a78d6' }}
            >
              {t('mk.cta')} <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold"
              style={{ borderColor: 'var(--border-1)', color: 'var(--text-primary)', background: 'var(--surface-1)' }}
            >
              {t('mk.ctaDemo')}
            </Link>
          </div>
        </section>

        {/* Preview */}
        <section className="pb-12">
          <div
            className="mx-auto max-w-4xl overflow-hidden rounded-2xl border shadow-xl"
            style={{ borderColor: 'var(--border-1)', background: 'var(--surface-1)' }}
          >
            <div className="flex items-center gap-1.5 border-b px-4 py-2.5" style={{ borderColor: 'var(--border-1)' }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#e34948' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#eda100' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#008300' }} />
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              {[
                { l: t('dash.kpi.revenue'), v: '2 494', c: '#2a78d6' },
                { l: t('dash.kpi.profit'), v: '214,8', c: '#1baf7a' },
                { l: t('dash.kpi.cash'), v: '18,6', c: '#eb6834' },
                { l: t('dash.kpi.bank'), v: '342,7', c: '#4a3aa7' },
              ].map((k) => (
                <div key={k.l} className="rounded-xl border p-3" style={{ borderColor: 'var(--border-1)', background: 'var(--surface-2)' }}>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {k.l}
                  </div>
                  <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {k.v}
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full" style={{ background: k.c, opacity: 0.85 }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-4 pb-20 sm:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.t} className="rounded-xl border p-5" style={{ borderColor: 'var(--border-1)', background: 'var(--surface-1)' }}>
                <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: 'rgba(42,120,214,0.12)' }}>
                  <Icon size={20} style={{ color: '#2a78d6' }} />
                </div>
                <h3 className="mt-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {f.t}
                </h3>
                <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {f.d}
                </p>
              </div>
            )
          })}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm" style={{ borderColor: 'var(--border-1)', color: 'var(--text-muted)' }}>
        © 2026 UZBalance · {t('app.tagline')}
      </footer>
    </div>
  )
}
