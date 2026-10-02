'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Gavel, Timer } from 'lucide-react'
import { useWallet } from '@/components/wallet/WalletProvider'
import { Modal, Summary, tradeMessage, type ItemRef } from '@/components/item/Modal'
import { AmountField, useSigned } from '@/components/item/TradeDialogs'
import { auctionOf, auctionState, countdown, isYou, type Auction, type AuctionLot, type AuctionState } from '@/lib/auctions'
import { eth, usd } from '@/lib/format'
import { useMarket } from '@/lib/market'
import { useNow } from '@/lib/useNow'
import { userUrl } from '@/lib/urls'
import item from '@/components/item/Item.module.sass'
import styles from './Auction.module.sass'

const time = (t: number) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })

/** The live auction for an item: countdown, top bid, bid history and placing a bid */
const AuctionPanel = ({ lot }: { lot: AuctionLot }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const now = useNow(1000)
  const [bidding, setBidding] = useState(false)
  if (!now) return <div className={`${item.priceCard} ${styles.panelLoading}`} />

  const a = auctionOf(lot, now)
  const mine = market.bidsOn(a.id)
  const s = auctionState(a, mine, now)
  const ref: ItemRef = { slug: a.slug, tokenId: a.tokenId, name: a.name, collectionName: a.collectionName }
  const leading = isYou(s.leader)
  const rival = s.leader && !isYou(s.leader) ? s.leader : null

  const start = () => {
    if (!wallet.address) return wallet.openConnect()
    if (wallet.wrongNetwork) return wallet.switchNetwork()
    setBidding(true)
  }

  return (
    <>
      <div className={item.priceCard}>
        <p className={item.saleEnds}>
          <Timer size={16} />
          {s.ended ? (
            <span>Auction ended · the next one starts in {countdown(a.endsAt + 120_000 - now)}</span>
          ) : (
            <span>
              Auction ends in <strong className={`mono ${a.endsAt - now < 60_000 ? styles.urgent : ''}`}>{countdown(a.endsAt - now)}</strong>
            </span>
          )}
        </p>
        <div className={item.priceBody}>
          <span className={item.priceLabel}>{s.ended ? (s.high === null ? 'No bids' : 'Winning bid') : s.high === null ? 'Reserve price' : 'Top bid'}</span>
          <div className={item.priceRow}>
            <strong className="mono">{eth(s.high ?? a.reserve)} ETH</strong>
            <span>{usd(s.high ?? a.reserve)}</span>
          </div>
          {s.leader && (
            <p className={`${styles.leader} ${leading ? styles.leading : mine.length ? styles.behind : ''}`}>
              {leading ? (s.ended ? 'You won this auction.' : 'You’re the top bidder.') : (
                <>
                  {s.ended ? 'Won by' : 'Top bidder:'} {rival && <Link href={userUrl(rival.address)}>{rival.name}</Link>}
                  {mine.length > 0 && !s.ended && ' · you’ve been outbid'}
                </>
              )}
            </p>
          )}
          {!s.ended && (
            <button type="button" className={item.primary} onClick={start} disabled={leading}>
              <Gavel size={18} /> {leading ? 'You’re winning' : mine.length ? 'Bid again' : 'Place a bid'}
            </button>
          )}
          <p className={styles.sellerNote}>
            Sold by <Link href={userUrl(a.seller.address)}>{a.seller.name}</Link> · bids must beat the top bid by 5%
          </p>
        </div>
      </div>

      {s.history.length > 0 && (
        <div className={item.incoming}>
          <h3>Bids</h3>
          <ul className={styles.history}>
            {s.history.slice(0, 6).map((e) => (
              <li key={`${e.at}-${e.amount}`}>
                <span>
                  <strong className="mono">{eth(e.amount)} ETH</strong> from {isYou(e.who) ? <b>you</b> : <Link href={userUrl(e.who.address)}>{e.who.name}</Link>}
                </span>
                <span className={item.muted}>{time(e.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bidding && <BidDialog item={ref} auction={a} state={s} onClose={() => setBidding(false)} />}
    </>
  )
}

const BidDialog = ({ item: ref, auction, state, onClose }: { item: ItemRef; auction: Auction; state: AuctionState; onClose: () => void }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const { state: step, error, run } = useSigned()
  const [amount, setAmount] = useState(String(state.minNext))
  const value = Number(amount)
  const low = !(value >= state.minNext)
  const short = wallet.kind === 'demo' && wallet.balance !== null && value > wallet.balance
  const bid = () => {
    const at = new Date().toISOString()
    run(tradeMessage(`Bid ${value} ETH on ${ref.name}`, ref, at), (signature) => market.placeBid({ ...auction, amount: value, at, signature }), at)
  }
  return (
    <Modal title={step === 'done' ? 'Bid placed' : 'Place a bid'} onClose={onClose}>
      <Summary {...ref} />
      {step === 'done' ? (
        <>
          <p className={item.success}>
            <CheckCircle2 size={20} /> You’re the top bidder at {eth(value)} ETH. We’ll let you know if someone outbids you.
          </p>
          <button type="button" className={item.primary} onClick={onClose}>
            Done
          </button>
        </>
      ) : (
        <>
          <AmountField label="Your bid" value={amount} onChange={setAmount} hint={low ? `Bid at least ${eth(state.minNext)} ETH` : `${usd(value)} · You pay only if you win`} />
          {short && <p className={item.error}>That’s more than your demo balance of {wallet.balance!.toFixed(3)} ETH.</p>}
          {error && <p className={item.error}>{error}</p>}
          <button type="button" className={item.primary} onClick={bid} disabled={low || short || step === 'signing'}>
            {step === 'signing' ? 'Confirm in your wallet…' : 'Sign to bid'}
          </button>
        </>
      )}
    </Modal>
  )
}

export default AuctionPanel
