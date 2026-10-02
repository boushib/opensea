import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Analytics from '@/components/collection/Analytics'
import ActivityTable, { type ActivityRow } from '@/components/collection/ActivityTable'
import CollectionHeader from '@/components/collection/CollectionHeader'
import ItemsBrowser, { type BrowserItem } from '@/components/collection/ItemsBrowser'
import { collectionActivity } from '@/lib/activity'
import { dailyStats } from '@/lib/analytics'
import { getCollection, getCollections } from '@/lib/catalog'
import { person } from '@/lib/people'
import styles from '@/components/collection/Collection.module.sass'

export function generateStaticParams() {
  return getCollections().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/collection/[slug]'>): Promise<Metadata> {
  const c = getCollection((await params).slug)
  return c ? { title: c.name, description: c.description } : {}
}

export default async function CollectionPage({ params, searchParams }: PageProps<'/collection/[slug]'>) {
  const { slug } = await params
  const { tab } = await searchParams
  const c = getCollection(slug)
  if (!c) notFound()
  const view = tab === 'activity' || tab === 'analytics' ? tab : 'items'
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
          <Link href={`/collection/${slug}?tab=activity`} className={showActivity ? styles.tabActive : ''} scroll={false}>
            Activity
          </Link>
          <Link href={`/collection/${slug}?tab=analytics`} className={view === 'analytics' ? styles.tabActive : ''} scroll={false}>
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
