import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import Collection from './pages/Collection'
import Home from './pages/Home'

const App = () => (
  <div className="app">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collections/:slug" element={<Collection />} />
    </Routes>
    <Footer />
  </div>
)

export default App
