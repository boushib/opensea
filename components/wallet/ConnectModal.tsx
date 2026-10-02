'use client'

import { useEffect, useState } from 'react'
import { FlaskConical, Wallet as WalletIcon, X } from 'lucide-react'
import { DEMO_FUNDS, useWallet } from './WalletProvider'
import styles from './Wallet.module.sass'

/** Choose a browser wallet or the built-in demo wallet */
const ConnectModal = ({ onClose }: { onClose: () => void }) => {
  const wallet = useWallet()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const connectBrowser = async () => {
    setBusy(true)
    setError('')
    try {
      await wallet.connectBrowser()
    } catch (e) {
      setError(e instanceof Error && /reject|denied/i.test(e.message) ? 'You cancelled the request in your wallet.' : 'Couldn’t connect to your wallet. Is it unlocked?')
    }
    setBusy(false)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal aria-labelledby="connect-title" onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2 id="connect-title">Connect a wallet</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <button type="button" className={styles.option} onClick={connectBrowser} disabled={!wallet.hasBrowserWallet || busy}>
          <span className={styles.optionIcon}>
            <WalletIcon size={22} />
          </span>
          <span className={styles.optionText}>
            <strong>{busy ? 'Waiting for your wallet…' : 'Browser wallet'}</strong>
            <span>{wallet.hasBrowserWallet ? 'MetaMask, Rabby, Coinbase Wallet and others, on the Sepolia test network' : 'No wallet extension found in this browser'}</span>
          </span>
        </button>
        {!wallet.hasBrowserWallet && (
          <p className={styles.hint}>
            Install{' '}
            <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
              MetaMask
            </a>{' '}
            to use your own wallet, or try the demo wallet below.
          </p>
        )}

        <button type="button" className={styles.option} onClick={wallet.connectDemo}>
          <span className={`${styles.optionIcon} ${styles.optionDemo}`}>
            <FlaskConical size={22} />
          </span>
          <span className={styles.optionText}>
            <strong>Demo wallet</strong>
            <span>No extension needed. Starts with {DEMO_FUNDS} demo ETH, kept in this browser.</span>
          </span>
        </button>

        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.note}>This is a demo marketplace: buying and offers are signed messages, so no funds ever move, even with a real wallet.</p>
      </div>
    </div>
  )
}

export default ConnectModal
