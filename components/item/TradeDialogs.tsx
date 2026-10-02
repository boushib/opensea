'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useWallet } from '@/components/wallet/WalletProvider'
import { eth, usd } from '@/lib/format'
import { useMarket, type IncomingOffer } from '@/lib/market'
import { shortAddress } from '@/lib/users'
import { Modal, signError, Summary, tradeMessage, type ItemRef } from './Modal'
import styles from './Item.module.sass'

type Base = { item: ItemRef; onClose: () => void }
const DURATIONS = [1, 3, 7, 30]

const Durations = ({ value, onChange }: { value: number; onChange: (d: number) => void }) => (
  <div className={styles.expiry}>
    {DURATIONS.map((d) => (
      <button key={d} type="button" className={d === value ? styles.expiryOn : ''} onClick={() => onChange(d)}>
        {d === 1 ? '1 day' : `${d} days`}
      </button>
    ))}
  </div>
)

export const AmountField = ({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint: string }) => (
  <label className={styles.field}>
    <span>{label}</span>
    <div className={styles.amount}>
      <input value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" autoFocus />
      <b>ETH</b>
    </div>
    <small>{hint}</small>
  </label>
)

/** Shared flow: sign, record, show success */
export const useSigned = () => {
  const wallet = useWallet()
  const [state, setState] = useState<'edit' | 'signing' | 'done'>('edit')
  const [error, setError] = useState('')
  const run = async (message: string, record: (signature: `0x${string}`, at: string) => void, at: string) => {
    setError('')
    setState('signing')
    try {
      record(await wallet.signMessage(message), at)
      setState('done')
    } catch (e) {
      setError(signError(e))
      setState('edit')
    }
  }
  return { state, error, run }
}

export const BuyDialog = ({ item, price, onClose }: Base & { price: number }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const { state, error, run } = useSigned()
  const short = wallet.kind === 'demo' && wallet.balance !== null && wallet.balance < price
  const buy = () => {
    const at = new Date().toISOString()
    run(tradeMessage(`Buy ${item.name} for ${price} ETH`, item, at), (signature) => market.buy({ slug: item.slug, tokenId: item.tokenId, name: item.name, price, at, signature, via: 'buy' }), at)
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

export const OfferDialog = ({ item, suggested, fair, onClose }: Base & { suggested: number; fair: number }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const { state, error, run } = useSigned()
  const [amount, setAmount] = useState(String(suggested))
  const [days, setDays] = useState(7)
  const value = Number(amount)
  const invalid = !(value > 0)
  const short = wallet.kind === 'demo' && wallet.balance !== null && value > wallet.balance
  const offer = () => {
    const at = new Date().toISOString()
    run(
      tradeMessage(`Offer ${value} ETH for ${item.name}, valid ${days} days`, item, at),
      (signature) => market.makeOffer({ slug: item.slug, tokenId: item.tokenId, name: item.name, amount: value, expiresDays: days, at, signature, fair }),
      at
    )
  }
  return (
    <Modal title={state === 'done' ? 'Offer sent' : 'Make an offer'} onClose={onClose}>
      <Summary {...item} />
      {state === 'done' ? (
        <>
          <p className={styles.success}>
            <CheckCircle2 size={20} /> Your offer of {eth(value)} ETH is live for {days} days. We’ll let you know if it’s accepted.
          </p>
          <button type="button" className={styles.primary} onClick={onClose}>
            Done
          </button>
        </>
      ) : (
        <>
          <AmountField label="Offer amount" value={amount} onChange={setAmount} hint={invalid ? 'Enter an amount above 0' : `${usd(value)} · Offers near the item’s value are usually accepted`} />
          <div className={styles.field}>
            <span>Expires in</span>
            <Durations value={days} onChange={setDays} />
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

export const ListDialog = ({ item, fair, floor, onClose }: Base & { fair: number; floor: number }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const { state, error, run } = useSigned()
  const [price, setPrice] = useState(String(Math.round(fair * 1.05 * 1e4) / 1e4))
  const [days, setDays] = useState(7)
  const value = Number(price)
  const invalid = !(value > 0)
  const list = () => {
    const at = new Date().toISOString()
    run(
      tradeMessage(`List ${item.name} for ${value} ETH, for ${days} days`, item, at),
      (signature) => market.list({ slug: item.slug, tokenId: item.tokenId, name: item.name, price: value, days, at, signature, fair }),
      at
    )
  }
  return (
    <Modal title={state === 'done' ? 'Listed for sale' : 'List for sale'} onClose={onClose}>
      <Summary {...item} />
      {state === 'done' ? (
        <>
          <p className={styles.success}>
            <CheckCircle2 size={20} /> {item.name} is listed for {eth(value)} ETH. We’ll let you know when it sells.
          </p>
          <button type="button" className={styles.primary} onClick={onClose}>
            Done
          </button>
        </>
      ) : (
        <>
          <AmountField label="Price" value={price} onChange={setPrice} hint={invalid ? 'Enter a price above 0' : `${usd(value)} · Floor ${eth(floor)} ETH · Prices near the item’s value sell fastest`} />
          <div className={styles.field}>
            <span>Duration</span>
            <Durations value={days} onChange={setDays} />
          </div>
          <dl className={styles.lines}>
            <div>
              <dt>Marketplace fee</dt>
              <dd>Free</dd>
            </div>
            <div className={styles.total}>
              <dt>You receive</dt>
              <dd>
                <span className="mono">{invalid ? '—' : `${eth(value)} ETH`}</span>
              </dd>
            </div>
          </dl>
          {error && <p className={styles.error}>{error}</p>}
          <button type="button" className={styles.primary} onClick={list} disabled={invalid || state === 'signing'}>
            {state === 'signing' ? 'Confirm in your wallet…' : 'Sign to list'}
          </button>
        </>
      )}
    </Modal>
  )
}

const ADDRESS = /^0x[a-fA-F0-9]{40}$/

export const TransferDialog = ({ item, onClose }: Base) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const { state, error, run } = useSigned()
  const [to, setTo] = useState('')
  const valid = ADDRESS.test(to.trim())
  const self = valid && to.trim().toLowerCase() === wallet.address?.toLowerCase()
  const send = () => {
    const at = new Date().toISOString()
    const address = to.trim()
    run(
      tradeMessage(`Transfer ${item.name} to ${address}`, item, at),
      (signature) => market.transfer({ slug: item.slug, tokenId: item.tokenId, name: item.name, to: { name: shortAddress(address), address }, at, signature }),
      at
    )
  }
  return (
    <Modal title={state === 'done' ? 'Transfer complete' : 'Transfer'} onClose={onClose}>
      <Summary {...item} />
      {state === 'done' ? (
        <>
          <p className={styles.success}>
            <CheckCircle2 size={20} /> {item.name} was sent to {shortAddress(to.trim())}.
          </p>
          <button type="button" className={styles.primary} onClick={onClose}>
            Done
          </button>
        </>
      ) : (
        <>
          <label className={styles.field}>
            <span>Wallet address</span>
            <div className={styles.amount}>
              <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="0x…" spellCheck={false} autoFocus className="mono" />
            </div>
            <small className={to && (!valid || self) ? styles.errorText : ''}>{!to ? 'The item leaves your wallet for good.' : !valid ? 'Enter a 0x address with 40 hex characters' : self ? 'That’s your own address' : 'Ready to send'}</small>
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button type="button" className={styles.primary} onClick={send} disabled={!valid || self || state === 'signing'}>
            {state === 'signing' ? 'Confirm in your wallet…' : 'Sign to transfer'}
          </button>
        </>
      )}
    </Modal>
  )
}

export const AcceptDialog = ({ item, offer, onClose }: Base & { offer: IncomingOffer }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const { state, error, run } = useSigned()
  const accept = () => {
    const at = new Date().toISOString()
    run(tradeMessage(`Accept ${offer.amount} ETH from ${offer.from.name} for ${item.name}`, item, at), () => market.acceptOffer(offer, item.name), at)
  }
  return (
    <Modal title={state === 'done' ? 'Offer accepted' : 'Accept offer'} onClose={onClose}>
      <Summary {...item} />
      {state === 'done' ? (
        <>
          <p className={styles.success}>
            <CheckCircle2 size={20} /> You sold {item.name} to {offer.from.name} for {eth(offer.amount)} ETH.
          </p>
          <button type="button" className={styles.primary} onClick={onClose}>
            Done
          </button>
        </>
      ) : (
        <>
          <dl className={styles.lines}>
            <div>
              <dt>From</dt>
              <dd>{offer.from.name}</dd>
            </div>
            <div className={styles.total}>
              <dt>You receive</dt>
              <dd>
                <span className="mono">{eth(offer.amount)} ETH</span>
                <small>{usd(offer.amount)}</small>
              </dd>
            </div>
          </dl>
          {error && <p className={styles.error}>{error}</p>}
          <button type="button" className={styles.primary} onClick={accept} disabled={state === 'signing'}>
            {state === 'signing' ? 'Confirm in your wallet…' : 'Sign to accept'}
          </button>
        </>
      )}
    </Modal>
  )
}
