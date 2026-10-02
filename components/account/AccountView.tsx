'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, HandCoins, ShoppingCart, Wallet as WalletIcon } from 'lucide-react'
import ItemCard from '@/components/ui/ItemCard'
import { useWallet } from '@/components/wallet/WalletProvider'
import { eth } from '@/lib/format'
import { identicon } from '@/lib/identicon'
import { useMarket } from '@/lib/market'
import { hash } from '@/lib/rng'
import { artUrl, itemUrl } from '@/lib/urls'
import { shortAddress } from '@/lib/users'
import styles from './Account.module.sass'

export type Tab = 'collected' | 'favorites' | 'offers' | 'activity'
export type CollectionMeta = { name: string; floor: number; verified: boolean }

const LABELS: Record<Tab, string> = { collected: 'Collected', favorites: 'Favorites', offers: 'Offers made', activity: 'Activity' }

const when = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

/** The connected wallet's items, favorites, offers and activity */
const AccountView = ({ tab, collections }: { tab: Tab; collections: Record<string, CollectionMeta> }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const [copied, setCopied] = useState(false)

  if (!wallet.address)
    return (
      <div className={`container ${styles.connect}`}>
        <span className={styles.connectIcon}>
          <WalletIcon size={28} />
        </span>
        <h1>Connect a wallet to see your profile</h1>
        <p>Your items, favorites and offers live with your wallet.</p>
        <button type="button" className={styles.primary} onClick={wallet.openConnect}>
          Connect wallet
        </button>
      </div>
    )

  const name = (slug: string, tokenId: number) => `${collections[slug]?.name ?? slug} #${tokenId}`
  const value = market.purchases.reduce((s, p) => s + (collections[p.slug]?.floor ?? 0), 0)
  const favorites = market.favorites.map((k) => {
    const [slug, id] = k.split('/')
    return { slug, tokenId: Number(id) }
  })
  const activity = [
    ...market.purchases.map((p) => ({ kind: 'Purchase' as const, slug: p.slug, tokenId: p.tokenId, price: p.price, at: p.at, signature: p.signature })),
    ...market.offers.map((o) => ({ kind: 'Offer' as const, slug: o.slug, tokenId: o.tokenId, price: o.amount, at: o.at, signature: o.signature })),
  ].sort((a, b) => b.at.localeCompare(a.at))
  const counts: Record<Tab, number> = { collected: market.purchases.length, favorites: favorites.length, offers: market.offers.length, activity: activity.length }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address!)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div>
      <div className={styles.banner} style={{ backgroundColor: `hsl(${hash(wallet.address) % 360} 42% 72%)` }} />
      <div className={`container ${styles.intro}`}>
        <img src={identicon(wallet.address)} alt="" className={styles.avatar} />
        <h1>{shortAddress(wallet.address)}</h1>
        <div className={styles.meta}>
          <button type="button" className={`mono ${styles.address}`} onClick={copy}>
            {wallet.address} {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <span className={styles.badge}>{wallet.kind === 'demo' ? 'Demo wallet' : 'Sepolia testnet'}</span>
        </div>
        <dl className={styles.stats}>
          <div>
            <dd className="mono">{market.purchases.length}</dd>
            <dt>Items</dt>
          </div>
          <div>
            <dd className="mono">{eth(value)} ETH</dd>
            <dt>Estimated value</dt>
          </div>
          <div>
            <dd className="mono">{wallet.balance === null ? '…' : `${eth(wallet.balance)} ETH`}</dd>
            <dt>{wallet.kind === 'demo' ? 'Demo balance' : 'Balance'}</dt>
          </div>
          <div>
            <dd className="mono">{market.offers.length}</dd>
            <dt>Offers</dt>
          </div>
        </dl>

        <nav className={styles.tabs}>
          {(Object.keys(LABELS) as Tab[]).map((t) => (
            <Link key={t} href={t === 'collected' ? '/account' : `/account?tab=${t}`} className={t === tab ? styles.tabOn : ''} scroll={false}>
              {LABELS[t]} <em>{counts[t]}</em>
            </Link>
          ))}
        </nav>

        {tab === 'collected' &&
          (market.purchases.length === 0 ? (
            <Empty text="You haven’t bought anything yet." />
          ) : (
            <div className={styles.grid}>
              {market.purchases.map((p) => (
                <ItemCard key={`${p.slug}/${p.tokenId}`} slug={p.slug} tokenId={p.tokenId} name={name(p.slug, p.tokenId)} price={null} note={`Bought for ${eth(p.price)} ETH`} />
              ))}
            </div>
          ))}

        {tab === 'favorites' &&
          (favorites.length === 0 ? (
            <Empty text="Tap the heart on any item to save it here." />
          ) : (
            <div className={styles.grid}>
              {favorites.map((f) => (
                <ItemCard key={`${f.slug}/${f.tokenId}`} slug={f.slug} tokenId={f.tokenId} name={name(f.slug, f.tokenId)} price={null} note={collections[f.slug]?.name} />
              ))}
            </div>
          ))}

        {tab === 'offers' &&
          (market.offers.length === 0 ? (
            <Empty text="Offers you make on items show up here." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Offer</th>
                    <th>Expires</th>
                    <th>Made</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {market.offers.map((o) => (
                    <tr key={`${o.slug}/${o.tokenId}`}>
                      <td>
                        <Link href={itemUrl(o.slug, o.tokenId)} className={styles.item}>
                          <img src={artUrl(o.slug, o.tokenId)} alt="" />
                          {name(o.slug, o.tokenId)}
                        </Link>
                      </td>
                      <td className="mono">{eth(o.amount)} ETH</td>
                      <td>{o.expiresDays} days</td>
                      <td className={styles.muted}>{when(o.at)}</td>
                      <td>
                        <button type="button" className={styles.cancel} onClick={() => market.cancelOffer(o.slug, o.tokenId)}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === 'activity' &&
          (activity.length === 0 ? (
            <Empty text="Purchases and offers you sign show up here." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Signature</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((a) => (
                    <tr key={`${a.kind}-${a.slug}-${a.tokenId}-${a.at}`}>
                      <td>
                        <span className={styles.event}>
                          {a.kind === 'Purchase' ? <ShoppingCart size={16} /> : <HandCoins size={16} />} {a.kind}
                        </span>
                      </td>
                      <td>
                        <Link href={itemUrl(a.slug, a.tokenId)} className={styles.item}>
                          <img src={artUrl(a.slug, a.tokenId)} alt="" />
                          {name(a.slug, a.tokenId)}
                        </Link>
                      </td>
                      <td className="mono">{eth(a.price)} ETH</td>
                      <td className={`mono ${styles.muted}`} title={a.signature}>
                        {a.signature.slice(0, 10)}…{a.signature.slice(-6)}
                      </td>
                      <td className={styles.muted}>{when(a.at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  )
}

const Empty = ({ text }: { text: string }) => (
  <div className={styles.empty}>
    <strong>Nothing here yet</strong>
    <span>{text}</span>
    <Link href="/explore" className={styles.primary}>
      Explore collections
    </Link>
  </div>
)

export default AccountView
