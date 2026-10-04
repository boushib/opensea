import type { Metadata } from 'next'
import { Suspense } from 'react'
import CreatedItem from '@/components/create/CreatedItem'

export const metadata: Metadata = { title: 'Created item' }

// An item in a collection you created; ?c= and ?t= name it
export default function CreatedItemPage() {
  return (
    <Suspense>
      <CreatedItem />
    </Suspense>
  )
}
