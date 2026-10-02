'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ShoppingCart, Trash2, X } from 'lucide-react'
import { useWallet } from '@/components/wallet/WalletProvider'
import { onCartOpen, useCart } from '@/lib/cart'
import { eth, usd } from '@/lib/format'
import { useMarket } from '@/lib/market'
import { artUrl, itemUrl } from '@/lib/urls'
import styles from './Cart.module.sass'

/** Header cart icon and the side panel to buy everything with one signature */
const Cart = () => {
  const cart = useCart()
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'signing' | 'done'>('idle')
  const [bought, setBought] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => onCartOpen(setOpen), [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Things you already own can't be bought again
  const buyable = cart.items.filter((i) => !market.owns(i.slug, i.tokenId))
  const total = buyable.reduce((s, i) => s + i.price, 0)
  const short = wallet.kind === 'demo' && wallet.balance !== null && wallet.balance < total

  const checkout = async () => {
    if (!wallet.address) return wallet.openConnect()
    if (wallet.wrongNetwork) return wallet.switchNetwork()
    setError('')
    setState('signing')
    try {
      const at = new Date().toISOString()
      const list = buyable.map((i) => `- ${i.name}: ${i.price} ETH`).join('\n')
      const signature = await wallet.signMessage(`Buy ${buyable.length} items for ${Math.round(total * 1e4) / 1e4} ETH\n${list}\n\nOpenSea clone demo: no funds move.\nTime: ${at}`)
      market.buyMany(buyable.map((i) => ({ slug: i.slug, tokenId: i.tokenId, name: i.name, price: i.price, at, signature, via: 'buy' as const })))
      setBought(buyable.length)
      cart.clear()
      setState('done')
    } catch (e) {
      setError(e instanceof Error && /reject|denied|cancel/i.test(e.message) ? 'You cancelled the signature in your wallet.' : 'Signing failed. Please try again.')
      setState('idle')
    }
  }

  return (
    <>
      <button type="button" className={styles.headerButton} onClick={() => setOpen(true)} aria-label={`Cart, ${cart.items.length} items`}>
        <ShoppingCart size={18} />
        {cart.items.length > 0 && <span className={styles.count}>{cart.items.length}</span>}
      </button>
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <aside className={styles.panel} role="dialog" aria-modal aria-label="Your cart" onClick={(e) => e.stopPropagation()}>
            <div className={styles.head}>
              <h2>Your cart</h2>
              <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {state === 'done' ? (
              <div className={styles.empty}>
                <CheckCircle2 size={40} className={styles.ok} />
                <strong>You bought {bought} {bought === 1 ? 'item' : 'items'}</strong>
                <Link href="/account" className={styles.checkout} onClick={() => {
                    setOpen(false)
                    setState('idle')
                  }}>
                  View in your profile
                </Link>
              </div>
            ) : cart.items.length === 0 ? (
              <div className={styles.empty}>
                <ShoppingCart size={36} />
                <strong>Your cart is empty</strong>
                <span>Add listed items to buy several at once.</span>
              </div>
            ) : (
              <>
                <div className={styles.listHead}>
                  <span>
                    {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                  </span>
                  <button type="button" onClick={cart.clear}>
                    Clear all
                  </button>
                </div>
                <ul className={styles.list}>
                  {cart.items.map((i) => (
                    <li key={`${i.slug}/${i.tokenId}`}>
                      <Link href={itemUrl(i.slug, i.tokenId)} onClick={() => setOpen(false)}>
                        <img src={artUrl(i.slug, i.tokenId)} alt="" />
                        <span>
                          <strong>{i.name}</strong>
                          {market.owns(i.slug, i.tokenId) && <small>You own this</small>}
                        </span>
                      </Link>
                      <span className="mono">{eth(i.price)} ETH</span>
                      <button type="button" onClick={() => cart.remove(i.slug, i.tokenId)} aria-label={`Remove ${i.name}`}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className={styles.foot}>
                  <div className={styles.total}>
                    <span>Total</span>
                    <strong className="mono">{eth(total)} ETH</strong>
                    <small>{usd(total)}</small>
                  </div>
                  {short && <p className={styles.error}>Not enough demo ETH: you have {wallet.balance!.toFixed(3)} ETH.</p>}
                  {error && <p className={styles.error}>{error}</p>}
                  <button type="button" className={styles.checkout} onClick={checkout} disabled={buyable.length === 0 || short || state === 'signing'}>
                    {state === 'signing' ? 'Confirm in your wallet…' : !wallet.address ? 'Connect wallet to buy' : `Buy ${buyable.length} ${buyable.length === 1 ? 'item' : 'items'}`}
                  </button>
                  <p className={styles.fine}>One signature for everything. It’s a demo: no funds move.</p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  )
}

export default Cart
