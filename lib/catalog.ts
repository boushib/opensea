import { blockBloom } from './art/blockBloom'
import { glyphCards } from './art/glyphCards'
import { moonfolk } from './art/moonfolk'
import { orbits } from './art/orbits'
import { pixelPals } from './art/pixelPals'
import { sonicWaves } from './art/sonicWaves'
import { terraPlots } from './art/terraPlots'
import type { ArtStyle, Traits } from './art/types'
import { between, intBetween, pick, rngFor, type Rng } from './rng'
import { ANONYMOUS, CREATORS, USERS, type User } from './users'

export type CategorySlug = 'pfps' | 'art' | 'gaming' | 'virtual-worlds' | 'music'

export const CATEGORIES: Array<{ slug: CategorySlug; name: string; blurb: string }> = [
  { slug: 'pfps', name: 'Profile pictures', blurb: 'Characters to represent you online' },
  { slug: 'art', name: 'Art', blurb: 'Generative and one-of-a-kind pieces' },
  { slug: 'gaming', name: 'Gaming', blurb: 'Cards, items and in-game assets' },
  { slug: 'virtual-worlds', name: 'Virtual worlds', blurb: 'Land and places to build on' },
  { slug: 'music', name: 'Music', blurb: 'Tracks and sounds you can own' },
]

type CollectionDef = {
  slug: string
  name: string
  category: CategorySlug
  creator: string
  size: number
  /** Typical price of a common item, in ETH */
  base: number
  /** How actively it trades: sales over 90 days per item */
  liquidity: number
  launchedDaysAgo: number
  verified: boolean
  featured: number
  style: ArtStyle
  description: string
}

const DEFS: CollectionDef[] = [
  { slug: 'pixel-pals', name: 'Pixel Pals', category: 'pfps', creator: 'pixel-studio', size: 160, base: 0.42, liquidity: 1.4, launchedDaysAgo: 420, verified: true, featured: 7, style: pixelPals, description: '160 tiny creatures, each drawn on a 12 × 12 grid. Some wear crowns, a few shoot lasers, and every one of them is mirrored down to the last pixel.' },
  { slug: 'moonfolk', name: 'Moonfolk', category: 'pfps', creator: 'moonfolk-labs', size: 200, base: 0.86, liquidity: 1.1, launchedDaysAgo: 610, verified: true, featured: 12, style: moonfolk, description: 'A friendly crowd of flat-drawn faces with hats, headphones and the occasional crown. Holders get early access to every Moonfolk Labs drop.' },
  { slug: 'block-bloom', name: 'Block Bloom', category: 'art', creator: 'ada-ruiz', size: 96, base: 1.2, liquidity: 0.6, launchedDaysAgo: 300, verified: true, featured: 3, style: blockBloom, description: 'Bauhaus-inspired tiles by Ada Ruiz. Quarter circles, half moons and triangles arranged on 3, 4 or 5 square grids, in six palettes.' },
  { slug: 'orbit-studies', name: 'Orbit Studies', category: 'art', creator: 'halley-works', size: 120, base: 0.65, liquidity: 0.8, launchedDaysAgo: 220, verified: false, featured: 5, style: orbits, description: 'Little solar systems: a sun, a handful of orbits and the planets that ride them. Look out for the rare black holes.' },
  { slug: 'terra-plots', name: 'Terra Plots', category: 'virtual-worlds', creator: 'terraforma', size: 180, base: 0.31, liquidity: 1.6, launchedDaysAgo: 520, verified: true, featured: 21, style: terraPlots, description: 'Isometric plots of land across five biomes. Some come with a house, a tower or, very rarely, a castle.' },
  { slug: 'sonic-waves', name: 'Sonic Waves', category: 'music', creator: 'wavelength', size: 100, base: 0.18, liquidity: 1.2, launchedDaysAgo: 150, verified: true, featured: 9, style: sonicWaves, description: 'Each piece is a track drawn as its waveform, from slow lo-fi to fast techno. Owners can stream the full release from Wavelength Records.' },
  { slug: 'glyph-cards', name: 'Glyph Cards', category: 'gaming', creator: 'glyphforge', size: 240, base: 0.09, liquidity: 2.2, launchedDaysAgo: 90, verified: true, featured: 14, style: glyphCards, description: 'Collectible cards for the Glyphforge battler. Five elements, six glyphs and four rarities; Legendary cards are about 1 in 25.' },
]

export type Sale = { tokenId: number; price: number; ageHours: number; from: string; to: string }

export type Item = {
  tokenId: number
  name: string
  traits: Traits
  rank: number
  ownerId: string
  /** ETH, when listed for sale */
  price: number | null
  listingDays: number
  bestOffer: number | null
  lastSale: Sale | null
}

export type Collection = Omit<CollectionDef, 'style'> & {
  creatorUser: User
  /** ISO date the collection launched */
  launchedAt: string
  items: Item[]
  sales: Sale[]
  traitCounts: Record<string, Record<string, number>>
  stats: {
    floor: number
    bestOffer: number
    listed: number
    owners: number
    volume: number
    volume24h: number
    volume7d: number
    change24h: number
    change7d: number
    sales24h: number
  }
}

const sum = (n: number[]) => n.reduce((s, x) => s + x, 0)
const round = (n: number, d = 4) => Math.round(n * 10 ** d) / 10 ** d

/** Builds a collection's items, owners, listings, offers and sales from its seed */
const build = (def: CollectionDef): Collection => {
  const raw = Array.from({ length: def.size }, (_, i) => ({ tokenId: i + 1, traits: def.style.traits(rngFor(def.slug, 'traits', i + 1)) }))

  // Rarity: rarer traits score higher; rank 1 is the rarest item
  const traitCounts: Record<string, Record<string, number>> = {}
  for (const { traits } of raw)
    for (const [k, v] of Object.entries(traits)) {
      traitCounts[k] ??= {}
      traitCounts[k][v] = (traitCounts[k][v] ?? 0) + 1
    }
  const scored = raw.map((r) => ({ ...r, score: sum(Object.entries(r.traits).map(([k, v]) => def.size / traitCounts[k][v])) }))
  const ranks = new Map([...scored].sort((a, b) => b.score - a.score || a.tokenId - b.tokenId).map((r, i) => [r.tokenId, i + 1]))

  // What each item is worth: commons near the base price, the rarest several times more
  const value = (tokenId: number) => {
    const pct = 1 - (ranks.get(tokenId)! - 1) / def.size
    return def.base * (1 + pct ** 4 * 7) * between(rngFor(def.slug, 'value', tokenId), 0.95, 1.2)
  }

  // Who trades this collection: some named collectors, mostly anonymous wallets
  const start = intBetween(rngFor(def.slug, 'holders'), 0, ANONYMOUS.length - 1)
  const holders = Array.from({ length: Math.round(def.size * 0.65) }, (_, i) => ANONYMOUS[(start + i * 7) % ANONYMOUS.length])
  const trader = (r: Rng) => (r() < 0.25 ? pick(r, USERS) : pick(r, holders)).id

  const market = rngFor(def.slug, 'market')
  const sales: Sale[] = []
  const salesCount = Math.round(def.size * def.liquidity * 3)
  for (let i = 0; i < salesCount; i++) {
    const tokenId = intBetween(market, 1, def.size)
    const ageHours = round(90 * 24 * market(), 2)
    const trend = 1 + (1 - ageHours / (90 * 24)) * 0.12
    sales.push({ tokenId, price: round(value(tokenId) * between(market, 0.82, 1.12) * trend), ageHours, from: trader(market), to: trader(market) })
  }
  sales.sort((a, b) => a.ageHours - b.ageHours)

  const items: Item[] = raw.map(({ tokenId, traits }) => {
    const r = rngFor(def.slug, 'item', tokenId)
    const last = sales.find((s) => s.tokenId === tokenId) ?? null
    const listed = r() < 0.3
    const v = value(tokenId)
    return {
      tokenId,
      name: `${def.name} #${tokenId}`,
      traits,
      rank: ranks.get(tokenId)!,
      // The last buyer still owns it; otherwise whoever minted it
      ownerId: last?.to ?? trader(r),
      price: listed ? round(v * between(r, 1.0, 1.35)) : null,
      listingDays: intBetween(r, 1, 30),
      bestOffer: r() < 0.45 ? round(v * between(r, 0.7, 0.92)) : null,
      lastSale: last,
    }
  })

  const listedPrices = items.flatMap((i) => (i.price ? [i.price] : []))
  const within = (from: number, to: number) => sales.filter((s) => s.ageHours >= from && s.ageHours < to)
  const vol = (from: number, to: number) => sum(within(from, to).map((s) => s.price))
  const change = (now: number, before: number) => (before > 0 ? (now - before) / before : 0)
  const v24 = vol(0, 24)
  const v7 = vol(0, 168)

  const { style: _style, ...rest } = def
  void _style
  return {
    ...rest,
    creatorUser: CREATORS[def.creator],
    launchedAt: new Date(Date.now() - def.launchedDaysAgo * 864e5).toISOString(),
    items,
    sales,
    traitCounts,
    stats: {
      floor: Math.min(...listedPrices),
      // A collection-wide offer (for any item) sits a little under the floor
      bestOffer: round(Math.min(...listedPrices) * between(rngFor(def.slug, 'collection-offer'), 0.86, 0.95)),
      listed: listedPrices.length,
      owners: new Set(items.map((i) => i.ownerId)).size,
      // Includes the mint and trading before these 90 days
      volume: round(vol(0, Infinity) * 2.2 + def.size * def.base * 0.6, 2),
      volume24h: round(v24, 3),
      volume7d: round(v7, 3),
      // Against the average day (or week) before, which is steadier than a single day
      change24h: change(v24, vol(24, 192) / 7),
      change7d: change(v7, vol(168, 672) / 3),
      sales24h: within(0, 24).length,
    },
  }
}

let cache: Collection[] | null = null

export const getCollections = () => (cache ??= DEFS.map(build))

export const getCollection = (slug: string) => getCollections().find((c) => c.slug === slug) ?? null

export const getItem = (slug: string, tokenId: number) => {
  const collection = getCollection(slug)
  const item = collection?.items.find((i) => i.tokenId === tokenId)
  return collection && item ? { collection, item } : null
}

export const getUser = (id: string) =>
  USERS.find((u) => u.id === id) ?? ANONYMOUS.find((u) => u.id === id) ?? Object.values(CREATORS).find((u) => u.id === id) ?? null

/** Draws an item's art as an SVG string */
export const drawItem = (slug: string, tokenId: number) => {
  const def = DEFS.find((d) => d.slug === slug)
  if (!def || tokenId < 1 || tokenId > def.size) return null
  return def.style.draw(def.style.traits(rngFor(slug, 'traits', tokenId)), rngFor(slug, 'art', tokenId))
}
