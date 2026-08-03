import { useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useT } from '../i18n'
import { Card, SectionTitle, DataTable } from '../components/ui'
import type { Col } from '../components/ui'
import { cashOps, bankOps, cashOpening, bankOpening, pick } from '../data/mock'
import type { Movement } from '../data/mock'
import { money, moneyShort, date } from '../lib/format'
import { useStore } from '../store'

function Register({ mode }: { mode: 'cash' | 'bank' }) {
  const { t, lang } = useT()
  const { currentCompany } = useStore()
  const ops = mode === 'cash' ? cashOps : bankOps
  const opening = mode === 'cash' ? cashOpening : bankOpening
  const company = currentCompany

  const sorted = useMemo(() => [...ops].sort((a, b) => a.date.localeCompare(b.date)), [ops])
  const totalIn = ops.filter((o) => o.kind === 'in').reduce((s, o) => s + o.amount, 0)
  const totalOut = ops.filter((o) => o.kind === 'out').reduce((s, o) => s + o.amount, 0)
  const closing = opening + totalIn - totalOut

  // running balance for the table (newest first display, compute chronologically)
  let run = opening
  const withRun = sorted.map((o) => {
    run += o.kind === 'in' ? o.amount : -o.amount
    return { ...o, balance: run }
  })
  const display = [...withRun].reverse()

  const cols: Col<Movement & { balance: number }>[] = [
    { key: 'no', header: t('common.number'), render: (o) => <span className="tnum" style={{ color: 'var(--text-muted)' }}>{o.no}</span> },
    { key: 'date', header: t('common.date'), render: (o) => date(o.date, lang) },
    { key: 'cp', header: t('cb.counterparty'), render: (o) => (
      <div>
        <div style={{ color: 'var(--text-primary)' }}>{o.counterparty}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{pick(o.memo, lang)}</div>
      </div>
    ) },
    { key: 'in', header: t('cb.in'), align: 'right', render: (o) => o.kind === 'in' ? <span style={{ color: 'var(--good-text)' }}>{money(o.amount)}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'out', header: t('cb.out'), align: 'right', render: (o) => o.kind === 'out' ? <span style={{ color: 'var(--critical)' }}>{money(o.amount)}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'bal', header: t('common.balance'), align: 'right', render: (o) => <span className="font-medium">{money(o.balance)}</span> },
  ]

  return (
    <div>
      <SectionTitle title={t(mode === 'cash' ? 'cb.cashTitle' : 'cb.bankTitle')} subtitle={t(mode === 'cash' ? 'cb.cashSub' : 'cb.bankSub')} />

      {mode === 'bank' && company && (company.bankAccount || company.bankName || company.mfo) && (
        <Card className="mb-4">
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('cb.account')}</div>
              <div className="tnum font-medium" style={{ color: 'var(--text-primary)' }}>{company.bankAccount || '—'}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('cb.bankName')}</div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{company.bankName || '—'}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('cb.mfo')}</div>
              <div className="tnum font-medium" style={{ color: 'var(--text-primary)' }}>{company.mfo || '—'}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('cb.opening')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{moneyShort(opening, lang)}</div>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <ArrowDownLeft size={13} style={{ color: 'var(--good-text)' }} /> {t('cb.in')}
          </div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--good-text)' }}>{moneyShort(totalIn, lang)}</div>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <ArrowUpRight size={13} style={{ color: 'var(--critical)' }} /> {t('cb.out')}
          </div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--critical)' }}>{moneyShort(totalOut, lang)}</div>
        </Card>
        <Card className="ring-1 ring-[#2a78d6]/30">
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('cb.closing')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: '#1c5cab' }}>{moneyShort(closing, lang)}</div>
        </Card>
      </div>

      <Card pad={false}>
        <div className="px-2 py-2">
          <DataTable cols={cols} rows={display} rowKey={(o) => o.id} empty={t('common.empty')} />
        </div>
      </Card>
    </div>
  )
}

export function Cash() {
  return <Register mode="cash" />
}
export function Bank() {
  return <Register mode="bank" />
}
