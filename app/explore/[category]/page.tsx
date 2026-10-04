import type { Metadata } from 'next'
import ExploreView from '@/components/explore/ExploreView'
import { CATEGORIES } from '@/lib/catalog'

// One page per category, built ahead of time
export const dynamicParams = false
export const generateStaticParams = () => CATEGORIES.map((c) => ({ category: c.slug }))

export async function generateMetadata({ params }: PageProps<'/explore/[category]'>): Promise<Metadata> {
  const { category } = await params
  return { title: CATEGORIES.find((c) => c.slug === category)?.name ?? 'Explore collections' }
}

export default async function ExploreCategory({ params }: PageProps<'/explore/[category]'>) {
  return <ExploreView category={(await params).category} />
}
