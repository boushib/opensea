import type { Metadata } from 'next'
import LiveAuctions from '@/components/auction/LiveAuctions'
import { getAuctionLots } from '@/lib/auctionLots'
import styles from '@/components/explore/Explore.module.sass'
import home from '../home.module.sass'

export const metadata: Metadata = { title: 'Live auctions' }

export default function Auctions() {
  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Live auctions</h1>
        <p>Bid against other collectors. The top bid when the timer runs out wins, and a new auction starts a couple of minutes later.</p>
      </header>
      <LiveAuctions lots={getAuctionLots()} className={home.grid} />
    </div>
  )
}
