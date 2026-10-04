import { drawCreated } from './art/draw'
import { createdItemUrl, parseCreated } from './created'

// Small enough to use in client components without pulling in the catalog

/** Catalog art is a pre-built SVG file; art for collections you create is drawn right here, as a data URL */
export const artUrl = (slug: string, tokenId: number) => {
  if (!parseCreated(slug)) return `/art/${slug}/${tokenId}.svg`
  const svg = drawCreated(slug, tokenId)
  return svg ? `data:image/svg+xml,${encodeURIComponent(svg)}` : ''
}

export const itemUrl = (slug: string, tokenId: number) => (parseCreated(slug) ? createdItemUrl(slug, tokenId) : `/item/${slug}/${tokenId}`)

export const collectionUrl = (slug: string) => `/collection/${slug}`

export const userUrl = (address: string) => `/user/${address.toLowerCase()}`
