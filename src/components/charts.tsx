import { useState } from 'react'
import { useMeasure } from './useMeasure'
import { money } from '../lib/format'

// Colors are read from CSS roles so light/dark swap in one place.
const SERIES_1 = 'var(--series-1)'
const SERIES_2 = 'var(--series-2)'
const GRID = 'var(--grid)'
const AXIS = 'var(--axis)'
const MUTED = 'var(--text-muted)'
const INK = 'var(--text-primary)'
const SURFACE = 'var(--surface-1)'

function niceTicks(max: number, count = 4): number[] {
  const raw = max / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v)
  return ticks
}

// ───────────────────────────────────────────────── Revenue vs expense ──
export function FlowChart({
  data,
  months,
  labels,
  unit,
}: {
  data: { m: number; revenue: number; expense: number }[]
  months: string[]
  labels: { revenue: string; expense: string }
  unit: string
}) {
  const { ref, width } = useMeasure<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const H = 260
  const padL = 44
  const padR = 16
  const padT = 12
  const padB = 28
  const W = Math.max(width, 320)
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const maxV = Math.max(...data.map((d) => Math.max(d.revenue, d.expense)))
  const ticks = niceTicks(maxV)
  const top = ticks[ticks.length - 1]

  const x = (i: number) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const y = (v: number) => padT + innerH - (v / top) * innerH

  const linePath = (key: 'revenue' | 'expense') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ')

  const areaPath = (key: 'revenue' | 'expense') =>
    `${linePath(key)} L ${x(data.length - 1).toFixed(1)} ${y(0)} L ${x(0).toFixed(1)} ${y(0)} Z`

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const rel = (px - padL) / innerW
    const idx = Math.round(rel * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const hd = hover != null ? data[hover] : null

  return (
    <div ref={ref} className="w-full">
      {/* Legend — always present for ≥2 series, identity never color-alone */}
      <div className="mb-2 flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm" style={{ background: SERIES_1 }} /> {labels.revenue}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm" style={{ background: SERIES_2 }} /> {labels.expense}
        </span>
        <span className="ml-auto" style={{ color: MUTED }}>
          {unit}
        </span>
      </div>

      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES_1} stopOpacity="0.16" />
            <stop offset="100%" stopColor={SERIES_1} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill={MUTED} className="tnum">
              {t >= 1000 ? `${(t / 1000).toFixed(t % 1000 ? 1 : 0)}k` : t}
            </text>
          </g>
        ))}

        {/* baseline */}
        <line x1={padL} x2={W - padR} y1={y(0)} y2={y(0)} stroke={AXIS} strokeWidth={1} />

        {/* revenue area + line */}
        <path d={areaPath('revenue')} fill="url(#revFill)" />
        <path d={linePath('revenue')} fill="none" stroke={SERIES_1} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={linePath('expense')} fill="none" stroke={SERIES_2} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* month labels */}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill={MUTED}>
            {months[d.m]}
          </text>
        ))}

        {/* crosshair + markers */}
        {hd && (
          <g>
            <line x1={x(hover!)} x2={x(hover!)} y1={padT} y2={y(0)} stroke={AXIS} strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={x(hover!)} cy={y(hd.revenue)} r={4.5} fill={SERIES_1} stroke={SURFACE} strokeWidth={2} />
            <circle cx={x(hover!)} cy={y(hd.expense)} r={4.5} fill={SERIES_2} stroke={SURFACE} strokeWidth={2} />
          </g>
        )}
      </svg>

      {/* tooltip */}
      {hd && (
        <div className="pointer-events-none -mt-2 flex justify-center">
          <div
            className="rounded-lg border px-3 py-2 text-xs shadow-md"
            style={{ background: SURFACE, borderColor: 'var(--border-1)' }}
          >
            <div className="mb-1 font-semibold" style={{ color: INK }}>
              {months[hd.m]}
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span className="h-2 w-2 rounded-full" style={{ background: SERIES_1 }} />
              {labels.revenue}: <span className="tnum font-medium" style={{ color: INK }}>{money(hd.revenue)}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span className="h-2 w-2 rounded-full" style={{ background: SERIES_2 }} />
              {labels.expense}: <span className="tnum font-medium" style={{ color: INK }}>{money(hd.expense)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────── Expense breakdown ──
export function ExpenseBars({
  data,
  unit,
}: {
  data: { label: string; value: number }[]
  unit: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.value))

  return (
    <div className="w-full">
      <div className="mb-3 text-right text-xs" style={{ color: MUTED }}>
        {unit}
      </div>
      <div className="flex flex-col gap-2.5">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100
          const active = hover === i
          return (
            <div
              key={d.label}
              className="grid grid-cols-[130px_1fr_auto] items-center gap-3"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="truncate text-xs" style={{ color: 'var(--text-secondary)' }} title={d.label}>
                {d.label}
              </div>
              <div className="h-5 overflow-hidden rounded-md" style={{ background: 'var(--surface-3)' }}>
                <div
                  className="h-full rounded-md transition-all"
                  style={{
                    width: `${pct}%`,
                    background: SERIES_1,
                    opacity: active ? 1 : 0.85,
                  }}
                />
              </div>
              <div className="tnum w-16 text-right text-xs font-medium" style={{ color: INK }}>
                {money(d.value, { decimals: 1 })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
