import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useT } from '../i18n'
import { Card, SectionTitle, DataTable, Badge, Input, Segmented } from '../components/ui'
import type { Col } from '../components/ui'
import { accounts, closingBalance, pick } from '../data/mock'
import type { Account, AccountType } from '../data/mock'
import { money } from '../lib/format'

const TONES: Record<AccountType, 'brand' | 'critical' | 'neutral' | 'good' | 'warning'> = {
  asset: 'brand',
  liability: 'critical',
  equity: 'neutral',
  income: 'good',
  expense: 'warning',
}

export default function Accounts() {
  const { t, lang } = useT()
  const [q, setQ] = useState('')
  const [type, setType] = useState<'all' | AccountType>('all')

  const typeLabel = (ty: AccountType) =>
    t(
      ty === 'asset'
        ? 'acc.type.asset'
        : ty === 'liability'
          ? 'acc.type.liability'
          : ty === 'equity'
            ? 'acc.type.equity'
            : ty === 'income'
              ? 'acc.type.income'
              : 'acc.type.expense',
    )

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase()
    return accounts.filter((a) => {
      if (type !== 'all' && a.type !== type) return false
      if (!ql) return true
      return a.code.includes(ql) || pick(a.name, lang).toLowerCase().includes(ql)
    })
  }, [q, type, lang])

  const cols: Col<Account>[] = [
    { key: 'code', header: t('acc.code'), render: (a) => <span className="tnum font-medium" style={{ color: 'var(--text-primary)' }}>{a.code}</span> },
    { key: 'name', header: t('common.name'), render: (a) => pick(a.name, lang) },
    { key: 'type', header: t('acc.type'), render: (a) => <Badge tone={TONES[a.type]}>{typeLabel(a.type)}</Badge> },
    { key: 'closing', header: t('common.balance'), align: 'right', render: (a) => money(closingBalance(a)) },
  ]

  return (
    <div>
      <SectionTitle title={t('acc.title')} subtitle={t('acc.sub')} />

      <Card pad={false}>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} className="pl-9" />
          </div>
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { value: 'all', label: t('common.all') },
              { value: 'asset', label: t('acc.type.asset') },
              { value: 'liability', label: t('acc.type.liability') },
              { value: 'income', label: t('acc.type.income') },
              { value: 'expense', label: t('acc.type.expense') },
            ]}
          />
        </div>
        <div className="px-2 pb-2">
          <DataTable cols={cols} rows={rows} rowKey={(a) => a.code} empty={t('common.empty')} />
        </div>
      </Card>
    </div>
  )
}
