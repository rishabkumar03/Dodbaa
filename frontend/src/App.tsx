import { useState } from 'react'
import HomePage from './pages/HomePage'
import CookieBanner from './components/CookieBanner'
import AboutPage from './pages/AboutPage'
import OrderPage from './pages/OrderPage'
import Footer from './components/Footer'
import CartPage from './pages/CartPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'
import ProfilePage from './pages/ProfilePage'
import WishlistPage from './pages/WishlistPage'
import { Route, Router, Routes } from 'react-router-dom'

function App() {
  const [nav, setNav] = useState({ page: 'home', id: undefined as string | undefined })
  const [nav1, setNav1] = useState({ id: undefined as string | undefined })

  const handleNavigate = (page: string, id?: string) => {
    setNav({ page, id })
  }

  const handleNavigate1 = (id?: string) => {
    setNav1({ id })
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage onNavigate={handleNavigate} />} />
        <Route path='/about' element={<AboutPage onNavigate={handleNavigate} />} />
        <Route path='/order' element={<OrderPage onNavigate={handleNavigate} />} />
        <Route path='/cart' element={<CartPage onNavigate={handleNavigate} />} />
        <Route path='/products' element={<ProductsPage onNavigate={handleNavigate} />} />
        <Route path='/profile' element={<ProfilePage onNavigate={handleNavigate} />} />
        <Route path='/wishlist' element={<WishlistPage onNavigate={handleNavigate} />} />
        {/* <Route path='/wishlist' element={{ < ProductDetailPage onNavigate={handleNavigate1} /> }} /> */}
      </Routes>
      <CookieBanner />
    </>
  )
}

export default App