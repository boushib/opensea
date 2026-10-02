import Link from 'next/link'
import { userUrl } from '@/lib/urls'

/** A collector's name linking to their profile */
const UserLink = ({ user, className }: { user: { name: string; address: string } | null; className?: string }) =>
  user ? (
    <Link href={userUrl(user.address)} className={className}>
      {user.name}
    </Link>
  ) : (
    <span className={className}>—</span>
  )

export default UserLink
