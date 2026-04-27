import React from 'react';
import { MOCK_ARTISTS } from '../utils/mockData';
import Footer from '../components/Footer';

interface AboutPageProps {
  onNavigate: (page: string, id?: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <main>
      {/* Hero image */}
      <div className="w-full h-64 sm:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&q=80"
          alt="About Dodbaa — artisan at work"
          className="w-full h-full object-cover object-top"
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-8">
        {/* About section */}
        <div className="mb-10">
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-1">About Dodbaa</h1>
          <p className="text-xs text-red-700 font-semibold uppercase tracking-wider mb-3">Company</p>
          <p className="text-sm text-stone-600 leading-relaxed mb-2">
            Dodbaa is a platform which solves gifting or decorating solutions of your &amp; yourself.
          </p>
          <p className="text-sm text-stone-500 leading-relaxed">
            We believe that handcrafted art carries a soul that mass-produced goods can never replicate. 
            Our marketplace connects passionate collectors and gift-givers directly with talented artists 
            from across India and beyond, celebrating the beauty of traditional craftsmanship in a modern world.
          </p>
        </div>

        {/* Idea behind Dodbaa */}
        <div className="mb-10">
          <h2 className="text-xl font-serif font-bold text-stone-900 mb-6">Idea behind Dodbaa</h2>
          <div className="grid grid-cols-3 gap-4">
            {MOCK_ARTISTS.map(artist => (
              <div key={artist.id} className="text-center">
                <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 mx-auto mb-3 flex items-center justify-center overflow-hidden">
                  <span className="text-xl font-serif font-bold text-stone-400">{artist.name.charAt(0)}</span>
                </div>
                <button className="bg-red-800 text-white text-xs px-3 py-1.5 rounded-full font-medium hover:bg-red-700 transition-colors">
                  {artist.name}
                </button>
                <p className="text-xs text-stone-400 mt-2">{artist.specialties.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="bg-stone-900 rounded-2xl p-6 text-white mb-10">
          <h2 className="text-lg font-serif font-bold mb-3">Our Mission</h2>
          <p className="text-sm text-stone-300 leading-relaxed">
            To make authentic handcrafted art accessible to everyone — from first-time buyers 
            discovering the joy of owning a one-of-a-kind piece, to seasoned collectors seeking 
            their next treasure. We take care of the commerce so artists can focus on creating.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Authentic', desc: 'Every piece is handcrafted by real artists with verified credentials.' },
            { title: 'Sustainable', desc: 'We prioritize eco-friendly materials and ethical production practices.' },
            { title: 'Community', desc: 'A thriving community of creators and collectors, growing together.' },
          ].map(v => (
            <div key={v.title} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 mb-1">{v.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </main>
  );
};

export default AboutPage;
