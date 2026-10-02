'use client'

import { Check, ShoppingCart } from 'lucide-react'
import { useCart, type CartItem } from '@/lib/cart'
import styles from './Cart.module.sass'

/** Adds a listed item to the cart (or removes it); sits on item cards and the item page */
const CartButton = ({ item, variant = 'card' }: { item: CartItem; variant?: 'card' | 'wide' }) => {
  const cart = useCart()
  const inCart = cart.has(item.slug, item.tokenId)
  return (
    <button
      type="button"
      className={variant === 'card' ? `${styles.cardButton} ${inCart ? styles.cardButtonOn : ''}` : `${styles.wideButton} ${inCart ? styles.wideButtonOn : ''}`}
      onClick={(e) => {
        // On cards the button sits inside the item link
        e.preventDefault()
        e.stopPropagation()
        if (inCart) cart.remove(item.slug, item.tokenId)
        else cart.add(item)
      }}
      aria-pressed={inCart}
      aria-label={inCart ? `Remove ${item.name} from cart` : `Add ${item.name} to cart`}
    >
      {inCart ? <Check size={16} /> : <ShoppingCart size={16} />}
      {variant === 'wide' ? (inCart ? 'In cart' : 'Add to cart') : inCart ? 'In cart' : 'Add to cart'}
    </button>
  )
}

export default CartButton
