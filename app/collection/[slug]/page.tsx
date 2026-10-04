import type { Metadata } from 'next'
import CollectionView from '@/components/collection/CollectionView'
import { getCollection, getCollections } from '@/lib/catalog'

// Every collection is built ahead of time
export const dynamicParams = false
export function generateStaticParams() {
  return getCollections().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/collection/[slug]'>): Promise<Metadata> {
  const c = getCollection((await params).slug)
  return c ? { title: c.name, description: c.description } : {}
}

export default async function CollectionPage({ params }: PageProps<'/collection/[slug]'>) {
  return <CollectionView slug={(await params).slug} view="items" />
}
