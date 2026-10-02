'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon } from 'lucide-react'
import Verified from '@/components/ui/Verified'
import { eth } from '@/lib/format'
import { matchCollections, matchItemNumbers, type SearchCollection } from '@/lib/searchIndex'
import { artUrl, collectionUrl, itemUrl } from '@/lib/urls'
import styles from './Search.module.sass'

type Suggestion = { href: string; image: string; title: string; subtitle: string; verified?: boolean }

/** Header search with instant suggestions; Enter opens the full results */
const Search = ({ collections }: { collections: SearchCollection[] }) => {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const input = useRef<HTMLInputElement>(null)
  const wrap = useRef<HTMLDivElement>(null)

  // "/" focuses search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      if (e.key === '/' && !typing) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

  const suggestions: Suggestion[] = q.trim()
    ? [
        ...matchCollections(q, collections)
          .slice(0, 4)
          .map((c) => ({ href: collectionUrl(c.slug), image: c.avatar, title: c.name, subtitle: `${c.size} items · Floor ${eth(c.floor)} ETH`, verified: c.verified })),
        ...matchItemNumbers(q, collections)
          .slice(0, 4)
          .map((i) => ({ href: itemUrl(i.slug, i.tokenId), image: artUrl(i.slug, i.tokenId), title: i.name, subtitle: 'Item' })),
      ]
    : []

  const go = (href: string) => {
    setOpen(false)
    setQ('')
    input.current?.blur()
    router.push(href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Enter' && q.trim()) {
      e.preventDefault()
      go(active >= 0 && suggestions[active] ? suggestions[active].href : `/search?q=${encodeURIComponent(q.trim())}`)
    } else if (e.key === 'Escape') {
      setOpen(false)
      input.current?.blur()
    }
  }

  return (
    <div className={styles.search} ref={wrap}>
      <SearchIcon size={18} className={styles.icon} />
      <input
        ref={input}
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setActive(-1)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search collections, items or traits"
        aria-label="Search"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls="search-suggestions"
      />
      <kbd className={styles.kbd}>/</kbd>
      {open && q.trim() && (
        <div className={styles.dropdown} id="search-suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <button key={s.href} type="button" role="option" aria-selected={i === active} className={i === active ? styles.active : ''} onMouseEnter={() => setActive(i)} onClick={() => go(s.href)}>
              <img src={s.image} alt="" />
              <span>
                <strong>
                  {s.title} {s.verified && <Verified size={14} />}
                </strong>
                <small>{s.subtitle}</small>
              </span>
            </button>
          ))}
          <button type="button" className={styles.all} onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}>
            See all results for “{q.trim()}”
          </button>
        </div>
      )}
    </div>
  )
}

export default Search
