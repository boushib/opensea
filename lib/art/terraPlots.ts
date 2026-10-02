import { weighted } from '../rng'
import { svg, type ArtStyle } from './types'

const TERRAIN = {
  Meadow: ['#7ccf6b', '#5aa64a', '#8b5e3c'],
  Desert: ['#f2d091', '#d9ad62', '#a87b46'],
  Tundra: ['#eef4f8', '#c8d8e4', '#8a9aa8'],
  Volcanic: ['#4a3f3f', '#2f2828', '#e85d04'],
  Lagoon: ['#5ec8d8', '#3aa3b5', '#2a7a88'],
} as const

const SKY = { Day: '#cfe8ff', Dusk: '#ffcfa8', Night: '#1b2140', Fog: '#e3e6ea' } as const

/** Isometric plots of land, some with a building */
export const terraPlots: ArtStyle = {
  traits: (rng) => ({
    Terrain: weighted(rng, [['Meadow', 34], ['Desert', 22], ['Lagoon', 18], ['Tundra', 16], ['Volcanic', 10]]),
    Structure: weighted(rng, [['Empty', 28], ['House', 24], ['Grove', 22], ['Tower', 14], ['Crystal', 7], ['Castle', 5]]),
    Sky: weighted(rng, [['Day', 40], ['Dusk', 25], ['Fog', 20], ['Night', 15]]),
    Size: weighted(rng, [['Small', 45], ['Medium', 35], ['Large', 20]]),
  }),
  draw: (t, rng) => {
    const [top, side, base] = TERRAIN[t.Terrain as keyof typeof TERRAIN]
    const w = t.Size === 'Small' ? 120 : t.Size === 'Medium' ? 150 : 175
    const h = w / 2
    const cx = 200
    const cy = 225
    const depth = 46
    const out: string[] = [`<rect width="400" height="400" fill="${SKY[t.Sky as keyof typeof SKY]}"/>`]
    if (t.Sky === 'Night') out.push(`<circle cx="320" cy="80" r="22" fill="#f8f4e3"/>`)
    if (t.Sky === 'Day') out.push(`<circle cx="320" cy="80" r="26" fill="#ffd166"/>`)
    // Block: top diamond and two side faces
    out.push(
      `<path d="M${cx - w} ${cy}L${cx} ${cy + h}L${cx} ${cy + h + depth}L${cx - w} ${cy + depth}z" fill="${side}"/>`,
      `<path d="M${cx + w} ${cy}L${cx} ${cy + h}L${cx} ${cy + h + depth}L${cx + w} ${cy + depth}z" fill="${base}"/>`,
      `<path d="M${cx} ${cy - h}L${cx + w} ${cy}L${cx} ${cy + h}L${cx - w} ${cy}z" fill="${top}"/>`,
    )
    const accent = ['#e63946', '#2081e2', '#ffb703', '#8e6cf0'][Math.floor(rng() * 4)]
    if (t.Structure === 'House')
      out.push(`<path d="M170 205l30 15 30-15v-40l-30-15-30 15z" fill="#f1f1f1"/><path d="M200 220v-40l30-15v40z" fill="#d4d4d8"/><path d="M165 166l35-34 35 34-35 17z" fill="${accent}"/>`)
    if (t.Structure === 'Tower')
      out.push(`<path d="M182 215l18 9 18-9v-110l-18-9-18 9z" fill="#e4e4e7"/><path d="M200 224v-110l18-9v110z" fill="#a1a1aa"/><path d="M178 105l22-36 22 36-22 11z" fill="${accent}"/>`)
    if (t.Structure === 'Grove')
      for (const [x, y] of [[160, 205], [200, 190], [235, 210], [195, 225]])
        out.push(`<rect x="${x - 3}" y="${y - 10}" width="6" height="16" fill="#7a4e2d"/><circle cx="${x}" cy="${y - 22}" r="16" fill="#2d6a4f"/>`)
    if (t.Structure === 'Crystal') out.push(`<path d="M200 110l26 60-26 48-26-48z" fill="#c77dff"/><path d="M200 110l26 60-26 48z" fill="#9d4edd"/>`)
    if (t.Structure === 'Castle')
      out.push(`<path d="M160 215l40 20 40-20v-60l-40 20-40-20z" fill="#d6d3d1"/><path d="M200 235v-60l40-20v60z" fill="#a8a29e"/><path d="M160 155v-20h12v10h12v-10h12v20" fill="#d6d3d1"/><path d="M196 140v-30h8v30z" fill="#57534e"/><path d="M204 110l20 6-20 6z" fill="${accent}"/>`)
    return svg(out.join(''))
  },
}
