import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { dismissCookieBanner } from '../store';

const CookieBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const dismissed = useAppSelector(s => s.ui.cookieBannerDismissed);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-100 border-t border-stone-200 px-4 py-3 flex items-center justify-between gap-4">
      <span className="text-sm text-stone-700">Accept Cookies</span>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => dispatch(dismissCookieBanner())}
          className="bg-stone-900 text-white text-sm px-4 py-1.5 rounded-full font-medium hover:bg-stone-700 transition-colors"
        >
          OK
        </button>
        <button
          onClick={() => dispatch(dismissCookieBanner())}
          className="border border-stone-300 text-stone-600 text-sm px-4 py-1.5 rounded-full hover:border-stone-500 transition-colors"
        >
          Manage Cookies
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
