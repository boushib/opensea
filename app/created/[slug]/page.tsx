import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CreatedCollection from '@/components/create/CreatedCollection'
import { parseCreated } from '@/lib/created'

export const metadata: Metadata = { title: 'Your collection' }

export default async function Created({ params }: PageProps<'/created/[slug]'>) {
  const { slug } = await params
  if (!parseCreated(slug)) notFound()
  return <CreatedCollection slug={slug} />
}
