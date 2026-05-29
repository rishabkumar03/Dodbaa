import HomePage from './pages/HomePage'
import CookieBanner from './components/CookieBanner'
import AboutPage from './pages/AboutPage'
import OrderPage from './pages/OrderPage'
import CartPage from './pages/CartPage'
import ProductsPage from './pages/ProductsPage'
import ProfilePage from './pages/ProfilePage'
import WishlistPage from './pages/WishlistPage'
import { Route, Routes } from 'react-router-dom'

function App() {
    return (
        <>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/about' element={<AboutPage />} />
                <Route path='/order' element={<OrderPage />} />
                <Route path='/cart' element={<CartPage />} />
                <Route path='/product/:productId' element={<ProductsPage />} />
                <Route path='/profile' element={<ProfilePage />} />
                <Route path='/wishlist' element={<WishlistPage />} />
            </Routes>
            <CookieBanner />
        </>
    )
}

export default App