import React from 'react';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { MOCK_PRODUCTS } from '../utils/mockData';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addToCart, addToWishlist, removeFromWishlist } from '../store';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, id?: string) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigate }) => {
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector(s => s.wishlist.items.map(i => i.product.id));

  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!product) return <div className="p-8 text-stone-500">Product not found.</div>;

  const isWishlisted = wishlistIds.includes(product.id);
  const related = MOCK_PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3)
    .concat(MOCK_PRODUCTS.filter(p => p.id !== product.id && p.category !== product.category).slice(0, 3 - MOCK_PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3).length));

  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-4 pt-6">
        <button
          onClick={() => onNavigate('products')}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to products
        </button>

        {/* Product detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-stone-100 aspect-square">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="py-2">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{product.category}</p>
            <h1 className="text-2xl font-serif font-bold text-stone-900 mb-1">{product.name}</h1>
            <p className="text-sm text-stone-500 mb-3">{product.subheading}</p>
            <p className="text-2xl font-bold text-stone-900 mb-4">${product.price.toFixed(2)}</p>

            <p className="text-sm text-stone-600 leading-relaxed mb-6">{product.description}</p>

            <button
              onClick={() => dispatch(addToCart(product))}
              className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors mb-3"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>

            <button
              onClick={() => isWishlisted ? dispatch(removeFromWishlist(product.id)) : dispatch(addToWishlist(product))}
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
                isWishlisted
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              {isWishlisted ? 'Wishlisted' : 'Move to Wishlist'}
            </button>

            <p className="text-xs text-stone-400 mt-4 text-center">
              Tax may be additional based on the price point
            </p>

            <div className="mt-6 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <p className="text-xs text-stone-500">
                Artist: <span className="font-medium text-stone-700">{product.artist}</span>
              </p>
            </div>
          </div>
        </div>

        {/* More Like That */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">More Like That</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MOCK_PRODUCTS.filter(p => p.id !== product.id).slice(0, 6).map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => onNavigate('product', p.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <Footer onNavigate={onNavigate} />
    </main>
  );
};

export default ProductDetailPage;
