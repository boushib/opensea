'use client'

import { useSyncExternalStore } from 'react'

/** What a wallet has done in this browser: items bought, offers made, favorites */
export type Purchase = { slug: string; tokenId: number; price: number; at: string; signature: string }
export type Offer = { slug: string; tokenId: number; amount: number; expiresDays: number; at: string; signature: string }
export type MarketState = { purchases: Purchase[]; offers: Offer[]; favorites: string[] }

const EMPTY: MarketState = { purchases: [], offers: [], favorites: [] }
const key = (address: string) => `market:${address.toLowerCase()}`
const listeners = new Set<() => void>()
const cache = new Map<string, MarketState>()

const read = (address: string | null): MarketState => {
  if (!address) return EMPTY
  if (cache.has(address)) return cache.get(address)!
  let state = EMPTY
  try {
    const raw = localStorage.getItem(key(address))
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) }
  } catch {}
  cache.set(address, state)
  return state
}

const write = (address: string, next: MarketState) => {
  cache.set(address, next)
  try {
    localStorage.setItem(key(address), JSON.stringify(next))
  } catch {}
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  // Another tab changed it
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

/** The wallet's activity, kept in sync across components and tabs */
export const useMarket = (address: string | null) => {
  const state = useSyncExternalStore(subscribe, () => read(address), () => EMPTY)
  const update = (fn: (s: MarketState) => MarketState) => address && write(address, fn(read(address)))
  return {
    ...state,
    owns: (slug: string, tokenId: number) => state.purchases.some((p) => p.slug === slug && p.tokenId === tokenId),
    offerOn: (slug: string, tokenId: number) => state.offers.find((o) => o.slug === slug && o.tokenId === tokenId) ?? null,
    isFavorite: (slug: string, tokenId: number) => state.favorites.includes(itemKey(slug, tokenId)),
    buy: (p: Purchase) => update((s) => ({ ...s, purchases: [p, ...s.purchases.filter((x) => itemKey(x.slug, x.tokenId) !== itemKey(p.slug, p.tokenId))] })),
    makeOffer: (o: Offer) => update((s) => ({ ...s, offers: [o, ...s.offers.filter((x) => itemKey(x.slug, x.tokenId) !== itemKey(o.slug, o.tokenId))] })),
    cancelOffer: (slug: string, tokenId: number) => update((s) => ({ ...s, offers: s.offers.filter((x) => itemKey(x.slug, x.tokenId) !== itemKey(slug, tokenId)) })),
    toggleFavorite: (slug: string, tokenId: number) =>
      update((s) => {
        const k = itemKey(slug, tokenId)
        return { ...s, favorites: s.favorites.includes(k) ? s.favorites.filter((x) => x !== k) : [k, ...s.favorites] }
      }),
  }
}
