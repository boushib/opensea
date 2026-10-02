import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

const KEY = 'demo-wallet-key'

/**
 * A wallet that lives in this browser, for trying the marketplace without an extension.
 * It holds no real funds: its key is random and only signs messages.
 */
export const loadDemoAccount = (create: boolean) => {
  try {
    let key = localStorage.getItem(KEY) as `0x${string}` | null
    if (!key && create) {
      key = generatePrivateKey()
      localStorage.setItem(KEY, key)
    }
    return key ? privateKeyToAccount(key) : null
  } catch {
    return null
  }
}

export const forgetDemoAccount = () => {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}
