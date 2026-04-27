import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { removeFromCart, updateQuantity, addToWishlist } from '../store';
import Footer from '../components/Footer';

interface CartPageProps {
  onNavigate: (page: string, id?: string) => void;
}

const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(s => s.cart.items);
  const total = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  const isEmpty = cartItems.length === 0;

  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-4 pt-8">
        {isEmpty ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              {/* Gift box illustration */}
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-30">
                <rect x="8" y="36" width="64" height="36" rx="3" stroke="#1c1917" strokeWidth="2.5" fill="none" />
                <rect x="4" y="24" width="72" height="14" rx="3" stroke="#1c1917" strokeWidth="2.5" fill="none" />
                <path d="M40 24V72" stroke="#1c1917" strokeWidth="2.5" />
                <path d="M40 24C40 24 30 20 28 14C26 8 32 6 36 10C38 12 40 16 40 16" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
                <path d="M40 24C40 24 50 20 52 14C54 8 48 6 44 10C42 12 40 16 40 16" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 36l4-4 4 4M60 36l4-4 4 4" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-xl font-serif font-semibold text-stone-900 mb-2">Your Cart is currently empty :(</h1>
            <button
              onClick={() => onNavigate('products')}
              className="mt-4 bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-serif font-semibold text-stone-900 mb-1">Your Cart</h1>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-stone-500">Complimentary exchange or return within 30 days. <button className="underline hover:text-stone-900">Read our conditions of sales.</button></p>
            </div>

            <h2 className="text-base font-semibold text-stone-900 mb-4">Final Cart:</h2>

            <div className="space-y-4 mb-8">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 items-start bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-400 mb-0.5">{product.category}</p>
                    <h3 className="text-sm font-semibold text-stone-900 mb-0.5">{product.name}</h3>
                    <p className="text-xs text-stone-500 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('order')}
                        className="bg-stone-900 text-white text-xs px-3 py-1.5 rounded-full hover:bg-stone-700 transition-colors"
                      >
                        Order Now
                      </button>
                      <button
                        onClick={() => {
                          dispatch(addToWishlist(product));
                          dispatch(removeFromCart(product.id));
                        }}
                        className="border border-stone-200 text-stone-600 text-xs px-3 py-1.5 rounded-full hover:border-stone-400 transition-colors"
                      >
                        Move to Wishlist
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-sm font-bold text-stone-900">${(product.price * quantity).toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => quantity > 1 ? dispatch(updateQuantity({ id: product.id, quantity: quantity - 1 })) : dispatch(removeFromCart(product.id))}
                        className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-xs font-medium w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ id: product.id, quantity: quantity + 1 }))}
                        className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(product.id))}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Total bar */}
        {!isEmpty && (
          <div className="sticky bottom-0 bg-white border-t border-stone-200 -mx-4 px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500">Total</p>
              <p className="text-xl font-bold text-stone-900">${total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => onNavigate('order')}
              className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors flex items-center gap-2"
            >
              <ShoppingBag size={16} />
              Checkout
            </button>
          </div>
        )}
      </div>

      <div className="pb-20">
        <Footer onNavigate={onNavigate} />
      </div>
    </main>
  );
};

export default CartPage;
