import type { Collection } from './catalog'
import { between, pick, rngFor } from './rng'
import { USERS } from './users'

export type ActivityEvent = {
  id: string
  kind: 'sale' | 'listing' | 'offer'
  tokenId: number
  price: number
  from: string | null
  to: string | null
  ageHours: number
}

/** Sales, plus the listings and offers currently open, newest first */
export const collectionActivity = (c: Collection): ActivityEvent[] => {
  const events: ActivityEvent[] = c.sales.map((s, i) => ({ id: `s${i}`, kind: 'sale', tokenId: s.tokenId, price: s.price, from: s.from, to: s.to, ageHours: s.ageHours }))
  for (const item of c.items) {
    const r = rngFor(c.slug, 'events', item.tokenId)
    if (item.price !== null) events.push({ id: `l${item.tokenId}`, kind: 'listing', tokenId: item.tokenId, price: item.price, from: item.ownerId, to: null, ageHours: between(r, 0.2, 24 * 20) })
    if (item.bestOffer !== null) events.push({ id: `o${item.tokenId}`, kind: 'offer', tokenId: item.tokenId, price: item.bestOffer, from: pick(r, USERS).id, to: item.ownerId, ageHours: between(r, 0.1, 24 * 10) })
  }
  return events.sort((a, b) => a.ageHours - b.ageHours)
}
