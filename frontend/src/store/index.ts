import * as toolkit from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, WishlistItem, Product, User } from '../types';

// ─── Cart Slice ─────────────────────────────────────────────────────────────
const cartSlice = toolkit.createSlice({
  name: 'cart',
  initialState: { items: [] as CartItem[] },
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find(i => i.product.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.product.id !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find(i => i.product.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

// ─── Wishlist Slice ──────────────────────────────────────────────────────────
const wishlistSlice = toolkit.createSlice({
  name: 'wishlist',
  initialState: { items: [] as WishlistItem[] },
  reducers: {
    addToWishlist(state, action: PayloadAction<Product>) {
      if (!state.items.find(i => i.product.id === action.payload.id)) {
        state.items.push({ product: action.payload, addedAt: new Date().toISOString() });
      }
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.product.id !== action.payload);
    },
  },
});

// ─── UI Slice ────────────────────────────────────────────────────────────────
const uiSlice = toolkit.createSlice({
  name: 'ui',
  initialState: { menuOpen: false, cookieBannerDismissed: false },
  reducers: {
    toggleMenu(state) { state.menuOpen = !state.menuOpen; },
    closeMenu(state) { state.menuOpen = false; },
    dismissCookieBanner(state) { state.cookieBannerDismissed = true; },
  },
});

// ─── Auth Slice ──────────────────────────────────────────────────────────────
type AuthState = { user: User | null; isLoggedIn: boolean };

const mockUser: User = {
  id: '1',
  name: 'Rishab Kumar',
  email: 'abc@email.com',
  addresses: [
    { id: '1', label: 'Home', full: '12 Artisan Lane, New Delhi 110001' },
    { id: '2', label: 'Work', full: '45 Creative Park, Mumbai 400001' },
  ],
  contacts: ['+91 98765 43210', '+91 87654 32109'],
};

const authSlice = toolkit.createSlice({
  name: 'auth',
  initialState: { user: mockUser, isLoggedIn: true } as AuthState,
  reducers: {
    login(state, action: PayloadAction<User>) { state.user = action.payload; state.isLoggedIn = true; },
    logout(state) { state.user = null; state.isLoggedIn = false; },
  },
});

// ─── Store ───────────────────────────────────────────────────────────────────
export const store = toolkit.configureStore({
  reducer: {
    cart: cartSlice.reducer,
    wishlist: wishlistSlice.reducer,
    ui: uiSlice.reducer,
    auth: authSlice.reducer,
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export const { toggleMenu, closeMenu, dismissCookieBanner } = uiSlice.actions;
export const { login, logout } = authSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
