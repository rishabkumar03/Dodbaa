import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addToCart } from '../store';
import { addToWishlist, removeFromWishlist } from '../store';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector(s => s.wishlist.items.map(i => i.product.id));
  const isWishlisted = wishlistIds.includes(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const handleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addToCart(product));
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-stone-300 transition-all duration-300 hover:shadow-md cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-stone-500 hover:bg-white hover:text-red-500'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-3">
        <p className="text-xs text-stone-400 mb-0.5">{product.category}</p>
        <h3 className="text-sm font-semibold text-stone-900 leading-snug mb-0.5 truncate">{product.name}</h3>
        <p className="text-xs text-stone-500 truncate mb-2">{product.description.slice(0, 50)}…</p>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-stone-900">${product.price.toFixed(2)}</span>
          <button
            onClick={handleCart}
            className="flex items-center gap-1.5 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-full hover:bg-stone-700 transition-colors"
          >
            <ShoppingCart size={12} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
