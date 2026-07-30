import { useT } from '../i18n'
import { Card, SectionTitle, DataTable } from '../components/ui'
import type { Col } from '../components/ui'
import { fixedAssets } from '../data/mock'
import type { FixedAsset } from '../data/mock'
import { money, moneyShort, date } from '../lib/format'

export default function Assets() {
  const { t, lang } = useT()

  const totalInitial = fixedAssets.reduce((s, a) => s + a.initial, 0)
  const totalDep = fixedAssets.reduce((s, a) => s + a.depreciation, 0)
  const totalResidual = totalInitial - totalDep

  const cols: Col<FixedAsset>[] = [
    { key: 'code', header: t('acc.code'), render: (a) => <span className="tnum" style={{ color: 'var(--text-muted)' }}>{a.code}</span> },
    { key: 'name', header: t('common.name'), render: (a) => <span style={{ color: 'var(--text-primary)' }}>{a.name}</span> },
    { key: 'inService', header: t('fa.inService'), render: (a) => date(a.inService, lang) },
    { key: 'life', header: t('fa.life'), align: 'center', render: (a) => `${a.lifeYears} ${t('fa.years')}` },
    { key: 'initial', header: t('fa.initial'), align: 'right', render: (a) => money(a.initial) },
    { key: 'dep', header: t('fa.depreciation'), align: 'right', render: (a) => <span style={{ color: 'var(--critical)' }}>{money(a.depreciation)}</span> },
    { key: 'residual', header: t('fa.residual'), align: 'right', render: (a) => <span className="font-medium">{money(a.initial - a.depreciation)}</span> },
  ]

  return (
    <div>
      <SectionTitle title={t('fa.title')} subtitle={t('fa.sub')} />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('fa.initial')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{moneyShort(totalInitial, lang)}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('fa.depreciation')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--critical)' }}>{moneyShort(totalDep, lang)}</div>
        </Card>
        <Card className="ring-1 ring-[#2a78d6]/30">
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('fa.residual')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: '#1c5cab' }}>{moneyShort(totalResidual, lang)}</div>
        </Card>
      </div>

      <Card pad={false}>
        <div className="px-2 py-2">
          <DataTable cols={cols} rows={fixedAssets} rowKey={(a) => a.id} empty={t('common.empty')} />
        </div>
      </Card>
    </div>
  )
}
