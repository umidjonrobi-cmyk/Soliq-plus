import { Sun, Moon, Plug, Check, FileText, Landmark, KeyRound, Sparkles, ShieldAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useT, LANGS } from '../i18n'
import type { Key } from '../i18n/dict'
import { Card, SectionTitle, Button, Badge, Field, Input } from '../components/ui'
import { useStore } from '../store'

function IntegrationRow({ icon: Icon, name, connected, onToggle, label }: { icon: LucideIcon; name: string; connected: boolean; onToggle: () => void; label: { on: string; off: string; connect: string } }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: 'var(--surface-3)' }}>
          <Icon size={18} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{name}</span>
      </div>
      <div className="flex items-center gap-3">
        {connected ? (
          <Badge tone="good"><Check size={12} /> {label.on}</Badge>
        ) : (
          <Badge tone="neutral">{label.off}</Badge>
        )}
        <Button variant="outline" size="sm" onClick={onToggle}>{label.connect}</Button>
      </div>
    </div>
  )
}

export default function Settings() {
  const { t, lang, setLang } = useT()
  const { theme, toggleTheme, user, notify } = useStore()

  const integrations: { icon: LucideIcon; key: Key; connected: boolean }[] = [
    { icon: FileText, key: 'st.int.efaktura', connected: true },
    { icon: Landmark, key: 'st.int.tax', connected: true },
    { icon: Landmark, key: 'st.int.bank', connected: false },
    { icon: KeyRound, key: 'st.int.eri', connected: false },
    { icon: Sparkles, key: 'st.int.ai', connected: false },
  ]

  return (
    <div>
      <SectionTitle title={t('st.title')} subtitle={t('st.sub')} />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <h2 className="mb-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{t('st.profile')}</h2>
          <div className="space-y-3">
            <Field label={t('auth.fullName')}>
              <Input defaultValue={user?.name ?? 'Nilufar Yusupova'} />
            </Field>
            <Field label={t('auth.email')}>
              <Input defaultValue={user?.email ?? 'demo@uzbalance.uz'} />
            </Field>
            <Field label={t('auth.phone')}>
              <Input defaultValue="+998 90 123 45 67" />
            </Field>
            <Button onClick={() => notify(t('st.saved'))}>{t('common.save')}</Button>
          </div>
        </Card>

        {/* Appearance */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{t('st.appearance')}</h2>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('st.language')}</div>
                <div className="inline-flex rounded-lg p-0.5" style={{ background: 'var(--surface-3)' }}>
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className="rounded-md px-3 py-1.5 text-sm font-medium"
                      style={lang === l.code ? { background: 'var(--surface-1)', color: 'var(--text-primary)' } : { color: 'var(--text-secondary)' }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('st.theme')}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
                    style={theme === 'light' ? { borderColor: '#2a78d6', color: 'var(--text-primary)', background: 'rgba(42,120,214,0.08)' } : { borderColor: 'var(--border-1)', color: 'var(--text-secondary)' }}
                  >
                    <Sun size={16} /> {t('st.theme.light')}
                  </button>
                  <button
                    onClick={() => theme === 'light' && toggleTheme()}
                    className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
                    style={theme === 'dark' ? { borderColor: '#2a78d6', color: 'var(--text-primary)', background: 'rgba(42,120,214,0.08)' } : { borderColor: 'var(--border-1)', color: 'var(--text-secondary)' }}
                  >
                    <Moon size={16} /> {t('st.theme.dark')}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 flex items-center gap-2 font-semibold" style={{ color: 'var(--critical)' }}>
              <ShieldAlert size={18} /> {t('st.danger')}
            </h2>
            <p className="mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('demo.banner')}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  localStorage.removeItem('uzb.company')
                } catch {
                  /* ignore */
                }
                notify(t('st.saved'))
              }}
            >
              {t('st.resetDemo')}
            </Button>
          </Card>
        </div>

        {/* Integrations */}
        <Card className="lg:col-span-2">
          <h2 className="mb-2 flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
            <Plug size={18} style={{ color: 'var(--text-muted)' }} /> {t('st.integrations')}
          </h2>
          <div>
            {integrations.map((it) => (
              <IntegrationRow
                key={it.key}
                icon={it.icon}
                name={t(it.key)}
                connected={it.connected}
                onToggle={() => notify(t('common.soon'))}
                label={{ on: t('st.connected'), off: t('st.notConnected'), connect: it.connected ? t('common.edit') : t('st.connect') }}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
