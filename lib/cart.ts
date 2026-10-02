'use client'

import { useSyncExternalStore } from 'react'

export type CartItem = { slug: string; tokenId: number; name: string; price: number }

// Namespaced, so another app on the same origin (e.g. in local development) can't clash
const KEY = 'opensea-cart'
const listeners = new Set<() => void>()
let cache: CartItem[] | null = null
const EMPTY: CartItem[] = []

const read = () => {
  if (cache) return cache
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    cache = Array.isArray(raw) ? (raw as CartItem[]).filter((i) => i && typeof i.slug === 'string' && typeof i.price === 'number') : []
  } catch {
    cache = []
  }
  return cache
}

const write = (items: CartItem[]) => {
  cache = items
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {}
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null
      l()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
  }
}

// Opening the cart panel from anywhere
const openListeners = new Set<(open: boolean) => void>()
export const onCartOpen = (fn: (open: boolean) => void) => {
  openListeners.add(fn)
  return () => {
    openListeners.delete(fn)
  }
}

const same = (a: { slug: string; tokenId: number }, b: { slug: string; tokenId: number }) => a.slug === b.slug && a.tokenId === b.tokenId

/** Listed items saved for buying together */
export const useCart = () => {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY)
  return {
    items,
    total: items.reduce((s, i) => s + i.price, 0),
    has: (slug: string, tokenId: number) => items.some((i) => same(i, { slug, tokenId })),
    // Always from the latest saved cart, so quick clicks don't overwrite each other
    add: (item: CartItem) => {
      const now = read()
      if (!now.some((i) => same(i, item))) write([...now, item])
    },
    remove: (slug: string, tokenId: number) => write(read().filter((i) => !same(i, { slug, tokenId }))),
    clear: () => write([]),
    open: () => openListeners.forEach((fn) => fn(true)),
  }
}
