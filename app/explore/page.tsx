import type { Metadata } from 'next'
import ExploreView from '@/components/explore/ExploreView'

export const metadata: Metadata = { title: 'Explore collections' }

export default function Explore() {
  return <ExploreView />
}
