import ExpandableText from '@/components/ui/ExpandableText'
import Verified from '@/components/ui/Verified'
import { CATEGORIES, type Collection } from '@/lib/catalog'
import Link from 'next/link'
import { artUrl, userUrl } from '@/lib/urls'
import { count, eth } from '@/lib/format'
import styles from './Collection.module.sass'

/** Banner, avatar, name, creator, stats and description */
const CollectionHeader = ({ collection: c }: { collection: Collection }) => {
  const banner = [...c.items].sort((a, b) => a.rank - b.rank).slice(0, 10)
  const category = CATEGORIES.find((k) => k.slug === c.category)
  const stats = [
    { label: 'Floor price', value: `${eth(c.stats.floor)} ETH` },
    { label: 'Best offer', value: `${eth(c.stats.bestOffer)} ETH` },
    { label: 'Total volume', value: `${eth(c.stats.volume)} ETH` },
    { label: 'Listed', value: `${((c.stats.listed / c.size) * 100).toFixed(0)}%` },
    { label: 'Owners', value: count(c.stats.owners) },
    { label: 'Items', value: count(c.size) },
  ]

  return (
    <header>
      <div className={styles.banner}>
        {banner.map((i) => (
          <img key={i.tokenId} src={artUrl(c.slug, i.tokenId)} alt="" />
        ))}
      </div>
      <div className={`container ${styles.intro}`}>
        <img src={artUrl(c.slug, c.featured)} alt="" className={styles.avatar} />
        <div className={styles.titleRow}>
          <div>
            <h1>
              {c.name} {c.verified && <Verified size={24} />}
            </h1>
            <p className={styles.by}>
              By{' '}
              <Link href={userUrl(c.creatorUser.address)}>
                <strong>{c.creatorUser.name}</strong>
              </Link> {c.creatorUser.verified && <Verified size={14} />}
              <span className={styles.dot}>·</span>
              {category?.name}
              <span className={styles.dot}>·</span>
              Created {new Date(c.launchedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <dl className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="mono">{s.value}</dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <ExpandableText text={c.description} />
      </div>
    </header>
  )
}

export default CollectionHeader
