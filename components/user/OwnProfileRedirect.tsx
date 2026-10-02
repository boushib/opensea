'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/components/wallet/WalletProvider'

/** Sends you to /account when the profile is your own connected wallet */
const OwnProfileRedirect = ({ address }: { address: string }) => {
  const wallet = useWallet()
  const router = useRouter()
  const mine = wallet.address?.toLowerCase() === address.toLowerCase()
  useEffect(() => {
    if (mine) router.replace('/account')
  }, [mine, router])
  return null
}

export default OwnProfileRedirect
