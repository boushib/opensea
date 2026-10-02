import type { Metadata } from 'next'
import RankingsTable, { type RankingRow } from '@/components/explore/RankingsTable'
import { CATEGORIES, getCollections } from '@/lib/catalog'
import { artUrl } from '@/lib/urls'
import styles from '@/components/explore/Explore.module.sass'

export const metadata: Metadata = { title: 'Collection rankings' }

export default async function Rankings({ searchParams }: PageProps<'/rankings'>) {
  const { sort } = await searchParams
  const rows: RankingRow[] = getCollections().map((c) => {
    const within = (hours: number) => c.sales.filter((s) => s.ageHours < hours)
    return {
      slug: c.slug,
      name: c.name,
      avatar: artUrl(c.slug, c.featured),
      verified: c.verified,
      category: CATEGORIES.find((k) => k.slug === c.category)!.name,
      floor: c.stats.floor,
      owners: c.stats.owners,
      items: c.size,
      periods: {
        '24h': { volume: c.stats.volume24h, change: c.stats.change24h, sales: within(24).length },
        '7d': { volume: c.stats.volume7d, change: c.stats.change7d, sales: within(168).length },
        all: { volume: c.stats.volume, change: null, sales: c.sales.length },
      },
    }
  })

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Collection rankings</h1>
        <p>Top collections by volume, floor price and more. Click a column to sort.</p>
      </header>
      <RankingsTable rows={rows} initialSort={sort === 'change' ? 'change' : 'volume'} />
    </div>
  )
}
