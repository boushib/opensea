import type { Metadata } from 'next'
import { Suspense } from 'react'
import AccountView, { type CollectionMeta } from '@/components/account/AccountView'
import { getCollections } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Your profile' }

export default function Account() {
  // Just what the profile needs to name and value items
  const collections: Record<string, CollectionMeta> = Object.fromEntries(getCollections().map((c) => [c.slug, { name: c.name, floor: c.stats.floor, verified: c.verified }]))
  // The tab comes from ?tab= in the browser, so the page itself stays static
  return (
    <Suspense>
      <AccountView collections={collections} />
    </Suspense>
  )
}
