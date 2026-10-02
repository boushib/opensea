'use client'

import { useState } from 'react'
import { ChevronDown, LayoutGrid, Grid3x3, Search, SlidersHorizontal, X } from 'lucide-react'
import ItemCard from '@/components/ui/ItemCard'
import { ago } from '@/lib/format'
import styles from './Collection.module.sass'

export type BrowserItem = {
  tokenId: number
  name: string
  rank: number
  price: number | null
  lastSale: number | null
  lastSaleAge: number | null
  traits: Record<string, string>
}

type Sort = 'price-asc' | 'price-desc' | 'rarity' | 'recent' | 'token'

const SORTS: Record<Sort, string> = {
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  rarity: 'Rarity: rarest first',
  recent: 'Recently sold',
  token: 'Token ID',
}

const PAGE = 40

type Props = { slug: string; items: BrowserItem[]; traitCounts: Record<string, Record<string, number>> }

/** The collection's items with filters (status, price, traits), search, sorting and two grid sizes */
const ItemsBrowser = ({ slug, items, traitCounts }: Props) => {
  const [query, setQuery] = useState('')
  const [buyNow, setBuyNow] = useState(false)
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [picked, setPicked] = useState<Record<string, string[]>>({})
  const [sort, setSort] = useState<Sort>('price-asc')
  const [dense, setDense] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [openTrait, setOpenTrait] = useState<string | null>(null)

  const q = query.trim().toLowerCase().replace('#', '')
  const minN = Number(min) || 0
  const maxN = Number(max) || Infinity
  const filtered = items.filter((i) => {
    if (q && !String(i.tokenId).startsWith(q) && !i.name.toLowerCase().includes(q)) return false
    if (buyNow && i.price === null) return false
    if ((min || max) && (i.price === null || i.price < minN || i.price > maxN)) return false
    return Object.entries(picked).every(([k, values]) => values.length === 0 || values.includes(i.traits[k]))
  })
  const sorted = [...filtered].sort((a, b) => {
    // Unlisted items go last when sorting by price
    const price = (x: BrowserItem, dir: 1 | -1) => (x.price === null ? Infinity : dir * x.price)
    if (sort === 'price-asc') return price(a, 1) - price(b, 1) || a.tokenId - b.tokenId
    if (sort === 'price-desc') return price(a, -1) - price(b, -1) || a.tokenId - b.tokenId
    if (sort === 'rarity') return a.rank - b.rank
    if (sort === 'recent') return (a.lastSaleAge ?? Infinity) - (b.lastSaleAge ?? Infinity)
    return a.tokenId - b.tokenId
  })

  const toggleTrait = (k: string, v: string) => {
    setPicked((p) => {
      const now = p[k] ?? []
      return { ...p, [k]: now.includes(v) ? now.filter((x) => x !== v) : [...now, v] }
    })
    setShown(PAGE)
  }
  const chips = [
    ...(buyNow ? [{ label: 'Buy now', clear: () => setBuyNow(false) }] : []),
    ...(min || max ? [{ label: `${min || '0'} – ${max || '∞'} ETH`, clear: () => {
          setMin('')
          setMax('')
        } }] : []),
    ...Object.entries(picked).flatMap(([k, vs]) => vs.map((v) => ({ label: `${k}: ${v}`, clear: () => toggleTrait(k, v) }))),
  ]
  const clearAll = () => {
    setBuyNow(false)
    setMin('')
    setMax('')
    setPicked({})
    setQuery('')
  }

  return (
    <div className={styles.browser}>
      <div className={styles.toolbar}>
        <button type="button" className={`${styles.toolButton} ${filtersOpen ? styles.toolButtonOn : ''}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>
          <SlidersHorizontal size={18} /> <span>Filters</span>
        </button>
        <label className={styles.search}>
          <Search size={18} />
          <input value={query} onChange={(e) => {
              setQuery(e.target.value)
              setShown(PAGE)
            }} placeholder="Search by name or number" />
        </label>
        <label className={styles.sort}>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
            {(Object.keys(SORTS) as Sort[]).map((s) => (
              <option key={s} value={s}>
                {SORTS[s]}
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </label>
        <div className={styles.density}>
          <button type="button" className={!dense ? styles.densityOn : ''} onClick={() => setDense(false)} aria-label="Large grid">
            <LayoutGrid size={18} />
          </button>
          <button type="button" className={dense ? styles.densityOn : ''} onClick={() => setDense(true)} aria-label="Small grid">
            <Grid3x3 size={18} />
          </button>
        </div>
      </div>

      <div className={`${styles.layout} ${filtersOpen ? '' : styles.layoutFull}`}>
        {filtersOpen && (
          <aside className={styles.filters}>
            <div className={styles.filtersHead}>
              <strong>Filters</strong>
              <button type="button" className={styles.closeFilters} onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
            <section>
              <h3>Status</h3>
              <label className={styles.check}>
                <input type="checkbox" checked={buyNow} onChange={(e) => {
                  setBuyNow(e.target.checked)
                  setShown(PAGE)
                }} />
                Buy now
                <em>{items.filter((i) => i.price !== null).length}</em>
              </label>
            </section>
            <section>
              <h3>Price</h3>
              <div className={styles.range}>
                <input value={min} onChange={(e) => setMin(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Min" inputMode="decimal" aria-label="Minimum price in ETH" />
                <span>to</span>
                <input value={max} onChange={(e) => setMax(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Max" inputMode="decimal" aria-label="Maximum price in ETH" />
                <b>ETH</b>
              </div>
            </section>
            <section>
              <h3>Traits</h3>
              {Object.entries(traitCounts).map(([k, values]) => {
                const open = openTrait === k
                const selected = picked[k]?.length ?? 0
                return (
                  <div key={k} className={styles.trait}>
                    <button type="button" className={styles.traitHead} onClick={() => setOpenTrait(open ? null : k)} aria-expanded={open}>
                      <span>
                        {k}
                        {selected > 0 && <em>{selected}</em>}
                      </span>
                      <span className={styles.traitMeta}>
                        {Object.keys(values).length}
                        <ChevronDown size={16} className={open ? styles.flip : ''} />
                      </span>
                    </button>
                    {open && (
                      <div className={styles.traitValues}>
                        {Object.entries(values)
                          .sort((a, b) => b[1] - a[1])
                          .map(([v, n]) => (
                            <label key={v} className={styles.check}>
                              <input type="checkbox" checked={picked[k]?.includes(v) ?? false} onChange={() => toggleTrait(k, v)} />
                              {v}
                              <em>{n}</em>
                            </label>
                          ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          </aside>
        )}

        <div className={styles.results}>
          <div className={styles.resultsHead}>
            <span>{filtered.length.toLocaleString('en-US')} items</span>
            {chips.map((c) => (
              <button key={c.label} type="button" className={styles.chip} onClick={c.clear}>
                {c.label} <X size={14} />
              </button>
            ))}
            {chips.length > 0 && (
              <button type="button" className={styles.clearAll} onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>
          {sorted.length === 0 ? (
            <div className={styles.empty}>
              <strong>No items found</strong>
              <span>Try removing a filter.</span>
            </div>
          ) : (
            <div className={`${styles.grid} ${dense ? styles.gridDense : ''}`}>
              {sorted.slice(0, shown).map((i) => (
                <ItemCard
                  key={i.tokenId}
                  slug={slug}
                  tokenId={i.tokenId}
                  name={i.name}
                  rank={i.rank}
                  price={i.price}
                  lastSale={i.lastSale}
                  note={sort === 'recent' && i.lastSaleAge !== null ? `Sold ${ago(i.lastSaleAge)}` : undefined}
                />
              ))}
            </div>
          )}
          {shown < sorted.length && (
            <button type="button" className={styles.loadMore} onClick={() => setShown(shown + PAGE)}>
              Load more ({sorted.length - shown} left)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ItemsBrowser
