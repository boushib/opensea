import Link from 'next/link'
import { artUrl, type Collection } from '@/lib/catalog'
import { eth } from '@/lib/format'
import Verified from './Verified'
import styles from './CollectionCard.module.sass'

/** A collection as a card: a strip of its items, avatar, name, floor and volume */
const CollectionCard = ({ collection: c }: { collection: Collection }) => {
  // A few of its rarest pieces as the cover
  const cover = [...c.items].sort((a, b) => a.rank - b.rank).slice(0, 3)
  return (
    <Link href={`/collection/${c.slug}`} className={styles.card}>
      <div className={styles.cover}>
        {cover.map((i) => (
          <img key={i.tokenId} src={artUrl(c.slug, i.tokenId)} alt="" loading="lazy" />
        ))}
      </div>
      <div className={styles.body}>
        <img src={artUrl(c.slug, c.featured)} alt="" className={styles.avatar} loading="lazy" />
        <div className={styles.name}>
          <strong>{c.name}</strong>
          {c.verified && <Verified />}
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Floor</dt>
            <dd className="mono">{eth(c.stats.floor)} ETH</dd>
          </div>
          <div>
            <dt>Total volume</dt>
            <dd className="mono">{eth(c.stats.volume)} ETH</dd>
          </div>
        </dl>
      </div>
    </Link>
  )
}

export default CollectionCard
