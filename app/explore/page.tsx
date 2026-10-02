import type { Metadata } from 'next'
import Link from 'next/link'
import CollectionCard from '@/components/ui/CollectionCard'
import { CATEGORIES, getCollections } from '@/lib/catalog'
import styles from '@/components/explore/Explore.module.sass'

export const metadata: Metadata = { title: 'Explore collections' }

export default async function Explore({ searchParams }: PageProps<'/explore'>) {
  const { category } = await searchParams
  const active = CATEGORIES.find((c) => c.slug === category)
  const collections = getCollections()
    .filter((c) => !active || c.category === active.slug)
    .sort((a, b) => b.stats.volume - a.stats.volume)

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>{active ? active.name : 'Explore collections'}</h1>
        <p>{active ? active.blurb : 'Every collection on the marketplace, by total volume.'}</p>
      </header>
      <nav className={styles.chips} aria-label="Categories">
        <Link href="/explore" className={!active ? styles.chipOn : ''}>
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/explore?category=${c.slug}`} className={active?.slug === c.slug ? styles.chipOn : ''}>
            {c.name}
          </Link>
        ))}
      </nav>
      <div className={styles.grid}>
        {collections.map((c) => (
          <CollectionCard key={c.slug} collection={c} />
        ))}
      </div>
    </div>
  )
}
