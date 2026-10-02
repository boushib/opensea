import { getCollections, getUser, type Collection, type Item, type Sale } from './catalog'
import { ANONYMOUS, CREATORS, USERS, type User } from './users'

const everyone = (): User[] => [...USERS, ...ANONYMOUS, ...Object.values(CREATORS)]

export const findByAddress = (address: string) => everyone().find((u) => u.address.toLowerCase() === address.toLowerCase()) ?? null

/** A user's name and address for links, from their id */
export const person = (id: string | null) => {
  const u = id ? getUser(id) : null
  return u ? { name: u.name, address: u.address } : null
}

export type Holding = { collection: Collection; item: Item }
export type Trade = Sale & { collection: Collection; side: 'bought' | 'sold' }

/** What a user owns, created and traded, across every collection */
export const profileOf = (user: User) => {
  const collections = getCollections()
  const owned: Holding[] = collections.flatMap((c) => c.items.filter((i) => i.ownerId === user.id).map((item) => ({ collection: c, item })))
  const created = collections.filter((c) => c.creator === user.id)
  const trades: Trade[] = collections
    .flatMap((c) =>
      c.sales.flatMap((s): Trade[] => [
        ...(s.to === user.id ? [{ ...s, collection: c, side: 'bought' as const }] : []),
        ...(s.from === user.id ? [{ ...s, collection: c, side: 'sold' as const }] : []),
      ])
    )
    .sort((a, b) => a.ageHours - b.ageHours)
  return {
    owned,
    created,
    trades,
    volume: trades.reduce((s, t) => s + t.price, 0),
    // Floor value of everything they hold
    value: owned.reduce((s, h) => s + h.collection.stats.floor, 0),
  }
}
