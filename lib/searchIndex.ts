// Shared by the header suggestions (client) and the search page (server)
export type SearchCollection = { slug: string; name: string; avatar: string; verified: boolean; size: number; floor: number }

export type ItemHit = { slug: string; tokenId: number; name: string }

const words = (q: string) => q.toLowerCase().replace(/#/g, ' ').split(/\s+/).filter(Boolean)

/** Collections whose name contains every word of the query (ignoring a token number) */
export const matchCollections = (q: string, all: SearchCollection[]) => {
  const ws = words(q).filter((w) => !/^\d+$/.test(w))
  if (ws.length === 0) return []
  return all.filter((c) => ws.every((w) => c.name.toLowerCase().includes(w) || c.slug.includes(w)))
}

/** "moonfolk 12" or "#12" → matching items by token number */
export const matchItemNumbers = (q: string, all: SearchCollection[]): ItemHit[] => {
  const num = words(q).find((w) => /^\d+$/.test(w))
  if (!num) return []
  const id = Number(num)
  const named = matchCollections(q, all)
  return (named.length ? named : all).filter((c) => id >= 1 && id <= c.size).map((c) => ({ slug: c.slug, tokenId: id, name: `${c.name} #${id}` }))
}
