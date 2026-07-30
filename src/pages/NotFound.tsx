import { Link } from 'react-router-dom'
import { useT } from '../i18n'

export default function NotFound() {
  const { t } = useT()
  return (
    <div className="grid min-h-screen place-items-center px-5" style={{ background: 'var(--surface-2)' }}>
      <div className="text-center">
        <div className="text-6xl font-bold" style={{ color: '#2a78d6' }}>
          404
        </div>
        <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
          {t('nf.title')}
        </p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: '#2a78d6' }}
        >
          {t('nf.back')}
        </Link>
      </div>
    </div>
  )
}
