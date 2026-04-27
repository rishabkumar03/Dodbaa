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
      <HomePage onNavigate={handleNavigate} />
      <AboutPage onNavigate={handleNavigate} />
      <OrderPage onNavigate={handleNavigate} />
      <CartPage onNavigate={handleNavigate} />
      <ProductsPage onNavigate={handleNavigate} />
      {/* <ProductDetailPage onNavigate={handleNavigate1} /> */}
      <ProfilePage onNavigate={handleNavigate} />
      <WishlistPage onNavigate={handleNavigate} />
      <CookieBanner />
    </>
  )
}

export default App