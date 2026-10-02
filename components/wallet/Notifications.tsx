'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, BellOff, CheckCircle2, Clock, HandCoins, Sparkles, Tag, Trophy } from 'lucide-react'
import type { NoteKind } from '@/lib/market'
import { useMarket } from '@/lib/market'
import { useNow } from '@/lib/useNow'
import { useWallet } from './WalletProvider'
import styles from './Wallet.module.sass'

const ICONS: Record<NoteKind, typeof Bell> = {
  sold: Tag,
  'offer-accepted': CheckCircle2,
  'offer-expired': Clock,
  'offer-received': HandCoins,
  outbid: HandCoins,
  'auction-won': Trophy,
  'auction-lost': Clock,
  listed: Tag,
  minted: Sparkles,
}

const since = (iso: string, now: number) => {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.round(mins / 60)
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`
}

/** Sales, accepted offers, new offers and auction results for the connected wallet */
const Notifications = () => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const now = useNow()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  if (!wallet.address) return null

  const toggle = () => {
    // Opening the list counts as reading it
    if (!open && market.unread) market.markAllRead()
    setOpen(!open)
  }

  return (
    <div className={styles.account} ref={ref}>
      <button type="button" className={styles.bell} onClick={toggle} aria-label={`Notifications${market.unread ? `, ${market.unread} new` : ''}`} aria-expanded={open}>
        <Bell size={18} />
        {market.unread > 0 && <span className={styles.badge}>{market.unread > 9 ? '9+' : market.unread}</span>}
      </button>
      {open && (
        <div className={`${styles.menu} ${styles.notes}`}>
          <strong className={styles.notesTitle}>Notifications</strong>
          {market.notes.length === 0 ? (
            <div className={styles.notesEmpty}>
              <BellOff size={24} />
              <span>Sales, accepted offers and new offers on your items show up here.</span>
            </div>
          ) : (
            <ul>
              {market.notes.slice(0, 20).map((n) => {
                const Icon = ICONS[n.kind]
                return (
                  <li key={n.id}>
                    <Link href={n.href} onClick={() => setOpen(false)}>
                      <span className={styles.noteIcon}>
                        <Icon size={16} />
                      </span>
                      <span>
                        <strong>{n.title}</strong>
                        <small>{n.body}</small>
                        <em>{now ? since(n.at, now) : ''}</em>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default Notifications
