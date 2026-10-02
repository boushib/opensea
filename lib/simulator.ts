'use client'

import { holdings, incomingOffers, readMarket, writeMarket, type MarketState, type Note, type Party } from './market'
import { hash } from './rng'
import { USERS } from './users'
import { itemUrl } from './urls'

/** Named collectors who buy, sell and make offers in the simulation */
export const PEOPLE: Party[] = USERS.map((u) => ({ name: u.name, address: u.address }))

const note = (n: Omit<Note, 'id' | 'read'>): Note => ({ ...n, id: `${n.kind}:${n.href}:${n.at}`, read: false })
const ms = (iso: string) => new Date(iso).getTime()
const day = 864e5

/**
 * Plays the rest of the market for one wallet, with fixed rules so it's predictable:
 * - a listing at up to 15% over the item's fair price sells 1–3 minutes after listing
 * - an offer at 92% or more of the fair price is accepted 40 seconds to 2 minutes after
 * - listings and offers expire after their duration
 * - collectors make offers on items you hold (see incomingOffers), announced once each
 */
export const simulate = (address: string, now = Date.now()) => {
  const s = readMarket(address)
  const notes: Note[] = []
  let next: MarketState = s
  const at = (t: number) => new Date(t).toISOString()

  // Listings
  const held = holdings(next)
  for (const l of next.listings) {
    const h = hash(`${l.slug}/${l.tokenId}/${l.at}`)
    const sellsAt = ms(l.at) + (60 + (h % 120)) * 1000
    const expiresAt = ms(l.at) + l.days * day
    const stillHeld = held.some((p) => p.slug === l.slug && p.tokenId === l.tokenId)
    if (!stillHeld) {
      next = { ...next, listings: next.listings.filter((x) => x !== l) }
    } else if (l.price <= l.fair * 1.15 && now >= sellsAt) {
      const buyer = PEOPLE[h % PEOPLE.length]
      next = {
        ...next,
        listings: next.listings.filter((x) => x !== l),
        sales: [{ slug: l.slug, tokenId: l.tokenId, name: l.name, price: l.price, to: buyer, at: at(sellsAt), via: 'listing' }, ...next.sales],
      }
      notes.push(note({ kind: 'sold', title: `${l.name} sold`, body: `${buyer.name} bought it for ${l.price} ETH.`, href: itemUrl(l.slug, l.tokenId), at: at(sellsAt) }))
    } else if (now >= expiresAt) {
      next = { ...next, listings: next.listings.filter((x) => x !== l) }
      notes.push(note({ kind: 'offer-expired', title: `Listing ended for ${l.name}`, body: 'Nobody bought it before the listing expired.', href: itemUrl(l.slug, l.tokenId), at: at(expiresAt) }))
    }
  }

  // Offers you made
  for (const o of next.offers) {
    const h = hash(`${o.slug}/${o.tokenId}/${o.at}`)
    const acceptedAt = ms(o.at) + (40 + (h % 80)) * 1000
    const expiresAt = ms(o.at) + o.expiresDays * day
    if (o.amount >= o.fair * 0.92 && now >= acceptedAt) {
      next = {
        ...next,
        offers: next.offers.filter((x) => x !== o),
        purchases: [{ slug: o.slug, tokenId: o.tokenId, name: o.name, price: o.amount, at: at(acceptedAt), signature: o.signature, via: 'offer' }, ...next.purchases],
      }
      notes.push(note({ kind: 'offer-accepted', title: 'Offer accepted', body: `You now own ${o.name}, for ${o.amount} ETH.`, href: itemUrl(o.slug, o.tokenId), at: at(acceptedAt) }))
    } else if (now >= expiresAt) {
      next = { ...next, offers: next.offers.filter((x) => x !== o) }
      notes.push(note({ kind: 'offer-expired', title: 'Offer expired', body: `Your offer on ${o.name} wasn’t accepted.`, href: itemUrl(o.slug, o.tokenId), at: at(expiresAt) }))
    }
  }

  // Offers others make on what you hold
  const seen = new Set(next.seen)
  for (const p of holdings(next)) {
    for (const o of incomingOffers(p, PEOPLE, now)) {
      if (seen.has(o.id)) continue
      seen.add(o.id)
      notes.push(note({ kind: 'offer-received', title: `New offer on ${p.name}`, body: `${o.from.name} offered ${o.amount} ETH.`, href: itemUrl(p.slug, p.tokenId), at: at(o.at) }))
    }
  }
  if (seen.size !== next.seen.length) next = { ...next, seen: [...seen] }

  if (next !== s || notes.length) writeMarket(address, { ...next, notes: [...notes.sort((a, b) => b.at.localeCompare(a.at)), ...next.notes].slice(0, 50) })
}
