import type { Rng } from '../rng'

export type Traits = Record<string, string>

/**
 * A collection's art style: picks an item's traits from weighted options and
 * draws it as SVG from those traits. The same seed always gives the same item.
 */
export type ArtStyle = {
  traits: (rng: Rng) => Traits
  draw: (traits: Traits, rng: Rng) => string
}

export const svg = (body: string, size = 400) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision">${body}</svg>`
