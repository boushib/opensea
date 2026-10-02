import { hash, mulberry32 } from './rng'

/** A 5×5 mirrored pattern from an address, as an SVG data URL, like classic wallet identicons */
export const identicon = (address: string) => {
  const rng = mulberry32(hash(address.toLowerCase()))
  const hue = Math.floor(rng() * 360)
  const fg = `hsl(${hue} 65% 52%)`
  const bg = `hsl(${(hue + 180) % 360} 45% 92%)`
  let cells = ''
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 3; x++)
      if (rng() < 0.5) {
        cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`
        if (x < 2) cells += `<rect x="${4 - x}" y="${y}" width="1" height="1"/>`
      }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 6 6" shape-rendering="crispEdges"><rect x="-0.5" y="-0.5" width="6" height="6" fill="${bg}"/><g fill="${fg}">${cells}</g></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
