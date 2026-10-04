import type { Metadata } from 'next'
import CollectionView, { COLLECTION_TABS, type CollectionTab } from '@/components/collection/CollectionView'
import { getCollection, getCollections } from '@/lib/catalog'

// The activity and analytics tabs of every collection, built ahead of time
export const dynamicParams = false
export const generateStaticParams = () => getCollections().flatMap((c) => COLLECTION_TABS.map((tab) => ({ slug: c.slug, tab })))

export async function generateMetadata({ params }: PageProps<'/collection/[slug]/[tab]'>): Promise<Metadata> {
  const { slug, tab } = await params
  const c = getCollection(slug)
  return c ? { title: `${c.name} ${tab}`, description: c.description } : {}
}

export default async function CollectionTabPage({ params }: PageProps<'/collection/[slug]/[tab]'>) {
  const { slug, tab } = await params
  return <CollectionView slug={slug} view={tab as CollectionTab} />
}
