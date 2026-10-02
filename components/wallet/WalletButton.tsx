'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Check, ChevronDown, Copy, Heart, HandCoins, LogOut, User } from 'lucide-react'
import { identicon } from '@/lib/identicon'
import { shortAddress } from '@/lib/users'
import { useWallet } from './WalletProvider'
import styles from './Wallet.module.sass'

/** "Connect wallet", or the connected wallet with its menu */
const WalletButton = () => {
  const wallet = useWallet()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  if (!wallet.address)
    return (
      <button type="button" className={styles.connect} onClick={wallet.openConnect} disabled={wallet.status === 'connecting'}>
        {wallet.status === 'connecting' ? 'Connecting…' : 'Connect wallet'}
      </button>
    )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address!)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className={styles.account} ref={ref}>
      <button type="button" className={styles.accountButton} onClick={() => setOpen(!open)} aria-expanded={open}>
        <img src={identicon(wallet.address)} alt="" />
        <span className="mono">{shortAddress(wallet.address)}</span>
        {wallet.wrongNetwork && <AlertTriangle size={16} className={styles.warn} />}
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className={styles.menu}>
          <div className={styles.menuHead}>
            <img src={identicon(wallet.address)} alt="" />
            <div>
              <button type="button" className={`mono ${styles.copy}`} onClick={copy}>
                {shortAddress(wallet.address)} {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <span className={styles.network}>{wallet.kind === 'demo' ? 'Demo wallet' : wallet.wrongNetwork ? 'Wrong network' : 'Sepolia testnet'}</span>
            </div>
          </div>
          <div className={styles.balance}>
            <span>{wallet.kind === 'demo' ? 'Demo balance' : 'Balance'}</span>
            <strong className="mono">{wallet.balance === null ? '…' : `${wallet.balance.toFixed(4).replace(/\.?0+$/, '')} ETH`}</strong>
          </div>
          {wallet.wrongNetwork && (
            <button type="button" className={styles.switch} onClick={wallet.switchNetwork}>
              <AlertTriangle size={16} /> Switch to Sepolia
            </button>
          )}
          <Link href="/account" onClick={() => setOpen(false)}>
            <User size={17} /> Profile
          </Link>
          <Link href="/account?tab=favorites" onClick={() => setOpen(false)}>
            <Heart size={17} /> Favorites
          </Link>
          <Link href="/account?tab=offers" onClick={() => setOpen(false)}>
            <HandCoins size={17} /> My offers
          </Link>
          <button
            type="button"
            onClick={() => {
              wallet.disconnect()
              setOpen(false)
            }}
          >
            <LogOut size={17} /> Disconnect
          </button>
        </div>
      )}
    </div>
  )
}

export default WalletButton
