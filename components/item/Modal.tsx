'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { artUrl } from '@/lib/urls'
import styles from './Item.module.sass'

export const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export type ItemRef = { slug: string; tokenId: number; name: string; collectionName: string }

export const Summary = ({ slug, tokenId, name, collectionName }: ItemRef) => (
  <div className={styles.summary}>
    <img src={artUrl(slug, tokenId)} alt="" />
    <div>
      <strong>{name}</strong>
      <span>{collectionName}</span>
    </div>
  </div>
)

export const signError = (e: unknown) =>
  e instanceof Error && /reject|denied|cancel/i.test(e.message) ? 'You cancelled the signature in your wallet.' : 'Signing failed. Please try again.'

/** The message a wallet signs; every trade says plainly that no funds move */
export const tradeMessage = (action: string, item: ItemRef, at: string) =>
  `${action}\n\nOpenSea clone demo: no funds move.\nItem: ${item.slug}/${item.tokenId}\nTime: ${at}`
