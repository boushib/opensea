// @ts-nocheck
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThirdwebWeb3Provider } from '@3rdweb/hooks'
import App from './App'
import './index.sass'

// 4 represents Rinkeby network
const supportedChainIDs = [4]

// Injcted is a web3 connection method use by metamask
const connectors = {
  injected: {},
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThirdwebWeb3Provider
        supportedChainIds={supportedChainIDs}
        connectors={connectors}
      >
        <App />
      </ThirdwebWeb3Provider>
    </BrowserRouter>
  </React.StrictMode>
)
