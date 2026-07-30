import { useT } from '../i18n'
import { Card, SectionTitle, DataTable } from '../components/ui'
import type { Col } from '../components/ui'
import { employees, payrollRow, pick } from '../data/mock'
import { money, moneyShort } from '../lib/format'

type Row = ReturnType<typeof payrollRow>

export default function Payroll() {
  const { t, lang } = useT()
  const rows = employees.map(payrollRow)

  const totalGross = rows.reduce((s, r) => s + r.gross, 0)
  const totalNet = rows.reduce((s, r) => s + r.net, 0)
  const totalTax = rows.reduce((s, r) => s + r.incomeTax + r.pension, 0)
  const totalSocial = rows.reduce((s, r) => s + r.social, 0)

  const cols: Col<Row>[] = [
    { key: 'name', header: t('pr.employee'), render: (r) => (
      <div>
        <div style={{ color: 'var(--text-primary)' }}>{r.name}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{pick(r.position, lang)}</div>
      </div>
    ) },
    { key: 'gross', header: t('pr.gross'), align: 'right', render: (r) => money(r.gross) },
    { key: 'tax', header: t('pr.incomeTax'), align: 'right', render: (r) => <span style={{ color: 'var(--critical)' }}>{money(r.incomeTax)}</span> },
    { key: 'pension', header: t('pr.pension'), align: 'right', render: (r) => <span style={{ color: 'var(--text-secondary)' }}>{money(r.pension)}</span> },
    { key: 'net', header: t('pr.net'), align: 'right', render: (r) => <span className="font-medium" style={{ color: 'var(--good-text)' }}>{money(r.net)}</span> },
  ]

  return (
    <div>
      <SectionTitle title={t('pr.title')} subtitle={t('pr.sub')} />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('pr.gross')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{moneyShort(totalGross, lang)}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('pr.incomeTax')} + {t('pr.pension')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--critical)' }}>{moneyShort(totalTax, lang)}</div>
        </Card>
        <Card>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('pr.social')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--series-2)' }}>{moneyShort(totalSocial, lang)}</div>
        </Card>
        <Card className="ring-1 ring-[#2a78d6]/30">
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('pr.net')}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: '#1c5cab' }}>{moneyShort(totalNet, lang)}</div>
        </Card>
      </div>

      <Card pad={false}>
        <div className="px-2 py-2">
          <DataTable
            cols={cols}
            rows={rows}
            rowKey={(r) => r.id}
            empty={t('common.empty')}
            footer={
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border-1)' }}>
                  <td className="px-3 py-2.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('common.total')}</td>
                  <td className="tnum px-3 py-2.5 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{money(totalGross)}</td>
                  <td className="tnum px-3 py-2.5 text-right text-sm font-semibold" style={{ color: 'var(--critical)' }}>{money(rows.reduce((s, r) => s + r.incomeTax, 0))}</td>
                  <td className="tnum px-3 py-2.5 text-right text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{money(rows.reduce((s, r) => s + r.pension, 0))}</td>
                  <td className="tnum px-3 py-2.5 text-right text-sm font-semibold" style={{ color: 'var(--good-text)' }}>{money(totalNet)}</td>
                </tr>
              </tfoot>
            }
          />
        </div>
      </Card>
    </div>
  )
}
