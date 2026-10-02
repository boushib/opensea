/** Demo exchange rate for showing dollar values */
export const ETH_USD = 3200

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

/** 0.4213 → "0.42", 1240.5 → "1.2K" */
export const eth = (n: number) => {
  if (n >= 1000) return compact.format(n)
  if (n >= 100) return n.toFixed(0)
  if (n >= 1) return n.toFixed(2).replace(/\.?0+$/, '')
  return n.toFixed(n < 0.01 ? 4 : 3).replace(/\.?0+$/, '')
}

export const usd = (ethAmount: number) =>
  `$${(ethAmount * ETH_USD).toLocaleString('en-US', { maximumFractionDigits: ethAmount * ETH_USD >= 100 ? 0 : 2 })}`

export const pct = (fraction: number) => `${fraction > 0 ? '+' : ''}${(fraction * 100).toFixed(1)}%`

export const count = (n: number) => (n >= 10000 ? compact.format(n) : n.toLocaleString('en-US'))

/** "3m ago", "5h ago", "12d ago" from an age in hours */
export const ago = (hours: number) => {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m ago`
  if (hours < 24) return `${Math.round(hours)}h ago`
  const days = Math.round(hours / 24)
  if (days < 60) return `${days}d ago`
  return `${Math.round(days / 30)}mo ago`
}
