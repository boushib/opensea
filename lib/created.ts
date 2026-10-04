/**
 * Collections you create live in your browser (see useMarket). Their slug carries the art
 * style and a seed, like "c-moonfolk--k3j9x2", so any item can be drawn from the slug alone, with no storage.
 */
export type Creation = {
  slug: string
  name: string
  description: string
  style: string
  /** How many items the collection can ever have */
  size: number
  /** What each item is worth, used when you list one */
  value: number
  minted: number
  at: string
  signature: string
}

export const MAX_SUPPLY = 200

export const STYLES = [
  { slug: 'pixel-pals', label: 'Pixel creatures' },
  { slug: 'moonfolk', label: 'Faces' },
  { slug: 'block-bloom', label: 'Bauhaus tiles' },
  { slug: 'orbit-studies', label: 'Solar systems' },
  { slug: 'terra-plots', label: 'Land plots' },
  { slug: 'sonic-waves', label: 'Waveforms' },
  { slug: 'glyph-cards', label: 'Game cards' },
] as const

export const createdSlug = (style: string, seed: string) => `c-${style}--${seed}`

export const parseCreated = (slug: string) => {
  const m = /^c-([a-z-]+)--([a-z0-9]{4,12})$/.exec(slug)
  return m && STYLES.some((s) => s.slug === m[1]) ? { style: m[1], seed: m[2] } : null
}

// The collection and its items are pages that read the slug from the URL in the browser, since they can't be pre-built
export const createdUrl = (slug: string) => `/created?${new URLSearchParams({ c: slug })}`

export const createdItemUrl = (slug: string, tokenId: number) => `/created/item?${new URLSearchParams({ c: slug, t: String(tokenId) })}`
