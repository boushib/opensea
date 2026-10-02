import { weighted } from '../rng'
import { svg, type ArtStyle } from './types'

const BACKGROUNDS = { Sky: '#9fd3f7', Mint: '#a8e6cf', Peach: '#ffc8a2', Lilac: '#cdb4f5', Sand: '#f1e3b8', Slate: '#3b4252', Rose: '#f7b2c4', Night: '#1f2437' } as const
const BODIES = { Lime: '#8fd14f', Tangerine: '#ff9f43', Berry: '#e8547a', Ocean: '#3a8ee6', Grape: '#8e6cf0', Lemon: '#ffd23f', Ghost: '#eef0f5', Coal: '#2c2f38' } as const

const N = 12

/** 12×12 pixel creatures, mirrored left to right */
export const pixelPals: ArtStyle = {
  traits: (rng) => ({
    Background: weighted(rng, [['Sky', 16], ['Mint', 16], ['Peach', 14], ['Lilac', 14], ['Sand', 14], ['Rose', 12], ['Slate', 9], ['Night', 5]]),
    Body: weighted(rng, [['Lime', 16], ['Tangerine', 16], ['Berry', 14], ['Ocean', 14], ['Grape', 12], ['Lemon', 12], ['Ghost', 9], ['Coal', 7]]),
    Eyes: weighted(rng, [['Dots', 40], ['Wide', 25], ['Sleepy', 20], ['Laser', 6], ['Shades', 9]]),
    Mouth: weighted(rng, [['Smile', 40], ['Flat', 25], ['Fangs', 15], ['Open', 20]]),
    Headwear: weighted(rng, [['None', 38], ['Cap', 18], ['Antenna', 16], ['Crown', 6], ['Halo', 7], ['Horns', 15]]),
    Pattern: weighted(rng, [['Plain', 55], ['Spots', 25], ['Belly', 20]]),
  }),
  draw: (t, rng) => {
    const px = 400 / N
    const cells: Array<[number, number, string]> = []
    const set = (x: number, y: number, color: string) => {
      cells.push([x, y, color])
      if (x !== N - 1 - x) cells.push([N - 1 - x, y, color])
    }
    const body = BODIES[t.Body as keyof typeof BODIES]
    const dark = t.Body === 'Coal' ? '#f4f4f6' : '#1b1d24'
    // Body: a solid core with random edges, so every creature has its own outline
    for (let y = 3; y <= 10; y++) {
      for (let x = 0; x < N / 2; x++) {
        const core = x >= 3 && y >= 4 && y <= 9
        const edge = x >= 2 && rng() < (y === 3 || y === 10 ? 0.45 : 0.7)
        const arm = x === 1 && (y === 6 || y === 7) && rng() < 0.6
        if (core || edge || arm) set(x, y, body)
      }
    }
    if (t.Pattern === 'Belly') for (let y = 7; y <= 9; y++) { set(5, y, '#ffffff99'); set(4, y, '#ffffff66') }
    if (t.Pattern === 'Spots') {
      set(3, 5, '#00000026')
      set(4, 9, '#00000026')
    }
    // Eyes
    if (t.Eyes === 'Dots') set(4, 5, dark)
    if (t.Eyes === 'Wide') { set(4, 5, '#ffffff'); set(4, 6, dark) }
    if (t.Eyes === 'Sleepy') { set(4, 6, dark); set(3, 6, dark) }
    if (t.Eyes === 'Laser') { set(4, 5, '#ff2d55'); set(3, 5, '#ff8fa3') }
    if (t.Eyes === 'Shades') for (let x = 2; x <= 5; x++) set(x, 5, '#111318')
    // Mouth
    if (t.Mouth === 'Smile') { set(4, 8, dark); set(5, 8, dark); set(3, 7, dark) }
    if (t.Mouth === 'Flat') { set(4, 8, dark); set(5, 8, dark) }
    if (t.Mouth === 'Fangs') { set(5, 8, dark); set(4, 8, dark); set(4, 9, '#ffffff') }
    if (t.Mouth === 'Open') { set(5, 8, dark); set(5, 9, '#e8547a') }
    // Headwear
    if (t.Headwear === 'Cap') for (let x = 2; x <= 5; x++) { set(x, 3, '#e5484d'); set(x, 2, '#e5484d') }
    if (t.Headwear === 'Antenna') { set(4, 2, dark); set(4, 1, '#ffd23f') }
    if (t.Headwear === 'Crown') { set(3, 2, '#ffc107'); set(5, 2, '#ffc107'); set(3, 1, '#ffc107'); set(5, 1, '#ffc107'); set(4, 2, '#ffc107') }
    if (t.Headwear === 'Halo') for (let x = 3; x <= 5; x++) set(x, 1, '#ffe066')
    if (t.Headwear === 'Horns') { set(2, 2, '#f4f4f6'); set(2, 1, '#f4f4f6') }

    const rects = cells.map(([x, y, c]) => `<rect x="${(x * px).toFixed(2)}" y="${(y * px).toFixed(2)}" width="${(px + 0.5).toFixed(2)}" height="${(px + 0.5).toFixed(2)}" fill="${c}"/>`).join('')
    return svg(`<rect width="400" height="400" fill="${BACKGROUNDS[t.Background as keyof typeof BACKGROUNDS]}"/><g shape-rendering="crispEdges">${rects}</g>`)
  },
}

