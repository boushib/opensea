/** A small seeded random number generator, so demo data is the same on every visit */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A stable 32-bit number from a string */
export const hash = (text: string) => {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export type Rng = ReturnType<typeof mulberry32>

export const rngFor = (...parts: Array<string | number>) => mulberry32(hash(parts.join(':')))

export const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)]

export const between = (rng: Rng, min: number, max: number) => min + rng() * (max - min)

export const intBetween = (rng: Rng, min: number, max: number) => Math.floor(between(rng, min, max + 1))

/** Picks from [value, weight] pairs; heavier weights come up more often */
export const weighted = <T>(rng: Rng, options: ReadonlyArray<readonly [T, number]>): T => {
  const total = options.reduce((s, [, w]) => s + w, 0)
  let r = rng() * total
  for (const [value, w] of options) {
    r -= w
    if (r <= 0) return value
  }
  return options[options.length - 1][0]
}
