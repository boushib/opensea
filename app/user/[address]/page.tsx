import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShoppingCart, Tag } from 'lucide-react'
import OwnProfileRedirect from '@/components/user/OwnProfileRedirect'
import CollectionCard from '@/components/ui/CollectionCard'
import ItemCard from '@/components/ui/ItemCard'
import Verified from '@/components/ui/Verified'
import { ago, count, eth } from '@/lib/format'
import { identicon } from '@/lib/identicon'
import { findByAddress, person, profileOf } from '@/lib/people'
import { hash } from '@/lib/rng'
import { artUrl, itemUrl, userUrl } from '@/lib/urls'
import { shortAddress } from '@/lib/users'
import styles from '@/components/account/Account.module.sass'

type Tab = 'collected' | 'created' | 'activity'

export async function generateMetadata({ params }: PageProps<'/user/[address]'>): Promise<Metadata> {
  const user = findByAddress((await params).address)
  return user ? { title: user.name } : {}
}

export default async function UserPage({ params, searchParams }: PageProps<'/user/[address]'>) {
  const { address } = await params
  const { tab: rawTab } = await searchParams
  const user = findByAddress(address)
  if (!user) notFound()
  const p = profileOf(user)
  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: 'collected', label: 'Collected', count: p.owned.length },
    ...(p.created.length ? [{ key: 'created' as const, label: 'Created', count: p.created.length }] : []),
    { key: 'activity', label: 'Activity', count: p.trades.length },
  ]
  const tab = tabs.find((t) => t.key === rawTab)?.key ?? (p.created.length && !p.owned.length ? 'created' : 'collected')
  const base = userUrl(user.address)

  return (
    <div>
      {/* Your own address opens your profile, with your browser activity */}
      <OwnProfileRedirect address={user.address} />
      <div className={styles.banner} style={{ backgroundColor: `hsl(${hash(user.address) % 360} 42% 72%)` }} />
      <div className={`container ${styles.intro}`}>
        <img src={identicon(user.address)} alt="" className={styles.avatar} />
        <h1 className={styles.name}>
          {user.name} {user.verified && <Verified size={22} />}
        </h1>
        <div className={styles.meta}>
          <span className={`mono ${styles.addressText}`}>{user.anonymous ? user.address : shortAddress(user.address)}</span>
        </div>
        <dl className={styles.stats}>
          <div>
            <dd className="mono">{count(p.owned.length)}</dd>
            <dt>Items</dt>
          </div>
          <div>
            <dd className="mono">{eth(p.value)} ETH</dd>
            <dt>Estimated value</dt>
          </div>
          <div>
            <dd className="mono">{eth(p.volume)} ETH</dd>
            <dt>Volume traded (90d)</dt>
          </div>
          {p.created.length > 0 && (
            <div>
              <dd className="mono">{p.created.length}</dd>
              <dt>Collections</dt>
            </div>
          )}
        </dl>

        <nav className={styles.tabs}>
          {tabs.map((t) => (
            <Link key={t.key} href={t.key === 'collected' ? base : `${base}?tab=${t.key}`} className={t.key === tab ? styles.tabOn : ''} scroll={false}>
              {t.label} <em>{t.count}</em>
            </Link>
          ))}
        </nav>

        {tab === 'collected' &&
          (p.owned.length === 0 ? (
            <p className={styles.emptyText}>No items right now.</p>
          ) : (
            <div className={styles.grid}>
              {p.owned.map(({ collection: c, item }) => (
                <ItemCard key={`${c.slug}-${item.tokenId}`} slug={c.slug} tokenId={item.tokenId} name={item.name} rank={item.rank} price={item.price} lastSale={item.lastSale?.price ?? null} />
              ))}
            </div>
          ))}

        {tab === 'created' && (
          <div className={styles.collectionGrid}>
            {p.created.map((c) => (
              <CollectionCard key={c.slug} collection={c} />
            ))}
          </div>
        )}

        {tab === 'activity' &&
          (p.trades.length === 0 ? (
            <p className={styles.emptyText}>No trades in the last 90 days.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Item</th>
                    <th>Price</th>
                    <th>With</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {p.trades.slice(0, 100).map((t, i) => {
                    const other = person(t.side === 'bought' ? t.from : t.to)
                    return (
                      <tr key={i}>
                        <td>
                          <span className={styles.event}>
                            {t.side === 'bought' ? <ShoppingCart size={16} /> : <Tag size={16} />} {t.side === 'bought' ? 'Bought' : 'Sold'}
                          </span>
                        </td>
                        <td>
                          <Link href={itemUrl(t.collection.slug, t.tokenId)} className={styles.item}>
                            <img src={artUrl(t.collection.slug, t.tokenId)} alt="" />
                            {t.collection.items[t.tokenId - 1].name}
                          </Link>
                        </td>
                        <td className="mono">{eth(t.price)} ETH</td>
                        <td>{other ? <Link href={userUrl(other.address)} className={styles.link}>{other.name}</Link> : '—'}</td>
                        <td className={styles.muted}>{ago(t.ageHours)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  )
}
