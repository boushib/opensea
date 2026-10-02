import { eth } from '@/lib/format'
import styles from './Item.module.sass'

type Point = { price: number; ageHours: number }

const W = 600
const H = 180
const PAD = { top: 16, right: 12, bottom: 24, left: 44 }
const DAYS = 90

/** Sale prices over the last 90 days as a line chart */
const PriceChart = ({ points }: { points: Point[] }) => {
  if (points.length === 0) return <p className={styles.empty}>No sales in the last 90 days.</p>
  const prices = points.map((p) => p.price)
  const lo = Math.min(...prices) * 0.9
  const hi = Math.max(...prices) * 1.1
  const x = (ageHours: number) => PAD.left + (1 - ageHours / (DAYS * 24)) * (W - PAD.left - PAD.right)
  const y = (price: number) => PAD.top + (1 - (price - lo) / (hi - lo || 1)) * (H - PAD.top - PAD.bottom)
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.ageHours).toFixed(1)} ${y(p.price).toFixed(1)}`).join('')
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length
  const ticks = [lo, (lo + hi) / 2, hi]

  return (
    <figure className={styles.chart}>
      <figcaption>
        <span>90-day average</span> <strong className="mono">{eth(avg)} ETH</strong>
        <span>· {points.length} {points.length === 1 ? 'sale' : 'sales'}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Price history: ${points.length} sales, averaging ${eth(avg)} ETH`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className={styles.grid} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className={styles.tick}>
              {eth(t)}
            </text>
          </g>
        ))}
        {['90d', '60d', '30d', 'Now'].map((label, i) => (
          <text key={label} x={PAD.left + (i / 3) * (W - PAD.left - PAD.right)} y={H - 6} textAnchor={i === 0 ? 'start' : i === 3 ? 'end' : 'middle'} className={styles.tick}>
            {label}
          </text>
        ))}
        {points.length > 1 && <path d={line} className={styles.line} />}
        {points.map((p, i) => (
          <circle key={i} cx={x(p.ageHours)} cy={y(p.price)} r={4} className={styles.point} />
        ))}
      </svg>
    </figure>
  )
}

export default PriceChart
