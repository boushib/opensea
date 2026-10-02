'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HandCoins, ShoppingCart, Tag } from 'lucide-react'
import { ago, eth } from '@/lib/format'
import { artUrl, itemUrl } from '@/lib/urls'
import styles from './Collection.module.sass'

export type ActivityRow = {
  id: string
  kind: 'sale' | 'listing' | 'offer'
  tokenId: number
  name: string
  price: number
  fromName: string | null
  toName: string | null
  ageHours: number
}

const KINDS = { sale: { label: 'Sale', icon: ShoppingCart }, listing: { label: 'Listing', icon: Tag }, offer: { label: 'Offer', icon: HandCoins } } as const

/** Recent sales, listings and offers, filterable by type */
const ActivityTable = ({ slug, rows }: { slug: string; rows: ActivityRow[] }) => {
  const [kinds, setKinds] = useState<Array<ActivityRow['kind']>>(['sale', 'listing', 'offer'])
  const shown = rows.filter((r) => kinds.includes(r.kind))
  const toggle = (k: ActivityRow['kind']) => setKinds((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]))

  return (
    <div className={styles.activity}>
      <div className={styles.kindFilters}>
        {(Object.keys(KINDS) as Array<ActivityRow['kind']>).map((k) => (
          <button key={k} type="button" className={kinds.includes(k) ? styles.kindOn : ''} onClick={() => toggle(k)} aria-pressed={kinds.includes(k)}>
            {KINDS[k].label}s
          </button>
        ))}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Event</th>
              <th>Item</th>
              <th className={styles.num}>Price</th>
              <th className={styles.hideSm}>From</th>
              <th className={styles.hideSm}>To</th>
              <th className={styles.num}>Time</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const Icon = KINDS[r.kind].icon
              return (
                <tr key={r.id}>
                  <td>
                    <span className={styles.event}>
                      <Icon size={16} /> {KINDS[r.kind].label}
                    </span>
                  </td>
                  <td>
                    <Link href={itemUrl(slug, r.tokenId)} className={styles.eventItem}>
                      <img src={artUrl(slug, r.tokenId)} alt="" loading="lazy" />
                      <span>{r.name}</span>
                    </Link>
                  </td>
                  <td className={`mono ${styles.num}`}>{eth(r.price)} ETH</td>
                  <td className={`${styles.hideSm} ${styles.who}`}>{r.fromName ?? '—'}</td>
                  <td className={`${styles.hideSm} ${styles.who}`}>{r.toName ?? '—'}</td>
                  <td className={`${styles.num} ${styles.time}`}>{ago(r.ageHours)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ActivityTable
