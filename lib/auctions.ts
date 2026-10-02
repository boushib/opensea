import { between, intBetween, rngFor } from './rng'
import type { Party } from './market'
import { USERS } from './users'

/** An item that's auctioned again and again on a fixed cycle (picked on the server, see auctionLots) */
export type AuctionLot = {
  slug: string
  tokenId: number
  name: string
  collectionName: string
  /** What the item is worth; bidders stop somewhere around it */
  fair: number
  seller: Party
  /** How long bidding runs; a 2-minute break showing the result follows */
  minutes: number
  /** Start offset so lots don't all end at once */
  offsetMinutes: number
}

/** One run of a lot, from first bid to hammer */
export type Auction = Omit<AuctionLot, 'minutes' | 'offsetMinutes'> & { id: string; startsAt: number; endsAt: number; reserve: number }

/** A bid you placed, carrying everything needed to replay its auction */
export type Bid = Auction & { amount: number; at: string; signature: string }

export type BidEvent = { who: Party | 'you'; amount: number; at: number }

export type AuctionState = {
  /** Bids so far, newest first */
  history: BidEvent[]
  high: number | null
  leader: Party | 'you' | null
  /** The lowest bid that would lead now */
  minNext: number
  ended: boolean
}

const BREAK = 2 * 60_000
const up = (n: number) => Math.ceil(n * 1000) / 1000

/** The run of a lot that's live (or just ended) at a moment */
export const auctionOf = (lot: AuctionLot, now: number): Auction => {
  const cycle = lot.minutes * 60_000 + BREAK
  const offset = lot.offsetMinutes * 60_000
  const k = Math.floor((now - offset) / cycle)
  const startsAt = offset + k * cycle
  return {
    id: `${lot.slug}/${lot.tokenId}/${k}`,
    slug: lot.slug,
    tokenId: lot.tokenId,
    name: lot.name,
    collectionName: lot.collectionName,
    fair: lot.fair,
    seller: lot.seller,
    startsAt,
    endsAt: startsAt + lot.minutes * 60_000,
    reserve: up(lot.fair * 0.5),
  }
}

/** The other bidders: how high they'll go and when their own bids land */
const bidders = (a: Auction) => {
  const rng = rngFor('auction', a.id)
  const ceiling = up(a.fair * between(rng, 0.85, 1.25))
  const pool = USERS.filter((u) => u.address !== a.seller.address)
  const n = intBetween(rng, 3, 7)
  const span = a.endsAt - a.startsAt
  const times = Array.from({ length: n }, () => a.startsAt + rng() * span * 0.95).sort((x, y) => x - y)
  const scheduled: BidEvent[] = times.map((at, j) => {
    const u = pool[Math.floor(rng() * pool.length)]
    return { who: { name: u.name, address: u.address }, amount: up(a.reserve + (ceiling - a.reserve) * ((j + 1) / n) ** 1.4), at }
  })
  const counterer = (seed: number) => {
    const u = pool[seed % pool.length]
    return { name: u.name, address: u.address }
  }
  return { ceiling, scheduled, counterer }
}

/**
 * Replays an auction up to `now`: the scheduled bids, your bids, and the counter-bids
 * other collectors make when you lead below their ceiling (15–40 seconds after you)
 */
export const auctionState = (a: Auction, mine: Pick<Bid, 'amount' | 'at'>[], now: number): AuctionState => {
  const { ceiling, scheduled, counterer } = bidders(a)
  const until = Math.min(now, a.endsAt)
  const queue: BidEvent[] = [...scheduled, ...mine.map((b) => ({ who: 'you' as const, amount: b.amount, at: new Date(b.at).getTime() }))].sort((x, y) => x.at - y.at)
  const history: BidEvent[] = []
  let high: number | null = null
  let leader: AuctionState['leader'] = null
  let counters = 0

  while (queue.length && queue[0].at <= until) {
    const e = queue.shift()!
    if (high !== null && e.amount <= high) continue
    high = e.amount
    leader = e.who
    history.unshift(e)
    if (e.who === 'you' && e.amount < ceiling) {
      const at = Math.min(e.at + (15 + ((e.at / 1000 + counters * 7) % 25)) * 1000, a.endsAt - 3000)
      const amount = Math.min(ceiling, up(e.amount * 1.05))
      if (at > e.at && amount > e.amount) {
        const counter = { who: counterer(Math.floor(e.at / 1000) + counters++), amount, at }
        const i = queue.findIndex((q) => q.at > at)
        queue.splice(i === -1 ? queue.length : i, 0, counter)
      }
    }
  }
  return { history, high, leader, minNext: high === null ? a.reserve : up(high * 1.05), ended: now >= a.endsAt }
}

export const isYou = (who: Party | 'you' | null): who is 'you' => who === 'you'

/** "4m 05s", "52s" */
export const countdown = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${s}s`
}
