import { intBetween, weighted } from '../rng'
import { svg, type ArtStyle } from './types'

const ELEMENTS = {
  Fire: { main: '#ff5a36', soft: '#ffd2c2', dark: '#7a1f0e' },
  Water: { main: '#2f80ed', soft: '#cfe2ff', dark: '#103a75' },
  Earth: { main: '#4caf50', soft: '#d6f0d6', dark: '#1f4d22' },
  Air: { main: '#a0aec0', soft: '#f1f4f8', dark: '#3c4656' },
  Void: { main: '#8b5cf6', soft: '#e7dcff', dark: '#311a6b' },
} as const

const FRAMES = { Common: '#c9ccd3', Rare: '#4aa3ff', Epic: '#b06cff', Legendary: '#ffb020' } as const

const GLYPHS: Record<string, string> = {
  Sun: '<circle cx="200" cy="175" r="44"/><g stroke-width="10" stroke-linecap="round"><path d="M200 105v-20M200 265v-20M130 175h-20M290 175h-20M150 125l-14-14M250 125l14-14M150 225l-14 14M250 225l14 14"/></g>',
  Moon: '<path d="M226 120a62 62 0 1 0 0 110 50 50 0 1 1 0-110z"/>',
  Star: '<path d="M200 105l21 45 49 6-36 34 10 49-44-24-44 24 10-49-36-34 49-6z"/>',
  Bolt: '<path d="M214 100l-64 90h46l-18 70 72-98h-48z"/>',
  Eye: '<path d="M120 175q80-80 160 0-80 80-160 0z"/><circle cx="200" cy="175" r="24" fill="#fff"/>',
  Tree: '<path d="M200 100l56 80h-30l40 50h-132l40-50h-30z"/><rect x="188" y="230" width="24" height="30"/>',
}

/** Collectible game cards with an element, a glyph and stats */
export const glyphCards: ArtStyle = {
  traits: (rng) => ({
    Element: weighted(rng, [['Fire', 24], ['Water', 24], ['Earth', 22], ['Air', 18], ['Void', 12]]),
    Glyph: weighted(rng, [['Sun', 18], ['Moon', 18], ['Star', 18], ['Bolt', 16], ['Tree', 18], ['Eye', 12]]),
    Rarity: weighted(rng, [['Common', 55], ['Rare', 28], ['Epic', 13], ['Legendary', 4]]),
    Power: String(intBetween(rng, 1, 10)),
  }),
  draw: (t) => {
    const e = ELEMENTS[t.Element as keyof typeof ELEMENTS]
    const frame = FRAMES[t.Rarity as keyof typeof FRAMES]
    const power = Number(t.Power)
    return svg(
      `<rect width="400" height="400" fill="${e.soft}"/>` +
        `<rect x="70" y="30" width="260" height="340" rx="22" fill="${frame}"/>` +
        `<rect x="82" y="42" width="236" height="316" rx="14" fill="#ffffff"/>` +
        `<rect x="94" y="54" width="212" height="230" rx="10" fill="${e.main}"/>` +
        `<g fill="${e.dark}" stroke="${e.dark}">${GLYPHS[t.Glyph]}</g>` +
        `<rect x="94" y="296" width="212" height="12" rx="6" fill="${e.soft}"/>` +
        `<rect x="94" y="296" width="${(212 * power) / 10}" height="12" rx="6" fill="${e.main}"/>` +
        `<g fill="${frame}">${Array.from({ length: t.Rarity === 'Legendary' ? 4 : t.Rarity === 'Epic' ? 3 : t.Rarity === 'Rare' ? 2 : 1 }, (_, i) => `<circle cx="${200 - 30 + i * 20}" cy="334" r="6"/>`).join('')}</g>`,
    )
  },
}
