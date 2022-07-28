import { useWeb3 } from '@3rdweb/hooks'
import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import api from './api'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import Asset from './pages/Asset'
import Collection from './pages/Collection'
import Home from './pages/Home'

const App = () => {
  const { address, connectWallet } = useWeb3()

  useEffect(() => {
    if (address) {
      const createUserDoc = async () => {
        const { username } = await api.createIfNotExists({
          _type: 'user',
          _id: address,
          username: 'unnamed',
          address,
        })
        toast.success(
          `Welcome back ${username !== 'unnamed' ? username : ''}!`,
          {
            style: {
              backgroundColor: '#202225',
              color: '#fff',
            },
          }
        )
      }
      createUserDoc()
    }
  }, [address])

  return (
    <div className="app">
      <Navbar
        address={address}
        onConnectWallet={() => connectWallet('injected')}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections/:slug" element={<Collection />} />
        <Route path="/assets/:collectionId/:assetId" element={<Asset />} />
      </Routes>
      <Footer />
      <Toaster position="top-center" />
    </div>
  )
}

export default App
