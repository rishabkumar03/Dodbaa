import React from 'react';
import { MapPin, Phone, Plus, RotateCcw } from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import Footer from '../components/Footer';

interface ProfilePageProps {
  onNavigate: (page: string, id?: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const user = useAppSelector(s => s.auth.user);

  if (!user) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 pt-16 text-center">
        <p className="text-stone-500 mb-4">Please log in to view your profile.</p>
        <button className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-medium">
          Log In
        </button>
      </div>
    );
  }

  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-8">
        {/* Avatar + Name */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-stone-200 shrink-0 overflow-hidden flex items-center justify-center">
            <span className="text-2xl font-serif font-bold text-stone-500">
              {user.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">{user.name}</h1>
            <p className="text-sm text-stone-500">{user.email}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-3">Addresses</h2>
          <div className="space-y-2">
            {user.addresses.map(addr => (
              <div key={addr.id} className="flex items-start gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-100">
                <MapPin size={16} className="text-stone-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-stone-600 mb-0.5">{addr.label}</p>
                  <p className="text-sm text-stone-700">{addr.full}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-2 bg-stone-900 text-white text-sm px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-stone-700 transition-colors">
            <Plus size={14} />
            Add Another Address
          </button>
        </div>

        {/* Contacts */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-3">Contacts</h2>
          <div className="space-y-2">
            {user.contacts.map((contact, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-100">
                <Phone size={16} className="text-stone-500 shrink-0" />
                <p className="text-sm text-stone-700">{contact}</p>
              </div>
            ))}
          </div>
          <button className="mt-2 bg-stone-900 text-white text-sm px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-stone-700 transition-colors">
            <Plus size={14} />
            Add Another Contact
          </button>
        </div>

        {/* Return policy icon */}
        <div className="flex justify-center mb-8">
          <div className="text-stone-300">
            <RotateCcw size={48} />
          </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </main>
  );
};

export default ProfilePage;
