import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useT } from '../i18n'
import { Card, SectionTitle, DataTable, Badge, Button, Input, Select, Modal, Field, Segmented } from '../components/ui'
import type { Col } from '../components/ui'
import { entries as seed, accounts, pick, accountLabel } from '../data/mock'
import type { Entry } from '../data/mock'
import { money, date, today } from '../lib/format'
import { useStore } from '../store'

export default function Entries() {
  const { t, lang } = useT()
  const { notify } = useStore()
  const [list, setList] = useState<Entry[]>(seed)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'posted' | 'draft'>('all')
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    date: today(),
    debit: accounts[0].code,
    credit: accounts[9].code,
    amount: '',
    memo: '',
    doc: '',
  })

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase()
    return list.filter((e) => {
      if (status !== 'all' && e.status !== status) return false
      if (!ql) return true
      return (
        e.no.includes(ql) ||
        e.doc.toLowerCase().includes(ql) ||
        e.debit.includes(ql) ||
        e.credit.includes(ql) ||
        pick(e.memo, lang).toLowerCase().includes(ql)
      )
    })
  }, [list, q, status, lang])

  function save() {
    const amount = Number(form.amount.replace(/\s/g, ''))
    if (!amount || amount <= 0) {
      notify(t('auth.err.required'))
      return
    }
    if (form.debit === form.credit) {
      notify(t('en.balanceErr'))
      return
    }
    const memo = form.memo.trim() || pick(['Yangi oʻtkazma', 'Янги ўтказма', 'Новая проводка'], lang)
    const no = String(261 + list.length - seed.length).padStart(5, '0')
    const entry: Entry = {
      id: `new-${Date.now()}`,
      no,
      date: form.date,
      debit: form.debit,
      credit: form.credit,
      amount,
      memo: [memo, memo, memo],
      status: 'posted',
      doc: form.doc.trim() || `BS-${no}`,
    }
    setList((l) => [entry, ...l])
    setOpen(false)
    setForm((f) => ({ ...f, amount: '', memo: '', doc: '' }))
    notify(t('en.saved'))
  }

  const cols: Col<Entry>[] = [
    { key: 'no', header: t('common.number'), render: (e) => <span className="tnum" style={{ color: 'var(--text-muted)' }}>№{e.no}</span> },
    { key: 'date', header: t('common.date'), render: (e) => date(e.date, lang) },
    {
      key: 'memo',
      header: t('common.description'),
      render: (e) => (
        <div>
          <div className="max-w-[280px] truncate" style={{ color: 'var(--text-primary)' }}>
            {pick(e.memo, lang)}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('en.doc')}: {e.doc}
          </div>
        </div>
      ),
    },
    { key: 'dt', header: t('en.dt'), render: (e) => <span className="tnum" title={accountLabel(e.debit, lang)}>{e.debit}</span> },
    { key: 'ct', header: t('en.ct'), render: (e) => <span className="tnum" title={accountLabel(e.credit, lang)}>{e.credit}</span> },
    { key: 'amount', header: t('common.amount'), align: 'right', render: (e) => <span className="font-medium">{money(e.amount)}</span> },
    {
      key: 'status',
      header: t('common.status'),
      align: 'center',
      render: (e) => <Badge tone={e.status === 'posted' ? 'good' : 'warning'}>{t(e.status === 'posted' ? 'en.posted' : 'en.draft')}</Badge>,
    },
  ]

  const amountNum = Number(form.amount.replace(/\s/g, '')) || 0

  return (
    <div>
      <SectionTitle
        title={t('en.title')}
        subtitle={t('en.sub')}
        right={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> {t('en.new')}
          </Button>
        }
      />

      <Card pad={false}>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} className="pl-9" />
          </div>
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: t('common.all') },
              { value: 'posted', label: t('en.posted') },
              { value: 'draft', label: t('en.draft') },
            ]}
          />
        </div>
        <div className="px-2 pb-2">
          <DataTable cols={cols} rows={filtered} rowKey={(e) => e.id} empty={t('common.empty')} />
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('en.new')}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={save}>{t('common.save')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('common.date')}>
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </Field>
            <Field label={t('en.doc')}>
              <Input value={form.doc} onChange={(e) => setForm((f) => ({ ...f, doc: e.target.value }))} placeholder="BS-00261" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`${t('en.dt')} — ${t('common.account')}`}>
              <Select value={form.debit} onChange={(e) => setForm((f) => ({ ...f, debit: e.target.value }))}>
                {accounts.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {pick(a.name, lang)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={`${t('en.ct')} — ${t('common.account')}`}>
              <Select value={form.credit} onChange={(e) => setForm((f) => ({ ...f, credit: e.target.value }))}>
                {accounts.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {pick(a.name, lang)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={`${t('common.amount')}, ${t('common.currency')}`}>
            <Input
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value.replace(/[^\d\s]/g, '') }))}
              placeholder="0"
            />
          </Field>
          <Field label={t('common.description')}>
            <Input value={form.memo} onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))} placeholder={t('common.description')} />
          </Field>

          {/* Live double-entry preview */}
          <div className="rounded-lg border p-3 text-sm" style={{ borderColor: 'var(--border-1)', background: 'var(--surface-2)' }}>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-muted)' }}>{t('en.dt')} {form.debit}</span>
              <span className="tnum font-medium" style={{ color: 'var(--good-text)' }}>{money(amountNum)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span style={{ color: 'var(--text-muted)' }}>{t('en.ct')} {form.credit}</span>
              <span className="tnum font-medium" style={{ color: 'var(--critical)' }}>{money(amountNum)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
