import { useMemo, useState } from 'react'
import { Plug, Check, ExternalLink, Loader2, Send, ShieldCheck, Star } from 'lucide-react'
import { useT } from '../i18n'
import { Card, SectionTitle, Button, Badge, Modal, Field, Input } from '../components/ui'
import { useStore } from '../store'
import { PROVIDER_LIST } from '../lib/integrations/providers'
import type { Provider } from '../lib/integrations/types'
import { getConfig, saveConfig, clearConfig, getActiveProvider, setActiveProvider } from '../lib/integrations/config'
import { buildDraftFromInvoice } from '../lib/integrations/draft'
import { invoices, companies } from '../data/mock'
import { listCertificates, signText } from '../lib/eimzo'

export default function Integrations() {
  const { t, lang } = useT()
  const { notify, companyId } = useStore()
  const company = companies.find((c) => c.id === companyId) ?? companies[0]

  const [active, setActive] = useState(getActiveProvider())
  const [editing, setEditing] = useState<Provider | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [lastDoc, setLastDoc] = useState<Record<string, string>>({})
  // bump to re-read localStorage-backed config after save/clear
  const [, force] = useState(0)
  const refresh = () => force((n) => n + 1)

  const status = useMemo(() => {
    const s: Record<string, 'live' | 'demo' | 'off'> = {}
    for (const p of PROVIDER_LIST) {
      const cfg = getConfig(p.meta.id)
      s[p.meta.id] = p.isConfigured(cfg) ? 'live' : 'off'
    }
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, busyId])

  function openConfig(p: Provider) {
    setEditing(p)
    setForm(getConfig(p.meta.id))
  }

  function save() {
    if (!editing) return
    saveConfig(editing.meta.id, form)
    setEditing(null)
    refresh()
    notify(t('int.connected'))
  }

  function disconnect(p: Provider) {
    clearConfig(p.meta.id)
    refresh()
    notify(t('int.notConnected'))
  }

  async function testConn(p: Provider) {
    setBusyId(p.meta.id + ':test')
    try {
      const res = await p.testConnection(getConfig(p.meta.id))
      notify(res.mode === 'live' ? t('int.testOk') : t('int.testDemo'))
    } finally {
      setBusyId(null)
    }
  }

  async function sendTest(p: Provider) {
    setBusyId(p.meta.id + ':send')
    try {
      // Build a draft from the first sale invoice + current company as seller.
      const inv = invoices.find((i) => i.kind === 'sale') ?? invoices[0]
      const draft = buildDraftFromInvoice(inv, company, lang)

      // Sign with E-IMZO if available; otherwise proceed unsigned (demo).
      let pkcs7: string | undefined
      let signed = false
      try {
        const certs = await listCertificates()
        if (certs.length) {
          pkcs7 = await signText(certs[0], JSON.stringify(draft))
          signed = true
        }
      } catch {
        /* E-IMZO not present — demo path */
      }

      const res = await p.sendInvoice(draft, getConfig(p.meta.id), pkcs7)
      if (res.ok && res.providerDocId) {
        setLastDoc((m) => ({ ...m, [p.meta.id]: res.providerDocId! }))
      }
      notify(
        !signed
          ? t('int.signSkipped')
          : res.mode === 'live'
            ? t('int.sentOk')
            : t('int.sentDemo'),
      )
    } finally {
      setBusyId(null)
    }
  }

  function makeActive(p: Provider) {
    setActiveProvider(p.meta.id)
    setActive(p.meta.id)
    notify(t('int.active'))
  }

  return (
    <div>
      <SectionTitle title={t('int.title')} subtitle={t('int.sub')} />

      <div className="mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: 'var(--border-1)', background: 'var(--surface-1)', color: 'var(--text-secondary)' }}>
        <Plug size={16} className="mt-0.5 shrink-0" style={{ color: '#2a78d6' }} />
        {t('int.needKeys')}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PROVIDER_LIST.map((p) => {
          const st = status[p.meta.id]
          const isActive = active === p.meta.id
          const testing = busyId === p.meta.id + ':test'
          const sending = busyId === p.meta.id + ':send'
          const doc = lastDoc[p.meta.id]
          return (
            <Card key={p.meta.id} className={isActive ? 'ring-2 ring-[#2a78d6]' : ''}>
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl text-sm font-bold" style={{ background: 'rgba(42,120,214,0.12)', color: '#1c5cab' }}>
                  {p.meta.name.slice(0, 2).toUpperCase()}
                </div>
                {isActive ? (
                  <Badge tone="brand"><Star size={12} /> {t('int.active')}</Badge>
                ) : st === 'live' ? (
                  <Badge tone="good"><Check size={12} /> {t('int.connected')}</Badge>
                ) : (
                  <Badge tone="neutral">{t('int.notConnected')}</Badge>
                )}
              </div>

              <h3 className="mt-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{p.meta.name}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t(p.meta.descKey)}</p>

              <a href={p.meta.docsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#2a78d6' }}>
                {p.meta.site} <ExternalLink size={12} />
              </a>

              {doc && (
                <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--surface-2)' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--good-text)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>{t('int.docId')}:</span>
                  <span className="tnum font-medium" style={{ color: 'var(--text-primary)' }}>{doc}</span>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => openConfig(p)}>
                  {t('int.configure')}
                </Button>
                {st === 'live' ? (
                  <Button variant="outline" size="sm" onClick={() => disconnect(p)}>
                    {t('int.disconnect')}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => testConn(p)} disabled={testing}>
                    {testing ? <Loader2 size={14} className="animate-spin" /> : null}
                    {t('int.test')}
                  </Button>
                )}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button size="sm" onClick={() => sendTest(p)} disabled={sending}>
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {sending ? t('int.sending') : t('int.sendTest')}
                </Button>
                {!isActive && (
                  <Button variant="ghost" size="sm" onClick={() => makeActive(p)}>
                    {t('int.setActive')}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <ShieldCheck size={14} /> {t('int.eriNote')}
      </p>

      {/* Config modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `${editing.meta.name} — ${t('int.configure')}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('common.cancel')}</Button>
            <Button onClick={save}>{t('int.save')}</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            {editing.meta.authFields.map((f) => (
              <Field key={f.key} label={t(f.labelKey)}>
                <Input
                  type={f.type === 'password' ? 'password' : 'text'}
                  value={form[f.key] || ''}
                  placeholder={f.placeholder}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  autoComplete="off"
                />
              </Field>
            ))}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('int.needKeys')}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
