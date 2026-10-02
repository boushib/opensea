'use client'

import Link from 'next/link'
import { Timer } from 'lucide-react'
import { useWallet } from '@/components/wallet/WalletProvider'
import { auctionOf, auctionState, countdown, isYou, type AuctionLot } from '@/lib/auctions'
import { eth } from '@/lib/format'
import { useMarket } from '@/lib/market'
import { useNow } from '@/lib/useNow'
import { artUrl, itemUrl } from '@/lib/urls'
import card from '@/components/ui/ItemCard.module.sass'
import styles from './Auction.module.sass'

/** Auction cards, soonest to end first; lots you've won drop out */
const LiveAuctions = ({ lots, limit, className }: { lots: AuctionLot[]; limit?: number; className?: string }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const now = useNow(1000)

  const shown = lots
    .filter((l) => !market.owns(l.slug, l.tokenId))
    .map((lot) => {
      const a = auctionOf(lot, now || 0)
      const mine = market.bidsOn(a.id)
      return { a, s: auctionState(a, mine, now || 0), bid: mine.length > 0 }
    })
    .sort((x, y) => Number(x.s.ended) - Number(y.s.ended) || x.a.endsAt - y.a.endsAt)
    .slice(0, limit)

  return (
    <div className={className}>
      {shown.map(({ a, s, bid }) => (
        <Link key={`${a.slug}-${a.tokenId}`} href={itemUrl(a.slug, a.tokenId)} className={card.card}>
          <div className={card.art}>
            <img src={artUrl(a.slug, a.tokenId)} alt={a.name} loading="lazy" width={400} height={400} />
            {now > 0 && (
              <span className={`${styles.timer} ${!s.ended && a.endsAt - now < 60_000 ? styles.timerUrgent : ''}`}>
                <Timer size={13} /> {s.ended ? 'Ended' : countdown(a.endsAt - now)}
              </span>
            )}
            {bid && <span className={`${styles.status} ${isYou(s.leader) ? styles.statusWin : styles.statusLose}`}>{isYou(s.leader) ? (s.ended ? 'Won' : 'Winning') : 'Outbid'}</span>}
          </div>
          <div className={card.body}>
            <strong>{a.name}</strong>
            <span className={`mono ${card.price}`}>{now ? `${eth(s.high ?? a.reserve)} ETH` : ' '}</span>
            <span className={card.muted}>{!now ? ' ' : s.high === null ? 'Reserve, no bids yet' : `${s.ended ? 'Winning bid' : 'Top bid'} · ${s.history.length} bids`}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default LiveAuctions
