import type { Metadata } from 'next'
import UserProfile from '@/components/user/UserProfile'
import { everyone, findByAddress } from '@/lib/people'

// Every profile is built ahead of time
export const dynamicParams = false
export const generateStaticParams = () => everyone().map((u) => ({ address: u.address.toLowerCase() }))

export async function generateMetadata({ params }: PageProps<'/user/[address]'>): Promise<Metadata> {
  const user = findByAddress((await params).address)
  return user ? { title: user.name } : {}
}

export default async function UserPage({ params }: PageProps<'/user/[address]'>) {
  return <UserProfile address={(await params).address} />
}
