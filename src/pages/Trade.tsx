import { useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { useT } from '../i18n'
import { Card, SectionTitle, DataTable, Badge, Segmented } from '../components/ui'
import type { Col } from '../components/ui'
import { invoices } from '../data/mock'
import type { Invoice } from '../data/mock'
import { money, moneyShort, date } from '../lib/format'

export default function Trade() {
  const { t, lang } = useT()
  const [kind, setKind] = useState<'sale' | 'purchase'>('sale')

  const rows = useMemo(() => invoices.filter((i) => i.kind === kind), [kind])
  const totalNet = rows.reduce((s, i) => s + i.net, 0)
  const totalVat = rows.reduce((s, i) => s + i.vat, 0)
  const unpaid = rows.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.net + i.vat, 0)

  const statusTone = (s: Invoice['status']) => (s === 'paid' ? 'good' : s === 'partial' ? 'warning' : 'critical')
  const statusLabel = (s: Invoice['status']) => t(s === 'paid' ? 'tr.paid' : s === 'partial' ? 'tr.partial' : 'tr.unpaid')

  const cols: Col<Invoice>[] = [
    { key: 'no', header: t('tr.invoice'), render: (i) => (
      <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-primary)' }}>
        <FileText size={14} style={{ color: 'var(--text-muted)' }} /> {i.no}
      </span>
    ) },
    { key: 'date', header: t('common.date'), render: (i) => date(i.date, lang) },
    { key: 'cp', header: t('cb.counterparty'), render: (i) => (
      <div>
        <div style={{ color: 'var(--text-primary)' }}>{i.counterparty}</div>
        <div className="tnum text-xs" style={{ color: 'var(--text-muted)' }}>{t('co.inn')}: {i.inn}</div>
      </div>
    ) },
    { key: 'net', header: t('common.amount'), align: 'right', render: (i) => money(i.net) },
    { key: 'vat', header: t('tr.vat'), align: 'right', render: (i) => <span style={{ color: 'var(--text-secondary)' }}>{money(i.vat)}</span> },
    { key: 'total', header: t('tr.withVat'), align: 'right', render: (i) => <span className="font-medium">{money(i.net + i.vat)}</span> },
    { key: 'status', header: t('common.status'), align: 'center', render: (i) => <Badge tone={statusTone(i.status)}>{statusLabel(i.status)}</Badge> },
  ]

  return (
    <div>
      <SectionTitle
        title={t('tr.title')}
        subtitle={t('tr.sub')}
        right={
          <Segmented
            value={kind}
            onChange={setKind}
            options={[
              { value: 'sale', label: t('tr.sales') },
              { value: 'purchase', label: t('tr.purchases') },
            ]}
          />
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('common.total')} ({kind === 'sale' ? t('tr.sales') : t('tr.purchases')})</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{moneyShort(totalNet + totalVat, lang)}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('tr.vat')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--series-1)' }}>{moneyShort(totalVat, lang)}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('tr.unpaid')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--critical)' }}>{moneyShort(unpaid, lang)}</div>
        </Card>
      </div>

      <Card pad={false}>
        <div className="px-2 py-2">
          <DataTable cols={cols} rows={rows} rowKey={(i) => i.id} empty={t('common.empty')} />
        </div>
      </Card>
    </div>
  )
}
