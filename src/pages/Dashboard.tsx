import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { useT } from '../i18n'
import { Card, SectionTitle, Badge, Segmented } from '../components/ui'
import { FlowChart, ExpenseBars } from '../components/charts'
import { moneyShort, money, date } from '../lib/format'
import {
  monthlyFlow,
  expenseBreakdown,
  entries,
  upcomingTasks,
  pick,
  cashOpening,
  bankOpening,
} from '../data/mock'
import { profitAndLoss, balanceSheet } from '../lib/accounting'

function KpiTile({
  label,
  value,
  delta,
  accent,
}: {
  label: string
  value: string
  delta?: number
  accent: string
}) {
  const up = (delta ?? 0) >= 0
  return (
    <Card>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      {delta != null && (
        <div className="mt-1.5 flex items-center gap-1 text-xs">
          {up ? <TrendingUp size={14} style={{ color: 'var(--good-text)' }} /> : <TrendingDown size={14} style={{ color: 'var(--critical)' }} />}
          <span style={{ color: up ? 'var(--good-text)' : 'var(--critical)' }} className="font-medium">
            {up ? '+' : '−'}
            {Math.abs(delta).toFixed(1).replace('.', ',')}%
          </span>
        </div>
      )}
    </Card>
  )
}

export default function Dashboard() {
  const { t, lang, months } = useT()
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const pl = profitAndLoss()
  const bs = balanceSheet()

  const recent = entries.filter((e) => e.status === 'posted').slice(0, 6)

  const taskIcon = (lvl: string) =>
    lvl === 'critical' ? (
      <AlertTriangle size={16} style={{ color: 'var(--critical)' }} />
    ) : lvl === 'warning' ? (
      <Clock size={16} style={{ color: '#b57d00' }} />
    ) : (
      <CheckCircle2 size={16} style={{ color: 'var(--good-text)' }} />
    )

  return (
    <div>
      <SectionTitle title={t('dash.title')} subtitle={`${t('common.period')}: ${months[6]} 2026`} />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label={t('dash.kpi.revenue')} value={moneyShort(pl.revenueSales, lang)} delta={11.9} accent="var(--series-1)" />
        <KpiTile label={t('dash.kpi.expense')} value={moneyShort(pl.cogs + pl.sellingExp + pl.adminExp, lang)} delta={5.4} accent="var(--series-2)" />
        <KpiTile label={t('dash.kpi.profit')} value={moneyShort(pl.netProfit, lang)} delta={18.2} accent="var(--series-3)" />
        <KpiTile label={t('dash.kpi.receivable')} value={moneyShort(bs.receivables, lang)} delta={-3.1} accent="#4a3aa7" />
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('dash.chart.flow')}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('dash.chart.flowSub')}
              </p>
            </div>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'chart', label: t('dash.chart.flow').split(' ')[0] },
                { value: 'table', label: t('dash.table') },
              ]}
            />
          </div>
          {view === 'chart' ? (
            <FlowChart
              data={monthlyFlow}
              months={months}
              unit={t('dash.chart.flowSub')}
              labels={{ revenue: t('dash.kpi.revenue'), expense: t('dash.kpi.expense') }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-1)', color: 'var(--text-muted)' }}>
                    <th className="px-2 py-2 text-left text-xs font-semibold uppercase">{t('dash.month')}</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold uppercase">{t('dash.kpi.revenue')}</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold uppercase">{t('dash.kpi.expense')}</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold uppercase">{t('dash.kpi.profit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyFlow.map((d) => (
                    <tr key={d.m} style={{ borderBottom: '1px solid var(--border-1)', color: 'var(--text-primary)' }}>
                      <td className="px-2 py-2">{months[d.m]}</td>
                      <td className="tnum px-2 py-2 text-right">{money(d.revenue)}</td>
                      <td className="tnum px-2 py-2 text-right">{money(d.expense)}</td>
                      <td className="tnum px-2 py-2 text-right font-medium">{money(d.revenue - d.expense)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('dash.chart.expenses')}
          </h2>
          <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('dash.chart.expensesSub')}
          </p>
          <ExpenseBars data={expenseBreakdown.map((e) => ({ label: pick(e.label, lang), value: e.value }))} unit={t('dash.chart.expensesSub')} />
        </Card>
      </div>

      {/* Bottom: recent + tasks */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" pad={false}>
          <div className="flex items-center justify-between px-5 py-3.5">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('dash.recent')}
            </h2>
            <Link to="/app/entries" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#2a78d6' }}>
              {t('dash.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border-1)' }}>
                    <td className="px-5 py-2.5" style={{ color: 'var(--text-muted)' }}>
                      {date(e.date, lang)}
                    </td>
                    <td className="px-2 py-2.5" style={{ color: 'var(--text-primary)' }}>
                      <div className="max-w-[240px] truncate">{pick(e.memo, lang)}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('en.dt')} {e.debit} · {t('en.ct')} {e.credit}
                      </div>
                    </td>
                    <td className="tnum px-5 py-2.5 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                      {money(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <KpiTile label={t('dash.kpi.cash')} value={moneyShort(cashOpening, lang)} accent="var(--series-2)" />
            <KpiTile label={t('dash.kpi.bank')} value={moneyShort(bankOpening, lang)} accent="#4a3aa7" />
          </div>
          <Card pad={false}>
            <div className="px-5 py-3.5">
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('dash.tasks')}
              </h2>
            </div>
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-2.5" style={{ borderTop: '1px solid var(--border-1)' }}>
                {taskIcon(task.level)}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                    {pick(task.title, lang)}
                  </div>
                </div>
                <Badge tone={task.level === 'critical' ? 'critical' : task.level === 'warning' ? 'warning' : 'good'}>
                  {date(task.due, lang)}
                </Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
