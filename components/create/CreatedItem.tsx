'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ItemActions from '@/components/item/ItemActions'
import { useWallet } from '@/components/wallet/WalletProvider'
import { createdTraits } from '@/lib/art/draw'
import { createdUrl } from '@/lib/created'
import { useMarket } from '@/lib/market'
import { artUrl } from '@/lib/urls'
import styles from '@/components/item/Item.module.sass'

/** An item from a collection someone created in this browser, named by ?c=<slug>&t=<token> */
const CreatedItem = () => {
  const params = useSearchParams()
  const slug = params.get('c') ?? ''
  const tokenId = Number(params.get('t'))
  const traits = createdTraits(slug, tokenId)
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const c = market.creationOf(slug)

  if (!traits)
    return (
      <div className={`container ${styles.page}`}>
        <h1>Item not found</h1>
      </div>
    )

  const minted = !!c && tokenId <= c.minted
  const collectionName = c?.name ?? 'Created collection'
  const name = `${collectionName} #${tokenId}`

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.layout}>
        <div className={styles.artWrap}>
          <img src={artUrl(slug, tokenId)} alt={name} className={styles.art} />
        </div>
        <div className={styles.left}>
          <details className={styles.panel} open>
            <summary>Traits</summary>
            <div className={styles.traits}>
              {Object.entries(traits).map(([type, value]) => (
                <div key={type} className={styles.trait}>
                  <span>{type}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </details>
          {c?.description && (
            <details className={styles.panel}>
              <summary>About {c.name}</summary>
              <p className={styles.about}>{c.description}</p>
            </details>
          )}
        </div>
        <div className={styles.right}>
          <Link href={createdUrl(slug)} className={styles.collection}>
            {collectionName}
          </Link>
          <h1>{name}</h1>
          {minted ? (
            <ItemActions slug={slug} tokenId={tokenId} name={name} collectionName={collectionName} owner={null} price={null} listingDays={0} bestOffer={null} floor={c.value} fair={c.value} />
          ) : (
            <p className={styles.empty}>{c ? 'This item hasn’t been minted yet.' : 'This collection was created with another wallet or in another browser.'}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreatedItem
