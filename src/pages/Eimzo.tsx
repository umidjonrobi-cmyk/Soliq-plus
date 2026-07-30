import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, ShieldAlert, RefreshCw, KeyRound, Check, Copy, PenLine, Loader2 } from 'lucide-react'
import { useT } from '../i18n'
import { Card, SectionTitle, Button, Badge } from '../components/ui'
import { useStore } from '../store'
import { listCertificates, signText } from '../lib/eimzo'
import type { Certificate } from '../lib/eimzo'
import { companies } from '../data/mock'

type Status = 'detecting' | 'ready' | 'notfound'

export default function Eimzo() {
  const { t } = useT()
  const { notify, companyId } = useStore()
  const company = companies.find((c) => c.id === companyId) ?? companies[0]

  const [status, setStatus] = useState<Status>('detecting')
  const [certs, setCerts] = useState<Certificate[]>([])
  const [selected, setSelected] = useState<Certificate | null>(null)
  const [doc, setDoc] = useState('')
  const [signing, setSigning] = useState(false)
  const [signature, setSignature] = useState('')

  const detect = useCallback(async () => {
    setStatus('detecting')
    setSignature('')
    try {
      const list = await listCertificates()
      setCerts(list)
      setStatus('ready')
    } catch {
      setStatus('notfound')
    }
  }, [])

  useEffect(() => {
    detect()
  }, [detect])

  useEffect(() => {
    // Prefill a meaningful document to sign.
    const today = new Date().toISOString().slice(0, 10)
    setDoc(
      `UZBalance — ${t('eri.document')}\n` +
        `${company.name}\n` +
        `${t('co.inn')}: ${company.inn}\n` +
        `${t('common.date')}: ${today}\n` +
        `——————————————————————————\n` +
        `Buxgalteriya balansi tasdiqlandi.`,
    )
  }, [company, t])

  async function onSign() {
    if (!selected) {
      notify(t('eri.selectFirst'))
      return
    }
    setSigning(true)
    setSignature('')
    try {
      const pkcs7 = await signText(selected, doc)
      setSignature(pkcs7)
      notify(t('eri.signed'))
    } catch {
      notify(t('eri.error'))
    } finally {
      setSigning(false)
    }
  }

  function copySig() {
    navigator.clipboard?.writeText(signature).then(
      () => notify(t('eri.copied')),
      () => {},
    )
  }

  return (
    <div>
      <SectionTitle
        title={t('eri.title')}
        subtitle={t('eri.sub')}
        right={
          status === 'ready' ? (
            <Badge tone="good">
              <ShieldCheck size={12} /> {t('eri.detected')}
            </Badge>
          ) : status === 'notfound' ? (
            <Badge tone="critical">
              <ShieldAlert size={12} /> {t('eri.notFound')}
            </Badge>
          ) : undefined
        }
      />

      {/* Detecting */}
      {status === 'detecting' && (
        <Card>
          <div className="flex items-center gap-3 py-6" style={{ color: 'var(--text-secondary)' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: '#2a78d6' }} />
            {t('eri.detecting')}
          </div>
        </Card>
      )}

      {/* Not found */}
      {status === 'notfound' && (
        <Card>
          <div className="flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(208,59,59,0.12)' }}>
              <ShieldAlert size={24} style={{ color: 'var(--critical)' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('eri.notFound')}
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('eri.notFoundDesc')}
              </p>
            </div>
            <Button variant="outline" onClick={detect}>
              <RefreshCw size={16} /> {t('eri.retry')}
            </Button>
          </div>
        </Card>
      )}

      {/* Ready */}
      {status === 'ready' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Certificates */}
          <Card pad={false}>
            <div className="flex items-center justify-between px-5 py-3.5">
              <h2 className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                <KeyRound size={18} style={{ color: 'var(--text-muted)' }} /> {t('eri.certificates')}
              </h2>
              <button onClick={detect} className="rounded-md p-1.5 hover:bg-[var(--surface-2)]" title={t('eri.retry')}>
                <RefreshCw size={15} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            {certs.length === 0 ? (
              <p className="px-5 pb-5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {t('eri.noCerts')}
              </p>
            ) : (
              certs.map((c, i) => {
                const active = selected?.serialNumber === c.serialNumber && selected?.cn === c.cn
                return (
                  <button
                    key={`${c.serialNumber}-${i}`}
                    onClick={() => setSelected(c)}
                    className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
                    style={{ borderTop: '1px solid var(--border-1)' }}
                  >
                    <div className="mt-0.5">
                      {active ? (
                        <div className="grid h-5 w-5 place-items-center rounded-full" style={{ background: '#2a78d6' }}>
                          <Check size={13} color="#fff" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border" style={{ borderColor: 'var(--border-1)' }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                        {c.cn || c.org || c.name}
                      </div>
                      <div className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {c.tin && <span className="tnum">{t('co.inn')}: {c.tin} · </span>}
                        {t('eri.validTo')}: {c.validTo || '—'}
                      </div>
                    </div>
                    {c.expired && <Badge tone="critical">{t('eri.expired')}</Badge>}
                  </button>
                )
              })
            )}
          </Card>

          {/* Sign panel */}
          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
              <PenLine size={18} style={{ color: 'var(--text-muted)' }} /> {t('eri.document')}
            </h2>
            <textarea
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              rows={7}
              className="w-full resize-none rounded-lg border p-3 text-sm outline-none focus:border-[#2a78d6]"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--border-1)', color: 'var(--text-primary)' }}
            />

            {selected && (
              <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--surface-2)' }}>
                <KeyRound size={14} style={{ color: '#2a78d6' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{t('eri.selected')}:</span>
                <span className="truncate font-medium" style={{ color: 'var(--text-primary)' }}>{selected.cn || selected.org}</span>
              </div>
            )}

            <Button className="mt-3 w-full" onClick={onSign} disabled={signing || !selected}>
              {signing ? <Loader2 size={16} className="animate-spin" /> : <PenLine size={16} />}
              {signing ? t('eri.signing') : t('eri.sign')}
            </Button>

            <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('eri.localNote')}
            </p>

            {signature && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    {t('eri.signature')}
                  </span>
                  <button onClick={copySig} className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#2a78d6' }}>
                    <Copy size={13} /> {t('eri.copy')}
                  </button>
                </div>
                <div
                  className="max-h-32 overflow-auto break-all rounded-lg border p-3 text-xs"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border-1)', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace' }}
                >
                  {signature}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
