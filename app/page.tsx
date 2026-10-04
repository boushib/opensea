import Link from 'next/link'
import LiveAuctions from '@/components/auction/LiveAuctions'
import Featured, { type Slide } from '@/components/home/Featured'
import Trending, { type TrendingRow } from '@/components/home/Trending'
import CollectionCard from '@/components/ui/CollectionCard'
import ItemCard from '@/components/ui/ItemCard'
import { getAuctionLots } from '@/lib/auctionLots'
import { CATEGORIES, getCollections } from '@/lib/catalog'
import { artUrl } from '@/lib/urls'
import { ago, count, eth, pct } from '@/lib/format'
import styles from './home.module.sass'

export default function Home() {
  const collections = getCollections()
  const byVolume = [...collections].sort((a, b) => b.stats.volume7d - a.stats.volume7d)

  const slides: Slide[] = byVolume.slice(0, 5).map((c) => {
    const tiles = [...c.items].sort((a, b) => a.rank - b.rank).slice(0, 12).map((i) => artUrl(c.slug, i.tokenId))
    return {
      slug: c.slug,
      name: c.name,
      creator: c.creatorUser.name,
      verified: c.verified,
      avatar: artUrl(c.slug, c.featured),
      tiles,
      stats: [
        { label: 'Floor', value: `${eth(c.stats.floor)} ETH` },
        { label: 'Items', value: count(c.size) },
        { label: '7d volume', value: `${eth(c.stats.volume7d)} ETH` },
      ],
    }
  })

  const rows: TrendingRow[] = collections.map((c) => ({
    slug: c.slug,
    name: c.name,
    avatar: artUrl(c.slug, c.featured),
    verified: c.verified,
    floor: `${eth(c.stats.floor)} ETH`,
    owners: count(c.stats.owners),
    periods: {
      '24h': { volume: c.stats.volume24h, volumeLabel: `${eth(c.stats.volume24h)} ETH`, change: c.stats.change24h, changeLabel: pct(c.stats.change24h) },
      '7d': { volume: c.stats.volume7d, volumeLabel: `${eth(c.stats.volume7d)} ETH`, change: c.stats.change7d, changeLabel: pct(c.stats.change7d) },
      all: { volume: c.stats.volume, volumeLabel: `${eth(c.stats.volume)} ETH`, change: null, changeLabel: '—' },
    },
  }))

  // The latest sales across every collection, one per item
  const seen = new Set<string>()
  const recent = collections
    .flatMap((c) => c.sales.map((s) => ({ c, s })))
    .sort((a, b) => a.s.ageHours - b.s.ageHours)
    .filter(({ c, s }) => !seen.has(`${c.slug}-${s.tokenId}`) && seen.add(`${c.slug}-${s.tokenId}`))
    .slice(0, 12)

  return (
    <div className="container">
      <div className={styles.top}>
        <Featured slides={slides} />
      </div>

      <Trending rows={rows} />

      <section className={styles.section}>
        <div className={styles.head}>
          <h2>Live auctions</h2>
          <Link href="/auctions" className={styles.more}>
            View all
          </Link>
        </div>
        <LiveAuctions lots={getAuctionLots()} limit={8} className={styles.rail} />
      </section>

      <section className={styles.section}>
        <div className={styles.head}>
          <h2>Just sold</h2>
          <Link href="/explore" className={styles.more}>
            Explore
          </Link>
        </div>
        <div className={styles.rail}>
          {recent.map(({ c, s }) => {
            const item = c.items[s.tokenId - 1]
            return <ItemCard key={`${c.slug}-${s.tokenId}`} slug={c.slug} tokenId={s.tokenId} name={item.name} price={s.price} note={`Sold ${ago(s.ageHours)}`} />
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.head}>
          <h2>Notable collections</h2>
        </div>
        <div className={styles.grid}>
          {byVolume.map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.head}>
          <h2>Browse by category</h2>
        </div>
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => {
            const inCat = collections.filter((c) => c.category === cat.slug)
            const tiles = inCat.flatMap((c) => [...c.items].sort((a, b) => a.rank - b.rank).slice(0, 4).map((i) => artUrl(c.slug, i.tokenId))).slice(0, 4)
            return (
              <Link key={cat.slug} href={`/explore/${cat.slug}`} className={styles.category}>
                <div className={styles.categoryArt}>
                  {tiles.map((src) => (
                    <img key={src} src={src} alt="" loading="lazy" />
                  ))}
                </div>
                <strong>{cat.name}</strong>
                <span>{cat.blurb}</span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
