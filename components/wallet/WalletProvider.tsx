'use client'

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { formatEther } from 'viem'
import { useBalance, useConnect, useConnection, useConnectors, useDisconnect, useSignMessage, useSwitchChain, WagmiProvider } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { useMarket } from '@/lib/market'
import { simulate } from '@/lib/simulator'
import { loadDemoAccount } from '@/lib/wallet/demo'
import { wagmiConfig } from '@/lib/wallet/config'
import ConnectModal from './ConnectModal'

/** Demo ETH the demo wallet starts with */
export const DEMO_FUNDS = 25

export type Wallet = {
  status: 'disconnected' | 'connecting' | 'connected'
  kind: 'browser' | 'demo' | null
  address: `0x${string}` | null
  /** Balance in ETH: Sepolia ETH for a browser wallet, demo ETH for the demo wallet */
  balance: number | null
  wrongNetwork: boolean
  hasBrowserWallet: boolean
  signMessage: (message: string) => Promise<`0x${string}`>
  connectBrowser: () => Promise<void>
  connectDemo: () => void
  disconnect: () => void
  switchNetwork: () => void
  openConnect: () => void
}

const WalletContext = createContext<Wallet | null>(null)

// The demo wallet's "connected" flag, shared across components and tabs
const DEMO_FLAG = 'demo-wallet-connected'
const demoListeners = new Set<() => void>()
const demoStore = {
  subscribe: (l: () => void) => {
    demoListeners.add(l)
    window.addEventListener('storage', l)
    return () => {
      demoListeners.delete(l)
      window.removeEventListener('storage', l)
    }
  },
  connected: () => {
    try {
      return localStorage.getItem(DEMO_FLAG) === '1'
    } catch {
      return false
    }
  },
  set: (on: boolean) => {
    try {
      if (on) localStorage.setItem(DEMO_FLAG, '1')
      else localStorage.removeItem(DEMO_FLAG)
    } catch {}
    demoListeners.forEach((l) => l())
  },
}

const hasEthereum = () => typeof window !== 'undefined' && 'ethereum' in window

const WalletState = ({ children }: { children: ReactNode }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const connection = useConnection()
  const connectors = useConnectors()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const sign = useSignMessage()
  const switchChain = useSwitchChain()
  const demoOn = useSyncExternalStore(demoStore.subscribe, demoStore.connected, () => false)
  const hasBrowserWallet = useSyncExternalStore(() => () => {}, hasEthereum, () => false)
  const demo = demoOn ? loadDemoAccount(false) : null

  const browserAddress = connection.status === 'connected' ? connection.address : null
  const address = browserAddress ?? demo?.address ?? null
  const balance = useBalance({ address: browserAddress ?? undefined, chainId: sepolia.id, query: { enabled: !!browserAddress } })
  const market = useMarket(demo?.address ?? null)
  // Demo ETH: spent on purchases and mints, earned from sales
  const demoSpent = market.purchases.reduce((s, p) => s + p.price, 0) - market.sales.reduce((s, x) => s + x.price, 0)

  // The rest of the market reacts to your listings and offers while you browse
  useEffect(() => {
    if (!address) return
    simulate(address)
    const timer = setInterval(() => simulate(address), 5000)
    return () => clearInterval(timer)
  }, [address])

  const wallet: Wallet = {
    status: address ? 'connected' : connection.status === 'connecting' || connection.status === 'reconnecting' ? 'connecting' : 'disconnected',
    kind: browserAddress ? 'browser' : demo ? 'demo' : null,
    address,
    balance: browserAddress ? (balance.data ? Number(formatEther(balance.data.value)) : null) : demo ? Math.max(0, DEMO_FUNDS - demoSpent) : null,
    wrongNetwork: !!browserAddress && connection.chainId !== sepolia.id,
    hasBrowserWallet,
    signMessage: async (message) => {
      if (browserAddress) return sign.mutateAsync({ message })
      if (demo) return demo.signMessage({ message })
      throw new Error('Connect a wallet first')
    },
    connectBrowser: async () => {
      demoStore.set(false)
      await connect.mutateAsync({ connector: connectors[0], chainId: sepolia.id })
      setModalOpen(false)
    },
    connectDemo: () => {
      if (browserAddress) disconnect.mutate()
      loadDemoAccount(true)
      demoStore.set(true)
      setModalOpen(false)
    },
    disconnect: () => {
      if (browserAddress) disconnect.mutate()
      if (demoOn) demoStore.set(false)
    },
    switchNetwork: () => switchChain.mutate({ chainId: sepolia.id }),
    openConnect: () => setModalOpen(true),
  }

  return (
    <WalletContext.Provider value={wallet}>
      {children}
      {modalOpen && <ConnectModal onClose={() => setModalOpen(false)} />}
    </WalletContext.Provider>
  )
}

/** Wagmi, React Query and the wallet context for the whole app */
export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletState>{children}</WalletState>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export const useWallet = () => {
  const wallet = useContext(WalletContext)
  if (!wallet) throw new Error('useWallet needs <Providers>')
  return wallet
}

