import { weighted } from '../rng'
import { svg, type ArtStyle } from './types'

const BG = { Butter: '#ffe9a8', Cloud: '#e6ecf5', Coral: '#ffb4a2', Pistachio: '#c9e4b4', Periwinkle: '#c3c8f5', Ink: '#232737', Tangerine: '#ffbe76' } as const
const SKIN = { Moon: '#f5f1e6', Sun: '#ffd07a', Clay: '#d9926b', Cocoa: '#8a5a44', Mint: '#9de0c3', Lavender: '#c7b2f2', Stone: '#a7acb8' } as const
const HAT_COLORS = ['#e5484d', '#2081e2', '#12a150', '#1b1d24', '#ff9f43', '#8e6cf0']

/** Flat, friendly faces */
export const moonfolk: ArtStyle = {
  traits: (rng) => ({
    Background: weighted(rng, [['Butter', 16], ['Cloud', 16], ['Coral', 14], ['Pistachio', 14], ['Periwinkle', 14], ['Tangerine', 14], ['Ink', 8]]),
    Skin: weighted(rng, [['Moon', 18], ['Sun', 16], ['Clay', 16], ['Cocoa', 16], ['Mint', 10], ['Lavender', 10], ['Stone', 8]]),
    Head: weighted(rng, [['Round', 50], ['Square', 30], ['Tall', 20]]),
    Eyes: weighted(rng, [['Dots', 32], ['Happy', 22], ['Wink', 14], ['Sunglasses', 14], ['Visor', 6], ['Sleepy', 12]]),
    Mouth: weighted(rng, [['Smile', 36], ['Grin', 22], ['Flat', 18], ['Surprised', 12], ['Tongue', 12]]),
    Hat: weighted(rng, [['None', 30], ['Beanie', 18], ['Cap', 18], ['Bucket', 12], ['Headphones', 12], ['Crown', 4], ['Party', 6]]),
    Extra: weighted(rng, [['None', 50], ['Blush', 20], ['Freckles', 16], ['Earring', 10], ['Scar', 4]]),
  }),
  draw: (t, rng) => {
    const skin = SKIN[t.Skin as keyof typeof SKIN]
    const ink = '#1b1d24'
    const hat = HAT_COLORS[Math.floor(rng() * HAT_COLORS.length)]
    const parts: string[] = [`<rect width="400" height="400" fill="${BG[t.Background as keyof typeof BG]}"/>`]
    // Shoulders and neck
    parts.push(`<path d="M80 400c0-70 54-110 120-110s120 40 120 110z" fill="${hat}"/>`, `<rect x="172" y="250" width="56" height="60" rx="10" fill="${skin}"/>`)
    // Head
    if (t.Head === 'Round') parts.push(`<circle cx="200" cy="185" r="105" fill="${skin}"/>`)
    if (t.Head === 'Square') parts.push(`<rect x="98" y="82" width="204" height="204" rx="44" fill="${skin}"/>`)
    if (t.Head === 'Tall') parts.push(`<rect x="112" y="62" width="176" height="230" rx="80" fill="${skin}"/>`)
    // Eyes
    const eyes: Record<string, string> = {
      Dots: `<circle cx="160" cy="180" r="11" fill="${ink}"/><circle cx="240" cy="180" r="11" fill="${ink}"/>`,
      Happy: `<path d="M144 184q16-20 32 0M224 184q16-20 32 0" stroke="${ink}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
      Wink: `<circle cx="160" cy="180" r="11" fill="${ink}"/><path d="M226 182h30" stroke="${ink}" stroke-width="9" stroke-linecap="round"/>`,
      Sunglasses: `<rect x="128" y="162" width="62" height="40" rx="12" fill="${ink}"/><rect x="210" y="162" width="62" height="40" rx="12" fill="${ink}"/><rect x="186" y="174" width="28" height="8" fill="${ink}"/>`,
      Visor: `<rect x="120" y="160" width="160" height="44" rx="22" fill="#2bd4e0"/><rect x="132" y="170" width="60" height="10" rx="5" fill="#ffffff88"/>`,
      Sleepy: `<path d="M146 186q14 10 28 0M226 186q14 10 28 0" stroke="${ink}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    }
    parts.push(eyes[t.Eyes])
    // Mouth
    const mouths: Record<string, string> = {
      Smile: `<path d="M168 232q32 28 64 0" stroke="${ink}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
      Grin: `<path d="M160 226h80q-8 40-40 40t-40-40z" fill="${ink}"/><path d="M168 228h64v10h-64z" fill="#fff"/>`,
      Flat: `<path d="M176 238h48" stroke="${ink}" stroke-width="9" stroke-linecap="round"/>`,
      Surprised: `<ellipse cx="200" cy="240" rx="16" ry="20" fill="${ink}"/>`,
      Tongue: `<path d="M168 230q32 26 64 0" stroke="${ink}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M190 244h20v10a10 10 0 0 1-20 0z" fill="#ff6b81"/>`,
    }
    parts.push(mouths[t.Mouth])
    // Extras
    if (t.Extra === 'Blush') parts.push(`<circle cx="138" cy="220" r="14" fill="#ff8fa3" opacity=".6"/><circle cx="262" cy="220" r="14" fill="#ff8fa3" opacity=".6"/>`)
    if (t.Extra === 'Freckles') parts.push(`<g fill="${ink}" opacity=".35"><circle cx="146" cy="212" r="3"/><circle cx="158" cy="220" r="3"/><circle cx="142" cy="224" r="3"/><circle cx="254" cy="212" r="3"/><circle cx="242" cy="220" r="3"/><circle cx="258" cy="224" r="3"/></g>`)
    if (t.Extra === 'Earring') parts.push(`<circle cx="${t.Head === 'Tall' ? 112 : 98}" cy="230" r="9" fill="none" stroke="#ffc107" stroke-width="6"/>`)
    if (t.Extra === 'Scar') parts.push(`<path d="M232 150l20 50" stroke="#c0392b" stroke-width="6" stroke-linecap="round"/>`)
    // Hat
    const top = t.Head === 'Tall' ? 62 : t.Head === 'Square' ? 82 : 80
    const hats: Record<string, string> = {
      None: '',
      Beanie: `<path d="M106 ${top + 52}a94 94 0 0 1 188 0z" fill="${hat}"/><rect x="100" y="${top + 44}" width="200" height="24" rx="12" fill="${hat}"/><circle cx="200" cy="${top - 34}" r="16" fill="${hat}"/>`,
      Cap: `<path d="M104 ${top + 50}a96 90 0 0 1 192 0z" fill="${hat}"/><rect x="200" y="${top + 38}" width="130" height="18" rx="9" fill="${hat}"/>`,
      Bucket: `<path d="M120 ${top + 40}q80-90 160 0z" fill="${hat}"/><rect x="88" y="${top + 34}" width="224" height="20" rx="10" fill="${hat}"/>`,
      Headphones: `<path d="M96 ${top + 110}a104 104 0 0 1 208 0" stroke="${ink}" stroke-width="14" fill="none"/><rect x="78" y="${top + 96}" width="34" height="64" rx="14" fill="${hat}"/><rect x="288" y="${top + 96}" width="34" height="64" rx="14" fill="${hat}"/>`,
      Crown: `<path d="M136 ${top + 20}l20-48 44 34 44-34 20 48z" fill="#ffc107"/><circle cx="200" cy="${top - 10}" r="8" fill="#e5484d"/>`,
      Party: `<path d="M170 ${top + 16}l30-92 30 92z" fill="${hat}"/><circle cx="200" cy="${top - 78}" r="12" fill="#ffd23f"/>`,
    }
    parts.push(hats[t.Hat])
    return svg(parts.join(''))
  },
}
