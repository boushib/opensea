import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

/** Get one free at https://dashboard.reown.com; without it the WalletConnect option stays off */
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

const APP = { name: 'OpenSea clone', description: 'A demo NFT marketplace on Sepolia', url: 'https://github.com/boushib/opensea', icons: [] as string[] }

/**
 * Real wallets on the Sepolia test network: browser extensions, Coinbase Wallet (app or
 * extension) and, with a project ID, any mobile wallet through WalletConnect.
 * Mainnet is only here to look up ENS names.
 */
export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    injected(),
    coinbaseWallet({ appName: APP.name }),
    ...(WALLETCONNECT_PROJECT_ID ? [walletConnect({ projectId: WALLETCONNECT_PROJECT_ID, metadata: APP, showQrModal: true })] : []),
  ],
  transports: { [sepolia.id]: http(), [mainnet.id]: http() },
  ssr: true,
})

export type ConnectorKind = 'injected' | 'coinbase' | 'walletconnect'
export const CONNECTOR_IDS: Record<ConnectorKind, string> = { injected: 'injected', coinbase: 'coinbaseWalletSDK', walletconnect: 'walletConnect' }

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
