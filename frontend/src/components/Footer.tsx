import React from 'react';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const nav = (page: string) => onNavigate?.(page);

  return (
    <footer className="bg-white border-t border-stone-200 mt-16">
      {/* Newsletter */}
      <div className="bg-stone-900 px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
        <span className="text-white text-sm font-medium shrink-0">Subscribe to our news letter</span>
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-3 py-1.5 text-sm rounded-md bg-stone-800 text-white placeholder-stone-400 border border-stone-700 focus:outline-none focus:border-stone-500 min-w-0"
        />
        <button className="bg-white text-stone-900 text-sm font-semibold px-5 py-1.5 rounded-md hover:bg-stone-100 transition-colors shrink-0">
          Subscribe
        </button>
      </div>

      {/* Footer Links */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div>
          <p className="font-semibold text-stone-900 mb-3 font-serif">Dodbaa.com</p>
          <div className="flex gap-3 text-stone-500">
            <Instagram size={16} className="hover:text-stone-900 cursor-pointer transition-colors" />
            <Facebook size={16} className="hover:text-stone-900 cursor-pointer transition-colors" />
            <Youtube size={16} className="hover:text-stone-900 cursor-pointer transition-colors" />
            <Twitter size={16} className="hover:text-stone-900 cursor-pointer transition-colors" />
          </div>
          <p className="text-xs text-stone-400 mt-3">Follow us on</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">Customer Care</p>
          <ul className="space-y-1.5">
            {['Contact Us', 'Call Now'].map(l => (
              <li key={l}><button className="text-xs text-stone-500 hover:text-stone-900 transition-colors">{l}</button></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">Legal Area</p>
          <ul className="space-y-1.5">
            {['Terms of Use', 'Privacy Policy'].map(l => (
              <li key={l}><button className="text-xs text-stone-500 hover:text-stone-900 transition-colors">{l}</button></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">More</p>
          <ul className="space-y-1.5">
            {['About Us', 'Careers'].map(l => (
              <li key={l}>
                <button
                  onClick={() => l === 'About Us' && nav('about')}
                  className="text-xs text-stone-500 hover:text-stone-900 transition-colors"
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
