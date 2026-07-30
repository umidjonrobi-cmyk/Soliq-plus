import { Plus, Building2, Check } from 'lucide-react'
import { useT } from '../i18n'
import { Card, SectionTitle, Button, Badge } from '../components/ui'
import { companies, pick } from '../data/mock'
import { useStore } from '../store'

export default function Companies() {
  const { t, lang } = useT()
  const { companyId, setCompanyId, notify } = useStore()

  return (
    <div>
      <SectionTitle
        title={t('co.title')}
        subtitle={t('co.sub')}
        right={
          <Button onClick={() => notify(t('common.soon'))}>
            <Plus size={16} /> {t('co.new')}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((c) => {
          const active = c.id === companyId
          return (
            <Card key={c.id} className={active ? 'ring-2 ring-[#2a78d6]' : ''}>
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: 'rgba(42,120,214,0.12)' }}>
                  <Building2 size={20} style={{ color: '#2a78d6' }} />
                </div>
                {active ? (
                  <Badge tone="brand">
                    <Check size={12} /> {t('co.current')}
                  </Badge>
                ) : (
                  <Badge tone={c.taxMode === 'general' ? 'neutral' : 'good'}>
                    {t(c.taxMode === 'general' ? 'co.taxMode.general' : 'co.taxMode.simple')}
                  </Badge>
                )}
              </div>

              <h3 className="mt-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                {c.name}
              </h3>

              <dl className="mt-3 space-y-1.5 text-sm">
                {[
                  [t('co.inn'), c.inn],
                  [t('co.oked'), c.oked],
                  [t('co.director'), c.director],
                  [t('co.address'), pick(c.address, lang)],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="w-24 shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {k}
                    </dt>
                    <dd className="min-w-0 flex-1" style={{ color: 'var(--text-secondary)' }}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4">
                {active ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t('co.current')}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCompanyId(c.id)
                      notify(`${c.name} — ${t('co.select')}`)
                    }}
                  >
                    {t('co.select')}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
