import React from 'react';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleMenu, closeMenu } from '../store';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const dispatch = useAppDispatch();
  const menuOpen = useAppSelector(s => s.ui.menuOpen);
  const cartCount = useAppSelector(s => s.cart.items.reduce((acc, i) => acc + i.quantity, 0));

  const navItems = ['Profile', 'Products', 'Order', 'Wishlist', 'Cart', 'About'];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <button
          onClick={() => { onNavigate('home'); dispatch(closeMenu()); }}
          className="text-base font-semibold tracking-tight text-stone-900 shrink-0 font-serif"
        >
          Dodbaa.com
        </button>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Welcome To Dodbaa."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-stone-400 transition-colors"
          />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('cart')}
            className="relative p-1.5 text-stone-700 hover:text-stone-900 transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => dispatch(toggleMenu())}
            className="p-1.5 text-stone-700 hover:text-stone-900 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-4 top-14 bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden w-48 z-50">
          {navItems.map(item => (
            <button
              key={item}
              onClick={() => {
                onNavigate(item.toLowerCase());
                dispatch(closeMenu());
              }}
              className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors border-b border-stone-100 last:border-0
                ${currentPage === item.toLowerCase()
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:bg-stone-50'}`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
