'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Sparkles } from 'lucide-react'
import ItemCard from '@/components/ui/ItemCard'
import ExpandableText from '@/components/ui/ExpandableText'
import { useWallet } from '@/components/wallet/WalletProvider'
import { signError } from '@/components/item/Modal'
import { STYLES } from '@/lib/created'
import { eth } from '@/lib/format'
import { useMarket } from '@/lib/market'
import { artUrl } from '@/lib/urls'
import header from '@/components/collection/Collection.module.sass'
import styles from './Create.module.sass'

/** A collection you created: mint more items and see the ones you've minted */
const CreatedCollection = ({ slug }: { slug: string }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const c = market.creationOf(slug)
  const [quantity, setQuantity] = useState(1)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')

  if (!c)
    return (
      <div className={`container ${styles.missing}`}>
        <h1>Collection not found</h1>
        <p>Collections you create live with the wallet that made them, in this browser. Connect that wallet to see it.</p>
        <Link href="/create">Create a collection</Link>
      </div>
    )

  const left = c.size - c.minted
  const n = Math.min(quantity, left)
  const tokens = Array.from({ length: c.minted }, (_, i) => i + 1)
  const preview = Array.from({ length: 10 }, (_, i) => i + 1)
  const stats = [
    { label: 'Value per item', value: `${eth(c.value)} ETH` },
    { label: 'Minted', value: `${c.minted} / ${c.size}` },
    { label: 'Style', value: STYLES.find((s) => s.slug === c.style)?.label ?? c.style },
  ]

  const mint = async () => {
    if (wallet.wrongNetwork) return wallet.switchNetwork()
    setError('')
    setSigning(true)
    const at = new Date().toISOString()
    try {
      const signature = await wallet.signMessage(`Mint ${n} from "${c.name}"\n\nOpenSea clone demo: nothing is deployed.\nCollection: ${c.slug}\nTime: ${at}`)
      market.mint(c.slug, n, at, signature)
      setQuantity(1)
    } catch (e) {
      setError(signError(e))
    }
    setSigning(false)
  }

  return (
    <>
      <header>
        <div className={header.banner}>
          {preview.map((t) => (
            <img key={t} src={artUrl(c.slug, t)} alt="" />
          ))}
        </div>
        <div className={`container ${header.intro}`}>
          <img src={artUrl(c.slug, 1)} alt="" className={header.avatar} />
          <div className={header.titleRow}>
            <div>
              <h1>{c.name}</h1>
              <p className={header.by}>
                By{' '}
                <Link href="/account?tab=created">
                  <strong>you</strong>
                </Link>
                <span className={header.dot}>·</span>
                Created {new Date(c.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <dl className={header.stats}>
              {stats.map((s) => (
                <div key={s.label}>
                  <dd className="mono">{s.value}</dd>
                  <dt>{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          {c.description && <ExpandableText text={c.description} />}

          <div className={styles.mintBar}>
            <div className={styles.progress}>
              <span>{left > 0 ? `${left} of ${c.size} left to mint` : 'Fully minted'}</span>
              <div className={styles.bar}>
                <i style={{ width: `${(c.minted / c.size) * 100}%` }} />
              </div>
            </div>
            {left > 0 && (
              <>
                <div className={styles.stepper}>
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={n <= 1} aria-label="Fewer">
                    <Minus size={16} />
                  </button>
                  <span className="mono">{n}</span>
                  <button type="button" onClick={() => setQuantity(Math.min(10, quantity + 1))} disabled={n >= Math.min(10, left)} aria-label="More">
                    <Plus size={16} />
                  </button>
                </div>
                <button type="button" className={styles.primary} onClick={mint} disabled={signing}>
                  <Sparkles size={18} /> {signing ? 'Confirm in your wallet…' : `Mint ${n}`}
                </button>
              </>
            )}
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </header>

      <section className={`container ${styles.items}`}>
        <h2>Minted items</h2>
        {tokens.length === 0 ? (
          <p className={header.empty}>Nothing minted yet. Mint the first items above; they go straight to your wallet.</p>
        ) : (
          <div className={header.grid}>
            {tokens.map((t) => (
              <ItemCard key={t} slug={c.slug} tokenId={t} name={`${c.name} #${t}`} price={market.listingOf(c.slug, t)?.price ?? null} note={market.owns(c.slug, t) ? 'In your wallet' : `Owned by ${market.passedTo(c.slug, t)?.name ?? 'someone'}`} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default CreatedCollection
