import { useState } from 'react'
import { Printer, CheckCircle2, FileSpreadsheet } from 'lucide-react'
import { useT } from '../i18n'
import { Card, SectionTitle, Button, Badge, Segmented } from '../components/ui'
import { money } from '../lib/format'
import { downloadCSV } from '../lib/export'
import { useStore } from '../store'
import { accounts, closingBalance, pick } from '../data/mock'
import { trialBalance, profitAndLoss, balanceSheet } from '../lib/accounting'

type Tab = 'balance' | 'pl' | 'tb' | 'gl'

function Row({ label, value, bold, indent, tone }: { label: string; value: number; bold?: boolean; indent?: boolean; tone?: string }) {
  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderBottom: '1px solid var(--border-1)' }}
    >
      <span className={`${bold ? 'font-semibold' : ''} ${indent ? 'pl-4' : ''}`} style={{ color: bold ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
        {label}
      </span>
      <span className={`tnum ${bold ? 'font-semibold' : 'font-medium'}`} style={{ color: tone ?? 'var(--text-primary)' }}>
        {money(value)}
      </span>
    </div>
  )
}

export default function Reports() {
  const { t, lang } = useT()
  const { notify } = useStore()
  const [tab, setTab] = useState<Tab>('balance')

  const bs = balanceSheet()
  const pl = profitAndLoss()
  const { rows: tbRows, totals } = trialBalance()

  function exportExcel() {
    if (tab === 'tb') {
      downloadCSV('aylanma-saldo.csv', [
        [t('acc.code'), t('common.name'), `${t('rp.startBalance')} ${t('en.dt')}`, `${t('rp.startBalance')} ${t('en.ct')}`, `${t('rp.turnover')} ${t('en.dt')}`, `${t('rp.turnover')} ${t('en.ct')}`, `${t('rp.endBalance')} ${t('en.dt')}`, `${t('rp.endBalance')} ${t('en.ct')}`],
        ...tbRows.map((r) => [r.code, pick(r.account.name, lang), r.openingDr, r.openingCr, r.turnoverDr, r.turnoverCr, r.closingDr, r.closingCr]),
        [t('common.total'), '', totals.openingDr, totals.openingCr, totals.turnoverDr, totals.turnoverCr, totals.closingDr, totals.closingCr],
      ])
    } else if (tab === 'pl') {
      downloadCSV('foyda-zarar.csv', [
        [t('common.description'), t('common.amount')],
        [t('rp.revenue'), pl.revenueSales],
        [t('rp.cogs'), pl.cogs],
        [t('rp.grossProfit'), pl.grossProfit],
        [t('rp.otherIncome'), pl.otherIncome],
        [t('rp.opex'), pl.sellingExp + pl.adminExp + pl.otherOpEx],
        [t('rp.operProfit'), pl.operProfit],
        [t('rp.financeExp'), pl.financeExp],
        [t('rp.preTax'), pl.preTax],
        [t('rp.taxExpense'), pl.taxExpense],
        [t('rp.netProfit'), pl.netProfit],
      ])
    } else if (tab === 'balance') {
      downloadCSV('balans.csv', [
        [t('common.description'), t('common.amount')],
        [t('rp.assets'), ''],
        [t('rp.longTerm'), bs.longTermAssets],
        [t('rp.currentAssets'), bs.currentAssets],
        [`${t('rp.assets')} ${t('common.total')}`, bs.assetsTotal],
        [t('rp.liabilities'), ''],
        [t('rp.equity'), bs.equity],
        [t('rp.obligations'), bs.liabilities],
        [`${t('rp.liabilities')} ${t('common.total')}`, bs.liabTotal],
      ])
    } else {
      downloadCSV('bosh-kitob.csv', [
        [t('acc.code'), t('common.name'), t('rp.startBalance'), t('rp.turnover') + ' ' + t('en.dt'), t('rp.turnover') + ' ' + t('en.ct'), t('rp.endBalance')],
        ...accounts.map((a) => [a.code, pick(a.name, lang), a.opening, a.debitTurnover, a.creditTurnover, closingBalance(a)]),
      ])
    }
    notify(t('st.saved'))
  }

  const opex = pl.sellingExp + pl.adminExp + pl.otherOpEx

  return (
    <div>
      <SectionTitle
        title={t('rp.title')}
        subtitle={t('rp.sub')}
        right={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer size={15} /> {t('rp.pdf')}
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel}>
              <FileSpreadsheet size={15} /> {t('rp.excel')}
            </Button>
          </div>
        }
      />

      <div className="mb-4 print:hidden">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'balance', label: t('rp.balance') },
            { value: 'pl', label: t('rp.pl') },
            { value: 'tb', label: t('rp.tb') },
            { value: 'gl', label: t('rp.gl') },
          ]}
        />
      </div>

      {/* ─────────────── Balance sheet ─────────────── */}
      {tab === 'balance' && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('rp.balance')}</h2>
            {bs.balanced && (
              <Badge tone="good">
                <CheckCircle2 size={12} /> {t('rp.balanced')}
              </Badge>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--series-1)' }}>{t('rp.assets')}</h3>
              <Row label={t('rp.longTerm')} value={bs.longTermAssets} bold />
              <Row label={t('nav.assets')} value={bs.fixedGross - bs.depreciation} indent />
              <Row label={t('acc.type.asset')} value={bs.intangibles} indent />
              <Row label={t('rp.currentAssets')} value={bs.currentAssets} bold />
              <Row label={t('nav.inventory')} value={bs.inventory} indent />
              <Row label={t('dash.kpi.receivable')} value={bs.receivables} indent />
              <Row label={`${t('nav.cash')} + ${t('nav.bank')}`} value={bs.cash} indent />
              <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: 'rgba(42,120,214,0.10)' }}>
                <span className="font-semibold" style={{ color: '#1c5cab' }}>{t('rp.balanceTotal')}</span>
                <span className="tnum font-semibold" style={{ color: '#1c5cab' }}>{money(bs.assetsTotal)}</span>
              </div>
            </Card>
            <Card>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--series-2)' }}>{t('rp.liabilities')}</h3>
              <Row label={t('rp.equity')} value={bs.equity} bold />
              <Row label={t('co.taxMode.general')} value={bs.share} indent />
              <Row label={t('rp.netProfit')} value={bs.retained} indent />
              <Row label={t('rp.obligations')} value={bs.liabilities} bold />
              <Row label={t('tr.purchases')} value={bs.payables} indent />
              <Row label={t('st.int.tax')} value={bs.taxesDue} indent />
              <Row label={t('nav.payroll')} value={bs.payroll} indent />
              <Row label={t('cb.bankName')} value={bs.loans} indent />
              <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: 'rgba(235,104,52,0.10)' }}>
                <span className="font-semibold" style={{ color: 'var(--series-2)' }}>{t('rp.balanceTotal')}</span>
                <span className="tnum font-semibold" style={{ color: 'var(--series-2)' }}>{money(bs.liabTotal)}</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─────────────── Profit & loss ─────────────── */}
      {tab === 'pl' && (
        <Card className="mx-auto max-w-2xl">
          <h2 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('rp.pl')}</h2>
          <Row label={t('rp.revenue')} value={pl.revenueSales} />
          <Row label={t('rp.cogs')} value={-pl.cogs} tone="var(--critical)" />
          <Row label={t('rp.grossProfit')} value={pl.grossProfit} bold />
          <Row label={t('rp.otherIncome')} value={pl.otherIncome} indent />
          <Row label={t('rp.opex')} value={-opex} tone="var(--critical)" indent />
          <Row label={t('rp.operProfit')} value={pl.operProfit} bold />
          <Row label={t('rp.financeExp')} value={-pl.financeExp} tone="var(--critical)" indent />
          <Row label={t('rp.preTax')} value={pl.preTax} bold />
          <Row label={t('rp.taxExpense')} value={-pl.taxExpense} tone="var(--critical)" indent />
          <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-3" style={{ background: 'rgba(27,175,122,0.12)' }}>
            <span className="font-semibold" style={{ color: 'var(--good-text)' }}>{t('rp.netProfit')}</span>
            <span className="tnum text-lg font-bold" style={{ color: 'var(--good-text)' }}>{money(pl.netProfit)}</span>
          </div>
        </Card>
      )}

      {/* ─────────────── Trial balance ─────────────── */}
      {tab === 'tb' && (
        <Card pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th rowSpan={2} className="border-b px-3 py-2 text-left text-xs font-semibold uppercase" style={{ borderColor: 'var(--border-1)', color: 'var(--text-muted)' }}>{t('common.account')}</th>
                  <th colSpan={2} className="border-b border-l px-3 py-1.5 text-center text-xs font-semibold uppercase" style={{ borderColor: 'var(--border-1)', color: 'var(--text-muted)' }}>{t('rp.startBalance')}</th>
                  <th colSpan={2} className="border-b border-l px-3 py-1.5 text-center text-xs font-semibold uppercase" style={{ borderColor: 'var(--border-1)', color: 'var(--text-muted)' }}>{t('rp.turnover')}</th>
                  <th colSpan={2} className="border-b border-l px-3 py-1.5 text-center text-xs font-semibold uppercase" style={{ borderColor: 'var(--border-1)', color: 'var(--text-muted)' }}>{t('rp.endBalance')}</th>
                </tr>
                <tr style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                  {['en.dt', 'en.ct', 'en.dt', 'en.ct', 'en.dt', 'en.ct'].map((k, i) => (
                    <th key={i} className={`border-b px-3 py-1.5 text-right text-xs font-semibold ${i % 2 === 0 ? 'border-l' : ''}`} style={{ borderColor: 'var(--border-1)' }}>{t(k as never)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tbRows.map((r) => (
                  <tr key={r.code} style={{ borderBottom: '1px solid var(--border-1)' }}>
                    <td className="px-3 py-2">
                      <span className="tnum font-medium" style={{ color: 'var(--text-primary)' }}>{r.code}</span>
                      <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{pick(r.account.name, lang)}</span>
                    </td>
                    <td className="tnum border-l px-3 py-2 text-right" style={{ borderColor: 'var(--border-1)', color: r.openingDr ? 'var(--text-primary)' : 'var(--text-muted)' }}>{r.openingDr ? money(r.openingDr) : '—'}</td>
                    <td className="tnum px-3 py-2 text-right" style={{ color: r.openingCr ? 'var(--text-primary)' : 'var(--text-muted)' }}>{r.openingCr ? money(r.openingCr) : '—'}</td>
                    <td className="tnum border-l px-3 py-2 text-right" style={{ borderColor: 'var(--border-1)', color: r.turnoverDr ? 'var(--text-primary)' : 'var(--text-muted)' }}>{r.turnoverDr ? money(r.turnoverDr) : '—'}</td>
                    <td className="tnum px-3 py-2 text-right" style={{ color: r.turnoverCr ? 'var(--text-primary)' : 'var(--text-muted)' }}>{r.turnoverCr ? money(r.turnoverCr) : '—'}</td>
                    <td className="tnum border-l px-3 py-2 text-right" style={{ borderColor: 'var(--border-1)', color: r.closingDr ? 'var(--text-primary)' : 'var(--text-muted)' }}>{r.closingDr ? money(r.closingDr) : '—'}</td>
                    <td className="tnum px-3 py-2 text-right" style={{ color: r.closingCr ? 'var(--text-primary)' : 'var(--text-muted)' }}>{r.closingCr ? money(r.closingCr) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--surface-2)', borderTop: '2px solid var(--border-1)' }}>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{t('common.total')}</td>
                  {[totals.openingDr, totals.openingCr, totals.turnoverDr, totals.turnoverCr, totals.closingDr, totals.closingCr].map((v, i) => (
                    <td key={i} className={`tnum px-3 py-2.5 text-right font-semibold ${i % 2 === 0 ? 'border-l' : ''}`} style={{ borderColor: 'var(--border-1)', color: 'var(--text-primary)' }}>{money(v)}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* ─────────────── General ledger ─────────────── */}
      {tab === 'gl' && (
        <Card pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-1)' }}>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase">{t('acc.code')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase">{t('common.name')}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase">{t('rp.startBalance')}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase">{t('en.dt')}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase">{t('en.ct')}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase">{t('rp.endBalance')}</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.code} style={{ borderBottom: '1px solid var(--border-1)' }}>
                    <td className="tnum px-3 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{a.code}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{pick(a.name, lang)}</td>
                    <td className="tnum px-3 py-2 text-right">{money(a.opening)}</td>
                    <td className="tnum px-3 py-2 text-right" style={{ color: a.debitTurnover ? 'var(--text-primary)' : 'var(--text-muted)' }}>{a.debitTurnover ? money(a.debitTurnover) : '—'}</td>
                    <td className="tnum px-3 py-2 text-right" style={{ color: a.creditTurnover ? 'var(--text-primary)' : 'var(--text-muted)' }}>{a.creditTurnover ? money(a.creditTurnover) : '—'}</td>
                    <td className="tnum px-3 py-2 text-right font-medium">{money(closingBalance(a))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
