import { pick, weighted } from '../rng'
import { svg, type ArtStyle } from './types'

const PALETTES = {
  Bauhaus: ['#f2efe6', '#e63946', '#1d3557', '#f4a261', '#2a9d8f'],
  Sunset: ['#fff1e0', '#ff6b35', '#f7c59f', '#ef476f', '#3d2c8d'],
  Ocean: ['#eaf4f4', '#0b3954', '#087e8b', '#bfd7ea', '#ff5a5f'],
  Forest: ['#f4f1de', '#3d5a40', '#81b29a', '#e07a5f', '#f2cc8f'],
  Mono: ['#f5f5f5', '#111111', '#555555', '#bbbbbb', '#e63946'],
  Candy: ['#fff7fb', '#ff8fab', '#a0c4ff', '#caffbf', '#7b2cbf'],
} as const

/** Bauhaus-style tiles of quarter circles, half circles and triangles */
export const blockBloom: ArtStyle = {
  traits: (rng) => ({
    Palette: weighted(rng, [['Bauhaus', 22], ['Sunset', 20], ['Ocean', 20], ['Forest', 18], ['Candy', 12], ['Mono', 8]]),
    Grid: weighted(rng, [['3 × 3', 30], ['4 × 4', 45], ['5 × 5', 25]]),
    Motif: weighted(rng, [['Arcs', 40], ['Mixed', 35], ['Circles', 15], ['Triangles', 10]]),
  }),
  draw: (t, rng) => {
    const colors = PALETTES[t.Palette as keyof typeof PALETTES]
    const n = Number(t.Grid[0])
    const s = 400 / n
    const out: string[] = [`<rect width="400" height="400" fill="${colors[0]}"/>`]
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const x0 = x * s
        const y0 = y * s
        const bg = pick(rng, colors.slice(1))
        let fg = pick(rng, colors)
        if (fg === bg) fg = colors[0]
        out.push(`<rect x="${x0}" y="${y0}" width="${s + 0.5}" height="${s + 0.5}" fill="${bg}"/>`)
        const kind = t.Motif === 'Mixed' ? pick(rng, ['arc', 'circle', 'tri', 'half'] as const) : t.Motif === 'Arcs' ? pick(rng, ['arc', 'half'] as const) : t.Motif === 'Circles' ? 'circle' : 'tri'
        const corner = Math.floor(rng() * 4)
        const cx = x0 + (corner % 2 ? s : 0)
        const cy = y0 + (corner > 1 ? s : 0)
        if (kind === 'arc') {
          // A quarter circle in the chosen corner, bulging into the tile
          const dx = corner % 2 ? -1 : 1
          const dy = corner > 1 ? -1 : 1
          out.push(`<path d="M${cx} ${cy}L${cx + dx * s} ${cy}A${s} ${s} 0 0 ${dx * dy > 0 ? 1 : 0} ${cx} ${cy + dy * s}z" fill="${fg}"/>`)
        }
        if (kind === 'circle') out.push(`<circle cx="${x0 + s / 2}" cy="${y0 + s / 2}" r="${s * 0.34}" fill="${fg}"/>`)
        if (kind === 'tri') out.push(`<path d="M${x0} ${y0 + (corner % 2 ? 0 : s)}L${x0 + s} ${y0 + (corner % 2 ? s : 0)}L${x0 + (corner > 1 ? s : 0)} ${y0 + (corner > 1 ? s : 0)}z" fill="${fg}"/>`)
        if (kind === 'half') out.push(`<path d="M${x0} ${y0 + s / 2}a${s / 2} ${s / 2} 0 0 ${corner % 2} ${s} 0z" fill="${fg}"/>`)
      }
    return svg(out.join(''))
  },
}
