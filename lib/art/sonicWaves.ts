import { between, weighted } from '../rng'
import { svg, type ArtStyle } from './types'

const GENRES = {
  'Lo-fi': { bg: '#f4ece1', bars: ['#c08552', '#895737', '#5e3023'] },
  Techno: { bg: '#0d0d12', bars: ['#00f5d4', '#00bbf9', '#9b5de5'] },
  Jazz: { bg: '#1d2d44', bars: ['#f0ebd8', '#748cab', '#e9c46a'] },
  Ambient: { bg: '#e8f1f2', bars: ['#7fb7be', '#d3f3ee', '#13505b'] },
  'Hip-hop': { bg: '#ffbe0b', bars: ['#1b1b1e', '#fb5607', '#ff006e'] },
  Synthwave: { bg: '#2b0f54', bars: ['#ff6c11', '#ff3864', '#f9c80e'] },
} as const

/** A track drawn as a waveform */
export const sonicWaves: ArtStyle = {
  traits: (rng) => ({
    Genre: weighted(rng, [['Lo-fi', 22], ['Techno', 18], ['Ambient', 16], ['Jazz', 14], ['Hip-hop', 16], ['Synthwave', 14]]),
    Shape: weighted(rng, [['Bars', 45], ['Mirror', 35], ['Dots', 20]]),
    Tempo: weighted(rng, [['Slow', 30], ['Mid', 45], ['Fast', 25]]),
    Length: weighted(rng, [['Single', 50], ['Extended', 35], ['Album', 15]]),
  }),
  draw: (t, rng) => {
    const g = GENRES[t.Genre as keyof typeof GENRES]
    const count = t.Tempo === 'Slow' ? 18 : t.Tempo === 'Mid' ? 26 : 36
    const gap = 300 / count
    const out: string[] = [`<rect width="400" height="400" fill="${g.bg}"/>`]
    let level = between(rng, 0.3, 0.7)
    for (let i = 0; i < count; i++) {
      level = Math.min(1, Math.max(0.08, level + between(rng, -0.25, 0.25)))
      const hgt = level * 220
      const x = 50 + i * gap
      const color = g.bars[i % g.bars.length]
      const bw = Math.max(3, gap * 0.6)
      if (t.Shape === 'Bars') out.push(`<rect x="${x.toFixed(1)}" y="${(310 - hgt).toFixed(1)}" width="${bw.toFixed(1)}" height="${hgt.toFixed(1)}" rx="${(bw / 2).toFixed(1)}" fill="${color}"/>`)
      if (t.Shape === 'Mirror') out.push(`<rect x="${x.toFixed(1)}" y="${(200 - hgt / 2).toFixed(1)}" width="${bw.toFixed(1)}" height="${hgt.toFixed(1)}" rx="${(bw / 2).toFixed(1)}" fill="${color}"/>`)
      if (t.Shape === 'Dots')
        for (let d = 0; d < Math.round(level * 8); d++) out.push(`<circle cx="${(x + bw / 2).toFixed(1)}" cy="${310 - d * 26}" r="${(bw / 2).toFixed(1)}" fill="${color}"/>`)
    }
    return svg(out.join(''))
  },
}
