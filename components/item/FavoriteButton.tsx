'use client'

import { Heart } from 'lucide-react'
import { useWallet } from '@/components/wallet/WalletProvider'
import { useMarket } from '@/lib/market'
import styles from './Item.module.sass'

/** Heart with the favorite count; favorites belong to the connected wallet */
const FavoriteButton = ({ slug, tokenId, base }: { slug: string; tokenId: number; base: number }) => {
  const wallet = useWallet()
  const market = useMarket(wallet.address)
  const on = market.isFavorite(slug, tokenId)
  return (
    <button
      type="button"
      className={`${styles.favorite} ${on ? styles.favoriteOn : ''}`}
      onClick={() => (wallet.address ? market.toggleFavorite(slug, tokenId) : wallet.openConnect())}
      aria-pressed={on}
      aria-label={on ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart size={18} fill={on ? 'currentColor' : 'none'} /> {base + (on ? 1 : 0)}
    </button>
  )
}

export default FavoriteButton
