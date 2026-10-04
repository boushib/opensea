import { MAX_SUPPLY, parseCreated } from '../created'
import { rngFor } from '../rng'
import { blockBloom } from './blockBloom'
import { glyphCards } from './glyphCards'
import { moonfolk } from './moonfolk'
import { orbits } from './orbits'
import { pixelPals } from './pixelPals'
import { sonicWaves } from './sonicWaves'
import { terraPlots } from './terraPlots'
import type { ArtStyle } from './types'

/**
 * Drawing for collections people create. They live in the browser, so their art is drawn there too,
 * with the same styles and seeds as the catalog. Small on purpose: it doesn't pull in the catalog.
 */
const ART: Record<string, ArtStyle> = {
  'pixel-pals': pixelPals,
  moonfolk,
  'block-bloom': blockBloom,
  'orbit-studies': orbits,
  'terra-plots': terraPlots,
  'sonic-waves': sonicWaves,
  'glyph-cards': glyphCards,
}

const styleFor = (slug: string, tokenId: number) => {
  const created = parseCreated(slug)
  return created && Number.isInteger(tokenId) && tokenId >= 1 && tokenId <= MAX_SUPPLY ? (ART[created.style] ?? null) : null
}

/** An item's traits in a collection someone created */
export const createdTraits = (slug: string, tokenId: number) => {
  const style = styleFor(slug, tokenId)
  return style ? style.traits(rngFor(slug, 'traits', tokenId)) : null
}

/** An item's art in a collection someone created, as an SVG string */
export const drawCreated = (slug: string, tokenId: number) => {
  const style = styleFor(slug, tokenId)
  return style ? style.draw(style.traits(rngFor(slug, 'traits', tokenId)), rngFor(slug, 'art', tokenId)) : null
}
