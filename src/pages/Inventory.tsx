import { useT } from '../i18n'
import { Card, SectionTitle, DataTable, Badge } from '../components/ui'
import type { Col } from '../components/ui'
import { items, pick } from '../data/mock'
import type { Item } from '../data/mock'
import { money, moneyShort } from '../lib/format'

export default function Inventory() {
  const { t, lang } = useT()

  const totalValue = items.reduce((s, i) => s + i.qty * i.cost, 0)
  const lowCount = items.filter((i) => i.qty < i.min).length

  const cols: Col<Item>[] = [
    { key: 'sku', header: t('inv.sku'), render: (i) => <span className="tnum" style={{ color: 'var(--text-muted)' }}>{i.sku}</span> },
    { key: 'name', header: t('common.name'), render: (i) => <span style={{ color: 'var(--text-primary)' }}>{i.name}</span> },
    { key: 'qty', header: t('common.qty'), align: 'right', render: (i) => (
      <span className="tnum">{i.qty.toLocaleString('ru-RU')} <span style={{ color: 'var(--text-muted)' }}>{pick(i.unit, lang)}</span></span>
    ) },
    { key: 'cost', header: t('inv.cost'), align: 'right', render: (i) => money(i.cost) },
    { key: 'value', header: t('inv.value'), align: 'right', render: (i) => <span className="font-medium">{money(i.qty * i.cost)}</span> },
    { key: 'status', header: t('common.status'), align: 'center', render: (i) =>
      i.qty < i.min ? <Badge tone="critical">{t('inv.low')}</Badge> : <Badge tone="good">{t('inv.ok')}</Badge> },
  ]

  return (
    <div>
      <SectionTitle title={t('inv.title')} subtitle={t('inv.sub')} />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('inv.value')} ({t('common.total')})</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{moneyShort(totalValue, lang)}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('common.total')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--series-1)' }}>{items.length}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('inv.low')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: lowCount ? 'var(--critical)' : 'var(--good-text)' }}>{lowCount}</div>
        </Card>
      </div>

      <Card pad={false}>
        <div className="px-2 py-2">
          <DataTable cols={cols} rows={items} rowKey={(i) => i.id} empty={t('common.empty')} />
        </div>
      </Card>
    </div>
  )
}
