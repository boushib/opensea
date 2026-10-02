'use client'

import { useState } from 'react'
import Link from 'next/link'
import Verified from '@/components/ui/Verified'
import styles from './Trending.module.sass'

export type TrendingRow = {
  slug: string
  name: string
  avatar: string
  verified: boolean
  floor: string
  owners: string
  periods: Record<Period, { volume: number; volumeLabel: string; change: number | null; changeLabel: string }>
}

type Period = '24h' | '7d' | 'all'

const LABEL: Record<Period, string> = { '24h': '24h', '7d': '7d', all: 'All time' }

/** Collections ranked by volume, for the chosen period */
const Trending = ({ rows }: { rows: TrendingRow[] }) => {
  const [period, setPeriod] = useState<Period>('24h')
  const sorted = [...rows].sort((a, b) => b.periods[period].volume - a.periods[period].volume)

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2>Trending collections</h2>
        <div className={styles.tabs} role="tablist">
          {(Object.keys(LABEL) as Period[]).map((p) => (
            <button key={p} type="button" role="tab" aria-selected={p === period} className={p === period ? styles.tabActive : ''} onClick={() => setPeriod(p)}>
              {LABEL[p]}
            </button>
          ))}
        </div>
        <Link href="/rankings" className={styles.more}>
          View all
        </Link>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.rankCol}>#</th>
              <th>Collection</th>
              <th className={styles.num}>Floor</th>
              <th className={styles.num}>Volume</th>
              <th className={`${styles.num} ${styles.hideSm}`}>Change</th>
              <th className={`${styles.num} ${styles.hideSm}`}>Owners</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const p = r.periods[period]
              return (
                <tr key={r.slug}>
                  <td className={styles.rankCol}>{i + 1}</td>
                  <td>
                    <Link href={`/collection/${r.slug}`} className={styles.collection}>
                      <img src={r.avatar} alt="" />
                      <strong>{r.name}</strong>
                      {r.verified && <Verified size={15} />}
                    </Link>
                  </td>
                  <td className={`mono ${styles.num}`}>{r.floor}</td>
                  <td className={`mono ${styles.num}`}>{p.volumeLabel}</td>
                  <td className={`mono ${styles.num} ${styles.hideSm} ${p.change === null ? '' : p.change >= 0 ? styles.up : styles.down}`}>{p.changeLabel}</td>
                  <td className={`mono ${styles.num} ${styles.hideSm}`}>{r.owners}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Trending
