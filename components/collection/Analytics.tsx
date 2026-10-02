'use client'

import { useState, type MouseEvent } from 'react'
import type { Day } from '@/lib/analytics'
import { eth, pct } from '@/lib/format'
import styles from './Analytics.module.sass'

const RANGES = [7, 30, 90] as const
const W = 640
const H = 220
const PAD = { top: 14, right: 12, bottom: 26, left: 52 }

/** Floor price and volume over 7, 30 or 90 days, with a hover readout */
const Analytics = ({ days }: { days: Day[] }) => {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30)
  const [hover, setHover] = useState<{ chart: 'floor' | 'volume'; i: number } | null>(null)
  const shown = days.slice(-range)

  const volume = shown.reduce((s, d) => s + d.volume, 0)
  const sales = shown.reduce((s, d) => s + d.sales, 0)
  const first = shown[0].floor
  const last = shown[shown.length - 1].floor
  const cards = [
    { label: 'Volume', value: `${eth(volume)} ETH` },
    { label: 'Sales', value: sales.toLocaleString('en-US') },
    { label: 'Average price', value: sales ? `${eth(volume / sales)} ETH` : '—' },
    { label: 'Floor change', value: pct((last - first) / first), tone: last >= first ? styles.up : styles.down },
  ]

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const step = innerW / shown.length
  const x = (i: number) => PAD.left + step * (i + 0.5)
  const indexAt = (e: MouseEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    return Math.max(0, Math.min(shown.length - 1, Math.floor((px - PAD.left) / step)))
  }
  const labels = [0, Math.floor((shown.length - 1) / 2), shown.length - 1]

  // Floor line
  const floors = shown.map((d) => d.floor)
  const lo = Math.min(...floors) * 0.92
  const hi = Math.max(...floors) * 1.08
  const fy = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo || 1)) * innerH
  const line = shown.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${fy(d.floor).toFixed(1)}`).join('')
  const area = `${line}L${x(shown.length - 1).toFixed(1)} ${PAD.top + innerH}L${x(0).toFixed(1)} ${PAD.top + innerH}Z`

  // Volume bars
  const vmax = Math.max(...shown.map((d) => d.volume), 0.0001) * 1.1
  const vy = (v: number) => PAD.top + (1 - v / vmax) * innerH

  const readout = (chart: 'floor' | 'volume') => {
    const i = hover?.chart === chart ? hover.i : shown.length - 1
    const d = shown[i]
    return chart === 'floor' ? (
      <>
        <strong className="mono">{eth(d.floor)} ETH</strong>
        <span>{d.label}</span>
      </>
    ) : (
      <>
        <strong className="mono">{eth(d.volume)} ETH</strong>
        <span>
          {d.label} · {d.sales} {d.sales === 1 ? 'sale' : 'sales'}
        </span>
      </>
    )
  }

  const axis = (ticks: number[], y: (v: number) => number) => (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className={styles.grid} />
          <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className={styles.tick}>
            {eth(t)}
          </text>
        </g>
      ))}
      {labels.map((i, k) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor={k === 0 ? 'start' : k === 2 ? 'end' : 'middle'} className={styles.tick}>
          {shown[i].label}
        </text>
      ))}
    </>
  )

  return (
    <div className={styles.analytics}>
      <div className={styles.toolbar}>
        <div className={styles.ranges} role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button key={r} type="button" className={r === range ? styles.rangeOn : ''} onClick={() => setRange(r)} aria-pressed={r === range}>
              {r}D
            </button>
          ))}
        </div>
      </div>

      <dl className={styles.cards}>
        {cards.map((c) => (
          <div key={c.label}>
            <dt>{c.label}</dt>
            <dd className={`mono ${c.tone ?? ''}`}>{c.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.charts}>
        <figure className={styles.chart}>
          <figcaption>
            <h3>Floor price</h3>
            <p>{readout('floor')}</p>
          </figcaption>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Floor price over ${range} days, from ${eth(first)} to ${eth(last)} ETH`} onMouseMove={(e) => setHover({ chart: 'floor', i: indexAt(e) })} onMouseLeave={() => setHover(null)}>
            {axis([lo, (lo + hi) / 2, hi], fy)}
            <path d={area} className={styles.area} />
            <path d={line} className={styles.line} />
            {hover?.chart === 'floor' && (
              <>
                <line x1={x(hover.i)} x2={x(hover.i)} y1={PAD.top} y2={PAD.top + innerH} className={styles.cursor} />
                <circle cx={x(hover.i)} cy={fy(shown[hover.i].floor)} r={5} className={styles.dot} />
              </>
            )}
          </svg>
        </figure>

        <figure className={styles.chart}>
          <figcaption>
            <h3>Volume</h3>
            <p>{readout('volume')}</p>
          </figcaption>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Daily volume over ${range} days, ${eth(volume)} ETH in total`} onMouseMove={(e) => setHover({ chart: 'volume', i: indexAt(e) })} onMouseLeave={() => setHover(null)}>
            {axis([0, vmax / 2, vmax], vy)}
            {shown.map((d, i) => (
              <rect key={d.daysAgo} x={x(i) - step * 0.36} width={step * 0.72} y={vy(d.volume)} height={Math.max(0, PAD.top + innerH - vy(d.volume))} rx={Math.min(3, step * 0.2)} className={hover?.chart === 'volume' && hover.i === i ? styles.barOn : styles.bar} />
            ))}
          </svg>
        </figure>
      </div>
    </div>
  )
}

export default Analytics
