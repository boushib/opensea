// Collection names for client code, which doesn't load the catalog (kept in sync with lib/catalog.ts)
export const COLLECTION_NAMES: Record<string, string> = {
  'pixel-pals': 'Pixel Pals',
  moonfolk: 'Moonfolk',
  'block-bloom': 'Block Bloom',
  'orbit-studies': 'Orbit Studies',
  'terra-plots': 'Terra Plots',
  'sonic-waves': 'Sonic Waves',
  'glyph-cards': 'Glyph Cards',
}

export const itemName = (slug: string, tokenId: number) => `${COLLECTION_NAMES[slug] ?? slug} #${tokenId}`
