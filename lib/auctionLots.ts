import type { AuctionLot } from './auctions'
import { getCollections, getUser } from './catalog'
import { hash } from './rng'

const LENGTHS = [8, 12, 20, 30]
let cache: AuctionLot[] | null = null

/** Two unlisted, well-ranked items from each collection, auctioned on repeat */
export const getAuctionLots = () =>
  (cache ??= getCollections().flatMap((c) =>
    c.items
      .filter((i) => i.price === null && i.rank <= c.size / 3)
      .slice(0, 2)
      .map((i) => {
        const h = hash(`lot/${c.slug}/${i.tokenId}`)
        const owner = getUser(i.ownerId)
        const minutes = LENGTHS[h % LENGTHS.length]
        return {
          slug: c.slug,
          tokenId: i.tokenId,
          name: i.name,
          collectionName: c.name,
          fair: Math.round(Math.max(c.stats.floor * 1.1, i.lastSale?.price ?? 0) * 1e4) / 1e4,
          seller: owner ? { name: owner.name, address: owner.address } : { name: 'someone', address: '0x0000000000000000000000000000000000000000' },
          minutes,
          offsetMinutes: ((h >>> 4) % ((minutes + 2) * 60)) / 60,
        }
      })
  ))

export const getAuctionLot = (slug: string, tokenId: number) => getAuctionLots().find((l) => l.slug === slug && l.tokenId === tokenId) ?? null
