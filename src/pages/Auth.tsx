import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sun, Moon, ArrowLeft, Play } from 'lucide-react'
import { useT, LANGS } from '../i18n'
import { useStore } from '../store'
import { Field, Input, Button } from '../components/ui'
import { registerAccount, verifyAccount, ensureDemoAccount } from '../lib/authLocal'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

function Shell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useT()
  const { theme, toggleTheme } = useStore()
  return (
    <div className="grid min-h-screen lg:grid-cols-2" style={{ background: 'var(--surface-2)' }}>
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between p-10 lg:flex" style={{ background: '#123a6b' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
              <path d="M8 22h16" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M11 18v-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M16 18v-4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M21 18v-9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white">UZBalance</span>
        </Link>
        <div>
          <h2 className="max-w-sm text-3xl font-bold leading-tight text-white">{t('mk.heroTitle')}</h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">{t('mk.heroSub')}</p>
        </div>
        <div className="text-xs text-white/50">© 2026 UZBalance</div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-5">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} /> {t('nf.back')}
          </Link>
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
            <button onClick={toggleTheme} className="rounded-lg border p-2" style={{ borderColor: 'var(--border-1)' }} aria-label="theme">
              {theme === 'light' ? <Moon size={18} style={{ color: 'var(--text-secondary)' }} /> : <Sun size={18} style={{ color: 'var(--text-secondary)' }} />}
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-5">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export function Login() {
  const { t } = useT()
  const { login, notify } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<{ email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof err = {}
    if (!emailOk(email)) next.email = t('auth.err.email')
    if (password.length < 6) next.password = t('auth.err.password')
    setErr(next)
    if (Object.keys(next).length) return
    setBusy(true)

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setBusy(false)
      if (error) {
        setErr({ form: t('auth.err.invalidCreds') })
        return
      }
      navigate('/app') // session listener sets the user
      return
    }

    const user = await verifyAccount(email, password)
    setBusy(false)
    if (!user) {
      setErr({ form: t('auth.err.invalidCreds') })
      return
    }
    login(user)
    navigate('/app')
  }

  async function demoLogin() {
    setBusy(true)
    if (isSupabaseConfigured) {
      const creds = { email: 'demo@uzbalance.uz', password: 'demo1234' }
      let res = await supabase.auth.signInWithPassword(creds)
      if (res.error) {
        // First run — create the shared demo account, then sign in.
        await supabase.auth.signUp({
          ...creds,
          options: { data: { full_name: 'Demo foydalanuvchi', company_name: '"NUR SAVDO" MChJ' } },
        })
        res = await supabase.auth.signInWithPassword(creds)
      }
      setBusy(false)
      if (res.error) {
        setErr({ form: res.error.message })
        return
      }
      notify(t('common.demo'))
      navigate('/app')
      return
    }

    const user = await ensureDemoAccount()
    setBusy(false)
    login(user)
    notify(t('common.demo'))
    navigate('/app')
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {t('auth.loginTitle')}
      </h1>
      <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('auth.loginHint')}
      </p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <Field label={t('auth.email')} error={err.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.uz" autoComplete="email" />
        </Field>
        <Field label={t('auth.password')} error={err.password}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        </Field>
        {err.form && (
          <div className="rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(208,59,59,0.10)', color: 'var(--critical)' }}>
            {err.form}
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" defaultChecked className="accent-[#2a78d6]" /> {t('auth.remember')}
          </label>
          <a href="#" className="font-medium" style={{ color: '#2a78d6' }}>
            {t('auth.forgot')}
          </a>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {t('auth.login')}
        </Button>
      </form>

      {/* Demo — alohida, tez kirish */}
      <div className="my-4 flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="h-px flex-1" style={{ background: 'var(--border-1)' }} />
        {t('auth.or')}
        <span className="h-px flex-1" style={{ background: 'var(--border-1)' }} />
      </div>
      <Button variant="outline" className="w-full" onClick={demoLogin} disabled={busy}>
        <Play size={15} /> {t('auth.demoLogin')}
      </Button>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-medium" style={{ color: '#2a78d6' }}>
          {t('auth.register')}
        </Link>
      </p>
    </Shell>
  )
}

export function Register() {
  const { t } = useT()
  const { login, notify } = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '', confirm: '' })
  const [agree, setAgree] = useState(true)
  const [err, setErr] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = t('auth.err.required')
    if (!form.company.trim()) next.company = t('auth.err.required')
    if (!emailOk(form.email)) next.email = t('auth.err.email')
    if (form.password.length < 6) next.password = t('auth.err.password')
    if (!form.confirm) next.confirm = t('auth.err.required')
    else if (form.confirm !== form.password) next.confirm = t('auth.err.confirmMismatch')
    setErr(next)
    if (Object.keys(next).length || !agree) return
    setBusy(true)

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name, company_name: form.company },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      setBusy(false)
      if (error) {
        if (/registered|exists/i.test(error.message)) setErr({ email: t('auth.err.emailTaken') })
        else setErr({ email: error.message })
        return
      }
      // Confirm-email ON → no session yet; ask the user to check their inbox.
      if (!data.session) {
        setConfirmSent(true)
        return
      }
      notify(t('auth.registered'))
      navigate('/app') // session listener sets the user
      return
    }

    const res = await registerAccount({ name: form.name, company: form.company, email: form.email, password: form.password })
    setBusy(false)
    if (!res.ok) {
      setErr({ email: t('auth.err.emailTaken') })
      return
    }
    login(res.user)
    notify(t('auth.registered'))
    navigate('/app')
  }

  if (confirmSent) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl" style={{ background: 'rgba(42,120,214,0.12)' }}>
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#2a78d6" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('auth.confirmTitle')}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('auth.confirmSent')} <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{form.email}</span>
          </p>
          <Link to="/login" className="mt-6 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ background: '#2a78d6' }}>
            {t('auth.login')}
          </Link>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {t('auth.registerTitle')}
      </h1>
      <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('auth.registerSub')}
      </p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <Field label={t('auth.fullName')} error={err.name}>
          <Input value={form.name} onChange={set('name')} placeholder="Familiya Ism" autoComplete="name" />
        </Field>
        <Field label={t('auth.company')} error={err.company}>
          <Input value={form.company} onChange={set('company')} placeholder='"COMPANY" MChJ' />
        </Field>
        <Field label={t('auth.email')} error={err.email}>
          <Input type="email" value={form.email} onChange={set('email')} placeholder="you@company.uz" autoComplete="email" />
        </Field>
        <Field label={t('auth.password')} error={err.password}>
          <Input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete="new-password" />
        </Field>
        <Field label={t('auth.confirmPassword')} error={err.confirm}>
          <Input type="password" value={form.confirm} onChange={set('confirm')} placeholder="••••••••" autoComplete="new-password" />
        </Field>
        <label className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[#2a78d6]" />
          {t('auth.agree')}
        </label>
        <Button type="submit" className="w-full" disabled={!agree || busy}>
          {t('auth.register')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="font-medium" style={{ color: '#2a78d6' }}>
          {t('auth.login')}
        </Link>
      </p>
    </Shell>
  )
}
