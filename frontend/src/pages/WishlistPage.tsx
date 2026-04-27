import React from 'react';
import { Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addToCart, removeFromWishlist } from '../store';
import Footer from '../components/Footer';

interface WishlistPageProps {
  onNavigate: (page: string, id?: string) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(s => s.wishlist.items);

  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-serif font-semibold text-stone-900 mb-6 flex items-center gap-2">
          <Heart size={20} className="text-red-500" fill="currentColor" />
          Wishlist
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-500 mb-4">Your wishlist is empty.</p>
            <button
              onClick={() => onNavigate('products')}
              className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlistItems.map(({ product }) => (
              <div key={product.id} className="flex gap-4 bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
                <div
                  className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 cursor-pointer"
                  onClick={() => onNavigate('product', product.id)}
                >
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-400 mb-0.5">{product.category}</p>
                  <h3
                    className="text-sm font-semibold text-stone-900 mb-1 cursor-pointer hover:underline"
                    onClick={() => onNavigate('product', product.id)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm font-bold text-stone-900 mb-3">${product.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dispatch(addToCart(product))}
                      className="bg-stone-900 text-white text-xs px-3 py-1.5 rounded-full hover:bg-stone-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => dispatch(removeFromWishlist(product.id))}
                      className="border border-red-200 text-red-500 text-xs px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer onNavigate={onNavigate} />
    </main>
  );
};

export default WishlistPage;
