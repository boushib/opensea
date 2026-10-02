'use client'

import { useState } from 'react'
import { CheckCircle2, HandCoins } from 'lucide-react'
import { Modal, signError } from '@/components/item/Modal'
import { useWallet } from '@/components/wallet/WalletProvider'
import { eth, usd } from '@/lib/format'
import { useMarket } from '@/lib/market'
import { artUrl } from '@/lib/urls'
import item from '@/components/item/Item.module.sass'
import styles from './Collection.module.sass'

type Props = { slug: string; name: string; size: number; floor: number; bestOffer: number; avatarToken: number }

const DURATIONS = [1, 3, 7, 30]

/** Offer a price for any item in the collection, for one or more items */
const CollectionOffer = ({ slug, name, size, floor, bestOffer, avatarToken }: Props) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const mine = market.collectionOfferOn(slug)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(String(Math.round(bestOffer * 1e4) / 1e4))
  const [quantity, setQuantity] = useState(1)
  const [days, setDays] = useState(7)
  const [state, setState] = useState<'edit' | 'signing' | 'done'>('edit')
  const [error, setError] = useState('')
  const value = Number(amount)
  const total = value * quantity
  const invalid = !(value > 0)
  const short = wallet.kind === 'demo' && wallet.balance !== null && total > wallet.balance

  const start = () => {
    if (!wallet.address) return wallet.openConnect()
    if (wallet.wrongNetwork) return wallet.switchNetwork()
    setState('edit')
    setOpen(true)
  }

  const submit = async () => {
    setError('')
    setState('signing')
    try {
      const at = new Date().toISOString()
      const signature = await wallet.signMessage(`Offer ${value} ETH each for up to ${quantity} ${name} items, valid ${days} days\n\nOpenSea clone demo: no funds move.\nCollection: ${slug}\nTime: ${at}`)
      market.makeCollectionOffer({ slug, collectionName: name, size, amount: value, quantity, filled: 0, expiresDays: days, at, signature, floor })
      setState('done')
    } catch (e) {
      setError(signError(e))
      setState('edit')
    }
  }

  return (
    <>
      {mine ? (
        <div className={styles.myCollectionOffer}>
          <HandCoins size={16} />
          <span>
            Your collection offer: <strong className="mono">{eth(mine.amount)} ETH</strong> × {mine.quantity} · {mine.filled} filled
          </span>
          <button type="button" onClick={() => market.cancelCollectionOffer(slug)}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className={styles.collectionOfferButton} onClick={start}>
          <HandCoins size={17} /> Make collection offer
        </button>
      )}
      {open && (
        <Modal title={state === 'done' ? 'Collection offer sent' : 'Make a collection offer'} onClose={() => setOpen(false)}>
          <div className={item.summary}>
            <img src={artUrl(slug, avatarToken)} alt="" />
            <div>
              <strong>{name}</strong>
              <span>
                Floor {eth(floor)} ETH · Best offer {eth(bestOffer)} ETH
              </span>
            </div>
          </div>
          {state === 'done' ? (
            <>
              <p className={item.success}>
                <CheckCircle2 size={20} /> Your offer for up to {quantity} {quantity === 1 ? 'item' : 'items'} at {eth(value)} ETH each is live. We’ll let you know as items come in.
              </p>
              <button type="button" className={item.primary} onClick={() => setOpen(false)}>
                Done
              </button>
            </>
          ) : (
            <>
              <label className={item.field}>
                <span>Price per item</span>
                <div className={item.amount}>
                  <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" autoFocus />
                  <b>ETH</b>
                </div>
                <small>{invalid ? 'Enter an amount above 0' : `${usd(value)} · Offers at 90% of the floor or more usually fill`}</small>
              </label>
              <div className={item.field}>
                <span>Quantity</span>
                <div className={styles.stepper}>
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Fewer">
                    −
                  </button>
                  <span className="mono">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(Math.min(10, quantity + 1))} aria-label="More">
                    +
                  </button>
                </div>
              </div>
              <div className={item.field}>
                <span>Expires in</span>
                <div className={item.expiry}>
                  {DURATIONS.map((d) => (
                    <button key={d} type="button" className={d === days ? item.expiryOn : ''} onClick={() => setDays(d)}>
                      {d === 1 ? '1 day' : `${d} days`}
                    </button>
                  ))}
                </div>
              </div>
              <dl className={item.lines}>
                <div className={item.total}>
                  <dt>Total if all fill</dt>
                  <dd>
                    <span className="mono">{invalid ? '—' : `${eth(total)} ETH`}</span>
                  </dd>
                </div>
              </dl>
              {short && <p className={item.error}>That’s more than your demo balance of {wallet.balance!.toFixed(3)} ETH.</p>}
              {error && <p className={item.error}>{error}</p>}
              <button type="button" className={item.primary} onClick={submit} disabled={invalid || short || state === 'signing'}>
                {state === 'signing' ? 'Confirm in your wallet…' : 'Sign to make offer'}
              </button>
            </>
          )}
        </Modal>
      )}
    </>
  )
}

export default CollectionOffer
