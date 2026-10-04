import type { Metadata } from 'next'
import { Suspense } from 'react'
import CreatedCollection from '@/components/create/CreatedCollection'

export const metadata: Metadata = { title: 'Your collection' }

// Collections you create live in your browser, so this page reads which one from ?c=
export default function Created() {
  return (
    <Suspense>
      <CreatedCollection />
    </Suspense>
  )
}
