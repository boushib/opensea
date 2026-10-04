import { notFound } from 'next/navigation'
import Link from 'next/link'
import Analytics from './Analytics'
import ActivityTable, { type ActivityRow } from './ActivityTable'
import CollectionHeader from './CollectionHeader'
import ItemsBrowser, { type BrowserItem } from './ItemsBrowser'
import { collectionActivity } from '@/lib/activity'
import { dailyStats } from '@/lib/analytics'
import { getCollection } from '@/lib/catalog'
import { person } from '@/lib/people'
import styles from './Collection.module.sass'

export const COLLECTION_TABS = ['activity', 'analytics'] as const
export type CollectionTab = 'items' | (typeof COLLECTION_TABS)[number]

/** A collection's page; each tab is its own path (/collection/<slug>, /activity, /analytics) so it can be built ahead of time */
const CollectionView = ({ slug, view }: { slug: string; view: CollectionTab }) => {
  const c = getCollection(slug)
  if (!c) notFound()
  const showActivity = view === 'activity'

  const items: BrowserItem[] = c.items.map((i) => ({ tokenId: i.tokenId, name: i.name, rank: i.rank, price: i.price, lastSale: i.lastSale?.price ?? null, lastSaleAge: i.lastSale?.ageHours ?? null, traits: i.traits }))
  const activity: ActivityRow[] = showActivity
    ? collectionActivity(c)
        .slice(0, 150)
        .map((e) => ({ ...e, name: c.items[e.tokenId - 1].name, fromUser: person(e.from), toUser: person(e.to) }))
    : []

  return (
    <>
      <CollectionHeader collection={c} />
      <div className="container">
        <nav className={styles.tabs}>
          <Link href={`/collection/${slug}`} className={view === 'items' ? styles.tabActive : ''} scroll={false}>
            Items
          </Link>
          <Link href={`/collection/${slug}/activity`} className={showActivity ? styles.tabActive : ''} scroll={false}>
            Activity
          </Link>
          <Link href={`/collection/${slug}/analytics`} className={view === 'analytics' ? styles.tabActive : ''} scroll={false}>
            Analytics
          </Link>
        </nav>
        {view === 'activity' ? (
          <ActivityTable slug={slug} rows={activity} />
        ) : view === 'analytics' ? (
          <Analytics days={dailyStats(c)} />
        ) : (
          <ItemsBrowser slug={slug} items={items} traitCounts={c.traitCounts} />
        )}
      </div>
    </>
  )
}

export default CollectionView
