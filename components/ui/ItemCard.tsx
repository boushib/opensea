import Link from 'next/link'
import CartButton from '@/components/cart/CartButton'
import { artUrl } from '@/lib/urls'
import { eth } from '@/lib/format'
import styles from './ItemCard.module.sass'

type Props = {
  slug: string
  tokenId: number
  name: string
  rank?: number
  price: number | null
  lastSale?: number | null
  note?: string
  /** The price is a live listing, so it can go in the cart */
  buyable?: boolean
}

/** An item in a grid: art, name, price (or last sale) and rarity rank */
const ItemCard = ({ slug, tokenId, name, rank, price, lastSale, note, buyable }: Props) => (
  <Link href={`/item/${slug}/${tokenId}`} className={styles.card}>
    <div className={styles.art}>
      <img src={artUrl(slug, tokenId)} alt={name} loading="lazy" width={400} height={400} />
      {rank && <span className={styles.rank}>#{rank}</span>}
      {buyable && price !== null && <CartButton item={{ slug, tokenId, name, price }} />}
    </div>
    <div className={styles.body}>
      <strong>{name}</strong>
      {price !== null ? (
        <span className={`mono ${styles.price}`}>{eth(price)} ETH</span>
      ) : (
        <span className={styles.muted}>Not listed</span>
      )}
      <span className={styles.muted}>{note ?? (lastSale ? `Last sale ${eth(lastSale)} ETH` : ' ')}</span>
    </div>
  </Link>
)

export default ItemCard
