import type { Lang } from '../i18n/dict'

const LOCALE: Record<Lang, string> = { uz: 'uz-UZ', cy: 'uz-UZ', ru: 'ru-RU' }

/** 12 500 000 — narrow no-break space groups, the local convention. */
export function money(value: number, opts: { decimals?: number } = {}): string {
  const d = opts.decimals ?? 0
  const sign = value < 0 ? '-' : ''
  const s = Math.abs(value)
    .toFixed(d)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return sign + s
}

/** Compact form for KPI tiles: 12,5 mln / 1,2 mlrd */
export function moneyShort(value: number, lang: Lang): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const dec = (n: number) => {
    const s = n.toFixed(1)
    return lang === 'ru' || lang === 'cy' || lang === 'uz' ? s.replace('.', ',') : s
  }
  const unit = {
    uz: { k: 'ming', m: 'mln', b: 'mlrd' },
    cy: { k: 'минг', m: 'млн', b: 'млрд' },
    ru: { k: 'тыс', m: 'млн', b: 'млрд' },
  }[lang]

  if (abs >= 1e9) return `${sign}${dec(abs / 1e9)} ${unit.b}`
  if (abs >= 1e6) return `${sign}${dec(abs / 1e6)} ${unit.m}`
  if (abs >= 1e3) return `${sign}${dec(abs / 1e3)} ${unit.k}`
  return `${sign}${abs}`
}

export function percent(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${Math.abs(value).toFixed(1).replace('.', ',')}%`
}

/** ISO yyyy-mm-dd → 15.03.2026 */
export function date(iso: string, lang: Lang): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
