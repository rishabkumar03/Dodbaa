import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_ARTISTS, MOCK_FEEDBACKS, CATEGORIES } from '../utils/mockData';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

interface HomePageProps {
  onNavigate: (page: string, id?: string) => void;
}

const spotlights = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80',
    title: 'Earthen Forms',
    subtitle: 'New ceramics collection',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=80',
    title: 'Painted Fields',
    subtitle: 'Original paintings',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1550159930-40066082a4fc?w=900&q=80',
    title: "Nature's Studio",
    subtitle: 'Organic sculptures',
  },
];

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [slide, setSlide] = useState(0);

  const prev = () => setSlide(s => (s - 1 + spotlights.length) % spotlights.length);
  const next = () => setSlide(s => (s + 1) % spotlights.length);

  const featuredProducts = MOCK_PRODUCTS.slice(0, 3);
  const artistProducts = MOCK_PRODUCTS.slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="max-w-screen-xl mx-auto px-4 pt-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-stone-900 leading-tight mb-4">
              Dodbaa is a platform,<br />
              where you introduced to various<br />
              talented artists and handcrafts<br />
              around the world.<br />
              <span className="text-stone-500">It is a connecting<br />bridge between you &amp; them.</span>
            </h1>
          </div>
          <div className="flex justify-end items-start pt-2">
            {/* Decorative light bulb illustration */}
            <div className="w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-70">
                <ellipse cx="40" cy="35" rx="22" ry="24" stroke="#D4A847" strokeWidth="2.5" />
                <path d="M28 58h24" stroke="#D4A847" strokeWidth="2" strokeLinecap="round" />
                <path d="M30 63h20" stroke="#D4A847" strokeWidth="2" strokeLinecap="round" />
                <path d="M33 68h14" stroke="#D4A847" strokeWidth="2" strokeLinecap="round" />
                <path d="M40 10V4M55 18l4-4M25 18l-4-4M62 35h6M12 35H6" stroke="#D4A847" strokeWidth="2" strokeLinecap="round" />
                <path d="M35 35c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#D4A847" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-screen-xl mx-auto px-4 py-4">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Categories</h2>
        <div className="flex gap-3 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onNavigate('products', cat)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 text-sm rounded-full transition-all duration-200 font-medium"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Spotlight Slider */}
      <section className="max-w-screen-xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Spotlights</h2>
        <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[16/7]">
          <img
            src={spotlights[slide].imageUrl}
            alt={spotlights[slide].title}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="text-2xl font-serif font-bold">{spotlights[slide].title}</h3>
            <p className="text-sm opacity-80">{spotlights[slide].subtitle}</p>
          </div>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors" aria-label="Previous">
            <ChevronLeft size={18} className="text-stone-700" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors" aria-label="Next">
            <ChevronRight size={18} className="text-stone-700" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {spotlights.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === slide ? 'bg-white w-4' : 'bg-white/50'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Collections */}
      <section className="max-w-screen-xl mx-auto px-4 py-4">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Meet Our Collections</h2>
        <div className="grid grid-cols-3 gap-3">
          {featuredProducts.map(p => (
            <div
              key={p.id}
              onClick={() => onNavigate('product', p.id)}
              className="aspect-square rounded-xl overflow-hidden bg-stone-100 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => onNavigate('products')}
            className="border border-green-600 text-green-700 text-sm px-5 py-2 rounded-full hover:bg-green-600 hover:text-white transition-all"
          >
            Browse more collections
          </button>
        </div>
      </section>

      {/* Meet Our Artists */}
      <section className="max-w-screen-xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Meet Our Artists</h2>
        <div className="grid grid-cols-3 gap-4">
          {MOCK_ARTISTS.map(artist => (
            <div key={artist.id} className="text-center">
              <div className="aspect-square rounded-xl bg-red-800 mb-2 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-2xl font-serif font-bold opacity-60">
                    {artist.name.charAt(0)}
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-stone-900">{artist.name}</p>
              <p className="text-xs text-stone-500">{artist.specialties.join(', ')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feedbacks */}
      <section className="max-w-screen-xl mx-auto px-4 py-4">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Feedbacks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MOCK_FEEDBACKS.map(fb => (
            <div key={fb.id} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <p className="text-sm text-stone-700 italic mb-3">{fb.text}</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-stone-300 flex items-center justify-center text-xs font-semibold text-stone-600">
                  {fb.user.charAt(0)}
                </div>
                <span className="text-xs font-medium text-stone-600">{fb.user}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </main>
  );
};

export default HomePage;
