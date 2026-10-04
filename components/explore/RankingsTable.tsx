'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Verified from '@/components/ui/Verified'
import { count, eth, pct } from '@/lib/format'
import styles from './Explore.module.sass'

type Period = '24h' | '7d' | 'all'
type SortKey = 'volume' | 'change' | 'floor' | 'sales' | 'owners' | 'items'

export type RankingRow = {
  slug: string
  name: string
  avatar: string
  verified: boolean
  category: string
  floor: number
  owners: number
  items: number
  periods: Record<Period, { volume: number; change: number | null; sales: number }>
}

const PERIODS: Record<Period, string> = { '24h': '24 hours', '7d': '7 days', all: 'All time' }

const COLUMNS: Array<{ key: SortKey; label: string; hideSm?: boolean }> = [
  { key: 'volume', label: 'Volume' },
  { key: 'change', label: 'Change' },
  { key: 'floor', label: 'Floor price' },
  { key: 'sales', label: 'Sales', hideSm: true },
  { key: 'owners', label: 'Owners', hideSm: true },
  { key: 'items', label: 'Items', hideSm: true },
]

/** All collections, ranked by any column, for a chosen period */
const RankingsTable = ({ rows }: { rows: RankingRow[] }) => {
  // ?sort=change opens on the top movers
  const initialSort: SortKey = useSearchParams().get('sort') === 'change' ? 'change' : 'volume'
  const [period, setPeriod] = useState<Period>('24h')
  const [sort, setSort] = useState<SortKey>(initialSort)
  const [desc, setDesc] = useState(true)

  const value = (r: RankingRow, k: SortKey) => {
    const p = r.periods[period]
    if (k === 'volume') return p.volume
    if (k === 'change') return p.change ?? -Infinity
    if (k === 'sales') return p.sales
    return r[k]
  }
  const sorted = [...rows].sort((a, b) => (desc ? value(b, sort) - value(a, sort) : value(a, sort) - value(b, sort)))
  const sortBy = (k: SortKey) => {
    if (k === sort) setDesc(!desc)
    else {
      setSort(k)
      setDesc(true)
    }
  }

  return (
    <>
      <div className={styles.tabs} role="tablist">
        {(Object.keys(PERIODS) as Period[]).map((p) => (
          <button key={p} type="button" role="tab" aria-selected={p === period} className={p === period ? styles.tabOn : ''} onClick={() => setPeriod(p)}>
            {PERIODS[p]}
          </button>
        ))}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.rank}>#</th>
              <th>Collection</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className={`${styles.num} ${c.hideSm ? styles.hideSm : ''}`} aria-sort={c.key === sort ? (desc ? 'descending' : 'ascending') : undefined}>
                  <button type="button" onClick={() => sortBy(c.key)} className={c.key === sort ? styles.sorted : ''}>
                    {c.label}
                    {c.key === sort && (desc ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const p = r.periods[period]
              return (
                <tr key={r.slug}>
                  <td className={styles.rank}>{i + 1}</td>
                  <td>
                    <Link href={`/collection/${r.slug}`} className={styles.collection}>
                      <img src={r.avatar} alt="" />
                      <span>
                        <strong>
                          {r.name} {r.verified && <Verified size={15} />}
                        </strong>
                        <small>{r.category}</small>
                      </span>
                    </Link>
                  </td>
                  <td className={`mono ${styles.num}`}>{eth(p.volume)} ETH</td>
                  <td className={`mono ${styles.num} ${p.change === null ? '' : p.change >= 0 ? styles.up : styles.down}`}>{p.change === null ? '—' : pct(p.change)}</td>
                  <td className={`mono ${styles.num}`}>{eth(r.floor)} ETH</td>
                  <td className={`mono ${styles.num} ${styles.hideSm}`}>{count(p.sales)}</td>
                  <td className={`mono ${styles.num} ${styles.hideSm}`}>{count(r.owners)}</td>
                  <td className={`mono ${styles.num} ${styles.hideSm}`}>{count(r.items)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default RankingsTable
