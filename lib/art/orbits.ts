import { between, intBetween, pick, weighted } from '../rng'
import { svg, type ArtStyle } from './types'

const SCHEMES = {
  Midnight: { bg: '#0f1226', ring: '#3b4270', planets: ['#ffd166', '#ef476f', '#06d6a0', '#7bdff2'] },
  Dawn: { bg: '#fff4e6', ring: '#f2c9a0', planets: ['#ff6b35', '#3d405b', '#81b29a', '#f2cc8f'] },
  Nebula: { bg: '#24123d', ring: '#5b3a8a', planets: ['#f72585', '#4cc9f0', '#ffd60a', '#b5179e'] },
  Arctic: { bg: '#eef6fb', ring: '#bcd8ea', planets: ['#1d4e89', '#00b2ca', '#f79256', '#7dcfb6'] },
  Ember: { bg: '#1c1714', ring: '#4a3a30', planets: ['#ff7b00', '#ffb703', '#e63946', '#f1faee'] },
} as const

/** Planets on concentric orbits around a sun */
export const orbits: ArtStyle = {
  traits: (rng) => ({
    Scheme: weighted(rng, [['Midnight', 26], ['Dawn', 22], ['Arctic', 22], ['Nebula', 18], ['Ember', 12]]),
    Orbits: weighted(rng, [['3', 30], ['4', 35], ['5', 25], ['6', 10]]),
    Sun: weighted(rng, [['Yellow', 50], ['White dwarf', 20], ['Red giant', 22], ['Black hole', 8]]),
    Moons: weighted(rng, [['None', 40], ['One', 35], ['Many', 25]]),
  }),
  draw: (t, rng) => {
    const c = SCHEMES[t.Scheme as keyof typeof SCHEMES]
    const n = Number(t.Orbits)
    const out: string[] = [`<rect width="400" height="400" fill="${c.bg}"/>`]
    // Stars
    for (let i = 0; i < 40; i++) out.push(`<circle cx="${between(rng, 0, 400).toFixed(1)}" cy="${between(rng, 0, 400).toFixed(1)}" r="${between(rng, 0.6, 1.8).toFixed(1)}" fill="${c.ring}"/>`)
    const sun = { Yellow: ['#ffd166', 34], 'White dwarf': ['#f8f9fa', 20], 'Red giant': ['#ef476f', 46], 'Black hole': ['#000000', 30] }[t.Sun] as [string, number]
    if (t.Sun === 'Black hole') out.push(`<circle cx="200" cy="200" r="44" fill="none" stroke="#ffb703" stroke-width="6"/>`)
    out.push(`<circle cx="200" cy="200" r="${sun[1]}" fill="${sun[0]}"/>`)
    for (let i = 0; i < n; i++) {
      const r = 70 + i * (120 / n) + 10
      out.push(`<circle cx="200" cy="200" r="${r.toFixed(1)}" fill="none" stroke="${c.ring}" stroke-width="2"/>`)
      const a = between(rng, 0, Math.PI * 2)
      const px = 200 + Math.cos(a) * r
      const py = 200 + Math.sin(a) * r
      const pr = intBetween(rng, 7, 16)
      out.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${pr}" fill="${pick(rng, c.planets)}"/>`)
      const moons = t.Moons === 'None' ? 0 : t.Moons === 'One' ? (i === 0 ? 1 : 0) : rng() < 0.5 ? 1 : 0
      for (let m = 0; m < moons; m++) out.push(`<circle cx="${(px + pr + 7).toFixed(1)}" cy="${(py - pr).toFixed(1)}" r="4" fill="${c.ring}"/>`)
    }
    return svg(out.join(''))
  },
}
