import type { Metadata } from 'next'
import { Search as SearchIcon } from 'lucide-react'
import CollectionCard from '@/components/ui/CollectionCard'
import ItemCard from '@/components/ui/ItemCard'
import { getCollections } from '@/lib/catalog'
import { matchCollections, matchItemNumbers, type SearchCollection } from '@/lib/searchIndex'
import { artUrl } from '@/lib/urls'
import styles from '@/components/explore/Search.module.sass'

export const metadata: Metadata = { title: 'Search' }

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q: raw } = await searchParams
  const q = (typeof raw === 'string' ? raw : '').trim()
  const collections = getCollections()
  const index: SearchCollection[] = collections.map((c) => ({ slug: c.slug, name: c.name, avatar: artUrl(c.slug, c.featured), verified: c.verified, size: c.size, floor: c.stats.floor }))

  const foundCollections = q ? matchCollections(q, index).map((m) => collections.find((c) => c.slug === m.slug)!) : []
  const numbered = q ? matchItemNumbers(q, index) : []
  // Items with a matching trait value, e.g. "crown" or "laser"
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !/^\d+$/.test(w))
  const byTrait = words.length
    ? collections
        .flatMap((c) => c.items.map((i) => ({ c, i })))
        .filter(({ c, i }) => words.every((w) => Object.values(i.traits).some((v) => v.toLowerCase().includes(w)) || c.name.toLowerCase().includes(w)))
        .filter(({ c }) => !foundCollections.includes(c))
        .sort((a, b) => a.i.rank / a.c.size - b.i.rank / b.c.size)
        .slice(0, 48)
    : []
  const total = foundCollections.length + numbered.length + byTrait.length

  return (
    <div className="container">
      <form className={styles.form} action="/search">
        <SearchIcon size={20} />
        <input name="q" defaultValue={q} placeholder="Search collections, items or traits" autoFocus={!q} aria-label="Search" />
        <button type="submit">Search</button>
      </form>

      {q && (
        <p className={styles.summary}>
          {total === 0 ? 'No results for' : `${total} results for`} <strong>“{q}”</strong>
        </p>
      )}
      {q && total === 0 && <p className={styles.hint}>Try a collection name like “moonfolk”, an item like “pixel pals 20”, or a trait like “crown”.</p>}

      {foundCollections.length > 0 && (
        <section className={styles.section}>
          <h2>Collections</h2>
          <div className={styles.collections}>
            {foundCollections.map((c) => (
              <CollectionCard key={c.slug} collection={c} />
            ))}
          </div>
        </section>
      )}

      {numbered.length + byTrait.length > 0 && (
        <section className={styles.section}>
          <h2>Items</h2>
          <div className={styles.items}>
            {numbered.map((n) => {
              const item = collections.find((c) => c.slug === n.slug)!.items[n.tokenId - 1]
              return <ItemCard key={`${n.slug}-${n.tokenId}`} slug={n.slug} tokenId={n.tokenId} name={n.name} rank={item.rank} price={item.price} lastSale={item.lastSale?.price ?? null} />
            })}
            {byTrait.map(({ c, i }) => (
              <ItemCard key={`${c.slug}-${i.tokenId}`} slug={c.slug} tokenId={i.tokenId} name={i.name} rank={i.rank} price={i.price} lastSale={i.lastSale?.price ?? null} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
