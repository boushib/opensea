'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, HandCoins, ShoppingCart, Tag, X } from 'lucide-react'
import { useWallet } from '@/components/wallet/WalletProvider'
import { eth, usd } from '@/lib/format'
import { useMarket } from '@/lib/market'
import { artUrl } from '@/lib/urls'
import styles from './Item.module.sass'

type Props = {
  slug: string
  tokenId: number
  name: string
  collectionName: string
  ownerName: string
  price: number | null
  listingDays: number
  bestOffer: number | null
  floor: number
}

type Dialog = 'buy' | 'offer' | null

/** Owner, price and the Buy / Make offer flows, which sign a message with the connected wallet */
const ItemActions = ({ slug, tokenId, name, collectionName, ownerName, price, listingDays, bestOffer, floor }: Props) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const owned = market.owns(slug, tokenId)
  const myOffer = market.offerOn(slug, tokenId)
  const [dialog, setDialog] = useState<Dialog>(null)

  const start = (d: Exclude<Dialog, null>) => {
    if (!wallet.address) return wallet.openConnect()
    if (wallet.wrongNetwork) return wallet.switchNetwork()
    setDialog(d)
  }

  return (
    <>
      <p className={styles.owner}>
        Owned by <strong>{owned ? 'you' : ownerName}</strong>
      </p>

      <div className={styles.priceCard}>
        {owned ? (
          <div className={styles.ownedNote}>
            <CheckCircle2 size={20} /> This item is in your wallet.{' '}
            <Link href="/account" className={styles.link}>
              View your items
            </Link>
          </div>
        ) : (
          <>
            {price !== null && (
              <p className={styles.saleEnds}>
                <Clock size={16} /> Listing ends in {listingDays} {listingDays === 1 ? 'day' : 'days'}
              </p>
            )}
            <div className={styles.priceBody}>
              <span className={styles.priceLabel}>{price !== null ? 'Current price' : 'Best offer'}</span>
              <div className={styles.priceRow}>
                <strong className="mono">{price !== null ? `${eth(price)} ETH` : bestOffer ? `${eth(bestOffer)} ETH` : '—'}</strong>
                {(price ?? bestOffer) !== null && <span>{usd(price ?? bestOffer!)}</span>}
              </div>
              <div className={styles.buttons}>
                {price !== null && (
                  <button type="button" className={styles.primary} onClick={() => start('buy')}>
                    <ShoppingCart size={18} /> Buy now
                  </button>
                )}
                <button type="button" className={price !== null ? styles.secondary : styles.primary} onClick={() => start('offer')}>
                  <HandCoins size={18} /> {myOffer ? 'Update offer' : 'Make offer'}
                </button>
              </div>
              {myOffer && (
                <div className={styles.myOffer}>
                  <Tag size={16} /> Your offer: <strong className="mono">{eth(myOffer.amount)} ETH</strong>, expires in {myOffer.expiresDays}d
                  <button type="button" onClick={() => market.cancelOffer(slug, tokenId)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {dialog === 'buy' && price !== null && (
        <BuyDialog slug={slug} tokenId={tokenId} name={name} collectionName={collectionName} price={price} onClose={() => setDialog(null)} />
      )}
      {dialog === 'offer' && (
        <OfferDialog slug={slug} tokenId={tokenId} name={name} collectionName={collectionName} suggested={myOffer?.amount ?? bestOffer ?? Math.round(floor * 0.9 * 1e3) / 1e3} onClose={() => setDialog(null)} />
      )}
    </>
  )
}

type DialogProps = { slug: string; tokenId: number; name: string; collectionName: string; onClose: () => void }

const Summary = ({ slug, tokenId, name, collectionName }: Omit<DialogProps, 'onClose'>) => (
  <div className={styles.summary}>
    <img src={artUrl(slug, tokenId)} alt="" />
    <div>
      <strong>{name}</strong>
      <span>{collectionName}</span>
    </div>
  </div>
)

const signError = (e: unknown) => (e instanceof Error && /reject|denied|cancel/i.test(e.message) ? 'You cancelled the signature in your wallet.' : 'Signing failed. Please try again.')

const BuyDialog = ({ price, onClose, ...item }: DialogProps & { price: number }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const [state, setState] = useState<'confirm' | 'signing' | 'done'>('confirm')
  const [error, setError] = useState('')
  const short = wallet.kind === 'demo' && wallet.balance !== null && wallet.balance < price

  const buy = async () => {
    setError('')
    setState('signing')
    try {
      const at = new Date().toISOString()
      const signature = await wallet.signMessage(`Buy ${item.name} for ${price} ETH\n\nOpenSea clone demo: no funds move.\nItem: ${item.slug}/${item.tokenId}\nTime: ${at}`)
      market.buy({ slug: item.slug, tokenId: item.tokenId, price, at, signature })
      setState('done')
    } catch (e) {
      setError(signError(e))
      setState('confirm')
    }
  }

  return (
    <Modal title={state === 'done' ? 'Purchase complete' : 'Complete purchase'} onClose={onClose}>
      <Summary {...item} />
      {state === 'done' ? (
        <>
          <p className={styles.success}>
            <CheckCircle2 size={20} /> You now own {item.name}.
          </p>
          <Link href="/account" className={styles.primary} onClick={onClose}>
            View in your profile
          </Link>
        </>
      ) : (
        <>
          <dl className={styles.lines}>
            <div>
              <dt>Price</dt>
              <dd className="mono">{eth(price)} ETH</dd>
            </div>
            <div>
              <dt>Marketplace fee</dt>
              <dd>Free</dd>
            </div>
            <div className={styles.total}>
              <dt>Total</dt>
              <dd>
                <span className="mono">{eth(price)} ETH</span>
                <small>{usd(price)}</small>
              </dd>
            </div>
          </dl>
          {short && <p className={styles.error}>Not enough demo ETH: you have {wallet.balance!.toFixed(3)} ETH.</p>}
          {error && <p className={styles.error}>{error}</p>}
          <button type="button" className={styles.primary} onClick={buy} disabled={state === 'signing' || short}>
            {state === 'signing' ? 'Confirm in your wallet…' : 'Sign to buy'}
          </button>
          <p className={styles.fine}>Your wallet asks you to sign a message. It’s a demo: nothing is charged{wallet.kind === 'demo' ? ' (demo ETH only)' : ''}.</p>
        </>
      )}
    </Modal>
  )
}

const EXPIRY = [1, 3, 7, 30]

const OfferDialog = ({ suggested, onClose, ...item }: DialogProps & { suggested: number }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const [amount, setAmount] = useState(String(suggested))
  const [days, setDays] = useState(7)
  const [state, setState] = useState<'edit' | 'signing' | 'done'>('edit')
  const [error, setError] = useState('')
  const value = Number(amount)
  const invalid = !(value > 0)
  const short = wallet.kind === 'demo' && wallet.balance !== null && value > wallet.balance

  const offer = async () => {
    setError('')
    setState('signing')
    try {
      const at = new Date().toISOString()
      const signature = await wallet.signMessage(`Offer ${value} ETH for ${item.name}, valid ${days} days\n\nOpenSea clone demo: no funds move.\nItem: ${item.slug}/${item.tokenId}\nTime: ${at}`)
      market.makeOffer({ slug: item.slug, tokenId: item.tokenId, amount: value, expiresDays: days, at, signature })
      setState('done')
    } catch (e) {
      setError(signError(e))
      setState('edit')
    }
  }

  return (
    <Modal title={state === 'done' ? 'Offer sent' : 'Make an offer'} onClose={onClose}>
      <Summary {...item} />
      {state === 'done' ? (
        <>
          <p className={styles.success}>
            <CheckCircle2 size={20} /> Your offer of {eth(value)} ETH is live for {days} days.
          </p>
          <button type="button" className={styles.primary} onClick={onClose}>
            Done
          </button>
        </>
      ) : (
        <>
          <label className={styles.field}>
            <span>Offer amount</span>
            <div className={styles.amount}>
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" autoFocus />
              <b>ETH</b>
            </div>
            <small>{invalid ? 'Enter an amount above 0' : usd(value)}</small>
          </label>
          <div className={styles.field}>
            <span>Expires in</span>
            <div className={styles.expiry}>
              {EXPIRY.map((d) => (
                <button key={d} type="button" className={d === days ? styles.expiryOn : ''} onClick={() => setDays(d)}>
                  {d === 1 ? '1 day' : `${d} days`}
                </button>
              ))}
            </div>
          </div>
          {short && <p className={styles.error}>That’s more than your demo balance of {wallet.balance!.toFixed(3)} ETH.</p>}
          {error && <p className={styles.error}>{error}</p>}
          <button type="button" className={styles.primary} onClick={offer} disabled={invalid || short || state === 'signing'}>
            {state === 'signing' ? 'Confirm in your wallet…' : 'Sign to make offer'}
          </button>
        </>
      )}
    </Modal>
  )
}

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} role="dialog" aria-modal aria-label={title} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHead}>
        <h2>{title}</h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
)

export default ItemActions
