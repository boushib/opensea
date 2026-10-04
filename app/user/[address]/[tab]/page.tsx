import type { Metadata } from 'next'
import UserProfile, { USER_TABS, type UserTab } from '@/components/user/UserProfile'
import { everyone, findByAddress, profileOf } from '@/lib/people'

// The created and activity tabs of every profile (created only for people who make collections)
export const dynamicParams = false
export const generateStaticParams = () =>
  everyone().flatMap((u) => USER_TABS.filter((tab) => tab !== 'created' || profileOf(u).created.length > 0).map((tab) => ({ address: u.address.toLowerCase(), tab })))

export async function generateMetadata({ params }: PageProps<'/user/[address]/[tab]'>): Promise<Metadata> {
  const user = findByAddress((await params).address)
  return user ? { title: user.name } : {}
}

export default async function UserTabPage({ params }: PageProps<'/user/[address]/[tab]'>) {
  const { address, tab } = await params
  return <UserProfile address={address} requested={tab as UserTab} />
}
