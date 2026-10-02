import type { Collection } from './catalog'

export type Day = {
  /** 0 is today */
  daysAgo: number
  /** "Sep 14", or "Today" */
  label: string
  volume: number
  sales: number
  /** Average sale price that day, when there were sales */
  avg: number | null
  /** Lowest sale over the three days up to this one; today is the live floor */
  floor: number
}

const round = (n: number) => Math.round(n * 1e4) / 1e4

/** A collection's last 90 days, one entry per day, oldest first */
export const dailyStats = (c: Collection, days = 90, now = Date.now()): Day[] => {
  let carry = c.stats.floor
  const out: Day[] = []
  for (let d = days - 1; d >= 0; d--) {
    const today = c.sales.filter((s) => s.ageHours >= d * 24 && s.ageHours < (d + 1) * 24)
    const recent = c.sales.filter((s) => s.ageHours >= d * 24 && s.ageHours < (d + 3) * 24)
    const volume = today.reduce((sum, s) => sum + s.price, 0)
    if (recent.length) carry = Math.min(...recent.map((s) => s.price))
    out.push({ daysAgo: d, label: d === 0 ? 'Today' : new Date(now - d * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), volume: round(volume), sales: today.length, avg: today.length ? round(volume / today.length) : null, floor: round(d === 0 ? c.stats.floor : carry) })
  }
  return out
}
