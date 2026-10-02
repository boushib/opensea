'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRightLeft, CheckCircle2, Clock, HandCoins, ShoppingCart, Tag } from 'lucide-react'
import AuctionPanel from '@/components/auction/AuctionPanel'
import CartButton from '@/components/cart/CartButton'
import { useWallet } from '@/components/wallet/WalletProvider'
import type { AuctionLot } from '@/lib/auctions'
import { eth, usd } from '@/lib/format'
import { incomingOffers, useMarket, type IncomingOffer } from '@/lib/market'
import { PEOPLE } from '@/lib/simulator'
import { useNow } from '@/lib/useNow'
import { userUrl } from '@/lib/urls'
import type { ItemRef } from './Modal'
import { AcceptDialog, BuyDialog, ListDialog, OfferDialog, TransferDialog } from './TradeDialogs'
import styles from './Item.module.sass'

type Props = {
  slug: string
  tokenId: number
  name: string
  collectionName: string
  owner: { name: string; address: string } | null
  price: number | null
  listingDays: number
  bestOffer: number | null
  floor: number
  /** What the item is worth: its price, last sale or the floor */
  fair: number
  /** Set when the item is up for auction */
  auction?: AuctionLot | null
}

type Dialog = { kind: 'buy' | 'offer' | 'list' | 'transfer' } | { kind: 'accept'; offer: IncomingOffer } | null

const daysLeft = (at: string, days: number, now: number) => Math.max(1, Math.ceil((new Date(at).getTime() + days * 864e5 - now) / 864e5))

/** Owner, price and every trade: buy, offer, list, transfer and accepting offers */
const ItemActions = ({ slug, tokenId, name, collectionName, owner, price, listingDays, bestOffer, floor, fair, auction }: Props) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const now = useNow()
  const [dialog, setDialog] = useState<Dialog>(null)
  const item: ItemRef = { slug, tokenId, name, collectionName }

  const owned = market.owns(slug, tokenId)
  const purchase = market.purchaseOf(slug, tokenId)
  const myListing = market.listingOf(slug, tokenId)
  const myOffer = market.offerOn(slug, tokenId)
  const newOwner = market.passedTo(slug, tokenId)
  const offers = purchase && now ? incomingOffers(purchase, PEOPLE, now) : []
  // After you sell or send it, the seller's old listing is gone
  const shownPrice = newOwner ? null : price

  const start = (d: Exclude<Dialog, null>) => {
    if (!wallet.address) return wallet.openConnect()
    if (wallet.wrongNetwork) return wallet.switchNetwork()
    setDialog(d)
  }

  return (
    <>
      <p className={styles.owner}>
        Owned by{' '}
        {owned ? (
          <Link href="/account">you</Link>
        ) : newOwner ? (
          <Link href={userUrl(newOwner.address)}>{newOwner.name}</Link>
        ) : owner ? (
          <Link href={userUrl(owner.address)}>{owner.name}</Link>
        ) : (
          'someone'
        )}
      </p>

      {!owned && !newOwner && auction ? (
        <AuctionPanel lot={auction} />
      ) : (
      <div className={styles.priceCard}>
        {owned ? (
          <div className={styles.priceBody}>
            {myListing ? (
              <>
                <span className={styles.priceLabel}>Your listing · ends in {now ? daysLeft(myListing.at, myListing.days, now) : myListing.days}d</span>
                <div className={styles.priceRow}>
                  <strong className="mono">{eth(myListing.price)} ETH</strong>
                  <span>{usd(myListing.price)}</span>
                </div>
                <div className={styles.buttons}>
                  <button type="button" className={styles.secondary} onClick={() => market.cancelListing(slug, tokenId)}>
                    Cancel listing
                  </button>
                  <button type="button" className={styles.secondary} onClick={() => start({ kind: 'list' })}>
                    <Tag size={18} /> Change price
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.ownedNote}>
                  <CheckCircle2 size={20} /> This item is in your wallet.
                </p>
                <div className={styles.buttons}>
                  <button type="button" className={styles.primary} onClick={() => start({ kind: 'list' })}>
                    <Tag size={18} /> List for sale
                  </button>
                  <button type="button" className={styles.secondary} onClick={() => start({ kind: 'transfer' })}>
                    <ArrowRightLeft size={18} /> Transfer
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {shownPrice !== null && (
              <p className={styles.saleEnds}>
                <Clock size={16} /> Listing ends in {listingDays} {listingDays === 1 ? 'day' : 'days'}
              </p>
            )}
            <div className={styles.priceBody}>
              <span className={styles.priceLabel}>{shownPrice !== null ? 'Current price' : newOwner ? 'Not listed' : 'Best offer'}</span>
              <div className={styles.priceRow}>
                <strong className="mono">{shownPrice !== null ? `${eth(shownPrice)} ETH` : !newOwner && bestOffer ? `${eth(bestOffer)} ETH` : '—'}</strong>
                {shownPrice !== null && <span>{usd(shownPrice)}</span>}
              </div>
              <div className={styles.buttons}>
                {shownPrice !== null && (
                  <button type="button" className={styles.primary} onClick={() => start({ kind: 'buy' })}>
                    <ShoppingCart size={18} /> Buy now
                  </button>
                )}
                {shownPrice !== null && <CartButton item={{ slug, tokenId, name, price: shownPrice }} variant="wide" />}
                <button type="button" className={shownPrice !== null ? styles.secondary : styles.primary} onClick={() => start({ kind: 'offer' })}>
                  <HandCoins size={18} /> {myOffer ? 'Update offer' : 'Make offer'}
                </button>
              </div>
              {myOffer && (
                <div className={styles.myOffer}>
                  <Tag size={16} /> Your offer: <strong className="mono">{eth(myOffer.amount)} ETH</strong>, expires in {now ? daysLeft(myOffer.at, myOffer.expiresDays, now) : myOffer.expiresDays}d
                  <button type="button" onClick={() => market.cancelOffer(slug, tokenId)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      )}

      {owned && (
        <div className={styles.incoming}>
          <h3>Offers on your item</h3>
          {offers.length === 0 ? (
            <p className={styles.muted}>No offers yet. Collectors usually make some within a few minutes.</p>
          ) : (
            <ul>
              {offers.map((o) => (
                <li key={o.id}>
                  <span>
                    <strong className="mono">{eth(o.amount)} ETH</strong> from <Link href={userUrl(o.from.address)}>{o.from.name}</Link>
                  </span>
                  <button type="button" onClick={() => start({ kind: 'accept', offer: o })}>
                    Accept
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {dialog?.kind === 'buy' && shownPrice !== null && <BuyDialog item={item} price={shownPrice} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'offer' && (
        <OfferDialog item={item} fair={fair} suggested={myOffer?.amount ?? bestOffer ?? Math.round(floor * 0.9 * 1e3) / 1e3} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'list' && <ListDialog item={item} fair={fair} floor={floor} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'transfer' && <TransferDialog item={item} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'accept' && <AcceptDialog item={item} offer={dialog.offer} onClose={() => setDialog(null)} />}
    </>
  )
}

export default ItemActions
