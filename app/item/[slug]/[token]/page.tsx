import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Eye, HandCoins, Sparkles, ShoppingCart, Tag, Truck } from 'lucide-react'
import FavoriteButton from '@/components/item/FavoriteButton'
import ItemActions from '@/components/item/ItemActions'
import PriceChart from '@/components/item/PriceChart'
import ItemCard from '@/components/ui/ItemCard'
import Verified from '@/components/ui/Verified'
import { getAuctionLot } from '@/lib/auctionLots'
import CreatedItem from '@/components/create/CreatedItem'
import { createdTraits, getItem, getUser } from '@/lib/catalog'
import { parseCreated } from '@/lib/created'
import { ago, count, eth } from '@/lib/format'
import { itemDetails } from '@/lib/itemDetails'
import { person } from '@/lib/people'
import UserLink from '@/components/user/UserLink'
import { shortAddress } from '@/lib/users'
import { artUrl } from '@/lib/urls'
import styles from '@/components/item/Item.module.sass'

export async function generateMetadata({ params }: PageProps<'/item/[slug]/[token]'>): Promise<Metadata> {
  const { slug, token } = await params
  if (parseCreated(slug)) return { title: `Item #${token}` }
  const found = getItem(slug, Number(token))
  return found ? { title: found.item.name, description: found.collection.description } : {}
}

const EVENT = {
  mint: { label: 'Minted', icon: Sparkles },
  sale: { label: 'Sale', icon: ShoppingCart },
  listing: { label: 'Listing', icon: Tag },
  offer: { label: 'Offer', icon: HandCoins },
  transfer: { label: 'Transfer', icon: Truck },
} as const

export default async function ItemPage({ params }: PageProps<'/item/[slug]/[token]'>) {
  const { slug, token } = await params
  if (parseCreated(slug)) {
    const traits = createdTraits(slug, Number(token))
    if (!traits) notFound()
    return <CreatedItem slug={slug} tokenId={Number(token)} traits={traits} />
  }
  const found = getItem(slug, Number(token))
  if (!found) notFound()
  const { collection: c, item } = found
  const d = itemDetails(c, item)
  const owner = getUser(item.ownerId)
  const more = c.items.filter((i) => i.tokenId !== item.tokenId && i.price !== null).slice(0, 8)

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.layout}>
        <div className={styles.artWrap}>
          <img src={artUrl(slug, item.tokenId)} alt={item.name} className={styles.art} />
          <FavoriteButton slug={slug} tokenId={item.tokenId} base={d.favorites} />
        </div>
        <div className={styles.left}>

          <details className={styles.panel} open>
            <summary>Traits</summary>
            <div className={styles.traits}>
              {d.traits.map((t) => (
                <Link key={t.type} href={`/collection/${slug}`} className={styles.trait}>
                  <span>{t.type}</span>
                  <strong>{t.value}</strong>
                  <em>{(t.share * 100).toFixed(t.share < 0.1 ? 1 : 0)}% have this</em>
                </Link>
              ))}
            </div>
          </details>

          <details className={styles.panel}>
            <summary>About {c.name}</summary>
            <p className={styles.about}>{c.description}</p>
          </details>

          <details className={styles.panel}>
            <summary>Details</summary>
            <dl className={styles.details}>
              <div>
                <dt>Contract address</dt>
                <dd className="mono">{shortAddress(d.contract)}</dd>
              </div>
              <div>
                <dt>Token ID</dt>
                <dd className="mono">{item.tokenId}</dd>
              </div>
              <div>
                <dt>Token standard</dt>
                <dd>ERC-721</dd>
              </div>
              <div>
                <dt>Chain</dt>
                <dd>Ethereum (demo)</dd>
              </div>
              <div>
                <dt>Creator earnings</dt>
                <dd>5%</dd>
              </div>
            </dl>
          </details>
        </div>

        <div className={styles.right}>
          <Link href={`/collection/${slug}`} className={styles.collection}>
            {c.name} {c.verified && <Verified size={16} />}
          </Link>
          <h1>{item.name}</h1>
          <ItemActions
            slug={slug}
            tokenId={item.tokenId}
            name={item.name}
            collectionName={c.name}
            owner={owner ? { name: owner.name, address: owner.address } : null}
            price={item.price}
            listingDays={item.listingDays}
            bestOffer={item.bestOffer}
            floor={c.stats.floor}
            fair={item.price ?? item.lastSale?.price ?? c.stats.floor}
            auction={getAuctionLot(slug, item.tokenId)}
          />
          <div className={styles.chips}>
            <span>
              <Sparkles size={15} /> Rarity #{item.rank} of {count(c.size)}
            </span>
            <span>
              <Eye size={15} /> {d.views} views
            </span>
            <span>Floor {eth(c.stats.floor)} ETH</span>
          </div>

          <section className={styles.panel}>
            <h2>Price history</h2>
            <PriceChart points={d.history} />
          </section>

          <section className={styles.panel}>
            <h2>Offers</h2>
            {d.offers.length === 0 ? (
              <p className={styles.empty}>No offers yet.</p>
            ) : (
              <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Price</th>
                    <th>Floor difference</th>
                    <th>Expires</th>
                    <th>From</th>
                  </tr>
                </thead>
                <tbody>
                  {d.offers.map((o, i) => (
                    <tr key={i}>
                      <td className="mono">{eth(o.amount)} ETH</td>
                      <td>{(((o.amount - c.stats.floor) / c.stats.floor) * 100).toFixed(0)}%</td>
                      <td>in {o.expiresDays}d</td>
                      <td className={styles.who}>
                        <UserLink user={person(o.from)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </section>
        </div>
      </div>

      <section className={styles.panel}>
        <h2>Item activity</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event</th>
                <th>Price</th>
                <th>From</th>
                <th>To</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {d.events.map((e, i) => {
                const Icon = EVENT[e.kind].icon
                return (
                  <tr key={i}>
                    <td>
                      <span className={styles.event}>
                        <Icon size={16} /> {EVENT[e.kind].label}
                      </span>
                    </td>
                    <td className="mono">{e.price !== null ? `${eth(e.price)} ETH` : '—'}</td>
                    <td className={styles.who}>{e.kind === 'mint' ? 'NullAddress' : <UserLink user={person(e.from)} />}</td>
                    <td className={styles.who}>
                      <UserLink user={person(e.to)} />
                    </td>
                    <td className={styles.time}>{ago(e.ageHours)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {more.length > 0 && (
        <section className={styles.more}>
          <div className={styles.moreHead}>
            <h2>More from this collection</h2>
            <Link href={`/collection/${slug}`}>View collection</Link>
          </div>
          <div className={styles.rail}>
            {more.map((i) => (
              <ItemCard key={i.tokenId} slug={slug} tokenId={i.tokenId} name={i.name} rank={i.rank} price={i.price} lastSale={i.lastSale?.price ?? null} buyable />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
