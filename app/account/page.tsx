import type { Metadata } from 'next'
import AccountView, { type CollectionMeta, type Tab } from '@/components/account/AccountView'
import { getCollections } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Your profile' }

const TABS: Tab[] = ['collected', 'created', 'listings', 'offers', 'received', 'favorites', 'activity']

export default async function Account({ searchParams }: PageProps<'/account'>) {
  const { tab } = await searchParams
  // Just what the profile needs to name and value items
  const collections: Record<string, CollectionMeta> = Object.fromEntries(getCollections().map((c) => [c.slug, { name: c.name, floor: c.stats.floor, verified: c.verified }]))
  return <AccountView tab={TABS.find((t) => t === tab) ?? 'collected'} collections={collections} />
}
