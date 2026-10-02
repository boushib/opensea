'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shuffle, Sparkles, Wallet as WalletIcon } from 'lucide-react'
import { useWallet } from '@/components/wallet/WalletProvider'
import { signError } from '@/components/item/Modal'
import { createdSlug, createdUrl, MAX_SUPPLY, STYLES } from '@/lib/created'
import { useMarket } from '@/lib/market'
import { hash } from '@/lib/rng'
import { artUrl } from '@/lib/urls'
import styles from './Create.module.sass'

const seedFrom = (text: string) => hash(text).toString(36).padStart(6, '0').slice(0, 8)

/** Launch a collection: pick a name, an art style and a size, then sign */
const CreateForm = () => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState<string>(STYLES[0].slug)
  const [size, setSize] = useState('50')
  const [value, setValue] = useState('0.05')
  const [shuffles, setShuffles] = useState(0)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')

  if (!wallet.address)
    return (
      <div className={styles.connect}>
        <WalletIcon size={28} />
        <h2>Connect a wallet to create</h2>
        <p>Your collection belongs to the wallet that signs it.</p>
        <button type="button" className={styles.primary} onClick={wallet.openConnect}>
          Connect wallet
        </button>
      </div>
    )

  // Same wallet, same draft: the same preview until you shuffle
  const seed = seedFrom(`${wallet.address}/${market.creations.length}/${shuffles}`)
  const slug = createdSlug(style, seed)
  const supply = Number(size)
  const worth = Number(value)
  const problems = [
    !name.trim() && 'Give your collection a name',
    !(Number.isInteger(supply) && supply >= 10 && supply <= MAX_SUPPLY) && `Size must be a whole number from 10 to ${MAX_SUPPLY}`,
    !(worth > 0) && 'Item value must be above 0',
    market.creations.some((c) => c.name.toLowerCase() === name.trim().toLowerCase()) && 'You already have a collection with this name',
  ].filter(Boolean) as string[]

  const create = async () => {
    if (wallet.wrongNetwork) return wallet.switchNetwork()
    setError('')
    setSigning(true)
    const at = new Date().toISOString()
    try {
      const signature = await wallet.signMessage(`Create the collection "${name.trim()}" with ${supply} items\n\nOpenSea clone demo: nothing is deployed.\nCollection: ${slug}\nTime: ${at}`)
      market.create({ slug, name: name.trim(), description: description.trim(), style, size: supply, value: worth, minted: 0, at, signature })
      router.push(createdUrl(slug))
    } catch (e) {
      setError(signError(e))
      setSigning(false)
    }
  }

  return (
    <div className={styles.layout}>
      <div className={styles.form}>
        <label className={styles.field}>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder="Midnight Moths" />
        </label>
        <label className={styles.field}>
          <span>
            Description <em>optional</em>
          </span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 400))} rows={3} placeholder="What makes it special?" />
        </label>

        <div className={styles.field}>
          <span className={styles.fieldHead}>
            Art style
            <button type="button" className={styles.shuffle} onClick={() => setShuffles(shuffles + 1)}>
              <Shuffle size={15} /> Shuffle
            </button>
          </span>
          <div className={styles.styles} role="radiogroup" aria-label="Art style">
            {STYLES.map((s) => (
              <button key={s.slug} type="button" role="radio" aria-checked={s.slug === style} className={s.slug === style ? styles.styleOn : ''} onClick={() => setStyle(s.slug)}>
                <img src={artUrl(createdSlug(s.slug, seed), 1)} alt="" />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Items</span>
            <input value={size} onChange={(e) => setSize(e.target.value.replace(/\D/g, ''))} inputMode="numeric" />
            <small>10 to {MAX_SUPPLY}. You mint them when you like.</small>
          </label>
          <label className={styles.field}>
            <span>Value per item</span>
            <div className={styles.amount}>
              <input value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" />
              <b>ETH</b>
            </div>
            <small>Collectors buy listings priced near this.</small>
          </label>
        </div>

        {problems.length > 0 && name && <p className={styles.error}>{problems[0]}</p>}
        {error && <p className={styles.error}>{error}</p>}
        <button type="button" className={styles.primary} onClick={create} disabled={problems.length > 0 || signing}>
          <Sparkles size={18} /> {signing ? 'Confirm in your wallet…' : 'Sign to create'}
        </button>
        <p className={styles.fine}>Your wallet signs a message; nothing is deployed and no gas is spent.</p>
      </div>

      <aside className={styles.preview} aria-label="Preview">
        <div className={styles.previewArt}>
          {[1, 2, 3, 4].map((t) => (
            <img key={t} src={artUrl(slug, t)} alt="" />
          ))}
        </div>
        <strong>{name.trim() || 'Your collection'}</strong>
        <span>
          By you · {Number.isInteger(supply) && supply > 0 ? supply : '—'} items
        </span>
      </aside>
    </div>
  )
}

export default CreateForm
