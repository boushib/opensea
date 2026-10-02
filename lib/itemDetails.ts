import { getUser, type Collection, type Item } from './catalog'
import { between, hash, intBetween, pick, rngFor } from './rng'
import { USERS } from './users'

export type ItemEvent = { kind: 'mint' | 'sale' | 'listing' | 'offer' | 'transfer'; price: number | null; from: string | null; to: string | null; ageHours: number }
export type ItemOffer = { from: string; amount: number; expiresDays: number }

/** A fake but stable contract address per collection */
export const contractAddress = (slug: string) => {
  let hex = ''
  let h = hash(`contract:${slug}`)
  while (hex.length < 40) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0
    hex += h.toString(16).padStart(8, '0')
  }
  return `0x${hex.slice(0, 40)}`
}

/** Everything the item page shows beyond the item itself */
export const itemDetails = (c: Collection, item: Item) => {
  const r = rngFor(c.slug, 'details', item.tokenId)
  const sales = c.sales.filter((s) => s.tokenId === item.tokenId)
  const mintAge = c.launchedDaysAgo * 24 - between(r, 0, 48)

  const offers: ItemOffer[] = []
  if (item.bestOffer)
    for (let i = 0; i < intBetween(r, 1, 4); i++) offers.push({ from: pick(r, USERS).id, amount: Math.round(item.bestOffer * (1 - i * between(r, 0.03, 0.08)) * 1e4) / 1e4, expiresDays: intBetween(r, 1, 14) })

  const events: ItemEvent[] = [
    { kind: 'mint' as const, price: Math.round(c.base * 0.4 * 1e3) / 1e3, from: null, to: sales.at(-1)?.from ?? item.ownerId, ageHours: mintAge },
    ...sales.map((s) => ({ kind: 'sale' as const, price: s.price, from: s.from, to: s.to, ageHours: s.ageHours })),
    ...(item.price ? [{ kind: 'listing' as const, price: item.price, from: item.ownerId, to: null, ageHours: between(r, 0.5, 24 * 12) }] : []),
    ...offers.map((o) => ({ kind: 'offer' as const, price: o.amount, from: o.from, to: item.ownerId, ageHours: between(r, 0.2, 24 * 6) })),
  ].sort((a, b) => a.ageHours - b.ageHours)

  const traits = Object.entries(item.traits).map(([type, value]) => ({ type, value, share: c.traitCounts[type][value] / c.size }))

  return {
    contract: contractAddress(c.slug),
    // Oldest first, for the chart
    history: [...sales].reverse().map((s) => ({ price: s.price, ageHours: s.ageHours })),
    offers: offers.sort((a, b) => b.amount - a.amount),
    events,
    traits,
    favorites: intBetween(r, 2, 60) + Math.max(0, Math.round((c.size - item.rank) / 6)),
    views: intBetween(r, 80, 900),
  }
}

export const userName = (id: string | null) => (id ? (getUser(id)?.name ?? 'Unknown') : null)

