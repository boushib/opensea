'use client'

import { useSyncExternalStore } from 'react'
import type { Bid } from './auctions'
import { itemName } from './names'
import { hash } from './rng'

/**
 * What a wallet has done in this browser. There's no backend: trades are signed messages,
 * and other collectors' reactions (buying your listings, accepting your offers, making
 * offers on your items) are simulated by lib/simulator.ts.
 */
export type Party = { name: string; address: string }
export type Purchase = { slug: string; tokenId: number; name: string; price: number; at: string; signature: string; via?: 'buy' | 'offer' | 'auction' | 'mint' }
export type Listing = { slug: string; tokenId: number; name: string; price: number; days: number; at: string; signature: string; fair: number }
export type Offer = { slug: string; tokenId: number; name: string; amount: number; expiresDays: number; at: string; signature: string; fair: number }
/** An offer on any item of a collection, for one or more items */
export type CollectionOffer = { slug: string; collectionName: string; size: number; amount: number; quantity: number; filled: number; expiresDays: number; at: string; signature: string; floor: number }
export type Sale = { slug: string; tokenId: number; name: string; price: number; to: Party; at: string; via: 'listing' | 'offer' }
export type Transfer = { slug: string; tokenId: number; name: string; to: Party; at: string; signature: string }
export type NoteKind = 'sold' | 'offer-accepted' | 'offer-expired' | 'offer-received' | 'outbid' | 'auction-won' | 'auction-lost' | 'listed' | 'minted'
export type Note = { id: string; kind: NoteKind; title: string; body: string; href: string; at: string; read: boolean }

export type MarketState = {
  purchases: Purchase[]
  listings: Listing[]
  offers: Offer[]
  collectionOffers: CollectionOffer[]
  /** Your bids on live auctions, until each auction is settled */
  bids: Bid[]
  sales: Sale[]
  transfers: Transfer[]
  favorites: string[]
  notes: Note[]
  /** Incoming offers already announced, so each is notified once */
  seen: string[]
}

const EMPTY: MarketState = { purchases: [], listings: [], offers: [], collectionOffers: [], bids: [], sales: [], transfers: [], favorites: [], notes: [], seen: [] }
const storageKey = (address: string) => `market:${address.toLowerCase()}`
const listeners = new Set<() => void>()
const cache = new Map<string, MarketState>()

export const readMarket = (address: string | null): MarketState => {
  if (!address) return EMPTY
  const k = address.toLowerCase()
  if (cache.has(k)) return cache.get(k)!
  let state = EMPTY
  try {
    const raw = localStorage.getItem(storageKey(k))
    if (raw) state = repair({ ...EMPTY, ...JSON.parse(raw) })
  } catch {}
  cache.set(k, state)
  return state
}

/** Older saves had no item names, and their notifications said "undefined" */
const repair = (s: MarketState): MarketState => {
  const named = <T extends { slug: string; tokenId: number; name?: string }>(xs: T[]) => xs.map((x) => (x.name ? x : { ...x, name: itemName(x.slug, x.tokenId) }))
  const fromHref = (href: string) => {
    const [, , slug, id] = href.split('/')
    return itemName(slug, Number(id))
  }
  return {
    ...s,
    purchases: named(s.purchases),
    listings: named(s.listings).map((l) => ({ ...l, fair: l.fair ?? l.price })),
    offers: named(s.offers).map((o) => ({ ...o, fair: o.fair ?? o.amount })),
    sales: named(s.sales),
    transfers: named(s.transfers),
    notes: s.notes.map((n) => (n.title.includes('undefined') || n.body.includes('undefined') ? { ...n, title: n.title.replace('undefined', fromHref(n.href)), body: n.body.replace('undefined', fromHref(n.href)) } : n)),
  }
}

export const writeMarket = (address: string, next: MarketState) => {
  cache.set(address.toLowerCase(), next)
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(next))
  } catch {}
  listeners.forEach((l) => l())
}

export const updateMarket = (address: string, fn: (s: MarketState) => MarketState) => writeMarket(address, fn(readMarket(address)))

const subscribe = (l: () => void) => {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith('market:')) {
      cache.clear()
      l()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
  }
}

export const itemKey = (slug: string, tokenId: number) => `${slug}/${tokenId}`
const same = (slug: string, tokenId: number) => (x: { slug: string; tokenId: number }) => x.slug === slug && x.tokenId === tokenId
const not = <T,>(f: (x: T) => boolean) => (x: T) => !f(x)

/** Items the wallet holds now: bought or minted, and not sold or sent away since */
export const holdings = (s: MarketState) =>
  s.purchases.filter((p) => {
    const later = (x: { at: string }) => x.at > p.at
    return !s.sales.some((x) => same(p.slug, p.tokenId)(x) && later(x)) && !s.transfers.some((x) => same(p.slug, p.tokenId)(x) && later(x))
  })

export type IncomingOffer = { id: string; slug: string; tokenId: number; from: Party; amount: number; at: number }

/**
 * Offers other collectors make on an item you hold: a few, at 75–97% of what you paid,
 * arriving over the first minutes after you got it. Same item and time, same offers.
 */
export const incomingOffers = (p: Purchase, people: Party[], now: number): IncomingOffer[] => {
  const seed = hash(`${p.slug}/${p.tokenId}/${p.at}`)
  const n = 1 + (seed % 3)
  const start = new Date(p.at).getTime()
  return Array.from({ length: n }, (_, i) => {
    const h = hash(`${seed}:${i}`)
    return {
      id: `${p.slug}/${p.tokenId}/${p.at}/${i}`,
      slug: p.slug,
      tokenId: p.tokenId,
      from: people[h % people.length],
      amount: Math.round(p.price * (0.75 + ((h >>> 8) % 23) / 100) * 1e4) / 1e4,
      at: start + (45 + i * 70 + ((h >>> 4) % 60)) * 1000,
    }
  })
    .filter((o) => o.at <= now)
    .sort((a, b) => b.amount - a.amount)
}

/** The wallet's market state, kept in sync across components and tabs */
export const useMarket = (address: string | null) => {
  const state = useSyncExternalStore(subscribe, () => readMarket(address), () => EMPTY)
  const update = (fn: (s: MarketState) => MarketState) => address && updateMarket(address, fn)
  const held = holdings(state)
  const note = (n: Omit<Note, 'id' | 'read'>): Note => ({ ...n, id: `${n.kind}:${n.href}:${n.at}`, read: false })

  return {
    ...state,
    held,
    owns: (slug: string, tokenId: number) => held.some(same(slug, tokenId)),
    purchaseOf: (slug: string, tokenId: number) => held.find(same(slug, tokenId)) ?? null,
    listingOf: (slug: string, tokenId: number) => state.listings.find(same(slug, tokenId)) ?? null,
    offerOn: (slug: string, tokenId: number) => state.offers.find(same(slug, tokenId)) ?? null,
    /** Who has it now, if you sold or sent it */
    passedTo: (slug: string, tokenId: number) => {
      const out = [...state.sales.filter(same(slug, tokenId)), ...state.transfers.filter(same(slug, tokenId))].sort((a, b) => b.at.localeCompare(a.at))[0]
      return out && !held.some(same(slug, tokenId)) ? out.to : null
    },
    isFavorite: (slug: string, tokenId: number) => state.favorites.includes(itemKey(slug, tokenId)),
    unread: state.notes.filter((n) => !n.read).length,

    buy: (p: Purchase) => update((s) => ({ ...s, purchases: [p, ...s.purchases.filter(not(same(p.slug, p.tokenId)))], offers: s.offers.filter(not(same(p.slug, p.tokenId))) })),
    buyMany: (ps: Purchase[]) =>
      update((s) => ({ ...s, purchases: [...ps, ...s.purchases.filter((x) => !ps.some((p) => same(p.slug, p.tokenId)(x)))] })),
    makeOffer: (o: Offer) => update((s) => ({ ...s, offers: [o, ...s.offers.filter(not(same(o.slug, o.tokenId)))] })),
    cancelOffer: (slug: string, tokenId: number) => update((s) => ({ ...s, offers: s.offers.filter(not(same(slug, tokenId))) })),
    collectionOfferOn: (slug: string) => state.collectionOffers.find((o) => o.slug === slug) ?? null,
    makeCollectionOffer: (o: CollectionOffer) => update((s) => ({ ...s, collectionOffers: [o, ...s.collectionOffers.filter((x) => x.slug !== o.slug)] })),
    bidsOn: (auctionId: string) => state.bids.filter((b) => b.id === auctionId),
    placeBid: (b: Bid) => update((s) => ({ ...s, bids: [b, ...s.bids] })),
    cancelCollectionOffer: (slug: string) => update((s) => ({ ...s, collectionOffers: s.collectionOffers.filter((x) => x.slug !== slug) })),
    list: (l: Listing) => update((s) => ({ ...s, listings: [l, ...s.listings.filter(not(same(l.slug, l.tokenId)))] })),
    cancelListing: (slug: string, tokenId: number) => update((s) => ({ ...s, listings: s.listings.filter(not(same(slug, tokenId))) })),
    acceptOffer: (o: IncomingOffer, name: string) =>
      update((s) => ({
        ...s,
        listings: s.listings.filter(not(same(o.slug, o.tokenId))),
        sales: [{ slug: o.slug, tokenId: o.tokenId, name, price: o.amount, to: o.from, at: new Date().toISOString(), via: 'offer' }, ...s.sales],
      })),
    transfer: (t: Transfer) => update((s) => ({ ...s, listings: s.listings.filter(not(same(t.slug, t.tokenId))), transfers: [t, ...s.transfers] })),
    toggleFavorite: (slug: string, tokenId: number) =>
      update((s) => {
        const k = itemKey(slug, tokenId)
        return { ...s, favorites: s.favorites.includes(k) ? s.favorites.filter((x) => x !== k) : [k, ...s.favorites] }
      }),
    notify: (n: Omit<Note, 'id' | 'read'>) => update((s) => ({ ...s, notes: [note(n), ...s.notes].slice(0, 50) })),
    markAllRead: () => update((s) => ({ ...s, notes: s.notes.map((n) => ({ ...n, read: true })) })),
  }
}
