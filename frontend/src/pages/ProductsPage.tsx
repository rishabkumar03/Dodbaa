import React, { useState, useMemo } from 'react';
import { MOCK_PRODUCTS, CATEGORIES } from '../utils/mockData';
import type { Category } from '../types';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

interface ProductsPageProps {
  onNavigate: (page: string, id?: string) => void;
  initialCategory?: string;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate, initialCategory }) => {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>(
    (initialCategory as Category) || 'All'
  );

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const title = activeCategory === 'All' ? 'All Products' : activeCategory;
  const subtitle = activeCategory === 'All'
    ? 'Explore our curated collection of handcrafted art.'
    : `Details about ${activeCategory.toLowerCase()} artworks.`;

  return (
    <main>
      <section className="max-w-screen-xl mx-auto px-4 pt-8 pb-4">
        {/* Header with decorative element */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">{title}</h1>
            <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>
          </div>
          {/* Decorative scissors/craft icon */}
          <div className="w-16 h-16 opacity-60">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect x="5" y="5" width="22" height="28" rx="4" fill="none" stroke="#1c1917" strokeWidth="2" transform="rotate(15 5 5)" />
              <rect x="30" y="8" width="22" height="28" rx="4" fill="none" stroke="#1c1917" strokeWidth="2" transform="rotate(-10 30 8)" />
              <circle cx="38" cy="42" r="8" fill="none" stroke="#1c1917" strokeWidth="2" />
              <path d="M32 42l12 0M38 36l0 12" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mt-4 mb-6">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-1.5 text-sm rounded-full border transition-all ${activeCategory === 'All'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-sm rounded-full border transition-all ${activeCategory === cat
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid — Masonry-style via CSS columns */}
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {filtered.map((product, i) => (
            <div key={product.id} className={`break-inside-avoid ${i % 3 === 1 ? 'mt-6' : ''}`}>
              <ProductCard
                product={product}
                onClick={() => onNavigate('product', product.id)}
              />
            </div>
          ))}
        </div>

        {/* "You can also try these" section */}
        {activeCategory !== 'All' && (
          <div className="mt-12">
            <h2 className="text-base font-semibold text-stone-900 mb-4">You can also try these:</h2>
            <div className="grid grid-cols-4 gap-3">
              {MOCK_PRODUCTS.filter(p => p.category !== activeCategory).slice(0, 4).map(p => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('product', p.id)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs font-medium text-stone-700 truncate">{p.name}</p>
                  <p className="text-xs text-stone-400">${p.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer onNavigate={onNavigate} />
    </main>
  );
};

export default ProductsPage;
